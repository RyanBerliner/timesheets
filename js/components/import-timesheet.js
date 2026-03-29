const e = React.createElement;

export function ImportTimesheet({ timesheets, archivedTimesheets, dispatch }) {
  const [name, setName] = React.useState('');
  const [importData, setImportData] = React.useState('');
  const modal = React.useRef();

  const reset = React.useCallback(() => {
    setName('');
    setImportData('');
  }, []);

  const submit = e => {
    e.preventDefault();

    const data = {
      times: [],
      details: {},
      timesync: null,
    };

    importData.trim().split('\n').forEach(row => {
      // important we only trim the end because the start could have a leading
      // empty resembling a missing racer number
      const parts = row.trimEnd().split(' ');
      if (!parts.length) return;

      const last = parseInt(parts.slice(-1));
      if (isNaN(last)) return;

      let first = parts[0];

      if (first === 'time') {
        data.timesync = last;
        return;
      }

      data.times.push(last);
      data.details[last] = {time: last, racer: first};
    });

    // just make sure someone didn't mess with the order of the export
    data.times.sort();

    window.localStorage.setItem(name.trim(), JSON.stringify(data));
    dispatch({ type: 'addtimesheet', payload: { name: name.trim() } });
    modal.current.hide();
  };

  return e(BS5ReactElements.Modal,
    {
      className: 'modal fade',
      id: 'importtimesheet',
      tabindex: -1,
      'aria-hidden': true,
      onShow: reset,
      component: modal,
    },
    e('div', {className: 'modal-dialog modal-fullscreen-md-down'},
      e('form', {className: 'modal-content', onSubmit: submit},
        e('div', {className: 'modal-header'},
          e('h3', {className: 'h5 modal-title'}, 'Import Timesheet'),
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
          e('label', {className: 'form-label'}, 'Timesheet Name'),
          e('input',
            {
              className: 'form-control mb-3',
              onChange: e => setName(e.target.value),
              value: name,
            },
          ),

          e('label', {className: 'form-label'}, 'Data (paste from Export)'),
          e('textarea', {
            readonly: true,
            className: 'form-control mb-3',
            rows: 5,
            value: importData,
            onChange: e => setImportData(e.target.value),
          }),
        ),
        e('div', {className: 'modal-footer'},
          e('button',
            {
              className: 'btn btn-primary',
              type: 'submit',
              disabled: !name.trim() || !importData.trim() || timesheets.indexOf(name.trim()) >= 0
            },
            'Import'
          ),
        ),
      ),
    ),
  );
}
