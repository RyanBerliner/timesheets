const e = React.createElement;

export function HeaderActions() {
  return e('div', {className: 'd-flex align-items-center'},
    e('button',
      {
        'data-bs-toggle': 'modal',
        'data-bs-target': '#createtimesheet',
        className: 'btn btn-primary rounded-pill py-2 px-3 lh-1 me-2'
      },
      'Create'
    ),
    e('div', {className: 'dropdown'},
      e(BS5ReactElements.Dropdown,
        {
          type: 'button',
          className: 'btn btn-link bg-body-tertiary text-body text-decoration-none rounded-pill py-2 px-3 lh-1',
          'data-bs-toggle': 'dropdown',
          'aria-expanded': false,
          id: 'app-options',
          config: { autoClose: 'outside' },
        },
        e('i', {className: 'bi bi-three-dots'}),
      ),
      e('ul',
        {
          className: 'dropdown-menu dropdown-menu-end',
          'aria-labelledby': 'app-options',
          style: {zIndex: 1021},
        },
        e('li', {}, e('a', {
          className: 'dropdown-item',
          'data-bs-toggle': 'modal',
          'data-bs-target': '#importtimesheet',
        }, 'Import')),
        e('li', {}, e('a', {
          className: 'dropdown-item',
          'data-bs-toggle': 'modal',
          'data-bs-target': '#exporttimesheet',
        }, 'Export')),
      ),
    ),
  );
}
