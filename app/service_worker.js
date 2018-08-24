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

self.addEventListener('fetch', function(event) {
  //console.log('Handling fetch event for ' + event.request.url);
  let chachedReq = event.request;
  if(event.request.url.indexOf('restaurant.html') != -1){
    chachedReq = new Request("restaurant.html");
  }  
  if(event.request.method == 'GET'){
    //getting data from the cache
    event.respondWith(  
      caches.match(chachedReq).then(function(response) {
        return response || fetch(event.request)
        .then(function (response){
            return caches.open(cacheName)
            .then(function(cache){
                cache.put(event.request, response.clone());
                return response;
            });
        })
        .catch(function(error){
          return new Response('No connection to the Internet!')
        })
      })
    );
  }    
});

self.addEventListener('sync', function(event) {
  if (event.tag == 'sync') {
    event.waitUntil(sendData());
  }
});

