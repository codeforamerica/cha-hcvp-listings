var $ = require('jquery');
var _ = require('underscore');
var L = require('leaflet');
require('leaflet-providers');

var icon = L.divIcon({className: 'leaflet-div-icon'})
var selectedIcon = L.divIcon({className: 'leaflet-div-icon selected'});

var listings = $('#listings');
var map = L.map('map');
map.setView([35.045556, -85.267222], 11);

L.tileLayer.provider('MapBox.jeremiak.jn9nfl41').addTo(map);

var homeData = require('./data/homes.json');
var layerGroups = {}, listingGroups = {}, currentLayer, selectedListing, selectedMarker;

function filterData(data) {
  var bedroomQuery = $('#bedrooms').val(), bathroomQuery = $('#bathrooms').val(), homes;
  var groupName = bedroomQuery + ':' + bathroomQuery;

  if (bedroomQuery == 'Any' && bathroomQuery == 'Any') {
    homes = data;
  }
  else if (bedroomQuery != 'Any' && bathroomQuery == 'Any') {
    homes = _.filter(data, function(house){
      return house.bed == parseInt(bedroomQuery);
    });
  }
  else if (bedroomQuery == 'Any' && bathroomQuery != 'Any') {
    homes = _.filter(data, function(house){
      return house.bath == parseInt(bathroomQuery);
    });
  }
  else if (bedroomQuery != 'Any' && bathroomQuery != 'Any') {
    homes = _.filter(data, function(house){
      return (house.bed == parseInt(bedroomQuery) && house.bath == parseInt(bathroomQuery));
    });
  }

  if (currentLayer) {
    map.removeLayer(currentLayer);
    listings.empty();
  }

  if (!layerGroups.hasOwnProperty(groupName)) {
    layerGroups[groupName] = L.layerGroup();
    listingGroups[groupName] = [];

    for (var i=0; i<homes.length; i++) {
      processHomes(homes[i], layerGroups[groupName], listingGroups[groupName])
    }
  }

  currentLayer = layerGroups[groupName];
  layerGroups[groupName].addTo(map);
  listingGroups[groupName].forEach(function(listing){
    $(listings).append(listing);
  });
}

function processHomes(json, layerGroup, listingGroup) {
  var marker = createMarker(json.name, json.lat, json.lng);
  var listing = createListingHtml(json.name, json.bed, json.bath);

  marker.listing = listing;
  listing[0].marker = marker;

  marker.on('click', selectListingFromMarker);
  listing.on('click', selectMarkerFromListing);

  listingGroup.push(listing);
  layerGroup.addLayer(marker);
}

function createMarker(name, lat, lng) {
  var marker = L.marker([lat, lng], {icon: icon});
  return marker
}

function createListingHtml(name, bed, bath) {
  var html = 'Property name: ' + name;
  html += '<br />Beds: ' + bed;
  html += '<br />Baths: ' + bath;

  return $('<div class="listing">' + html + '</div>');
}

function handleCurrentlySelected(listing, marker) {
  if (selectedListing) { $(selectedListing).removeClass('selected'); }
  if (selectedMarker) { selectedMarker.setIcon(icon); }
  selectedListing = listing;
  selectedMarker = marker;
  $(listing).addClass('selected');
  marker.setIcon(selectedIcon);
}

function selectListingFromMarker(e) {
  var listing = e.target.listing;
  handleCurrentlySelected(listing, e.target);
}

function selectMarkerFromListing(e) {
  var marker = e.target.marker;
  handleCurrentlySelected(e.target, marker);
}

$(document).ready(function() {
  $('#bedrooms').on('change', function(e){
    filterData(homeData);
  });

  $('#bathrooms').on('change', function(e) {
    filterData(homeData);
  })

  filterData(homeData);
});

window.$ = $;
window.map = map;
window.filterData = filterData;
window.homeData = homeData;
