'use strict';

// https://developers.google.com/web/ilt/pwa/introduction-to-service-worker
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('service-worker.js')
//   .then(function(registration) {
//     console.log('Registration successful, scope is:', registration.scope);
//   })
//   .catch(function(error) {
//     console.log('Service worker registration failed, error:', error);
//   });
// }

const e = React.createElement;

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function randomId() {
  return `id-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
}

function reducer(state, action) {
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
    case 'addtimesheet':
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

function useLocalStorage(initialValue, key) {
  const [state, dispatch] = React.useReducer(reducer, (function() {
    const existingValue = window.localStorage.getItem(key);
    return existingValue == null ? initialValue : JSON.parse(existingValue);
  })());
  React.useEffect(function() {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, dispatch];
}

function formatShareData(timesheet, useBreak) {
  const rows = [];
  rows.push(`time sync: ${timesheet.timesync || '(not synced)'}`);
  timesheet.times.forEach(function(time) {
    rows.push(`${timesheet.details[time].racer} ${time}`);
  });
  return rows.join(useBreak ? '%0D%0A' : '\n');
}

function AddTime(props) {
  const [addTimeRacer, setAddTimeRacer] = React.useState('');
  const id = React.useRef(randomId());
  return e('form',
    {
      className: 'mt-1 py-3 row bg-white',
      onSubmit: function(e) {
        e.preventDefault();
        props.dispatch({type: 'addtime', payload: {time: Date.now(), racer: addTimeRacer}});
        setAddTimeRacer('');
      }
    },
    e('div', {className: 'col-md-8 col-lg-10 mb-3 mb-md-0 d-flex align-items-center'},
      e('label', {className: 'text-nowrap', htmlFor: id.current}, 'Racer #'),
      e('input',
        {
          className: 'form-control ms-3',
          type: 'number',
          id: id.current,
          placeholder: 'Enter racer # or add it later...',
          value: addTimeRacer,
          onChange: function(e) {
            setAddTimeRacer(e.target.value);
          }
        }
      ),
    ),
    e('div', {className: 'col-lg-2 col-md-4'},
      e('input',
        {
          className: 'btn btn-primary d-block w-100',
          type: 'submit',
          value: 'Add Time'
        }
      )
    )
  );
}

function Time(props) {
  const time = props.time;
  const [editTimeRacer, setEditTimeRacer] = React.useState(time.racer);
  const saved = time.racer === editTimeRacer;
  const timestamp = new Date(0);
  timestamp.setUTCMilliseconds(time.time);
  const dropdown = React.useRef();
  return e('tr', {},
    e('th', {className: 'align-middle'}, `# ${time.racer}`),
    e('td', {className: 'align-middle'}, timestamp.toLocaleTimeString()),
    e('td', {className: 'dropdown text-end'},
      e(BS5ReactElements.Dropdown,
        {
          type: 'button',
          className: 'btn btn-sm btn-link',
          'data-bs-toggle': 'dropdown',
          'aria-expanded': false,
          id: `id-${time.time}`,
          config: {
            autoClose: 'outside',
          },
          component: dropdown
        },
        'Edit Time'
      ),
      e('ul',
        {
          className: 'dropdown-menu dropdown-menu-end',
          'aria-labelledby': `id-${time.time}`,
          style: {zIndex: 1021},
        },
        e('form',
          {
            style: {minWidth: 270},
            className: 'p-3',
            onSubmit: function(e) {
              e.preventDefault();
              props.dispatch({type: 'edittime', payload: {time: time.time, racer: editTimeRacer}});
              dropdown.current.hide();
            }
          },
          e('label', {htmlFor: `edit-${time.time}`}, 'Racer #'),
          e('input',
            {
              type: 'number',
              value: editTimeRacer,
              className: 'form-control mt-1 mb-3',
              placeholder: 'Enter racer #',
              id: `edit-${time.time}`,
              onChange: function(e) {
                setEditTimeRacer(e.target.value);
              }
            }
          ),
          e('div', {className: 'd-flex justify-content-between'},
            e('button', {type: 'submit', className: 'btn btn-sm btn-primary'}, 'Save'),
            e('button',
              {
                type: 'button',
                className: 'btn btn-sm btn-link text-danger',
                onClick: function(e) {
                  e.preventDefault();
                  const OK = window.confirm('Are you sure you\'d like to delete this time?');
                  if (OK) {
                    props.dispatch({type: 'deletetime', payload: {time: time.time}});
                  }
                }
              },
              'Delete'
            )
          )
        )
      )
    )
  );
}

