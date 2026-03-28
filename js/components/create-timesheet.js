const e = React.createElement;

export function CreateTimesheet(props) {
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
    e('div', {className: 'modal-dialog modal-dialog-centered', style: {maxWidth: 370}},
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
          e('input', {className: 'btn btn-primary w-100', type: 'submit', value: 'Create Timesheet'}),
          e('button',
            {
              type: 'button',
              className: 'btn btn-link bg-body-tertiary text-decoration-none text-body w-100 mt-2',
              'data-bs-dismiss': 'modal'
            },
            'Cancel'
          )
        )
      )
    )
  );
}
