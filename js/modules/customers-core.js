/**
 * customers-core.js - المحرك الرئيسي
 */

import { db } from '../core/config.js';
import { collection, getDocs, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { UI } from './customers-ui.js'; // <--- الربط هنا

export async function initCustomers(container) {
    UI.injectStyles(); // حقن التنسيقات من ملف الـ UI
    container.innerHTML = UI.renderMainLayout(); // بناء الهيكل من ملف الـ UI

    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;

    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, complete: 0, incomplete: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        if (data.city && data.phone) stats.complete++; else stats.incomplete++;

        // استخدام دالة الـ UI لرسم السطر
        listBody.innerHTML += UI.renderCustomerRow(id, data);
    });

    // تحديث الأرقام في الواجهة
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
}

// دالة جلب بيانات عميل واحد لخدمة ملف الطباعة
export async function getCustomerById(id) {
    const docSnap = await getDoc(doc(db, "customers", id));
    return docSnap.exists() ? docSnap.data() : null;
}

window.previewPrint = (id) => {
    window.open(`print-card.html?id=${id}`, '_blank', 'width=1100,height=900');
};

function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value.toLowerCase()) ? '' : 'none';
    });
}
