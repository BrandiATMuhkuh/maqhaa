/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*jshint camelcase: false */

var gigi = {};
var fire = new Firebase('https://luminous-inferno-2967.firebaseio.com');
var caffeeList = {};
caffeeList.cafe = {};
caffeeList.fire = {};

fire.child('ChIJDZzo5DeuEmsRsi1wzrIp6HY').once('value', function(snap) {
   console.log('I fetched a user!', snap.val());
});

function fireFire(){
  fire.once('value', function(snap){
    console.log('fire',snap.val());
    for(var a in snap.val()){
      console.log(a);
      caffeeList.fire[a] = snap.val()[a];
    }

    gigi.init();
  });
}


caffeeList.addCafe = function(place){
  if(place === null || place === undefined || place.place_id === null || place.place_id === undefined){
    return null;
  }

  if(caffeeList.cafe[place.place_id] === undefined){
    caffeeList.cafe[place.place_id] = place;
    return place;
  }

  return null;
};

caffeeList.getPrice = function(placeId){
  var myBean = caffeeList.fire[placeId];
  if(myBean){
    var sum = 0.0;
    var cou = 0;
    for(var c in myBean){
      console.log(c);
      if(myBean[c].r > 0.0){
        sum = sum + myBean[c].r;
        cou = cou + 1;
      }
    }
    return sum/cou;
  }


  return 0.0;
};





gigi.init = function(){
  this.map = null;
  this.service = null;
  this.cafePlace = null;
  this.markers = [];


  var mapOptions = {
    center: new google.maps.LatLng(-43.53, 172.620278),
    zoom: 15,
    mapTypeControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapMarker: false,
    overviewMapControl: false
  };

  this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);


  /*
  GeoMarker = new GeolocationMarker();
  GeoMarker.setCircleOptions({fillColor: '#808080'});
  google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function() {
    map.setCenter(this.getPosition());
  });
  GeoMarker.setMap(map);*/

  this.cafePlace = document.querySelector('my-cafe');


  this.service = new google.maps.places.PlacesService(this.map);

  google.maps.event.addListener(this.map, 'idle', this.performSearch);

};

gigi.performSearch = function() {
  console.log('perforem serarch');
  var request = {
    bounds: gigi.map.getBounds(),
    keyword: 'cafe'
  };
  gigi.service.radarSearch(request, gigi.callback);
};

gigi.callback = function(results, status) {
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
  }
  //deleteMarkers();

  for (var i = 0; i < results.length; i = i + 1) {
    //createMarker(result);

    var r = caffeeList.addCafe(results[i]);

    if(r){
      gigi.createMarker(r);
    }
  }

  //showMarkers()
};

gigi.createMarker = function(place) {
  //console.log("place", place.place_id);
  var mapLabel = new MapLabel({
    text: '$'+caffeeList.getPrice(place.place_id),
    position: place.geometry.location,
    map: this.map,
    fontSize: 15,
    align: 'center',
    icon: 'images/cafe.png'
  });

  var marker = new google.maps.Marker({
    icon: 'images/cafe.png'
  });
  marker.bindTo('map', mapLabel);
  marker.bindTo('position', mapLabel);

  this.markers.push(marker);

  var _self = this;
  google.maps.event.addListener(marker, 'click', function() {
    _self.service.getDetails(place, function(result, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      console.log(result);
      _self.cafePlace.name = result.name;
      _self.cafePlace.place_id = result.place_id;


    });
  });
};



// Sets the map on all markers in the array.
gigi.setAllMap = function(map) {
  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(map);
  }
};

// Removes the markers from the map, but keeps them in the array.
gigi.clearMarkers = function() {
  this.setAllMap(null);
};

// Shows any markers currently in the array.
gigi.showMarkers = function() {
  this.setAllMap(this.map);
};

// Deletes all markers in the array by removing references to them.
gigi.deleteMarkers = function() {
  this.clearMarkers();
  this.markers = [];
};



(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
    //gigi.init();
    fireFire();
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

})(document);
