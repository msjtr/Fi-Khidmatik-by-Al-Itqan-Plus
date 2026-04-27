/**
 * js/modules/customers-ui.js 
 * نسخة مطورة مع معالجة أخطاء الاتصال والتحقق من العناصر
 */

export async function initCustomersUI(container) {
    console.log("🚀 تنشيط واجهة العملاء... جاري التحقق من المكونات");
    
    // 1. التأكد من وجود الحاوية والجدول
    const tableBody = container.querySelector('#customers-tbody') || document.querySelector('#customers-tbody');
    
    if (!tableBody) {
        console.warn("⚠️ لم يتم العثور على #customers-tbody، جاري المحاولة مرة أخرى بعد قليل...");
        setTimeout(() => initCustomersUI(container), 500);
        return;
    }

    // 2. التحقق من وجود Firebase
    if (!window.db) {
        console.error("❌ خطأ: لم يتم تهيئة Firebase (window.db غير موجود)");
        tableBody.innerHTML = '<tr><td colspan="9" style="color:red; text-align:center;">خطأ في الاتصال بقاعدة البيانات</td></tr>';
        return;
    }

    await renderCustomersTable(tableBody);
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">جاري جلب بيانات العملاء...</td></tr>';

    try {
        // جلب البيانات من مجموعة "customers"
        const snapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            // معالجة البيانات لتجنب undefined (مهم جداً لظهور البيانات)
            const name = data.name || '---';
            const phone = data.phone || '---';
            const city = data.city || '---';
            const classification = data.classification || 'عادي';
            const building = data.building_no || '---';
            const additional = data.additional_no || '---';
            const zip = data.zip_code || '---';
            const pobox = data.po_box || '---';

            html += `
                <tr class="customer-row">
                    <td>
                        <div class="cust-info-cell">
                            <div class="avatar-circle">${name.charAt(0)}</div>
                            <span class="cust-name">${name}</span>
                        </div>
                    </td>
                    <td dir="ltr">${phone}</td>
                    <td>${city}</td>
                    <td><span class="status-badge ${classification === 'VIP' ? 'vip-style' : 'reg-style'}">${classification}</span></td>
                    <td>${building}</td>
                    <td>${additional}</td>
                    <td>${zip}</td>
                    <td>${pobox}</td>
                    <td>
                        <div class="action-btns">
                            <button onclick="window.editCustomer('${id}')" class="edit-btn"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="del-btn"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        console.log(`✅ تم تحميل ${snapshot.size} عميل بنجاح.`);

    } catch (error) {
        console.error("❌ فشل جلب العملاء من Firestore:", error);
        tableBody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">حدث خطأ أثناء تحميل البيانات: ${error.message}</td></tr>`;
    }
}

// الدوال العالمية للتحكم (أضفها لتعمل الأزرار داخل الجدول)
window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal('edit', id);
    }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            // إعادة التحديث
            const tbody = document.querySelector('#customers-tbody');
            if (tbody) renderCustomersTable(tbody);
        } catch (e) {
            alert("فشل الحذف: " + e.message);
        }
    }
};
