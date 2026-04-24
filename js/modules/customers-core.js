/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء - Tera Gateway
 */

// استيراد الإعدادات الأساسية
import { db } from '../core/config.js';

// استخدام استيراد متوافق ومستقر لمكتبة Firebase
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// استيراد واجهة المستخدم المحدثة
import { UI } from './customers-ui.js';

/**
 * تهيئة موديول العملاء
 */
export async function initCustomers(container) {
    if (!container) return;

    // 1. حقن التنسيقات الخاصة بالواجهة
    UI.injectStyles();

    // 2. بناء الهيكل الأساسي
    container.innerHTML = UI.renderMainLayout();

    // 3. ربط أحداث البحث (Search Logic)
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.oninput = (e) => filterTable(e.target.value);
    }

    // 4. ربط زر الإضافة
    const addBtn = document.getElementById('add-customer-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            if (typeof window.openCustomerModal === 'function') {
                window.openCustomerModal();
            } else {
                console.warn("نظام الإضافة (Modal) غير جاهز حالياً");
            }
        };
    }

    // 5. تحميل البيانات من Firestore
    await loadCustomers();
}

/**
 * جلب البيانات وعرضها مع حساب الإحصائيات
 */
async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    if (!listBody) return;

    try {
        // عرض حالة التحميل (Spinner)
        listBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:50px;">
            <div class="spinner-border" style="color:var(--primary)"></div> جاري جلب البيانات...
        </td></tr>`;

        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
        let rowsHtml = '';

        if (querySnapshot.empty) {
            listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين حالياً</td></tr>';
            updateStatsUI(stats);
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            stats.total++;
            
            // معيار اكتمال البيانات (الهوية، الجوال، المدينة)
            const isComplete = data.phone && data.idNumber && data.city;
            if (isComplete) stats.complete++; else stats.incomplete++;
            
            // ملاحظات (إذا كان هناك ملاحظات مكتوبة)
            if (data.notes && data.notes.trim() !== '') stats.flagged++;

            // توليد السطر باستخدام القالب المحدث
            rowsHtml += UI.renderCustomerRow(id, data);
        });

        listBody.innerHTML = rowsHtml;
        updateStatsUI(stats);

    } catch (error) {
        console.error("Firebase Error:", error);
        listBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">
            <i class="fas fa-circle-exclamation"></i> خطأ في الاتصال بقاعدة البيانات
        </td></tr>`;
    }
}

/**
 * تحديث واجهة الإحصائيات بأرقام حقيقية
 */
function updateStatsUI(stats) {
    const map = {
        'stat-total': stats.total,
        'stat-complete': stats.complete,
        'stat-incomplete': stats.incomplete,
        'stat-flagged': stats.flagged
    };

    for (const [id, value] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }
}

/**
 * وظائف النافذة العامة (Global Actions)
 */

// معاينة الطباعة
window.previewPrint = (id) => {
    const printUrl = `print-card.html?id=${id}`;
    const printWindow = window.open(printUrl, '_blank', 'width=1200,height=900');
    if (!printWindow) alert("يرجى السماح بالنوافذ المنبثقة (Pop-ups) لعرض صفحة الطباعة");
};

// تصدير البيانات (تحتاج لمكتبة SheetJS أو معالجة بسيطة)
window.exportToExcel = () => {
    console.log("جاري تجهيز ملف Excel لجميع العملاء...");
    // يمكن هنا إضافة كود التصدير الفعلي
};

/**
 * محرك البحث السريع (Client-side Filtering)
 */
function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row-fade'); // نستخدم الكلاس المحدث من الـ UI
    const searchVal = value.toLowerCase().trim();
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchVal) ? '' : 'none';
    });
}
