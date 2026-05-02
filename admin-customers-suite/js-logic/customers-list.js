/**
 * نظام Tera V12 - محرك قائمة العملاء
 */

import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

// 🌟 استدعاء محرك الخرائط الخاص بك
import { GeoEngine } from './map-logic.js';

const customersRef = collection(db, "customers");
let customersDataList = [];

// ... (دالة loadCustomers تبقى كما هي تماماً لجلب الجدول) ...
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        customersDataList = [];
        tbody.innerHTML = '';

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id; 
            customersDataList.push(data);

            const firstLetter = data.name ? data.name.charAt(0).toUpperCase() : '?';
            const avatarHtml = data.avatarUrl ? `<img src="${data.avatarUrl}">` : firstLetter;

            // استخدام الإحداثيات إذا توفرت
            let mapSearchUrl = "";
            if (data.latitude && data.longitude) {
                mapSearchUrl = `https://www.google.com/maps/?q=${data.latitude},${data.longitude}`;
            } else {
                const fullAddress = `${data.country || ''} ${data.city || ''} ${data.district || ''} ${data.street || ''} ${data.buildingNo || ''}`.trim();
                mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
            }

            const dateAdded = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-';
            const status = data.status || "نشط";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td class="sticky-col">
                    <div class="avatar-cell">
                        <div class="avatar-circle">${avatarHtml}</div>
                        <strong>${data.name || '-'}</strong>
                    </div>
                </td>
                <td dir="ltr">${data.phone || '-'}</td>
                <td dir="ltr">${data.countryCode || '+966'}</td>
                <td>${data.email || '-'}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td><a href="${mapSearchUrl}" target="_blank" class="map-link">📍 الموقع</a></td>
                <td>${dateAdded}</td>
                <td>${status}</td>
                <td><span class="tag-badge">${data.tag || 'عام'}</span></td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')">✏️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        const countElement = document.getElementById('customers-count');
        if (countElement) countElement.innerText = customersDataList.length;

    } catch (error) {
        console.error(error);
    }
}

// ----------------------------------------------------
// التعبئة التلقائية من الخريطة إلى الحقول
// ----------------------------------------------------
async function updateFieldsFromGeoEngine(lat, lng) {
    document.getElementById('edit-lat').value = lat;
    document.getElementById('edit-lng').value = lng;
    
    // استخدام دالتك الذكية لجلب العنوان
    const addr = await GeoEngine.getAddressFromCoords(lat, lng);
    if(addr) {
        document.getElementById('edit-city').value = addr.city || '';
        document.getElementById('edit-district').value = addr.district || '';
        document.getElementById('edit-postalCode').value = addr.postalCode || '';
        
        // استخراج تفاصيل أدق إذا لزم الأمر
        if (addr.fullAddress) {
            const parts = addr.fullAddress.split('،');
            if(parts.length > 0) document.getElementById('edit-street').value = parts[0].trim();
        }
    }
}

// ----------------------------------------------------
// التحديث من الحقول إلى الخريطة (عكسي)
// ----------------------------------------------------
function updateMapFromText() {
    if (!GeoEngine.geocoder || !GeoEngine.map) return;
    
    const country = document.getElementById('edit-country').value;
    const city = document.getElementById('edit-city').value;
    const district = document.getElementById('edit-district').value;
    const street = document.getElementById('edit-street').value;
    
    const fullAddress = `${street} ${district} ${city} ${country}`.trim();
    if(fullAddress.length < 4) return;

    GeoEngine.geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            GeoEngine.map.setCenter(location);
            GeoEngine.marker.setPosition(location);
            
            document.getElementById('edit-lat').value = location.lat();
            document.getElementById('edit-lng').value = location.lng();
        }
    });
}

// ----------------------------------------------------
// زر تحديد موقعي (GPS)
// ----------------------------------------------------
window.autoDetectLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if(GeoEngine.map && GeoEngine.marker) {
                const pos = new google.maps.LatLng(lat, lng);
                GeoEngine.map.setCenter(pos);
                GeoEngine.marker.setPosition(pos);
            }
            updateFieldsFromGeoEngine(lat, lng);
        }, () => { alert("يرجى تفعيل الموقع في المتصفح."); });
    }
};

