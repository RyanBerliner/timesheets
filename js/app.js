import { useLocalStorageReducer, appReducer } from './state.js';
import { HeaderActions } from './components/header-actions.js';
import { SingleTimesheet } from './components/single-timesheet.js';
import { CreateTimesheet } from './components/create-timesheet.js';
import { ArchivedTimesheet } from './components/archived-timesheet.js';
import { ImportTimesheet } from './components/import-timesheet.js';
import { ExportTimesheet } from './components/export-timesheet.js';
import { ViewResults } from './components/view-results.js';

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
      e(HeaderActions),
      e(CreateTimesheet, {timesheets: timesheets.timesheets, dispatch: dispatch}),
      e(ImportTimesheet, {timesheets: [...timesheets.timesheets, ...timesheets.archivedTimesheets], dispatch: dispatch}),
      e(ExportTimesheet, {timesheets: timesheets.timesheets}),
      e(ViewResults, {timesheets: timesheets.timesheets}),
    ),

    timesheets.timesheets.length === 0
      ? e('p', {className: 'container'}, 'Create a timesheet to get started.')
      : null,

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
