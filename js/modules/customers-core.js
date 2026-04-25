/**
 * customers-core.js
 * منطق العمليات لعملاء Tera Gateway
 */
import { db } from '../core/config.js';
import { 
    collection, 
    getDocs, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { UI } from './customers-ui.js';

/**
 * دالة تهيئة موديول العملاء
 * يجب أن تكون مصدّرة (export) ليقرأها ملف admin.html
 */
export async function initCustomers(container) {
    // 1. رسم الهيكل الرئيسي للواجهة
    container.innerHTML = UI.renderMainLayout();

    // 2. ربط مستمع للبحث
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterCustomers(e.target.value);
        });
    }

    // 3. تحميل البيانات الحية من Firestore
    loadCustomersLive();
}

/**
 * جلب البيانات الحية وتحديث الجدول تلقائياً
 */
function loadCustomersLive() {
    const customersList = document.getElementById('customers-list');
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        customersList.innerHTML = '';
        let total = 0;
        let vips = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            customersList.innerHTML += UI.renderCustomerRow(doc.id, data);
            
            // تحديث الإحصائيات البسيطة
            total++;
            if (data.tag === 'vip') vips++;
        });

        // تحديث أرقام الإحصائيات في الواجهة
        if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
        if(document.getElementById('stat-flagged')) document.getElementById('stat-flagged').innerText = vips;
    });
}

/**
 * منطق الفلترة (بحث بسيط)
 */
function filterCustomers(term) {
    const rows = document.querySelectorAll('.customer-row-fade');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term.toLowerCase()) ? '' : 'none';
    });
}
