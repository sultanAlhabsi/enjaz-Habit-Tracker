import { requireOptionalNativeModule } from 'expo-modules-core';

const PLAYERS_COUNT = 3;
let players: any[] = [];
let activePlayerIdx = 0;
let isInitializing = false;
let isAudioModeConfigured = false;

const isAudioSupported = (): boolean => {
  try {
    if (typeof requireOptionalNativeModule === 'function') {
      return !!requireOptionalNativeModule('ExpoAudio');
    }
  } catch (_e) {}
  return false;
};

/**
 * Configure global audio mode for sound effects:
 * - playsInSilentMode: true (allows completion chime even when phone is in silent/vibrate)
 * - interruptionMode: 'mixWithOthers' (tells Android NOT to request exclusive audio focus, preventing system volume ducking or muting)
 */
const configureAudioMode = async (): Promise<void> => {
  if (isAudioModeConfigured) return;
  try {
    const { setAudioModeAsync } = require('expo-audio');
    if (typeof setAudioModeAsync === 'function') {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
      isAudioModeConfigured = true;
    }
  } catch (_e) {
    // Non-fatal fallback
  }
};

/**
 * Preload the habit completion chime audio players to ensure instant, zero-latency playback.
 * 3-player pool allows rapid back-to-back completions without audio collision or cutting off.
 */
export const initSound = async (): Promise<void> => {
  if (isInitializing || players.length === PLAYERS_COUNT) return;
  isInitializing = true;

  try {
    if (!isAudioSupported()) return;

    await configureAudioMode();

    const { AudioModule } = require('expo-audio');
    const { resolveSource } = require('expo-audio/build/utils/resolveSource');
    const soundAsset = require('../../assets/sounds/complete.wav');

    if (AudioModule?.AudioPlayer) {
      const resolved = resolveSource ? resolveSource(soundAsset) : soundAsset;
      while (players.length < PLAYERS_COUNT) {
        // keepAudioSessionActive = false for lightweight UI sounds
        const p = new AudioModule.AudioPlayer(resolved, 500, false, 0);
        players.push(p);
      }
    }
  } catch (_err) {
    // Non-fatal fallback
  } finally {
    isInitializing = false;
  }
};

/**
 * Play the crisp Pop & Chime celebration sound.
 * Designed to be non-blocking, concurrent-safe, and fail-safe.
 */
export const playCompletionSound = async (): Promise<void> => {
  try {
    if (!isAudioSupported()) return;

    if (!isAudioModeConfigured) {
      configureAudioMode().catch(() => {});
    }

    if (players.length < PLAYERS_COUNT) {
      await initSound();
    }

    if (players.length === 0) return;

    const player = players[activePlayerIdx];
    activePlayerIdx = (activePlayerIdx + 1) % players.length;

    if (player) {
      try {
        if (typeof player.seekTo === 'function') {
          // Await seekTo resolution so Android ExoPlayer properly transitions out of STATE_ENDED
          const seekPromise = player.seekTo(0);
          if (seekPromise && typeof seekPromise.then === 'function') {
            seekPromise
              .then(() => {
                if (typeof player.play === 'function') {
                  player.play();
                }
              })
              .catch(() => {
                try {
                  if (typeof player.play === 'function') {
                    player.play();
                  }
                } catch (_) {}
              });
          } else {
            if (typeof player.play === 'function') {
              player.play();
            }
          }
        } else if (typeof player.play === 'function') {
          player.play();
        }
      } catch (_playErr) {
        // Safe failover: do NOT discard player so it survives concurrent calls
      }
    }
  } catch (_err) {
    // Non-blocking fail-safe
  }
};
