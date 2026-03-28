const skipWaitingBtn = document.getElementById('sw-skip-waiting');
const updateAlert = document.getElementById('sw-update-alert');

function showSkipWaiting(registration) {
  updateAlert.classList.remove('d-none');
  skipWaitingBtn.addEventListener('click', function(event) {
    event.preventDefault();
    registration.waiting.postMessage('SKIP_WAITING');
  });
}

// https://developers.google.com/web/ilt/pwa/introduction-to-service-worker
// https://whatwebcando.today/articles/handling-service-worker-updates/
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js', {scope: '/timesheets/'})
  .then(function(registration) {
    console.log('Service worker registration successful, scope is:', registration.scope);

    if (registration.waiting) {
      showSkipWaiting(registration);
    }

    registration.addEventListener('updatefound', function() {
      if (registration.installing) {
        registration.installing.addEventListener('statechange', function() {
          if (registration.waiting && navigator.serviceWorker.controller) {
            showSkipWaiting(registration);
          }
        });
      }
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}

