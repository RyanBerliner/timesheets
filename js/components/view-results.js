import { formatShareData, formatElapsed } from '../utils.js';

const e = React.createElement;

export function ViewResults({ timesheets }) {
  const [startName, setStartName] = React.useState('');
  const [finishName, setFinishName] = React.useState('');

  // gross on many levels but may refactor to use context so not worth it
  const [results, quarantinedResults] = React.useMemo(() => {
    const empty = [[], new Set([])];
    if (!startName || !finishName) return empty;
    if (startName == finishName) return empty;

    let start = window.localStorage.getItem(startName);
    start = start ? JSON.parse(start) : null;
    let finish = window.localStorage.getItem(finishName);
    finish = finish ? JSON.parse(finish) : null;

    if (!start || !finish) return empty;

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
    let slowest = 0;
    let fastest = Infinity;

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

      const worst = Math.max(...runs);
      const best = Math.min(...runs);
      if (worst > slowest) slowest = worst;
      if (best < fastest) fastest = best;
      resultsArr.push({racer, runs, best});
    });

    quarantinedRacers.forEach(racer => {
      // we'll go through each start value and try to line up a finish value.
      // if we cannot find a reasonable one, discard that start value and try
      // the next one.
      const racerTimes = times[racer];
      const runs = [];
      let lastUsedF = 0;

      racerTimes.starts.forEach(start => {
        for (let f = lastUsedF; f < racerTimes.finishes.length; f++) {
          const time = racerTimes.finishes[f] - start;
          if (time >= fastest && time <= slowest) {
            runs.push(time);
            lastUsedF = f;
            return;
          }
        }

        // cannot find a finish, assume this run is a dnf
        runs.push(Infinity);
      });

      const best = Math.min(...runs);
      resultsArr.push({racer, runs, best});
    });

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

    return [resultsArr, quarantinedRacers];
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
    e('div', {className: 'modal-dialog modal-lg modal-fullscreen-lg-down'},
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
          e('div', {className: 'row'},
            e('div', {className: 'col-6'},
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
            ),
            e('div', {className: 'col-6'},
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
            ),
          ),

          (startName && finishName)
            ? e('div', {className: 'overflow-x-auto'}, e(Results, {results, quarantinedResults}))
            : e(Select),
        ),
      ),
    ),
  );
}

function Select() {
  return e('div', {className: 'text-center text-muted mt-3 px-3'},
    'Select the start and finish timesheets to view results.'
  );
}

function Error() {
  return e('div', {className: 'text-center text-muted mt-3 px-3'},
    'Unable to compute results from the selected timesheets.'
  );
}

function QuarantineNotice() {
  return e('div', {className: 'text-muted'},
    'The',
    e('i', {className: 'text-danger mx-1 bi bi-question-circle-fill'}),
    'icon indicates there may be missing data. The app will try showing the ' +
    'valid runs it can figure out but it won\'t always do so correctly. You ' +
    'should find the issue and fix the timesheets if possible.'
  );
}


function Results({ results, quarantinedResults }) {
  if (!results.length) return e(Error);

  const best = results[0].best;

  const maxRuns = React.useMemo(() => {
    return Math.max(...results.map(r => r.runs.length));
  }, [results]);

  return e('div', {},
    quarantinedResults.size ? e(QuarantineNotice) : null,
    e('table', {className: 'mt-3 table table-striped table-bordered text-nowrap'},
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
          let delta = best === result.best
            ? ''
            : formatElapsed(result.best - best);

          if (delta === '?') delta = '';

          return e('tr', {},
            e('td', {className: quarantinedResults.has(result.racer) ? 'text-danger' : ''},
              quarantinedResults.has(result.racer)
                ? e(BS5ReactElements.Tooltip, {title: 'Missing data'},
                    result.rank,
                    e('i', {className: 'ms-1 bi bi-question-circle-fill'}),
                  )
                : result.rank
            ),
            e('td', {className: 'fw-bold'}, '# ' + result.racer),
            e('td', {className: 'font-monospace'},
              formatElapsed(result.best),
              e('span', {className: 'small text-danger ms-2'}, delta),
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
    ),
  )
}
