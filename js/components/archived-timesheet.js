const e = React.createElement;

export function ArchivedTimesheet(props) {
  return e('li', {},
    `${props.timesheet} - `,
    e('a',
      {
        role: 'button',
        className: 'text-underline',
        onClick: function(e) {
          props.dispatch({type: 'restoretimesheet', payload: {name: props.timesheet}});
        }
      },
      'Restore'
    ),
    e('span', {className: 'd-inline-block mx-2'}, '|'),
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
