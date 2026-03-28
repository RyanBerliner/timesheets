export function appReducer(state, action) {
  const newState = JSON.parse(JSON.stringify(state));
  const payload = action.payload;
  switch (action.type) {
    case 'addtimesheet':
    case 'restoretimesheet':
      if (newState.timesheets.indexOf(payload.name) < 0) {
        newState.timesheets.push(payload.name);
      }
      newState.archivedTimesheets = newState.archivedTimesheets.filter(function(timesheet) {
        return timesheet != payload.name;
      });
      newState.activeTimesheet = payload.name;
      return newState;
    case 'archivetimesheet':
      newState.timesheets = newState.timesheets.filter(function(timesheet) {
        return timesheet != payload.name;
      });
      if (newState.archivedTimesheets.indexOf(payload.name) < 0) {
        newState.archivedTimesheets.push(payload.name);
      }
      newState.activeTimesheet = null;
      return newState;
    case 'deletetimesheet':
      newState.archivedTimesheets = newState.archivedTimesheets.filter(function(timesheet) {
        return timesheet != payload.name;
      });
      return newState;
    default:
      return newState;
  }
}

export function timesheetReducer(state, action) {
  const newState = JSON.parse(JSON.stringify(state));
  const payload = action.payload;
  switch (action.type) {
    case 'addtime':
      newState.times.push(payload.time);
      newState.details[payload.time] = {time: payload.time, racer: payload.racer};
      return newState;
    case 'edittime':
      newState.details[payload.time] = {time: payload.time, racer: payload.racer};
      return newState;
    case 'deletetime':
      delete newState.details[payload.time];
      newState.times = newState.times.filter(function(time) {
        return time != payload.time;
      });
      return newState;
    case 'timesync':
      newState.timesync = payload.time;
      return newState;
    default:
      return newState;
  }
}

export function useLocalStorageReducer(initialValue, key, reducer) {
  const [state, dispatch] = React.useReducer(reducer, initialValue, val => {
    const existingValue = window.localStorage.getItem(key);
    return existingValue == null ? val : JSON.parse(existingValue);
  });

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, dispatch];
}