// مراقبة الحقول لتحديث الخريطة تلقائياً عند الكتابة
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    document.querySelectorAll('.address-input').forEach(input => {
        input.addEventListener('change', updateMapFromText);
    });
});

// ----------------------------------------------------
// نظام التعديل (المودال) والربط مع محركك
// ----------------------------------------------------
window.openEditModal = async (id) => {
    const customer = customersDataList.find(c => c.id === id);
    if (!customer) return;

    // تعبئة البيانات...
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = customer.name || '';
    document.getElementById('edit-phone').value = customer.phone || '';
    document.getElementById('edit-countryCode').value = customer.countryCode || '+966';
    document.getElementById('edit-email').value = customer.email || '';
    document.getElementById('edit-country').value = customer.country || 'المملكة العربية السعودية';
    document.getElementById('edit-city').value = customer.city || 'حائل';
    document.getElementById('edit-district').value = customer.district || '';
    document.getElementById('edit-street').value = customer.street || '';
    document.getElementById('edit-buildingNo').value = customer.buildingNo || '';
    document.getElementById('edit-additionalNo').value = customer.additionalNo || '';
    document.getElementById('edit-postalCode').value = customer.postalCode || '';
    document.getElementById('edit-poBox').value = customer.poBox || '';
    document.getElementById('edit-tag').value = customer.tag || '';
    document.getElementById('edit-status').value = customer.status || 'نشط';

    const lat = parseFloat(customer.latitude) || 27.5236; // حائل افتراضياً
    const lng = parseFloat(customer.longitude) || 41.6966;
    
    document.getElementById('edit-lat').value = lat;
    document.getElementById('edit-lng').value = lng;

    document.getElementById('edit-customer-modal').classList.add('active');

    // 🚀 تشغيل محركك (GeoEngine)
    setTimeout(async () => {
        await GeoEngine.initMap('modal-map', lat, lng);
        
        // عند سحب الدبوس
        GeoEngine.marker.addListener('dragend', () => {
            const pos = GeoEngine.marker.getPosition();
            updateFieldsFromGeoEngine(pos.lat(), pos.lng());
        });

        // عند النقر على الخريطة
        GeoEngine.map.addListener('click', (e) => {
            GeoEngine.marker.setPosition(e.latLng);
            updateFieldsFromGeoEngine(e.latLng.lat(), e.latLng.lng());
        });
    }, 300); // تأخير بسيط لضمان ظهور النافذة قبل رسم الخريطة
};

window.closeEditModal = () => {
    document.getElementById('edit-customer-modal').classList.remove('active');
};

// حفظ البيانات في فايربيس
const editForm = document.getElementById('edit-customer-form');
if(editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-doc-id').value;
        const saveBtn = document.querySelector('.save-btn');
        saveBtn.innerText = 'جارِ الحفظ...';
        saveBtn.disabled = true;

        try {
            await updateDoc(doc(db, "customers", id), {
                name: document.getElementById('edit-name').value,
                phone: document.getElementById('edit-phone').value,
                countryCode: document.getElementById('edit-countryCode').value,
                email: document.getElementById('edit-email').value,
                country: document.getElementById('edit-country').value,
                city: document.getElementById('edit-city').value,
                district: document.getElementById('edit-district').value,
                street: document.getElementById('edit-street').value,
                buildingNo: document.getElementById('edit-buildingNo').value,
                additionalNo: document.getElementById('edit-additionalNo').value,
                postalCode: document.getElementById('edit-postalCode').value,
                poBox: document.getElementById('edit-poBox').value,
                tag: document.getElementById('edit-tag').value,
                status: document.getElementById('edit-status').value,
                latitude: document.getElementById('edit-lat').value || null,
                longitude: document.getElementById('edit-lng').value || null,
                updatedAt: new Date().toISOString()
            });
            alert('تم التحديث بنجاح!');
            closeEditModal();
            loadCustomers(); 
        } catch (error) {
            console.error(error);
        } finally {
            saveBtn.innerText = 'حفظ التعديلات';
            saveBtn.disabled = false;
        }
    });
}

window.deleteCustomer = async (id) => {
    if(confirm('هل أنت متأكد من الحذف؟')) {
        try { await deleteDoc(doc(db, "customers", id)); loadCustomers(); } catch (e) {}
    }
};
