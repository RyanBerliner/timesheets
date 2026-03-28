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

