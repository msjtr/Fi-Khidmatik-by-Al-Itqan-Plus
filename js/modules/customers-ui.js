/**
 * موديول واجهة مستخدم العملاء - إصدار Tera Engine V12.12.1
 * متوافق مع Firebase Modular SDK ونظام الجداول المتطور
 */

// استيراد الدوال البرمجية مباشرة من الإصدار 12.12.1 لضمان التوافق مع firebase.js
import { 
    collection, 
    getDocs, 
    doc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تشغيل موديول العملاء المحدث...");

    // استخدام window.db المعرف في ملف firebase.js الخاص بك
    const db = window.db;
    if (!db) {
        console.error("❌ خطأ: لم يتم العثور على اتصال قاعدة البيانات (window.db).");
        return;
    }

    const tableBody = document.getElementById('customers-data-rows');
    if (tableBody) {
        await renderCustomersTable(db, tableBody);
    } else {
        // مراقبة تحميل الواجهة في حال تأخر حقن الـ HTML
        const observer = new MutationObserver((mutations, obs) => {
            const target = document.getElementById('customers-data-rows');
            if (target) {
                renderCustomersTable(db, target);
                obs.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

async function renderCustomersTable(db, tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">جاري مزامنة بيانات العملاء...</td></tr>';

    try {
        // استخدام أسلوب الـ Modular لطلب البيانات
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد سجلات في قاعدة البيانات حالياً.</td></tr>';
            updateStats({ total: 0, vip: 0, complete: 0, incomplete: 0, active: 0 });
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, complete: 0, incomplete: 0, active: 0 };
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            // حساب الإحصائيات الحية
            stats.total++;
            if (data.classification === 'VIP') stats.vip++;
            if (data.status === 'نشط' || data.status === 'active') stats.active++;
            
            const isComplete = data.name && data.phone && data.city;
            isComplete ? stats.complete++ : stats.incomplete++;

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
                    <td><span class="status-badge status-active">${data.status || 'نشط'}</span></td>
                    <td><span class="badge ${data.classification === 'VIP' ? 'vip' : 'reg'}">${data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updateStats(stats);
        console.log(`✅ تم تحديث جدول العملاء بنجاح (${querySnapshot.size} عميل).`);

    } catch (error) {
        console.error("🔴 خطأ أثناء معالجة البيانات:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">فشل جلب البيانات: ${error.message}</td></tr>`;
    }
}

function updateStats(s) {
    const fields = ['total', 'vip', 'complete', 'incomplete', 'active'];
    fields.forEach(f => {
        const el = document.getElementById(`stat-${f}`);
        if (el) el.innerText = s[f] || 0;
    });
}

// الدوال العالمية لربط الأزرار (Global Scope)
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        try {
            const docRef = doc(window.db, "customers", id);
            await deleteDoc(docRef);
            // إعادة تحميل الجدول فوراً
            renderCustomersTable(window.db, document.getElementById('customers-data-rows'));
        } catch (e) {
            alert("خطأ في عملية الحذف: " + e.message);
        }
    }
};

window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal('edit', id);
    }
};
