import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js';

const customersRef = collection(db, "customers");
let customersDataList = [];

// جلب البيانات وعرضها
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        tbody.innerHTML = '';
        customersDataList = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;
            customersDataList.push(data);

            // دمج العنوان للبحث في جوجل ماب
            const addrParts = [data.country, data.city, data.district, data.street, data.buildingNo].filter(p => p);
            const fullAddr = addrParts.join(" / ") || "حائل";
            const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td>
                <td class="sticky-col"><strong>${data.name}</strong></td>
                <td>${data.phone}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
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

// فتح نافذة التعديل
window.openEditModal = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if (!c) return;
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-country').value = c.country || '';
    document.getElementById('edit-city').value = c.city || '';
    document.getElementById('edit-district').value = c.district || '';
    document.getElementById('edit-street').value = c.street || '';
    document.getElementById('edit-buildingNo').value = c.buildingNo || '';
    document.getElementById('edit-additionalNo').value = c.additionalNo || '';
    document.getElementById('edit-postalCode').value = c.postalCode || '';
    document.getElementById('edit-poBox').value = c.poBox || '';
    document.getElementById('edit-customer-modal').classList.add('active');
};

// إغلاق النافذة
window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

// حفظ التعديلات
document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    try {
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
            updatedAt: new Date().toISOString()
        });
        alert("تم التحديث بنجاح");
        closeEditModal();
        loadCustomers();
    } catch (err) { console.error(err); }
};

// حذف عميل
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

document.addEventListener('DOMContentLoaded', loadCustomers);
