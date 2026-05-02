import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 
import { GeoEngine } from './map-logic.js';

const customersRef = collection(db, "customers");
let customersDataList = [];

async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        tbody.innerHTML = '';
        customersDataList = [];
        let index = 1;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;
            customersDataList.push(data);

            const refreshKey = new Date().getTime();
            let mapLink = "";

            if (data.latitude && data.longitude) {
                mapLink = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}&t=${refreshKey}`;
            } else {
                const addr = [data.country, data.city, data.district, data.street, data.buildingNo, data.additionalNo, data.postalCode, data.poBox]
                             .filter(p => p && p.trim() !== "").join(" / ");
                mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || "حائل")}&t=${refreshKey}`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td class="sticky-col"><strong>${data.name}</strong></td>
                <td>${data.phone}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td><a href="${mapLink}" target="_blank">📍 عرض</a></td>
                <td>${data.status || 'نشط'}</td>
                <td class="sticky-col-right">
                    <button onclick="openEditModal('${data.id}')">✏️</button>
                    <button onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>`;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error(e); }
}

async function updateMapFromText() {
    const parts = ['edit-street', 'edit-district', 'edit-city', 'edit-country'].map(id => document.getElementById(id).value);
    const query = parts.filter(p => p).join(" ");
    if (query.length < 5) return;

    const coords = await GeoEngine.getCoordsFromAddress(query);
    if (coords && GeoEngine.map) {
        GeoEngine.map.setView([coords.lat, coords.lng], 15);
        GeoEngine.marker.setLatLng([coords.lat, coords.lng]);
        document.getElementById('edit-lat').value = coords.lat;
        document.getElementById('edit-lng').value = coords.lng;
    }
}

window.openEditModal = async (id) => {
    const c = customersDataList.find(item => item.id === id);
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name;
    document.getElementById('edit-phone').value = c.phone;
    document.getElementById('edit-country').value = c.country || 'المملكة العربية السعودية';
    document.getElementById('edit-city').value = c.city || 'حائل';
    document.getElementById('edit-district').value = c.district || '';
    document.getElementById('edit-street').value = c.street || '';
    document.getElementById('edit-buildingNo').value = c.buildingNo || '';
    document.getElementById('edit-additionalNo').value = c.additionalNo || '';
    document.getElementById('edit-postalCode').value = c.postalCode || '';
    document.getElementById('edit-poBox').value = c.poBox || '';

    const lat = parseFloat(c.latitude) || 27.5236;
    const lng = parseFloat(c.longitude) || 41.6966;
    document.getElementById('edit-lat').value = lat;
    document.getElementById('edit-lng').value = lng;

    document.getElementById('edit-customer-modal').classList.add('active');
    
    setTimeout(async () => {
        await GeoEngine.initMap('modal-map', lat, lng);
        GeoEngine.marker.on('dragend', async (e) => {
            const pos = e.target.getLatLng();
            document.getElementById('edit-lat').value = pos.lat;
            document.getElementById('edit-lng').value = pos.lng;
            const addr = await GeoEngine.getAddressFromCoords(pos.lat, pos.lng);
            if (addr) {
                document.getElementById('edit-city').value = addr.city;
                document.getElementById('edit-district').value = addr.district;
                document.getElementById('edit-street').value = addr.street;
            }
        });
    }, 300);
};

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    document.querySelectorAll('.address-input').forEach(el => el.addEventListener('change', updateMapFromText));
});

document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    await updateDoc(doc(db, "customers", id), {
        name: document.getElementById('edit-name').value,
        country: document.getElementById('edit-country').value,
        city: document.getElementById('edit-city').value,
        district: document.getElementById('edit-district').value,
        street: document.getElementById('edit-street').value,
        buildingNo: document.getElementById('edit-buildingNo').value,
        additionalNo: document.getElementById('edit-additionalNo').value,
        postalCode: document.getElementById('edit-postalCode').value,
        poBox: document.getElementById('edit-poBox').value,
        latitude: document.getElementById('edit-lat').value,
        longitude: document.getElementById('edit-lng').value
    });
    alert("تم التحديث!");
    location.reload();
};