function SingleTimesheet(props) {
  const [timesheet, dispatch] = useLocalStorage({times: [], details: {}, timesync: null}, props.timesheet);
  const id = React.useRef(randomId());
  const collapse = React.useRef();
  const syncToast = React.useRef();
  React.useEffect(function() {
    if (props.active) {
      collapse.current.show();
    }
  }, [props.active]);
  return e('div', {className: 'accordion-item'},
    e('h2',
      {
        className: 'accordion-header sticky-top',
        id: `timesheet-heading-${id.current}`
      },
      e('button',
        {
          className: `accordion-button ${props.active ? '' : 'collapsed'}`,
          type: 'button',
          'data-bs-toggle': 'collapse',
          'data-bs-target': `#sheet-${id.current}`,
          'aria-expanded': false,
          'aria-controls': `sheet-${id.current}`,
        },
        props.timesheet
      ),
    ),
    e(BS5ReactElements.Collapse, 
      {
        id: `sheet-${id.current}`,
        class: `accordion-collapse collapse ${props.active ? 'show' : ''}`,
        'aria-labelledby': `timesheet-heading-${id.current}`,
        config: {toggle: false},
        component: collapse,
      },
      e('div', {className: 'accordion-body pt-0'},
        e(AddTime, {dispatch: dispatch}),
        e('table', {className: 'table table-sm border-top'},
          e('tbody', {},
            timesheet.times.slice(0).reverse().map(function(time) {
              return e(Time, {time: timesheet.details[time], dispatch: dispatch, key: time});
            })
          )
        ),
        e('div', {className: 'd-md-flex justify-content-between'},
          e('span', {},
            e('button',
              {
                type: 'button',
                className: 'btn btn-sm btn-link',
                onClick: function(e) {
                  e.preventDefault();
                  const OK = confirm('Confirm this action at the exact same time as the persion you are syncing with. You can do this at any time, and more than once if you mess up.');
                  if (OK) {
                    dispatch({type: 'timesync', payload: {time: Date.now()}});
                    syncToast.current.show();
                  }
                }
              },
              'Time Sync'
            ),
            timesheet.timesync ? e('br') : null,
            timesheet.timesync ? e('small', {className: 'text-muted ms-2'}, `synced at ${timesheet.timesync}`) : null
          ),
          e('div', {className: 'position-fixed top-0 end-0 start-0 px-3', style: {zIndex: 1025}},
            e(BS5ReactElements.Toast,
              {
                component: syncToast,
                className: 'toast bg-white my-3 mx-auto hide'
              },
              e('div', {className: 'd-flex align-items-center'},
                e('div', {className: 'toast-body'}, 'Time sync has been recorded.'),
                e('button', {type: 'button', className: 'btn-close me-2 m-auto', 'data-bs-dismiss': 'toast', 'aria-label': 'Close'})
              )
            ),
          ),
          e('div', {className: 'd-flex mt-3 mt-md-0 align-items-center'},
            e('button',
              {
                type: 'button',
                'data-bs-toggle': 'modal',
                'data-bs-target': `#share-${id.current}`,
                className: 'btn btn-sm btn-link',
              },
              'Share Timesheet'
            ),
            e(BS5ReactElements.Modal,
              {
                tabIndex: -1,
                className: 'modal fade',
                id: `share-${id.current}`,
                'aria-hidden': true
              },
              e('div', {className: 'modal-dialog'},
                e('div', {className: 'modal-content'},
                  e('div', {className: 'modal-header'},
                    e('h3', {className: 'h5 modal-title'}, 'Share Timesheet'),
                    e('button',
                      {
                        type: 'button',
                        className: 'btn-close',
                        'data-bs-dismiss': 'modal',
                        'aria-label': 'close',
                      }
                    )
                  ),
                  e('div', {className: 'modal-body'},
                    e('p', {},
                      'You can copy and paste this timesheets data to share it with others however they prefer. ',
                      'Or ',
                      e('a', {href: `mailto:?subject=${props.timesheet}&body=${formatShareData(timesheet, true)}`}, 'click this link to send an email.'),
                    ),
                    e('textarea',
                      {
                        readonly: true,
                        className: 'form-control mb-3',
                        rows: 5,
                        value: formatShareData(timesheet, false)
                      }
                    )
                  )
                )
              )
            ),
            e('button',
              {
                type: 'button',
                className: 'btn btn-sm btn-link text-danger',
                onClick: function(e) {
                  e.preventDefault();
                  let OK = confirm('Are you sure you\'d like to archive this timesheet?');
                  if (OK) {
                    props.timesheetDispatch({type: 'archivetimesheet', payload: {name: props.timesheet}})
                  }
                }
              },
              'Archive'
            ),
          )
        )
      )
    ),
  );
}

