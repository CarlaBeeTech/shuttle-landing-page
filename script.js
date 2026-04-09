function scrollToContact() {
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("open");
}

// Close mobile menu on outside click
document.addEventListener("click", function(e) {
  const menu = document.getElementById("mobileMenu");
  const btn = document.querySelector(".mobile-menu-btn");
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove("open");
  }
});

// Shrink header on scroll
window.addEventListener("scroll", function() {
  const header = document.querySelector(".main-header");
  if (window.scrollY > 60) {
    header.style.padding = "0.6rem 3rem";
  } else {
    header.style.padding = "1rem 3rem";
  }
});

// ===== GOOGLE MAPS / ROUTE ESTIMATOR (preserved) =====
let pickupAutocomplete;
let dropoffAutocomplete;
let directionsService;
let directionsRenderer;
let map;

function initMap() {
  const kansasCity = { lat: 39.0997, lng: -94.5786 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: kansasCity,
    zoom: 10,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false,
  });

  const pickupInput = document.getElementById("pickup");
  const dropoffInput = document.getElementById("dropoff");

  if (pickupInput) {
    pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
      fields: ["formatted_address", "geometry", "name"],
    });
  }

  if (dropoffInput) {
    dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, {
      fields: ["formatted_address", "geometry", "name"],
    });
  }
}

function calculateRouteEstimate() {
  const pickup = document.getElementById("pickup").value.trim();
  const dropoff = document.getElementById("dropoff").value.trim();
  const passengerTier = document.getElementById("passengerCount").value;
  const rideType = document.getElementById("rideType").value;

  if (!pickup || !dropoff) {
    alert("Please enter both pickup and drop-off locations.");
    return;
  }

  directionsService.route(
    {
      origin: pickup,
      destination: dropoff,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status !== "OK") {
        alert("Unable to calculate route. Please check the addresses and try again.");
        return;
      }

      directionsRenderer.setDirections(response);

      const leg = response.routes[0].legs[0];
      const distanceText = leg.distance.text;
      const durationText = leg.duration.text;
      const miles = leg.distance.value / 1609.34;
      const estimate = calculateRate(miles, passengerTier, rideType);

      document.getElementById("distanceOutput").textContent = distanceText;
      document.getElementById("durationOutput").textContent = durationText;
      document.getElementById("rateOutput").textContent = `$${estimate.toFixed(2)}`;
    }
  );
}

function calculateRate(miles, passengerTier, rideType) {
  let baseFare = 25;
  let perMile = 2.75;

  let passengerFee = 0;
  if (passengerTier === "2") passengerFee = 10;
  if (passengerTier === "3") passengerFee = 25;
  if (passengerTier === "4") passengerFee = 40;

  let rideTypeFee = 0;
  if (rideType === "round") rideTypeFee = 20;
  if (rideType === "event") rideTypeFee = 35;

  return baseFare + (miles * perMile) + passengerFee + rideTypeFee;
}
