// Create IndexedDB database with restaurants and reviews stores

const name = 'mws-restaurant-reviews-db';
const version = 2;

const idbPromise = idb.open(name, version, upgradeDB => {
  console.log('starting idb')
  switch (upgradeDB.oldVersion){
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'})
      .createIndex('restaurant_id', 'id');
    case 1:
      upgradeDB.createObjectStore('reviews', {keyPath: 'id'})
      .createIndex('restaurant_id', 'restaurant_id');
  }  
});

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }

  static get DATABASE_URL_REVIEWS() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/`;
  }

  /**
   * Fetch all restaurants.
   */

  static fetchRestaurants(callback){
    fetch(DBHelper.DATABASE_URL, {method: 'GET'})
      .then(res => res.json())
      .then(data => {
        callback(null, data);
      })
      .catch(err => {callback(err, null)})
  }

  static fetchReviewsByRestId(id, callback){
    fetch(DBHelper.DATABASE_URL_REVIEWS + '?restaurant_id=' + id, {method: 'GET'})
      .then(res => res.json())
      .then(data => {
        callback(null, data);
      })
      .catch(err => {callback(err, null)})
  }

  // Mark or unmark restaurant as favourite
  static toggleFavourite(id, isFav) {
    //send data to remote db
    fetch(DBHelper.DATABASE_URL + id + '/?is_favorite=' + isFav, {method: 'PUT'})
    //updata data in IndexedDB
    .then(
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
    )
  }

  // Add new review
  static addReview(review){
    fetch(DBHelper.DATABASE_URL_REVIEWS, {
      method: 'POST',
      body: JSON.stringify(review)
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph ? `/img/${restaurant.photograph}` : '/img/na';
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
/*
addEventListener('fetch', event => {
  if (event.request.method != 'GET') return;

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
  }


})*/
