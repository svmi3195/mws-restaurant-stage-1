//for registering service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      //register service worker
      navigator.serviceWorker.
      register('/service_worker.js')
      .then(function(registration) {
        //console.log('Registration successful, scope is:', registration.scope);
      })
      .catch(err => {console.log(err)})
    });

    //request a one-off sync
    navigator.serviceWorker.ready.then(function(swRegistration) {
      return swRegistration.sync.register('sync');
    });    
  }
  