import {
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
  scrubSensitiveText,
} from '../utils/telemetrySanitizer.ts';

let _diagnosticsEnabled = false;
let _sentryInitialized = false;
let _bootInitialized = false;

const safeRequire = <T = any>(loader: () => T): T | null => {
  try {
    return loader();
  } catch {
    return null;
  }
};

/* eslint-disable @typescript-eslint/no-require-imports */
const getExpoConstants = () =>
  safeRequire(() => require('expo-constants')?.default ?? require('expo-constants'));
const getSentryModule = () => safeRequire(() => require('@sentry/react-native'));
const getObserveModule = () => safeRequire(() => require('expo-observe')?.Observe);
/* eslint-enable @typescript-eslint/no-require-imports */

const FILTERED_ROUTE_PARAMS = ['habitId', 'habitName', 'name', 'title', 'note', 'isRevisit'];

export const getSentryDsn = (): string | null => {
  const constants = getExpoConstants();
  const extraDsn = constants?.expoConfig?.extra?.sentryDsn;
  const envDsn =
    typeof process !== 'undefined' && process?.env ? process.env.EXPO_PUBLIC_SENTRY_DSN : undefined;
  const raw = typeof extraDsn === 'string' && extraDsn.trim() ? extraDsn : envDsn;
  if (!raw || typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const configureObserveDispatch = (enabled: boolean): void => {
  const Observe = getObserveModule();
  if (!Observe?.configure) return;
  try {
    Observe.configure({
      dispatchingEnabled: enabled,
      integrations: {
        'react-navigation': {
          filteredParams: FILTERED_ROUTE_PARAMS,
        },
      },
    });
  } catch {
    // Ignore when native module is unavailable (e.g. Jest / Node test runtime)
  }
};

const initSentryIfOptedIn = (): void => {
  if (!_diagnosticsEnabled || _sentryInitialized) return;
  const dsn = getSentryDsn();
  if (!dsn) return;

  const Sentry = getSentryModule();
  if (!Sentry?.init) return;

  try {
    Sentry.init({
      dsn,
      sendDefaultPii: false,
      enableAutoPerformanceTracing: false,
      tracesSampleRate: 0,
      profilesSampleRate: 0,
      attachScreenshot: false,
      attachViewHierarchy: false,
      enableUserInteractionTracing: false,
      beforeSend(event: any) {
        return sanitizeSentryEvent(event, _diagnosticsEnabled);
      },
      beforeSendTransaction(event: any) {
        return sanitizeSentryEvent(event, _diagnosticsEnabled);
      },
      beforeBreadcrumb(breadcrumb: any) {
        return sanitizeSentryBreadcrumb(breadcrumb, _diagnosticsEnabled);
      },
    });
    _sentryInitialized = true;
  } catch {
    // Ignore when native Sentry runtime is unavailable
  }
};

/**
 * Configures observability in a strict opt-out state at boot before user
 * preferences load from SQLite. Nothing is dispatched until explicit consent.
 */
export const initTelemetryAtBoot = (): void => {
  if (_bootInitialized) return;
  _bootInitialized = true;
  _diagnosticsEnabled = false;
  configureObserveDispatch(false);
};

/**
 * Enables or disables crash & performance telemetry based on user consent.
 */
export const setDiagnosticsEnabled = (enabled: boolean): void => {
  _diagnosticsEnabled = Boolean(enabled);
  configureObserveDispatch(_diagnosticsEnabled);
  if (_diagnosticsEnabled) {
    initSentryIfOptedIn();
  }
};

export const isDiagnosticsEnabled = (): boolean => _diagnosticsEnabled;

export const captureTelemetryException = (error: unknown): void => {
  if (!_diagnosticsEnabled) return;

  const safeError =
    error instanceof Error
      ? (() => {
          const scrubbed = new Error(scrubSensitiveText(error.message));
          scrubbed.name = error.name;
          scrubbed.stack = error.stack ? scrubSensitiveText(error.stack) : undefined;
          return scrubbed;
        })()
      : new Error('Unexpected application error');

  const Sentry = getSentryModule();
  try {
    if (_sentryInitialized && Sentry?.captureException) {
      Sentry.captureException(safeError);
    }
  } catch {
    // No-op
  }

  const Observe = getObserveModule();
  try {
    Observe?.reportError?.(safeError);
  } catch {
    // No-op
  }
};

export const markAppInteractive = (): void => {
  if (!_diagnosticsEnabled) return;
  const Observe = getObserveModule();
  try {
    Observe?.markInteractive?.();
  } catch {
    // No-op
  }
};
