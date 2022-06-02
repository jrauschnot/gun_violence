// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  accessToken: API_KEY
});

// We create the second tile layer that will be the background of our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  accessToken: API_KEY
});

// We create the third tile layer that will be the background of our map.
let night = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  accessToken: API_KEY
});

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
  center: [40.7, -94.5],
  zoom: 3,
  layers: [night]
});

// Create a base layer that holds all three maps.
let baseMaps = {
  "Streets": streets,
  "Satellite": satelliteStreets,
  "Night": night
};

// 1. Add a 2nd layer group.
let allGunViolence = new L.LayerGroup();

// 2. Add a reference to the tectonic plates group to the overlays object.
let overlays = {
  "Mass Shootings: Total Victims": allGunViolence,
};

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Accessing the GeoJSON URL
let shootingData = "https://raw.githubusercontent.com/jrauschnot/gun_violence/main/Last_Clean_final_gun_violence.geojson"

// Retrieve the earthquake GeoJSON data.
d3.json(shootingData).then(function (data) {
  console.log(data);
  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(features) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(features.properties.total_victims_x),
      color: "#000000",
      radius: getRadius(features.properties.total_victims_x),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(total_victims_x) {
    if (total_victims_x > 100) {
      return "#ea2c2c";
    }
    if (total_victims_x > 50) {
      return "#ea822c";
    }
    if (total_victims_x > 25) {
      return "#ee9c00";
    }
    if (total_victims_x > 10) {
      return "#eecc00";
    }
    if (total_victims_x > 5) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(total_victims_x) {
    if (total_victims_x === 0) {
      return 1;
    }
    return total_victims_x / 4 ;
  }

  // Creating a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function (features, latlng) {
      console.log(data);
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each circleMarker to display the magnitude and location of the earthquake
    // after the marker has been created and styled.
    onEachFeature: function (features, layer) {
      layer.bindPopup("Total Killed or Injured: " + features.properties.total_victims_x + "<br>Location: " + features.properties.city_state + "<br>Date: " + features.properties.date);
    }
  }).addTo(allGunViolence);

  // Then we add the earthquake layer to our map.
  allGunViolence.addTo(map);

  // Here we create a legend control object.
  let legend = L.control({ position: "bottomright" });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    total_victims_x = [0, 5, 10, 25, 50, 100];
    colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < total_victims_x.length; i++) {
      console.log(colors[i]);
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        total_victims_x[i] + (total_victims_x[i + 1] ? "&ndash;" + total_victims_x[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, we our legend to the map.
  legend.addTo(map);


  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(total_victims_x) {
    if (total_victims_x >= 75) {
      return total_victims_x / 20;
    }
    return total_victims_x / 2;
  }

  // Creating a GeoJSON layer with the retrieved data.
  L.geojson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function (features, latlng) {
      console.log(data);
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each circleMarker to display the magnitude and location of the earthquake
    // after the marker has been created and styled.
    onEachFeature: function (features, layer) {
      layer.bindPopup("Total Killed or Injured: " + total_victims_x + "<br>Location: " + features.properties.city_state + "Date: " + features.properties.date);
    }
  }).addTo(allGunViolence);

  // Then we add the earthquake layer to our map.
  allGunViolence.addTo(map);

});