//for registering service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.
      register('/service_worker.js')
      .then(function(registration) {
        //console.log('Registration successful, scope is:', registration.scope);
      })
      .catch(err => {console.log(err)})
    });
  }
  