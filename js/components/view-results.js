import { formatShareData } from '../utils.js';

const e = React.createElement;

export function ViewResults({ timesheets }) {
  const [startName, setStartName] = React.useState('');
  const [finishName, setFinishName] = React.useState('');

  // gross on many levels but may refactor to use context so not worth it
  const results = React.useMemo(() => {
    if (!startName || !finishName) return null;
    if (startName == finishName) return null;

    let start = window.localStorage.getItem(startName);
    start ? JSON.parse(start) : null;
    let finish = window.localStorage.getItem(finishName);
    finish ? JSON.parse(finish) : null;

    if (!start || !finish) return null;

    // TODO: actually calculate the results
    return 'the results';
  }, [startName, finishName]);

  const reset = React.useCallback(() => {
    setStartName('');
    setFinishName('');
  }, []);

  return e(BS5ReactElements.Modal,
    {
      className: 'modal fade',
      id: 'viewresults',
      tabindex: -1,
      'aria-hidden': true,
      onShow: reset,
    },
    e('div', {className: 'modal-dialog modal-fullscreen-md-down'},
      e('div', {className: 'modal-content'},
        e('div', {className: 'modal-header'},
          e('h3', {className: 'h5 modal-title'}, 'View Results'),
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
          e('label', {className: 'form-label'}, 'Start'),
          e('select',
            {
              className: 'form-control mb-3',
              onChange: e => setStartName(e.target.value),
            },
            e('option', {value: ''}, '- select a timesheet -'),
            ...timesheets.map(name => e('option', {
              value: name,
              selected: name == startName,
            }, name)),
          ),

          e('label', {className: 'form-label'}, 'Finish'),
          e('select',
            {
              className: 'form-control mb-3',
              onChange: e => setFinishName(e.target.value),
            },
            e('option', {value: ''}, '- select a timesheet -'),
            ...timesheets.map(name => e('option', {
              value: name,
              selected: name == finishName,
            }, name)),
          ),

          results
            ? results
            : 'select start and finish timesheets'
        ),
      ),
    ),
  );
}
