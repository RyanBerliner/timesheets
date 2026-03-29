import { useLocalStorageReducer, timesheetReducer } from '../state.js';
import { randomId } from '../utils.js';

const e = React.createElement;

function AddTime(props) {
  const [addTimeRacer, setAddTimeRacer] = React.useState('');
  const id = React.useRef(randomId());
  return e('form',
    {
      className: 'mt-1 py-3 bg-body',
      onSubmit: function(e) {
        e.preventDefault();
        props.dispatch({type: 'addtime', payload: {time: Date.now(), racer: addTimeRacer}});
        setAddTimeRacer('');
      }
    },
    e('div', {className: 'mb-3 d-flex align-items-center'},
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
    e('div', {},
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

export function SingleTimesheet(props) {
  const [timesheet, dispatch] = useLocalStorageReducer({
    times: [],
    details: {},
    timesync: null
  }, props.timesheet, timesheetReducer);

  const [secondsSinceLastRacer, setSecondsSinceLastRacer] = React.useState(0);
  const id = React.useRef(randomId());
  const collapse = React.useRef();
  const syncToast = React.useRef();
  React.useEffect(function() {
    if (props.active) {
      collapse.current.show();
    }
  }, [props.active]);
  const lastTime = React.useMemo(function() {
    if (timesheet.times.length === 0) {
      return null;
    } else {
      return timesheet.times[timesheet.times.length - 1];
    }
  }, [timesheet.times]);
  React.useEffect(function() {
    const interval = setInterval(function() {
      const milliseconds = lastTime == null ? 0 : Date.now() - lastTime;
      setSecondsSinceLastRacer(parseInt(milliseconds / 1000));
    }, 1000);
    return function() {
      clearInterval(interval);
    }
  }, [lastTime]);
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
        `${props.timesheet} (+${secondsSinceLastRacer})`
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
        e('div', {className: 'd-flex justify-content-between align-items-start'},
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
            timesheet.timesync ? e('small', {className: 'd-block text-muted ms-2'}, `Synced at ${timesheet.timesync}`) : null
          ),
          e('div', {className: 'position-fixed top-0 end-0 start-0 px-3', style: {zIndex: 1025}},
            e(BS5ReactElements.Toast,
              {
                component: syncToast,
                className: 'toast bg-body my-3 mx-auto hide'
              },
              e('div', {className: 'd-flex align-items-center'},
                e('div', {className: 'toast-body'}, 'Time sync has been recorded.'),
                e('button', {type: 'button', className: 'btn-close me-2 m-auto', 'data-bs-dismiss': 'toast', 'aria-label': 'Close'})
              )
            ),
          ),
          e('button',
            {
              type: 'button',
              className: 'btn btn-sm btn-link text-danger',
              onClick: function(e) {
                e.preventDefault();
                let OK = confirm('Are you sure you\'d like to archive this timesheet?');
                if (OK) {
                  props.appDispatch({type: 'archivetimesheet', payload: {name: props.timesheet}})
                }
              }
            },
            'Archive'
          ),
        )
      )
    ),
  );
}
