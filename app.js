var L = require('leaflet');
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

var map = L.map('map');
map.setView([47.63, -122.32], 11);

var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var tiles = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';

var layer = L.tileLayer(tiles, {
  maxZoom: 18,
  attribution: attribution
});

layer.addTo(map);
