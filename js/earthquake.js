// create default map object
var myMap = L.map("map", {
    center: [34.79, -44.98],
    zoom: 3,
    tileLayer: {
        // this map option disables world wrapping. by default, it is false.
        continuousWorld: false,
        // this option disables loading tiles outside of the world bounds.
        noWrap: true
    }
});

// default tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibHluaWd1ZXoiLCJhIjoiY2plNmkwMGJtMDBrczJ4cDhmanBycm40NyJ9.dFcvJVP-r3OUfkq2tcrDYQ").addTo(myMap);

// get maps
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibHluaWd1ZXoiLCJhIjoiY2plNmkwMGJtMDBrczJ4cDhmanBycm40NyJ9.dFcvJVP-r3OUfkq2tcrDYQ",{id: 'map'});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibHluaWd1ZXoiLCJhIjoiY2plNmkwMGJtMDBrczJ4cDhmanBycm40NyJ9.dFcvJVP-r3OUfkq2tcrDYQ",{id: 'map'});

// Define basemap layers
var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellite
};

// earthquake link and plate tectonic links
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"    

// Control layers
var controlLayers = L.control.layers(baseMaps).addTo(myMap);


// style earthquake circles
function styleInfo(feature) {
    return{
    fillOpacity: 0.75,
    fillColor: getColor(feature.properties.mag), //function to return color gradient on magniture
    radius: getRadius(feature.properties.mag), // functino to return radius depending on magnitude
    stroke: true,
    color: "black",
    weight: 0.5
    }
};

// gold to crimson gradient
function getColor(magnitude){
    switch(true) {
        case magnitude > 5:
        return "#BF000E"; 
        case magnitude > 4:
        return "#C8290A"; 
        case magnitude > 3:
        return "#D25307"; 
        case magnitude > 2:
        return "#DB7C03"; 
        case magnitude > 1:
        return "#E5A600"; 
        default:
        return "#E5A605"; 
    }
};

function getRadius(magnitude){
    switch(true) {
        case magnitude > 5:
        return 25;
        case magnitude > 4:
        return 20;
        case magnitude > 3:
        return 15;
        case magnitude > 2:
        return 10;
        case magnitude > 1:
        return 5;
        default:
        return 5;
    }
};

// earthquake info popup
function earthquakeInfo(feature, layer) {
    layer.bindPopup("<h4 class='infoHeader'>Weekly Earthquake Data</h4> \
    <p class='description'>" + "Location: " + feature.properties.place + "</p>\
    <p class='description'>" + "Magnitude: " + feature.properties.mag + "</p>\
    <p class='description'>" + "Time: " + new Date(feature.properties.time) + "</p>");
        
};


// plates info popup
function platesInfo(feature, layer) {
    layer.bindPopup("<h3 class='infoHeader'>Tectonic Plate:</h1> \
<p class='plate'>" + feature.properties.PlateName + "</p>");
}

// plate color
function colorPlates(feature){
    return{
        color: "#CCCA24",
        fillOpacity: 0.05
    };
};

// d3 json to add plates layer
d3.json(platesLink, function(data) {
    
    var platesLayer = L.geoJson(data, {
        // Create popup info for each plate layer
        onEachFeature: platesInfo,

     }).addTo(myMap);
    controlLayers.addOverlay(platesLayer, "Plates");
});

// d3 json to add earthquake layer
d3.json(link, function(data){
    var earthquakeLayer = L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
        onEachFeature: earthquakeInfo,
        
        
      }).addTo(myMap);
      controlLayers.addOverlay(earthquakeLayer, 'Earthquakes');

    });
// create leaflet legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);



