/**
 * موديول إدارة عملاء تيرا جيت واي - النسخة الاحترافية المحدثة
 * متوافق مع الجدول ذو الـ 17 عموداً ونظام الإحصائيات
 */

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تشغيل محرك العملاء...");
    
    // استخدام ID الجديد الذي وضعته في الـ HTML
    const tableBody = container.querySelector('#customers-data-rows');
    
    if (!tableBody) {
        // إذا لم يجد الجدول، ينتظر تحميل الـ DOM (حل لمشكلة التوقيت)
        const observer = new MutationObserver((mutations, obs) => {
            const target = container.querySelector('#customers-data-rows');
            if (target) {
                renderCustomersTable(target);
                obs.disconnect();
            }
        });
        observer.observe(container, { childList: true, subtree: true });
    } else {
        await renderCustomersTable(tableBody);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">جاري مزامنة البيانات مع Firestore...</td></tr>';

    try {
        const snapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء في قاعدة البيانات حالياً.</td></tr>';
            updateStats({ total: 0, vip: 0, complete: 0, incomplete: 0 });
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, complete: 0, incomplete: 0, active: 0, individuals: 0, companies: 0 };
        let index = 1;

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            // حساب الإحصائيات أثناء المرور على البيانات
            stats.total++;
            if (data.classification === 'VIP') stats.vip++;
            if (data.status === 'نشط' || data.status === 'active') stats.active++;
            
            // فحص اكتمال البيانات (الاسم، الجوال، المدينة، العنوان الوطني)
            const isComplete = data.name && data.phone && data.city && data.building_no;
            isComplete ? stats.complete++ : stats.incomplete++;

            // بناء الصف (مطابق لترتيب الـ THEAD الخاص بك)
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
                        <span class="status-badge ${data.status === 'active' ? 'status-active' : 'status-inactive'}">
                            ${data.status || 'نشط'}
                        </span>
                    </td>
                    <td><span class="badge ${data.classification === 'VIP' ? 'vip' : 'regular'}">${data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions-header">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updateStats(stats); // تحديث عدادات الإحصائيات في الأعلى

    } catch (error) {
        console.error("خطأ جلب البيانات:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">فشل الاتصال: ${error.message}</td></tr>`;
    }
}

// دالة تحديث الإحصائيات في الـ UI
function updateStats(s) {
    const safeUpdate = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };
    
    safeUpdate('stat-total', s.total);
    safeUpdate('stat-vip', s.vip);
    safeUpdate('stat-complete', s.complete);
    safeUpdate('stat-incomplete', s.incomplete);
    safeUpdate('stat-active', s.active);
}

// ربط العمليات بالنطاق العالمي
window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal('edit', id);
    }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من منصة تيرا؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            // تحديث الجدول بعد الحذف
            const tb = document.querySelector('#customers-data-rows');
            if (tb) renderCustomersTable(tb);
        } catch (e) {
            alert("حدث خطأ أثناء الحذف: " + e.message);
        }
    }
};
