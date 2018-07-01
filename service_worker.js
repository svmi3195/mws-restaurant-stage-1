let cacheName = "mws-restaurant-app-001";

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(cacheName).then(function(cache) {
        return cache.addAll(
          [
            '/',
            '/index.html',
            '/restaurant.html',
            '/css/styles.css',
            '/data/restaurants.json',
            '/js/',
            '/js/dbhelper.js',
            '/js/main.js',
            '/js/register.js',
            '/js/restaurant_info.js'
          ]
        )
        .catch(function(error){
            console.log("Failed to open caches. " + error);
        });
      })
    );
  });