import idb from 'idb';
console.log('x')
const name = 'mws-restaurant-reviews-db';
const version = 1;

const idbPromise = idb.open(name, version, upgradeDB => {
  switch (upgradeDB.oldVersion){
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});    
  }  
});

let cacheName = "mws-restaurant-app-001";

self.addEventListener('install', function(event) {
  console.log('xx')
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
  console.log('xxx')
  /*
  if(event.request.url.hostname !== 'localhost'){
    event.request.mode = "no-cors";
  }*/
  let chachedReq;
  if(event.request.url.indexOf('restaurant.html' !== -1)){
    chachedReq = new Request("restaurant.html");
  }
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
});
  