import { formatShareData } from '../utils.js';

const e = React.createElement;

export function ExportTimesheet({ timesheets }) {
  const [selectedTimesheet, setSelectedTimesheet] = React.useState('');

  // gross on many levels but may refactor to use context so not worth it
  const timesheet = React.useMemo(() => {
    const sheet = window.localStorage.getItem(selectedTimesheet);
    return sheet ? JSON.parse(sheet) : null;
  }, [selectedTimesheet]);

  return e(BS5ReactElements.Modal,
    {
      className: 'modal fade',
      id: 'exporttimesheet',
      tabindex: -1,
      'aria-hidden': true,
      onShow: () => setSelectedTimesheet(''),
    },
    e('div', {className: 'modal-dialog'},
      e('div', {className: 'modal-content'},
        e('div', {className: 'modal-header'},
          e('h3', {className: 'h5 modal-title'}, 'Export Timesheet'),
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
          e('label', {className: 'form-label'}, 'Timesheet'),
          e('select',
            {
              className: 'form-control mb-3',
              onChange: e => setSelectedTimesheet(e.target.value),
            },
            e('option', {value: ''}, '- select a timesheet -'),
            ...timesheets.map(name => e('option', {
              value: name,
              selected: name == selectedTimesheet,
            }, name)),
          ),

          timesheet
            ? e('textarea', {
                readonly: true,
                className: 'form-control mb-3',
                rows: 5,
                value: formatShareData(timesheet, false)
              })
            : null,

          timesheet
            ? e('p', {},
                'Copy and paste the data above to share it with others ' +
                'however they prefer. Or ',
                e('a',
                  {href: `mailto:?subject=${selectedTimesheet}&body=${formatShareData(timesheet, true)}`},
                  'click this link to send an email.'
                ),
              )
            : null,
        ),
      ),
    ),
  );
}
