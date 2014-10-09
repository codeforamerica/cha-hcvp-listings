var $ = require('jquery');
var _ = require('underscore');
var L = require('leaflet');
require('leaflet-providers');

var Miso = require('miso.dataset');

var icon = L.divIcon({className: 'leaflet-div-icon'})
var selectedIcon = L.divIcon({className: 'leaflet-div-icon selected'});

var listings = $('#listings');
var map = L.map('map');
map.setView([35.045556, -85.267222], 11);

L.tileLayer.provider('MapBox.jeremiak.jn9nfl41').addTo(map);

var sourceData;
var layerGroups = {}, listingGroups = {}, currentLayer, selectedListing, selectedMarker;

function filterData(data) {
  var bedroomQuery = $('#bedrooms').val(), bathroomQuery = $('#bathrooms').val(), homes;
  var groupName = bedroomQuery + ':' + bathroomQuery;

  if (bedroomQuery == 'Any' && bathroomQuery == 'Any') {
    homes = data;
  }
  else if (bedroomQuery != 'Any' && bathroomQuery == 'Any') {
    homes = _.filter(data, function(house){
      return house.BED == parseInt(bedroomQuery);
    });
  }
  else if (bedroomQuery == 'Any' && bathroomQuery != 'Any') {
    homes = _.filter(data, function(house){
      return house.BATH == parseInt(bathroomQuery);
    });
  }
  else if (bedroomQuery != 'Any' && bathroomQuery != 'Any') {
    homes = _.filter(data, function(house){
      return (house.BED == parseInt(bedroomQuery) && house.BATH == parseInt(bathroomQuery));
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
  var home = json;
  var marker = createMarker(json.ADDRESS, json.LAT, json.LNG);
  var listing = createListingHtml(home);

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

function createListingHtml(home) {
  var html = 'Property name: ' + home.ADDRESS;
  html += '<br />Beds: ' + home.BED;
  html += '<br />Baths: ' + home.BATH;
  html += '<br />Rent: ' + home.RENT;
  html += '<br />Security Deposit: ' + home['SEC DEP'];

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
    filterData(sourceData);
  });

  $('#bathrooms').on('change', function(e) {
    filterData(sourceData);
  });

  var ds = new Miso.Dataset({
    key : "10daWmhJnvckLq0v8HE5LsAlEotgG34H_9JQR0TLkPuo",
    worksheet: "1",
    importer: Miso.Dataset.Importers.GoogleSpreadsheet,
    parser : Miso.Dataset.Parsers.GoogleSpreadsheet
  });

  ds.fetch({
    success: function() {
      sourceData = _.filter(ds.toJSON(), function(d) {
        return d.AVAILABLE != 'NO';
      });
      filterData(sourceData);
    },
    error: function(e) {
      console.log('failed');
    }
  });

});

window.$ = $;
window._ = _;
window.map = map;
window.filterData = filterData
