export const GeoEngine = {
    map: null,
    marker: null,

    async initMap(elementId, initialLat, initialLng) {
        if (this.map) this.map.remove();
        this.map = L.map(elementId).setView([initialLat, initialLng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        this.marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(this.map);
        setTimeout(() => this.map.invalidateSize(), 300);
        return this.map;
    },

    async getAddressFromCoords(lat, lng) {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
        const data = await res.json();
        if (data && data.address) {
            return {
                city: data.address.city || data.address.town || "حائل",
                district: data.address.suburb || data.address.neighbourhood || "",
                street: data.address.road || "",
                postalCode: data.address.postcode || ""
            };
        }
        return null;
    },

    async getCoordsFromAddress(fullAddress) {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
        const data = await res.json();
        return data.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
    }
};
