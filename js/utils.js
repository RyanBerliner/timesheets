// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
export function randomId() {
  return `id-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
}

export function formatShareData(timesheet, useBreak) {
  const rows = [];
  rows.push(`time sync: ${timesheet.timesync || '(not synced)'}`);
  timesheet.times.forEach(function(time) {
    rows.push(`${timesheet.details[time].racer} ${time}`);
  });
  return rows.join(useBreak ? '%0D%0A' : '\n');
}

export function formatElapsed(rawMilliseconds) {
  if (rawMilliseconds === Infinity) return '?';
  const milliseconds = rawMilliseconds % 1000;
  const minutes = Math.floor(rawMilliseconds / 60_000);
  const seconds = Math.floor(rawMilliseconds / 1000) % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}s`;
}
