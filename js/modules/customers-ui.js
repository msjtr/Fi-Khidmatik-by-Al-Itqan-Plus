/**
 * js/modules/customers-ui.js
 * موديول واجهة مستخدم العملاء - النسخة المطابقة لبيانات Firestore V12.12.1
 */

// ملاحظة: لا تستخدم import للمكتبات إذا كانت محملة في firebase.js لتجنب تعارض الموديولات
export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تشغيل المحرك المحدث...");

    // نظام الانتظار لضمان اتصال Firebase
    const waitForDb = () => {
        return new Promise((resolve) => {
            if (window.db) return resolve(window.db);
            const interval = setInterval(() => {
                if (window.db) {
                    clearInterval(interval);
                    resolve(window.db);
                }
            }, 100);
        });
    };

    try {
        await waitForDb();
        console.log("✅ تم الاتصال بقاعدة البيانات.");

        // البحث عن جسم الجدول باستخدام المعرف الصحيح من الـ HTML الخاص بك
        const tableBody = container.querySelector('#customers-data-rows') || document.getElementById('customers-data-rows');
        
        if (tableBody) {
            await renderCustomersTable(tableBody);
        } else {
            console.error("❌ لم يتم العثور على عنصر الجدول #customers-data-rows");
        }
    } catch (error) {
        console.error("❌ خطأ في بدء الموديول:", error);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:20px;">جاري مزامنة بيانات العملاء...</td></tr>';

    try {
        // جلب البيانات من مجموعة customers
        const snapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:20px;">لا يوجد سجلات حالياً.</td></tr>';
            return;
        }

        let html = '';
        let index = 1;
        let stats = { total: 0, vip: 0, active: 0 };

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            stats.total++;
            if(data.classification === 'VIP') stats.vip++;
            if(data.status === 'نشط') stats.active++;

            html += `
                <tr>
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
                    <td><span class="status-dot ${data.status === 'نشط' ? 'online' : 'offline'}"></span> ${data.status || 'نشط'}</td>
                    <td><span class="badge ${data.classification === 'VIP' ? 'vip' : 'reg'}">${data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions">
                        <button onclick="window.editCustomer('${id}')" class="btn-table edit"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteCustomer('${id}')" class="btn-table delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        
        // تحديث عدادات الإحصائيات في الأعلى
        if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = stats.total;
        if (document.getElementById('stat-vip')) document.getElementById('stat-vip').innerText = stats.vip;
        if (document.getElementById('stat-active')) document.getElementById('stat-active').innerText = stats.active;

    } catch (error) {
        console.error("🔴 خطأ في جلب البيانات:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ في الاتصال: ${error.message}</td></tr>`;
    }
}

// ربط الدوال بالنطاق العالمي لتعمل مع onclick
window.editCustomer = (id) => window.openCustomerModal?.('edit', id);
window.deleteCustomer = async (id) => {
    if (confirm("هل تريد حذف هذا العميل نهائياً من تيرا جيت واي؟")) {
        await window.db.collection("customers").doc(id).delete();
        initCustomersUI(document.querySelector('.customers-module-wrapper'));
    }
};
