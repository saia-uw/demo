// In the following example, markers appear when the user clicks on the map.
// Each marker is labeled with a single alphabetical character.
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

function initMap() {
  var center = new google.maps.LatLng(47.590045, -122.270962);  
  var map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 12,
    mapTypeControl: false,
    fullscreenControl: false,
    // zoomControl:false
  });

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);

  var styles = [
    {
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];

  map.setOptions({styles: styles}); 

  var flightPlanCoordinates = [
    {lat: 47.590380, lng: -122.285647},
    {lat: 47.589660, lng: -122.254236}
  ];
  var flightPlanCoordinates2 = [
    {lat: 47.589951, lng: -122.285939},
    {lat: 47.589268, lng: -122.254213}
  ];
  var flightPlanCoordinates3 = [
    {lat: 47.589268, lng: -122.254213},
    {lat: 47.589951, lng: -122.285939}
    
  ];
  addLine(flightPlanCoordinates, map, '#FF0000');
  addLine(flightPlanCoordinates2, map, '#FF0000');
  addCircle(center, 3000, map);
  addMarker(center, map);
}

function addCircle(center, radius, map) {
  // Add the circle for this city to the map.
  var cityCircle = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    center: center,
    radius: radius
  });
}

function addLine(flightPlanCoordinates, map, color) {
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 5
  });
  flightPath.setMap(map);
}

// Adds a marker to the map.
function addMarker(location, map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  var image = {
    // url: "https://image.flaticon.com/icons/png/128/179/179386.png",
    // url: "https://image.flaticon.com/icons/png/128/497/497738.png",
    url: "images/warning.png",
    // This marker is 20 pixels wide by 32 pixels high.
    scaledSize: new google.maps.Size(30, 30),
    // // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(15, 30)
  }
  var marker = new google.maps.Marker({
    position: location,
    // label: labels[labelIndex++ % labels.length],
    map: map,
    icon: image
  });
  addInfoWindow(
    "Incident: SeattleTanker, \
    will last ~3 hrs", 
    marker, map
  );
}

function addInfoWindow(contentString, marker, map) {
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}


/**
 * Returns the Popup class.
 *
 * Unfortunately, the Popup class can only be defined after
 * google.maps.OverlayView is defined, when the Maps API is loaded.
 * This function should be called by initMap.
 */
function createPopupClass() {
  /**
   * A customized popup on the map.
   * @param {!google.maps.LatLng} position
   * @param {!Element} content The bubble div.
   * @constructor
   * @extends {google.maps.OverlayView}
   */
  function Popup(position, content) {
    this.position = position;

    content.classList.add('popup-bubble');

    // This zero-height div is positioned at the bottom of the bubble.
    var bubbleAnchor = document.createElement('div');
    bubbleAnchor.classList.add('popup-bubble-anchor');
    bubbleAnchor.appendChild(content);

    // This zero-height div is positioned at the bottom of the tip.
    this.containerDiv = document.createElement('div');
    this.containerDiv.classList.add('popup-container');
    this.containerDiv.appendChild(bubbleAnchor);

    // Optionally stop clicks, etc., from bubbling up to the map.
    google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv);
  }
  // ES5 magic to extend google.maps.OverlayView.
  Popup.prototype = Object.create(google.maps.OverlayView.prototype);

  /** Called when the popup is added to the map. */
  Popup.prototype.onAdd = function() {
    this.getPanes().floatPane.appendChild(this.containerDiv);
  };

  /** Called when the popup is removed from the map. */
  Popup.prototype.onRemove = function() {
    if (this.containerDiv.parentElement) {
      this.containerDiv.parentElement.removeChild(this.containerDiv);
    }
  };

  /** Called each frame when the popup needs to draw itself. */
  Popup.prototype.draw = function() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);

    // Hide the popup when it is far out of view.
    var display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.containerDiv.style.left = divPosition.x + 'px';
      this.containerDiv.style.top = divPosition.y + 'px';
    }
    if (this.containerDiv.style.display !== display) {
      this.containerDiv.style.display = display;
    }
  };

  return Popup;
}