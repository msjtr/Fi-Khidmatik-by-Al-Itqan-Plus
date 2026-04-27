/**
 * customers-ui.js - المحرك المطور لنظام Tera Gateway
 * المتوافق مع بروتوكول الـ 17 عنصراً ونظام الإحصائيات المتقدم
 */
import { db } from '../core/firebase.js'; 
import { 
    collection, getDocs, query, orderBy, deleteDoc, doc, getDoc, updateDoc, addDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * 1. تشغيل واجهة العملاء وجلب البيانات
 */
export async function initCustomersUI() {
    const tableBody = document.getElementById('customers-data-rows');
    if (!tableBody) return;

    // إظهار مؤشر التحميل
    tableBody.innerHTML = `<tr><td colspan="17" style="text-align:center; padding:50px;">
        <i class="fas fa-circle-notch fa-spin fa-2x" style="color:#2563eb;"></i><br>جاري مزامنة قاعدة البيانات...</td></tr>`;

    try {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = ''; 

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px; color:#64748b;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            updateCustomersStats([]); // تصقير الإحصائيات
            return;
        }

        // تحديث شبكة الإحصائيات الـ 17
        updateCustomersStats(querySnapshot.docs);

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.className = "customer-row";

            // بناء الصف مع تثبيت الأعمدة (Sticky) كما في CSS
            tr.innerHTML = `
                <td class="sticky-col">${index++}</td>
                <td class="sticky-col-name">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="admin/images/default-product.png" class="customer-avatar" style="width:30px; height:30px; border-radius:8px;">
                        <span>${data.name || '---'}</span>
                    </div>
                </td>
                <td><a href="tel:${data.phone}" style="text-decoration:none; color:inherit;">${data.phone || '---'}</a></td>
                <td><span class="badge" style="background:#f1f5f9; padding:2px 8px; border-radius:5px;">${data.countryCode || '+966'}</span></td>
                <td>${data.email || '---'}</td>
                <td>${data.country || 'السعودية'}</td>
                <td>${data.city || '---'}</td>
                <td>${data.district || '---'}</td>
                <td>${data.street || '---'}</td>
                <td>${data.buildingNo || '---'}</td>
                <td>${data.additionalNo || '---'}</td>
                <td>${data.postalCode || '---'}</td>
                <td>${data.poBox || '---'}</td>
                <td style="font-size:0.75rem; color:#64748b;">${formatDate(data.createdAt)}</td>
                <td><span class="status-pill ${getStatusClass(data.status)}">${data.status || 'غير محدد'}</span></td>
                <td><span class="status-pill ${data.tag === 'VIP' ? 'status-vip' : 'status-pending'}">${data.tag || 'عادي'}</span></td>
                <td class="sticky-actions-cell">
                    <div class="action-btns">
                        <button onclick="window.openCustomerModal('edit', '${docSnap.id}')" class="btn-action btn-edit" title="تعديل"><i class="fas fa-pen"></i></button>
                        <button onclick="window.deleteCust('${docSnap.id}')" class="btn-action btn-delete" title="حذف"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="text-align:center; color:#ef4444; padding:30px;">
            <i class="fas fa-exclamation-triangle"></i> فشل الاتصال بقاعدة البيانات. تأكد من إعدادات Firebase.</td></tr>`;
    }
}

/**
 * 2. تحديث شبكة الإحصائيات المتقدمة
 */
function updateCustomersStats(docs) {
    const data = docs.map(d => d.data());
    
    const stats = {
        total: data.length,
        active: data.filter(d => d.status === 'نشط').length,
        suspended: data.filter(d => d.status === 'موقوف').length,
        vip: data.filter(d => d.tag === 'VIP').length,
        complete: data.filter(d => d.name && d.phone && d.city && d.district).length,
        individuals: data.filter(d => d.type === 'فرد' || !d.type).length,
        companies: data.filter(d => d.type === 'شركة').length
    };

    // ربط القيم بالعناصر في واجهة المستخدم (حسب IDs المحدثة في index.html)
    const mappings = {
        'stat-total': stats.total,
        'stat-active': stats.active,
        'stat-suspended': stats.suspended,
        'stat-vip': stats.vip,
        'stat-complete': stats.complete,
        'stat-incomplete': stats.total - stats.complete,
        'stat-individuals': stats.individuals,
        'stat-companies': stats.companies
    };

    for (const [id, value] of Object.entries(mappings)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }
}

/**
 * 3. حذف عميل مع تأكيد
 */
window.deleteCust = async function(id) {
    if (confirm("⚠️ هل أنت متأكد من حذف هذا العميل نهائياً من قاعدة البيانات؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            // تحديث إحصائية "الحذف" برمجياً (لأغراض العرض)
            const delEl = document.getElementById('stat-deletes');
            if (delEl) delEl.innerText = parseInt(delEl.innerText) + 1;
            
            initCustomersUI(); // إعادة تحميل الجدول
        } catch (error) {
            alert("حدث خطأ أثناء الحذف.");
        }
    }
};

/**
 * 4. مساعدات التنسيق (Helpers)
 */
function formatDate(dateInput) {
    if (!dateInput) return '---';
    const date = new Date(dateInput);
    return date.toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusClass(status) {
    switch (status) {
        case 'نشط': return 'status-active';
        case 'موقوف': return 'status-inactive';
        default: return 'status-pending';
    }
}

// تشغيل المحرك عند الاستدعاء
window.filterCustomersTable = function() {
    const input = document.getElementById("customer-search");
    const filter = input.value.toUpperCase();
    const rows = document.querySelectorAll(".customer-row");

    rows.forEach(row => {
        const text = row.innerText.toUpperCase();
        row.style.display = text.indexOf(filter) > -1 ? "" : "none";
    });
};
