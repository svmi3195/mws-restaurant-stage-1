import idb from 'idb';
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
  /*
  if(event.request.url.hostname !== 'localhost'){
    event.request.mode = "no-cors";
  }*/
  let chachedReq;
  if(event.request.url.indexOf('restaurant.html' !== -1)){
    chachedReq = new Request("restaurant.html");
  }

  if(event.request.url.indexOf('1337/restaurants') != -1){
    console.log('fetching restaurants from 1337');

    event.respondWith(
      idbPromise.then(db => {
        return db.transaction('restaurants')
          .objectStore('restaurants').get(1);
      }).then(obj => {
        console.log('Got data from idb');
        console.log(obj);
      
      return fetch(event.request)
      .then(response => response.json())
      .then(data => {
        return idbPromise.then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          tx.objectStore('restaurants').put({
            id: 1,
            data: data
          });
          return data; 
        })
      .then(res => {
        return new Response(JSON.stringify(res))
      })
      })
      .catch(err => {
        return new Response('Error fetching from the server: ' + err)
      })
      }));
  }else{
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
  