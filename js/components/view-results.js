import { formatShareData, formatElapsed } from '../utils.js';

const e = React.createElement;

export function ViewResults({ timesheets }) {
  const [startName, setStartName] = React.useState('');
  const [finishName, setFinishName] = React.useState('');

  // gross on many levels but may refactor to use context so not worth it
  const results = React.useMemo(() => {
    if (!startName || !finishName) return null;
    if (startName == finishName) return null;

    let start = window.localStorage.getItem(startName);
    start = start ? JSON.parse(start) : null;
    let finish = window.localStorage.getItem(finishName);
    finish = finish ? JSON.parse(finish) : null;

    if (!start || !finish) return null;

    // racer: {starts: [], finishes: []}
    const times = {};
    const racers = new Set([]);

    start.times.forEach(time => {
      const details = start.details[time];
      const racer = details.racer;
      racers.add(racer);
      if (!times[racer]) times[racer] = {starts: [], finishes: []};
      times[racer].starts.push(time);
    });

    finish.times.forEach(time => {
      const details = finish.details[time];
      const racer = details.racer;
      racers.add(racer);
      if (!times[racer]) times[racer] = {starts: [], finishes: []};
      times[racer].finishes.push(time);
    });

    // these are racers who have different numbers of start and finishes, so we
    // could do our best to figure out whats going on after calcualting other
    // results to see what expected times are
    const quarantinedRacers = new Set([]);

    // [{racer: runs: [time1, time2, ...], best: timex, rank: x}
    const resultsArr = [];

    racers.forEach(racer => {
      const racerTimes = times[racer];
      if (racerTimes.starts.length !== racerTimes.finishes.length) {
        quarantinedRacers.add(racer);
        return;
      }

      const runs = [];

      for (let i = 0; i < racerTimes.starts.length; i++) {
        const start = racerTimes.starts[i];
        const finish = racerTimes.finishes[i];
        if (finish < start) {
          quarantinedRacers.add(racer);
          return;
        }

        runs.push(finish - start);
      }

      const best = Math.min(...runs);
      resultsArr.push({racer, runs, best});
    });

    // TODO: deal with quarantined racers

    resultsArr.sort((a, b) => a.best - b.best);

    let rank = 0;
    let last = null;

    resultsArr.forEach(result => {
      if (result.best !== last) {
        rank += 1;
      }

      result.rank = rank;
      last = result.best;
    });

    return resultsArr;
  }, [startName, finishName]);

  const reset = React.useCallback(() => {
    setStartName('mock start');
    setFinishName('mock finish');
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
            ? e('div', {className: 'overflow-x-auto'}, e(Results, {results}))
            : 'select start and finish timesheets'
        ),
      ),
    ),
  );
}

function Results({ results }) {
  if (!results.length) return 'Unable to compute results';

  const best = results[0].best;

  const maxRuns = React.useMemo(() => {
    return Math.max(...results.map(r => r.runs.length));
  }, [results]);

  return e('table', {className: 'table table-striped table-bordered'},
    e('thead', {},
      e('tr', {},
        e('th', {}, 'Rank'),
        e('th', {}, 'Racer'),
        e('th', {}, 'Best'),
        ...(() => {
          const headers = []; 
          for (let i = 0; i < maxRuns; i++) {
            headers.push(e('th', {}, `Run ${i+1}`));
          };
          return headers;
        })(),
      ),
    ),
    e('tbody', {},
      results.map(result => {
        return e('tr', {},
          e('td', {}, result.rank),
          e('td', {className: 'fw-bold'}, '# ' + result.racer),
          e('td', {className: 'font-monospace'},
            formatElapsed(result.best),
            e('span', {className: 'small text-danger ms-2'},
              best === result.best
                ? ''
                : formatElapsed(result.best - best)
            ),
          ),
          ...(() => {
            const runs = []; 
            for (let i = 0; i < maxRuns; i++) {
              if (i >= result.runs.length) runs.push(e('td', {}, '-'));
              else runs.push(e('td', {className: 'font-monospace'}, formatElapsed(result.runs[i])))
            };
            return runs;
          })(),
        );
      }),
    ),
  );
}
