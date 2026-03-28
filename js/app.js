import { useLocalStorageReducer, appReducer } from './state.js';
import { SingleTimesheet } from './components/single-timesheet.js';
import { CreateTimesheet } from './components/create-timesheet.js';
import { ArchivedTimesheet } from './components/archived-timesheet.js';

const e = React.createElement;

function App(props) {
  const [timesheets, dispatch] = useLocalStorageReducer({
    timesheets: [],
    archivedTimesheets: [],
    activeTimesheet: null
  }, '[timesheetsindex]', appReducer);

  return e(React.Fragment, {},
    e('div', {className: 'container d-flex py-3 align-items-center justify-content-between mt-2'},
      e('h2', {className: 'h5 my-0 text-body-emphasis'}, 'Timesheets'),
      e('button',
        {
          'data-bs-toggle': 'modal',
          'data-bs-target': '#createtimesheet',
          className: 'btn btn-link bg-body-tertiary text-body text-decoration-none rounded-pill py-2 px-3 lh-1'
        },
        'Create'
      ),
    ),
    e(CreateTimesheet, {timesheets: timesheets.timesheets, dispatch: dispatch}),
    timesheets.timesheets.length === 0 ? e('p', {className: 'container'}, 'Create a timesheet to get started.') : null,
    e('div', {className: 'accordion my-3 container px-0 px-md-2'},
      timesheets.timesheets.slice(0).reverse().map(function(timesheet) {
        return e(SingleTimesheet,
          {
            appDispatch: dispatch,
            timesheet: timesheet,
            active: timesheet === timesheets.activeTimesheet,
            key: timesheet
          }
        )
      }),
    ),
    e('div', {className: 'container'},
      e('h2', {className: 'h5 mt-5 text-body-emphasis'}, 'Archived Timesheets'),
      e('ul', {className: 'mb-5'},
        timesheets.archivedTimesheets.map(function(timesheet) {
          return e(ArchivedTimesheet, {timesheet: timesheet, dispatch: dispatch})
        }),
        timesheets.archivedTimesheets.length === 0 ? e('li', {}, 'No archived timesheets') : null
      ),
    ),
  );
}

ReactDOM.render(
  e(App),
  document.getElementById('app')
);
