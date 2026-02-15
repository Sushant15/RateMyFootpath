//Initialize map
var map = L.map('map').setView([28.6331, 77.2211], 16);

//Add Layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Variables to store coordinates
let coordinates = {
    lat: null,
    lng: null
};

// Variables to store marker
let locationMarker = null;


/**
 * Updates marker position.
 * Removes old marker if exists.
 * Creates new draggable marker.
 */
function updateMarker(map) {

    // Safety check
    if (coordinates.lat == null || coordinates.lng == null) {
        console.error("Latitude or Longitude is null.");
        return;
    }

    // Remove previous marker
    if (locationMarker) {
        locationMarker.remove();
        locationMarker = null;
    }

    // Create new draggable marker
    locationMarker = L.marker(coordinates, {
        draggable: true
    }).addTo(map);

    // Center map
    map.setView(coordinates, 18);

    console.log("Marker set to:", coordinates.lat, coordinates.lng);

    // Update lat/lng after dragging
    locationMarker.on("dragend", function () {
        const position = locationMarker.getLatLng();

        coordinates.lat = position.lat;
        coordinates.lng = position.lng;

        console.log("Marker dragged to:", coordinates.lat, coordinates.lng);
    });
}

/*
  create options object @options for getCurrentPosition() method
  creat success function @success for getCurrentPosition() method
  create error function @error for getCurrentPosition() method
*/

const options = {
  enableHighAccuracy: true,
};

function success(pos) {
  const crd = pos.coords;

  coordinates.lat = pos.coords.latitude;
  coordinates.lng = pos.coords.longitude;

  updateMarker(map); //Draggable marker functiom

  console.log("Your current position is:");
  console.log(`Latitude : ${coordinates.lat}`);
  console.log(`Longitude: ${coordinates.lng}`);
  console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);
