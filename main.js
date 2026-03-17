// =============================
// CONFIG
// =============================

// Replace with your PythonAnywhere username
const API_URL = "https://api-wandering-dream-7324.fly.dev/submit/";


// =============================
// INITIALIZE MAP
// =============================

var map = L.map('map').setView([28.6331, 77.2211], 16);

// Add OpenStreetMap layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);


// =============================
// LOCATION VARIABLES
// =============================

let coordinates = {
    lat: null,
    lng: null
};

let locationMarker = null;


// =============================
// UPDATE MARKER FUNCTION
// =============================

function updateMarker(map) {

    if (coordinates.lat === null || coordinates.lng === null) {
        console.error("Latitude or Longitude missing.");
        return;
    }

    // Remove previous marker
    if (locationMarker) {
        locationMarker.remove();
    }

    // Create draggable marker
    locationMarker = L.marker(coordinates, {
        draggable: true
    }).addTo(map);

    map.setView(coordinates, 18);

    console.log("Marker placed:", coordinates.lat, coordinates.lng);

    // Update coordinates after dragging
    locationMarker.on("dragend", function () {
        const position = locationMarker.getLatLng();

        coordinates.lat = position.lat;
        coordinates.lng = position.lng;

        console.log("Marker moved:", coordinates.lat, coordinates.lng);
    });
}


// =============================
// GEOLOCATION
// =============================

const options = {
    enableHighAccuracy: true
};

function success(pos) {

    coordinates.lat = pos.coords.latitude;
    coordinates.lng = pos.coords.longitude;

    updateMarker(map);

    console.log("Location detected:", coordinates);
}

function error(err) {
    alert("Unable to get your location. Please enable GPS.");
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Request location
navigator.geolocation.getCurrentPosition(success, error, options);


// =============================
// ISSUE COLLECTION
// =============================

function getSelectedIssues() {

    const selectedIssues = [];

    document.querySelectorAll('input[name="issues"]:checked')
        .forEach((checkbox) => {

            selectedIssues.push({
                id: Number(checkbox.id),
                value: checkbox.value
            });

        });

    return selectedIssues;
}


// =============================
// SUBMIT DATA
// =============================

const submitButton = document.getElementById("submit-button");

submitButton.addEventListener("click", async () => {

    const issues = getSelectedIssues();

    // Validate coordinates
    if (coordinates.lat === null || coordinates.lng === null) {
        alert("Location not detected yet. Please allow GPS.");
        return;
    }

    // Validate issues
    if (issues.length === 0) {
        alert("Please select at least one issue.");
        return;
    }

    // Disable button while sending
    submitButton.disabled = true;
    submitButton.innerText = "Submitting...";

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                issues: issues
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Saved:", data);

        alert("✅ Report submitted successfully!");

        // Reset form
        document.querySelectorAll('input[name="issues"]').forEach(cb => cb.checked = false);

    } catch (error) {

        console.error(error);
        alert("❌ Failed to submit report. Please try again.");

    } finally {

        submitButton.disabled = false;
        submitButton.innerText = "Submit";

    }

});

