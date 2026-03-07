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

/*
  This code is to capture the list of issues selected for a location
*/

const selectedIssues = [];

function submitIssues() {

    document.querySelectorAll('input[name="issues"]:checked')
          .forEach((checkbox) => {
              selectedIssues.push({
                  id: checkbox.id,
                  value: checkbox.value
              });
          });

      //console.log(selectedIssues);

  }


/*
 This code is for calling the api to save the issue in database
*/

//create entry in database for submit Button
document.getElementById("submit-button").addEventListener("click", async (event) => {

  submitIssues(); //call function

  // Make sure location was captured first
  if (coordinates.lat === undefined || coordinates.lng === undefined) {
    alert("Please get your location first.");
    return;
  }

  try {
    const response = await fetch("https://Sushantgarg15.pythonanywhere.com/submit/", {        //use 127.0.0.1:8000 if working on local machine
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        issues: selectedIssues
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Saved:", data);
    alert("Location saved successfully!");
    //location.reload();
  } catch (err) {
    console.error(err);
    alert("Failed to save location");
    //location.reload();
  }
});


