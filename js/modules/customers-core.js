/**
 * customers-core.js
 * منطق العمليات المطور لعملاء Tera Gateway
 */
import { db } from '../core/config.js';
import { 
    collection, addDoc, doc, updateDoc, deleteDoc, 
    getDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { UI } from './customers-ui.js';

/**
 * تهيئة الموديول وربط العمليات
 */
export async function initCustomers(container) {
    // 1. رسم الواجهة (تم استبدال UI.renderMainLayout لأننا نستخدم HTML خارجي الآن)
    // إذا كنت تستخدم fetch لتحميل customers.html، تأكد من استدعاء هذه الدالة بعد التحميل
    
    // 2. ربط مستمع للبحث (فلتر بحث مميز وسهل)
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterCustomers(e.target.value));
    }

    // 3. ربط نموذج الإضافة/التعديل
    const form = document.getElementById('customer-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await handleSaveCustomer();
        };
    }

    // 4. تحميل البيانات الحية والإحصائيات
    loadCustomersLive();
}

/**
 * جلب البيانات وتحديث الإحصائيات الأربعة
 */
function loadCustomersLive() {
    const customersList = document.getElementById('customers-list');
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        customersList.innerHTML = '';
        let stats = { total: 0, complete: 0, incomplete: 0, notes: 0 };

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;

            // حساب الإحصائيات بناءً على مخططك
            stats.total++;
            if (data.buildingNo && data.district && data.postalCode) stats.complete++; 
            else stats.incomplete++;
            if (data.notes && data.notes.trim() !== "") stats.notes++;

            // إضافة السطر للجدول
            customersList.innerHTML += UI.renderCustomerRow(id, data);
        });

        // تحديث أرقام الإحصائيات في الواجهة
        updateStatsUI(stats);
    });
}

/**
 * تحديث واجهة الإحصائيات
 */
function updateStatsUI(s) {
    if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = s.total;
    if(document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = s.complete;
    if(document.getElementById('stat-incomplete')) document.getElementById('stat-incomplete').innerText = s.incomplete;
    if(document.getElementById('stat-notes')) document.getElementById('stat-notes').innerText = s.notes;
}

/**
 * حفظ أو تحديث بيانات العميل
 */
async function handleSaveCustomer() {
    const id = document.getElementById('edit-customer-id').value;
    const customerData = {
        name: document.getElementById('cust-name').value,
        email: document.getElementById('cust-email').value,
        country: document.getElementById('cust-country').value,
        countryCode: document.getElementById('cust-countryCode').value,
        phone: document.getElementById('cust-phone').value,
        tag: document.getElementById('cust-tag').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        buildingNo: document.getElementById('cust-buildingNo').value,
        additionalNo: document.getElementById('cust-additionalNo').value,
        postalCode: document.getElementById('cust-postalCode').value,
        poBox: document.getElementById('cust-poBox').value,
        notes: document.getElementById('cust-notes').value,
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), customerData);
        } else {
            customerData.createdAt = new Date().toISOString(); // تاريخ الإضافة
            await addDoc(collection(db, "customers"), customerData);
        }
        window.closeCustomerModal();
    } catch (error) {
        console.error("Error saving customer:", error);
        alert("حدث خطأ أثناء الحفظ");
    }
}

/**
 * جلب بيانات عميل واحد للفورم عند التعديل
 */
window.editCustomer = async (id) => {
    const docSnap = await getDoc(doc(db, "customers", id));
    if (docSnap.exists()) {
        const d = docSnap.data();
        document.getElementById('edit-customer-id').value = id;
        document.getElementById('cust-name').value = d.name || '';
        document.getElementById('cust-email').value = d.email || '';
        document.getElementById('cust-countryCode').value = d.countryCode || '+966';
        document.getElementById('cust-phone').value = d.phone || '';
        document.getElementById('cust-tag').value = d.tag || 'normal';
        document.getElementById('cust-city').value = d.city || '';
        document.getElementById('cust-district').value = d.district || '';
        document.getElementById('cust-street').value = d.street || '';
        document.getElementById('cust-buildingNo').value = d.buildingNo || '';
        document.getElementById('cust-additionalNo').value = d.additionalNo || '';
        document.getElementById('cust-postalCode').value = d.postalCode || '';
        document.getElementById('cust-poBox').value = d.poBox || '';
        document.getElementById('cust-notes').value = d.notes || '';
        
        const joinDateEl = document.getElementById('join-date-display');
        if(d.createdAt) joinDateEl.innerText = "تاريخ الانضمام: " + new Date(d.createdAt).toLocaleDateString('ar-SA');
        
        document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
        document.getElementById('delete-btn').style.display = 'block';
        document.getElementById('customer-modal').style.display = 'flex';
    }
};

/**
 * حذف العميل
 */
window.deleteCustomer = async () => {
    const id = document.getElementById('edit-customer-id').value;
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        await deleteDoc(doc(db, "customers", id));
        window.closeCustomerModal();
    }
};

/**
 * فلتر البحث المميز
 */
function filterCustomers(term) {
    const rows = document.querySelectorAll('#customers-list tr');
    const searchTerm = term.toLowerCase();
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(searchTerm) ? '' : 'none';
    });
}
