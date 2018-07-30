//for registering service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.
      register('/bundled_sw.js')
      .then(console.log('Service worker successfully registered'))
      .catch(err => {console.log(err)})
    });
  }
  