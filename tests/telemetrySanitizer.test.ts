import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIAGNOSTICS_PREFERENCE_KEY,
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
  sanitizeTelemetryRecord,
  scrubSensitiveText,
} from '../src/utils/telemetrySanitizer.ts';

test('telemetrySanitizer: DIAGNOSTICS_PREFERENCE_KEY is stable', () => {
  assert.equal(DIAGNOSTICS_PREFERENCE_KEY, 'diagnostics_opt_in');
});

test('telemetrySanitizer: drops all events and breadcrumbs when opt-in is disabled', () => {
  const event = {
    message: 'Unhandled crash',
    user: { id: '123', email: 'user@example.com' },
    extra: { habitName: 'قراءة القرآن' },
  };
  const breadcrumb = { category: 'navigation', message: 'Opened HomeTab' };

  assert.equal(sanitizeSentryEvent(event, false), null);
  assert.equal(sanitizeSentryBreadcrumb(breadcrumb, false), null);
});

test('telemetrySanitizer: strips PII, device context, user-entered habit names, and notes when opted in', () => {
  const event = {
    user: { id: 'user-1', email: 'sultan@example.com', ip_address: '1.2.3.4' },
    server_name: 'my-phone',
    request: {
      url: 'https://user@example.com/api',
      cookies: 'session=secret',
      headers: { Authorization: 'Bearer abc' },
      data: { note: 'Secret journal entry' },
    },
    contexts: {
      device: { name: "Sultan's Phone" },
      os: { name: 'Android', version: '15' },
    },
    extra: {
      habitName: 'صلاة الفجر',
      note: 'ملاحظة شخصية خاصة',
      safeCount: 3,
      nested: {
        title: 'عادة سرية',
        step: 'init',
      },
    },
    exception: {
      values: [
        {
          value: 'Failed connecting to postgresql://user:pass@host/db for user@example.com',
        },
      ],
    },
  };

  const sanitized = sanitizeSentryEvent(event, true);
  assert.ok(sanitized);
  assert.equal('user' in sanitized, false);
  assert.equal('server_name' in sanitized, false);
  assert.equal(sanitized.request?.cookies, undefined);
  assert.equal(sanitized.request?.headers, undefined);
  assert.equal(sanitized.request?.data, undefined);
  assert.equal((sanitized.contexts as Record<string, unknown>)?.device, undefined);
  assert.deepEqual((sanitized.contexts as Record<string, unknown>)?.os, {
    name: 'Android',
    version: '15',
  });
  assert.equal(sanitized.extra?.habitName, '[REDACTED]');
  assert.equal(sanitized.extra?.note, '[REDACTED]');
  assert.equal(sanitized.extra?.safeCount, 3);
  assert.deepEqual(sanitized.extra?.nested, {
    title: '[REDACTED]',
    step: 'init',
  });
  assert.equal(
    sanitized.exception?.values?.[0]?.value,
    'Failed connecting to [REDACTED_URL] for [REDACTED_EMAIL]'
  );
});

test('telemetrySanitizer: drops UI/console breadcrumbs and scrubs remaining breadcrumbs', () => {
  assert.equal(
    sanitizeSentryBreadcrumb({ category: 'ui.click', message: 'Pressed صلاة الفجر' }, true),
    null
  );
  assert.equal(
    sanitizeSentryBreadcrumb({ category: 'console', message: 'Habit note saved' }, true),
    null
  );

  const navBreadcrumb = sanitizeSentryBreadcrumb(
    {
      category: 'navigation',
      message: 'Navigated to HabitDetails',
      data: { habitName: 'رياضة الصباح', route: 'HabitDetails' },
    },
    true
  );

  assert.ok(navBreadcrumb);
  assert.equal(navBreadcrumb.data?.habitName, '[REDACTED]');
  assert.equal(navBreadcrumb.data?.route, 'HabitDetails');
});

test('telemetrySanitizer: scrubSensitiveText and sanitizeTelemetryRecord handle edge values', () => {
  assert.equal(
    scrubSensitiveText('Contact me@domain.org via postgres://admin:secret@db.internal:5432/app'),
    'Contact [REDACTED_EMAIL] via [REDACTED_URL]'
  );
  assert.deepEqual(sanitizeTelemetryRecord({ password: '123', ok: true }), {
    password: '[REDACTED]',
    ok: true,
  });
});
