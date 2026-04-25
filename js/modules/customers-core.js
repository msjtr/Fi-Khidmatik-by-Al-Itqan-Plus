/**
 * customers-core.js
 * المحرك الرئيسي لإدارة العملاء - Tera Gateway
 */

import { db } from '../core/config.js';
import { 
    collection, getDocs, query, orderBy, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { UI } from './customers-ui.js';

/**
 * تشغيل موديول العملاء
 * @param {HTMLElement} container - الحاوية التي سيتم حقن الواجهة فيها
 */
export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الهيكل الرئيسي (الإحصائيات، شريط البحث، الجدول)
    container.innerHTML = UI.renderMainLayout();
    
    // 2. تفعيل نظام البحث الحي
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.oninput = (e) => filterCustomersTable(e.target.value);
    }

    // 3. جلب البيانات من Firestore
    await loadCustomersData();
}

/**
 * جلب بيانات العملاء وتحديث الواجهة
 */
async function loadCustomersData() {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;

    try {
        // جلب العملاء مرتبين حسب الأحدث
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
        let rowsHtml = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // تحديث عدادات الإحصائيات
            stats.total++;
            const isDataComplete = data.phone && data.idNumber && data.city;
            if (isDataComplete) stats.complete++; else stats.incomplete++;
            if (data.notes || data.tag === 'مميز') stats.flagged++;

            // بناء صف الجدول باستخدام القالب من UI
            rowsHtml += UI.renderCustomerRow(id, data);
        });

        // حقن الصفوف في الجدول
        listBody.innerHTML = rowsHtml || '<tr><td colspan="5" style="text-align:center; padding:20px;">لا يوجد عملاء مسجلين حالياً</td></tr>';
        
        // تحديث أرقام الإحصائيات في الأعلى
        updateStatsCounters(stats);

    } catch (error) {
        console.error("خطأ أثناء جلب بيانات العملاء:", error);
        listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">فشل تحميل البيانات. تأكد من صلاحيات الوصول.</td></tr>';
    }
}

/**
 * تحديث عدادات الإحصائيات في الواجهة
 */
function updateStatsCounters(stats) {
    const mappings = {
        'stat-total': stats.total,
        'stat-complete': stats.complete,
        'stat-incomplete': stats.incomplete,
        'stat-flagged': stats.flagged
    };

    for (const [id, value] of Object.entries(mappings)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }
}

/**
 * فلترة الجدول بناءً على البحث
 */
function filterCustomersTable(queryText) {
    const rows = document.querySelectorAll('.customer-row-fade');
    const term = queryText.toLowerCase().trim();

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

/**
 * --- ربط الوظائف بـ window لضمان عمل الأزرار (Global Access) ---
 */

// وظيفة التعديل: تفتح المودال الموجود في admin.html
window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal(id);
    } else {
        console.error("دالة openCustomerModal غير معرفة في admin.html");
    }
};

// وظيفة الطباعة: تفتح صفحة العقد أو الكرت
window.previewPrint = (id) => {
    const printUrl = `/fi-khidmatik/print-customer.html?id=${id}`;
    window.open(printUrl, '_blank', 'width=1000,height=800');
};

// وظيفة التصدير (Excel)
window.exportToExcel = () => {
    console.log("طلب تصدير بيانات العملاء إلى Excel");
    alert("سيتم تحميل ملف Excel بكافة البيانات قريباً...");
};
