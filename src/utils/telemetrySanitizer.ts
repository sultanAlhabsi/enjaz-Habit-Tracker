export const DIAGNOSTICS_PREFERENCE_KEY = 'diagnostics_opt_in';

const SENSITIVE_KEY_PATTERN =
  /^(name|title|note|notes|description|habitname|habittitle|habitnote|query|params|databaseurl|connectionstring|email|token|password|secret|authorization|cookie|cookies|ip_address|user|username|phone|text|value|input)$/i;

const CONNECTION_STRING_PATTERN = /postgres(?:ql)?:\/\/[^\s'"]+/gi;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function scrubSensitiveText(input: string): string {
  return input
    .replace(CONNECTION_STRING_PATTERN, '[REDACTED_URL]')
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]');
}

export function sanitizeTelemetryRecord(value: unknown, depth = 0): unknown {
  if (depth > 5) {
    return '[TRUNCATED]';
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string') {
    return scrubSensitiveText(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeTelemetryRecord(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = sanitizeTelemetryRecord(val, depth + 1);
      }
    }
    return out;
  }
  return '[UNSUPPORTED]';
}

export interface SanitizedBreadcrumbLike {
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export function sanitizeSentryBreadcrumb<T extends SanitizedBreadcrumbLike>(
  breadcrumb: T,
  optInEnabled: boolean
): T | null {
  if (!optInEnabled) {
    return null;
  }

  const category = breadcrumb.category || '';

  // Drop console logs or UI interaction breadcrumbs that might capture habit names or notes
  if (category === 'console' || category.startsWith('ui.')) {
    return null;
  }

  const sanitized: SanitizedBreadcrumbLike = {
    ...breadcrumb,
    message:
      typeof breadcrumb.message === 'string' ? scrubSensitiveText(breadcrumb.message) : undefined,
    data: breadcrumb.data
      ? (sanitizeTelemetryRecord(breadcrumb.data) as Record<string, unknown>)
      : undefined,
  };

  return sanitized as T;
}

export interface SanitizedSentryEventLike {
  user?: unknown;
  server_name?: unknown;
  request?: {
    cookies?: unknown;
    headers?: unknown;
    data?: unknown;
    url?: string;
    [key: string]: unknown;
  };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  breadcrumbs?: SanitizedBreadcrumbLike[];
  exception?: {
    values?: Array<{
      value?: string;
      [key: string]: unknown;
    }>;
  };
  message?: string;
  [key: string]: unknown;
}

export function sanitizeSentryEvent<T extends SanitizedSentryEventLike>(
  event: T,
  optInEnabled: boolean
): T | null {
  if (!optInEnabled) {
    return null;
  }

  const sanitized: SanitizedSentryEventLike = { ...event };

  // Strip all personal / device-identifying fields
  delete sanitized.user;
  delete sanitized.server_name;

  if (sanitized.request) {
    const { cookies: _c, headers: _h, data: _d, ...restReq } = sanitized.request;
    sanitized.request = {
      ...restReq,
      url: typeof restReq.url === 'string' ? scrubSensitiveText(restReq.url) : undefined,
    };
  }

  if (typeof sanitized.message === 'string') {
    sanitized.message = scrubSensitiveText(sanitized.message);
  }

  if (sanitized.extra) {
    sanitized.extra = sanitizeTelemetryRecord(sanitized.extra) as Record<string, unknown>;
  }

  if (sanitized.contexts) {
    const nextContexts: Record<string, unknown> = {};
    for (const [ctxKey, ctxVal] of Object.entries(sanitized.contexts)) {
      if (ctxKey === 'device') continue;
      if (ctxKey === 'os' || ctxKey === 'runtime' || ctxKey === 'app') {
        nextContexts[ctxKey] =
          ctxVal && typeof ctxVal === 'object'
            ? Object.fromEntries(
                Object.entries(ctxVal as Record<string, unknown>).map(([k, v]) => [
                  k,
                  typeof v === 'string' ? scrubSensitiveText(v) : v,
                ])
              )
            : ctxVal;
      } else {
        nextContexts[ctxKey] = sanitizeTelemetryRecord(ctxVal);
      }
    }
    sanitized.contexts = nextContexts;
  }

  if (sanitized.tags) {
    sanitized.tags = sanitizeTelemetryRecord(sanitized.tags) as Record<string, unknown>;
  }

  if (Array.isArray(sanitized.breadcrumbs)) {
    sanitized.breadcrumbs = sanitized.breadcrumbs
      .map((b) => sanitizeSentryBreadcrumb(b, true))
      .filter((b): b is SanitizedBreadcrumbLike => b !== null);
  }

  if (sanitized.exception?.values) {
    sanitized.exception = {
      ...sanitized.exception,
      values: sanitized.exception.values.map((ex) => ({
        ...ex,
        value: typeof ex.value === 'string' ? scrubSensitiveText(ex.value) : ex.value,
      })),
    };
  }

  return sanitized as T;
}
