mapboxgl.accessToken = mapToken;

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // map style
    center: [0, 0], // Default center
    zoom: 10 // Default zoom
});

console.log(coordinates);

// Parse coordinates
const [lng, lat] = JSON.parse(coordinates);

// Check if coordinates are valid
if (isNaN(lng) || isNaN(lat)) {
    console.error('Invalid coordinates:', lng, lat);
} else {
    // Update map center
    map.setCenter([lng, lat]);
    
    // Add marker to the map
    new mapboxgl.Marker({color: 'red'})
        .setLngLat([lng, lat])
        
        .addTo(map);
}
