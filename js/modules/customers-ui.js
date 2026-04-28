/**
 * js/modules/customers-ui.js
 * موديول واجهة مستخدم العملاء - متوافق مع Firebase V12 (Modular)
 * مخصص لمجموعة: customers
 */

import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تهيئة موديول العملاء V12...");

    // دالة الانتظار لضمان جاهزية اتصال Firestore
    const getDbInstance = () => {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (window.db) {
                    clearInterval(interval);
                    resolve(window.db);
                }
            }, 100);
        });
    };

    try {
        const db = await getDbInstance();
        // البحث عن جسم الجدول المخصص للعملاء
        const tableBody = container.querySelector('#customers-data-rows');
        
        if (tableBody) {
            await renderCustomersTable(db, tableBody);
        } else {
            console.error("❌ خطأ: لم يتم العثور على #customers-data-rows في واجهة العملاء.");
        }
    } catch (error) {
        console.error("❌ فشل بدء الموديول:", error);
    }
}

async function renderCustomersTable(db, tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">جاري سحب البيانات من مجموعة customers...</td></tr>';

    try {
        // الوصول للمجموعة باستخدام النظام الجديد لـ v12
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين في النظام حالياً.</td></tr>';
            return;
        }

        let html = '';
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

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
                    <td>
                        <span class="status-badge ${data.status === 'نشط' ? 'active' : 'inactive'}">
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
        console.log(`✅ تم تحميل ${querySnapshot.size} عميل بنجاح.`);

    } catch (error) {
        console.error("🔴 خطأ أثناء جلب مجموعة customers:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center; padding:20px;">خطأ في الوصول للبيانات: ${error.message}</td></tr>`;
    }
}

// ربط الأزرار بالعالم الخارجي
window.editCustomer = (id) => {
    if (window.openCustomerModal) window.openCustomerModal('edit', id);
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من قاعدة البيانات؟")) {
        try {
            const customerDocRef = doc(window.db, "customers", id);
            await deleteDoc(customerDocRef);
            // تحديث الجدول فورياً
            const tb = document.querySelector('#customers-data-rows');
            if (tb) renderCustomersTable(window.db, tb);
        } catch (e) {
            alert("حدث خطأ أثناء الحذف: " + e.message);
        }
    }
};
