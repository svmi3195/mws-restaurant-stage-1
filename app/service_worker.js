import idb from 'idb';
const name = 'mws-restaurant-reviews-db';
const version = 2;

const idbPromise = idb.open(name, version, upgradeDB => {
  switch (upgradeDB.oldVersion){
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'})
      .createIndex('restaurant_id', 'id');
    case 1:
      upgradeDB.createObjectStore('reviews', {keyPath: 'id'})
      .createIndex('restaurant_id', 'restaurant_id');
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

  if(event.request.method == 'PUT'){
    let id = Number(event.request.url.split('/')[4]);
    let isFav = event.request.url.split('=')[1] === 'true' ? true : false;
    idbPromise.then(db => {
      db.transaction('restaurants', 'readwrite')
      .objectStore('restaurants')
      .get(id)
      .then(restaurant => {
        restaurant.is_favorite = isFav;
        db.transaction('restaurants', 'readwrite')
          .objectStore('restaurants')
          .put(restaurant)
      })
    })
  }

  let store;
  let id;
  if(event.request.url.indexOf('1337/restaurants') != -1){
    store = 'restaurants';
    id = null;
  }else if(event.request.url.indexOf('1337/reviews') != -1){
    store = 'reviews';
    id = Number(event.request.url.slice(event.request.url.indexOf('id=') + 3));
  }

  if(store){ //getting data from IndexedDb stores   
    event.respondWith(
      idbPromise.then(db => {
        return db.transaction(store)
          .objectStore(store)
          .index('restaurant_id')
          .getAll(id);
      }).then(dataArray => {
        if(dataArray.length > 0){
          return new Response(JSON.stringify(dataArray));
        }else{
          return fetch(event.request)
            .then(response => response.json())
            .then(data => {
              return idbPromise.then(db => {
                const tx = db.transaction(store, 'readwrite');                
                for(let i =0; i < data.length; i++){
                  tx.objectStore(store).put(data[i]);
                }
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
  }else{ //getting data from the cache
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
  