function CreateTimesheet(props) {
  const [timesheetName, setTimesheetName] = React.useState('');
  const modal = React.useRef();
  return e(BS5ReactElements.Modal,
    {
      className: 'modal fade',
      id: 'createtimesheet',
      tabindex: -1,
      'aria-hidden': true,
      component: modal,
      onShow: function(e) {
        setTimesheetName('');
      }
    },
    e('div', {className: 'modal-dialog'},
      e('div', {className: 'modal-content p-4'},
        e('form',
          {
            onSubmit: function(e) {
              e.preventDefault();
              props.dispatch({type: 'addtimesheet', payload: {name: timesheetName}});
              modal.current.hide();
            }
          },
          e('label', {className: 'text-nowrap', htmlFor: 'timesheetname'}, 'Timesheet Name'),
          e('input',
            {
              type: 'text',
              value: timesheetName,
              id: 'timesheetname',
              required: true,
              className: 'form-control mt-2 mb-3',
              placeholder: 'Ex. "Stage 2 Finish"',
              onChange: function(e) {
                setTimesheetName(e.target.value);
              }
            }
          ),
          e('div', {className: 'd-flex justify-content-between'},
            e('input', {className: 'btn btn-primary', type: 'submit', value: 'Create Timesheet'}),
            e('button',
              {
                type: 'button',
                className: 'btn btn-outline-danger',
                'data-bs-dismiss': 'modal'
              },
              'Cancel'
            )
          )
        )
      )
    )
  );
}

function ArchivedTimesheet(props) {
  return e('li', {},
    `${props.timesheet} - `,
    e('a',
      {
        role: 'button',
        className: 'text-danger',
        onClick: function(e) {
          const OK = window.confirm('Are you sure you\'d like to delete this timesheet? This cannot be undone.');
          if (OK) {
            props.dispatch({type: 'deletetimesheet', payload: {name: props.timesheet}});
            window.localStorage.removeItem(props.timesheet);
          }
        }
      },
      'Delete Permanently'
    )
  );
}

function App(props) {
  const [timesheets, dispatch] = useLocalStorage({
    timesheets: [],
    archivedTimesheets: [],
    activeTimesheet: null
  }, '[timesheetsindex]');
  return e(React.Fragment, {},
    e('div', {className: 'd-flex py-3 align-items-center mt-4'},
      e('h2', {className: 'h3 my-0'}, 'Timesheets'),
      e('button',
        {
          'data-bs-toggle': 'modal',
          'data-bs-target': '#createtimesheet',
          className: 'btn btn-outline-secondary ms-3'
        },
        'Create'
      ),
    ),
    e(CreateTimesheet, {timesheets: timesheets.timesheets, dispatch: dispatch}),
    timesheets.timesheets.length === 0 ? e('p', {}, 'Create a timesheet to get started.') : null,
    e('div', {className: 'accordion my-3'},
      timesheets.timesheets.slice(0).reverse().map(function(timesheet) {
        return e(SingleTimesheet,
          {
            timesheetDispatch: dispatch,
            timesheet: timesheet,
            active: timesheet === timesheets.activeTimesheet,
            key: timesheet
          }
        )
      }),
    ),
    e('h2', {className: 'h4 mt-5'}, 'Archived Timesheets'),
    e('p', {}, 'You can restore a timesheet by creating another one with the same name.'),
    e('ul', {className: 'mb-5'},
      timesheets.archivedTimesheets.map(function(timesheet) {
        return e(ArchivedTimesheet, {timesheet: timesheet, dispatch: dispatch})
      }),
      timesheets.archivedTimesheets.length === 0 ? e('li', {}, 'No archived timesheets') : null
    ),
    e('p', {}, e('a', {href: '#'}, 'What is this and how do I use it?'))
  );
}

ReactDOM.render(
  e(App),
  document.getElementById('app')
);