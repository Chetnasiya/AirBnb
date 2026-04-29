console.log("Coords in map.js:", coords);

const map = L.map('map').setView(coords, 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
}).addTo(map);

L.marker(coords).addTo(map)
    .bindPopup(`<b>${listingTitle}</b><br>${listingLocation}`)
    .openPopup();

    