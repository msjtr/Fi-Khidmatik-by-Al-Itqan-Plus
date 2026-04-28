/**
 * موديول واجهة مستخدم العملاء - إصدار Firebase v12
 * Tera Gateway | إدارة قاعدة البيانات
 */

// استيراد الدوال بنظام v12 Modular
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function initCustomersUI(container) {
    console.log("🚀 تنشيط واجهة العملاء - Firebase v12");

    // التحقق من وجود db في النافذة العالمية
    if (!window.db) {
        console.error("❌ window.db غير معرف. تأكد من تصديره في ملف التهيئة.");
        return;
    }

    // البحث عن tbody باستخدام المعرف الجديد في تصميمك
    const tableBody = container.querySelector('#customers-data-rows');
    
    if (tableBody) {
        await renderCustomersTable(tableBody);
    } else {
        // مراقبة تحميل الـ HTML في الحاوية
        const observer = new MutationObserver((mutations, obs) => {
            const target = container.querySelector('#customers-data-rows');
            if (target) {
                renderCustomersTable(target);
                obs.disconnect();
            }
        });
        observer.observe(container, { childList: true, subtree: true });
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:20px;">جاري المزامنة مع Firestore v12...</td></tr>';

    try {
        // استخدام الطريقة الوظيفية للإصدار 12
        const customersRef = collection(window.db, "customers");
        const q = query(customersRef, orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">قاعدة البيانات فارغة حالياً.</td></tr>';
            updateStats({ total: 0, vip: 0, active: 0, complete: 0, incomplete: 0 });
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, active: 0, complete: 0, incomplete: 0 };
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            // حساب الإحصائيات الحية
            stats.total++;
            if (data.classification === 'VIP') stats.vip++;
            if (data.status === 'نشط' || data.status === 'active') stats.active++;
            
            // التحقق من اكتمال البيانات (الاسم، الجوال، المدينة، رقم المبنى)
            const isComplete = data.name && data.phone && data.city && data.building_no;
            isComplete ? stats.complete++ : stats.incomplete++;

            // بناء الصفوف بناءً على الـ 17 عموداً في تصميمك
            html += `
                <tr class="customer-row">
                    <td class="sticky-col">${index++}</td>
                    <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.country_key || '+966'}</td>
                    <td>${data.email || '---'}</td>
                    <td>${data.country || 'السعودية'}</td>
                    <td>${data.city || '---'}</td>
                    <td>${data.district || '---'}</td>
                    <td>${data.street || '---'}</td>
                    <td>${data.building_no || '---'}</td>
                    <td>${data.additional_no || '---'}</td>
                    <td>${data.zip_code || '---'}</td>
                    <td>${data.po_box || '---'}</td>
                    <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : '---'}</td>
                    <td>
                        <span class="status-badge ${data.status === 'active' || data.status === 'نشط' ? 'status-active' : 'status-inactive'}">
                            ${data.status || 'نشط'}
                        </span>
                    </td>
                    <td><span class="badge ${data.classification === 'VIP' ? 'vip' : 'reg'}">${data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updateStats(stats);
        console.log(`✅ تم جلب ${stats.total} عميل بنجاح.`);

    } catch (error) {
        console.error("🔴 خطأ v12:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">فشل الاتصال بـ Firestore: ${error.message}</td></tr>`;
    }
}

function updateStats(s) {
    const fields = ['total', 'vip', 'active', 'complete', 'incomplete'];
    fields.forEach(field => {
        const el = document.getElementById(`stat-${field}`);
        if (el) el.innerText = s[field] || 0;
    });
}

// الدوال العالمية للتحكم
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً من نظام تيرا؟")) {
        try {
            const docRef = doc(window.db, "customers", id);
            await deleteDoc(docRef);
            // إعادة تحميل الجدول
            const tb = document.getElementById('customers-data-rows');
            if (tb) renderCustomersTable(tb);
        } catch (e) {
            alert("حدث خطأ أثناء الحذف: " + e.message);
        }
    }
};

window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal('edit', id);
    }
};
