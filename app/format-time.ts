// Event times are stored as 24-hour "HH:MM" strings (what the admin form's
// time input produces). Visitors read 12-hour times, so format for display.
// Anything that isn't a plain 24-hour value — including free text or a time
// already written with AM/PM — is passed through untouched.
export function formatTime12(value?: string | null): string {
  const raw = String(value ?? "").trim();
  if (!raw || /[ap]\.?m/i.test(raw)) return raw;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(raw);
  if (!match) return raw;
  const hours = Number(match[1]);
  if (hours > 23) return raw;
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
}
