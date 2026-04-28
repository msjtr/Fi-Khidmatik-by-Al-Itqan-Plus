/**
 * موديول واجهة مستخدم العملاء - النسخة المعتمدة لمنصة تيرا جيت واي
 * يتوافق مع هيكلية Firestore ونظام الإحصائيات المتقدم
 */

export async function initCustomersUI(container) {
    console.log("🚀 تنشيط واجهة العملاء... جاري التحقق من المكونات");

    // التأكد من جاهزية اتصال قاعدة البيانات قبل البدء
    const db = window.db;
    if (!db) {
        console.warn("⚠️ انتظار تهيئة Firebase...");
        setTimeout(() => initCustomersUI(container), 250);
        return;
    }

    // البحث عن المعرف الصحيح للجدول كما هو في الـ HTML الخاص بك
    const tableBody = document.getElementById('customers-data-rows');

    if (tableBody) {
        await renderCustomersTable(db, tableBody);
    } else {
        // في حال لم يتم حقن الجدول بعد، نستخدم MutationObserver للمراقبة
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
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:20px;">جاري مزامنة بيانات العملاء...</td></tr>';

    try {
        // جلب البيانات من مجموعة customers
        const querySnapshot = await db.collection("customers").get();
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">قاعدة البيانات فارغة حالياً.</td></tr>';
            updateStats({ total: 0, vip: 0, complete: 0, incomplete: 0, active: 0 });
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, complete: 0, incomplete: 0, active: 0 };
        let index = 1;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            // تحديث منطق الإحصائيات
            stats.total++;
            if (data.classification === 'VIP' || data.tag === 'vip') stats.vip++;
            if (data.status === 'نشط' || data.status === 'active') stats.active++;
            
            // فحص اكتمال البيانات الأساسية (الاسم، الجوال، المدينة)
            const isComplete = data.name && data.phone && data.city;
            isComplete ? stats.complete++ : stats.incomplete++;

            // بناء الصفوف لتطابق الـ 17 عموداً في الواجهة
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
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updateStats(stats);
        console.log(`✅ تم تحميل ${querySnapshot.size} عميل بنجاح.`);

    } catch (error) {
        console.error("🔴 خطأ أثناء جلب مجموعة customers:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center; padding:20px;">خطأ في الوصول للبيانات: ${error.message}</td></tr>`;
    }
}

// دالة تحديث بطاقات الإحصائيات
function updateStats(s) {
    const fields = ['total', 'vip', 'complete', 'incomplete', 'active'];
    fields.forEach(f => {
        const el = document.getElementById(`stat-${f}`);
        if (el) el.innerText = s[f] || 0;
    });
}

/**
 * ربط الأزرار بالعالم الخارجي (Global Scope)
 * لضمان عمل onclick من داخل الجدول
 */
window.editCustomer = (id) => {
    if (window.openCustomerModal) window.openCustomerModal('edit', id);
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من قاعدة البيانات؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            // تحديث الجدول فوراً بعد الحذف
            const tb = document.getElementById('customers-data-rows');
            if (tb) renderCustomersTable(window.db, tb);
        } catch (e) {
            alert("خطأ أثناء الحذف: " + e.message);
        }
    }
};
