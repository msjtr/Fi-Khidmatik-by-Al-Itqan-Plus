/**
 * موديول واجهة مستخدم العملاء - النسخة المطابقة لبيانات Firestore
 * تيرا جيت واي | Tera Gateway
 */

export async function initCustomersUI(container) {
    console.log("🚀 تنشيط واجهة العملاء... جاري التحقق من المكونات");

    // 1. التأكد من وجود الاتصال بـ Firebase
    if (!window.db) {
        console.error("❌ خطأ: window.db غير معرف. تأكد من تهيئة Firebase أولاً.");
        return;
    }

    // 2. البحث عن جسم الجدول باستخدام الـ ID الصحيح من الـ HTML الخاص بك
    const tableBody = container.querySelector('#customers-data-rows') || document.querySelector('#customers-data-rows');

    if (tableBody) {
        await renderCustomersTable(window.db, tableBody);
    } else {
        console.warn("⚠️ لم يتم العثور على #customers-data-rows، جاري الانتظار...");
        // المحاولة مرة أخرى بعد حقن الـ HTML
        setTimeout(() => initCustomersUI(container), 200);
    }
}

async function renderCustomersTable(db, tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">جاري جلب البيانات...</td></tr>';

    try {
        // جلب البيانات من مجموعة customers
        const querySnapshot = await db.collection("customers").orderBy("name").get();
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            updateStats({ total: 0 });
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, active: 0, complete: 0, incomplete: 0 };
        let index = 1;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            // تحديث الإحصائيات
            stats.total++;
            if (data.classification === 'VIP') stats.vip++;
            if (data.status === 'نشط') stats.active++;
            
            // فحص اكتمال البيانات الأساسية
            const isComplete = data.name && data.phone && data.city && data.building_no;
            isComplete ? stats.complete++ : stats.incomplete++;

            // بناء الصف البرمجي (مطابق للأعمدة الـ 17 في صورتك)
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
                    <td><span class="status-badge">${data.status || 'نشط'}</span></td>
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
        console.log(`✅ تم تحميل ${querySnapshot.size} عميل بنجاح.`);

    } catch (error) {
        console.error("❌ خطأ أثناء جلب العملاء:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">حدث خطأ: ${error.message}</td></tr>`;
    }
}

// دالة تحديث بطاقات الإحصائيات في الأعلى
function updateStats(s) {
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    setVal('stat-total', s.total || 0);
    setVal('stat-vip', s.vip || 0);
    setVal('stat-active', s.active || 0);
    setVal('stat-complete', s.complete || 0);
    setVal('stat-incomplete', s.incomplete || 0);
}

// ربط الدوال بالأزرار العالمية
window.editCustomer = (id) => {
    if (window.openCustomerModal) window.openCustomerModal('edit', id);
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من قاعدة البيانات؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            // إعادة تحديث الجدول فوراً
            const tb = document.getElementById('customers-data-rows');
            if (tb) renderCustomersTable(window.db, tb);
        } catch (e) {
            alert("فشل الحذف: " + e.message);
        }
    }
};
