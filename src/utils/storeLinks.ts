/**
 * Store links used to turn every shared report into a way to discover the app.
 */

export const ANDROID_PACKAGE_NAME = 'com.enjaz.habittracker';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

/**
 * Tagged with a UTM referrer so installs that come from shared reports show up
 * as "app_share" in Play Console's acquisition reports.
 */
export const PLAY_STORE_SHARE_URL = `${PLAY_STORE_URL}&referrer=utm_source%3Dapp_share`;

export const SHARE_DOWNLOAD_LINE = `حمّل التطبيق مجاناً: ${PLAY_STORE_SHARE_URL}`;

export const appendDownloadLink = (text: string): string =>
  `${text.trimEnd()}\n${SHARE_DOWNLOAD_LINE}`;
