import idb from 'idb';
const name = 'mws-restaurant-reviews-db';
const version = 2;

const idbPromise = idb.open(name, version, upgradeDB => {
  switch (upgradeDB.oldVersion){
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    case 1:
      upgradeDB.createObjectStore('reviews', {keyPath: 'id'})
      .createIndex('restaurant', 'restaurant_id');
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
  let chachedReq = event.request;
  if(event.request.url.indexOf('restaurant.html') != -1){
    chachedReq = new Request("restaurant.html");
  }

  let store;
  if(event.request.url.indexOf('1337/restaurants') != -1){
    store = 'restaurants';
  }else if(event.request.url.indexOf('1337/reviews') != -1){
    store = 'reviews';
  }
  console.log(store)

  if(store){    
    event.respondWith(
      idbPromise.then(db => {
        return db.transaction(store)
          .objectStore(store).get(1);
      }).then(obj => {
        if(obj && obj.data){
          return new Response(JSON.stringify(obj.data));
        }else{
          return fetch(event.request)
            .then(response => response.json())
            .then(data => {
              return idbPromise.then(db => {
                const tx = db.transaction(store, 'readwrite');
                tx.objectStore(store).put({
                  id: store.length,
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
        }
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
  