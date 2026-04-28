/**
 * موديول واجهة مستخدم العملاء - مطور لمنصة تيرا جيت واي
 * متوافق تماماً مع حقول Firestore v12 الخاصة بك
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
    if (!window.db) return console.error("❌ window.db غير جاهز");

    const tableBody = container.querySelector('#customers-data-rows');
    if (tableBody) {
        await renderCustomersTable(tableBody);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">جاري مزامنة بيانات العملاء...</td></tr>';

    try {
        const customersRef = collection(window.db, "customers");
        const q = query(customersRef, orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">لا يوجد عملاء مسجلين.</td></tr>';
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, active: 0, complete: 0, incomplete: 0 };
        let index = 1;

        querySnapshot.forEach((customerDoc) => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            // تحديث الإحصائيات بناءً على الحقول الحقيقية
            stats.total++;
            if (data.tag === 'vip') stats.vip++; // استخدام tag بدلاً من classification
            
            // فحص اكتمال البيانات (حسب حقولك: الاسم، الجوال، المدينة، رقم المبنى)
            const isComplete = data.name && data.phone && data.city && data.buildingNo;
            isComplete ? stats.complete++ : stats.incomplete++;

            // تنسيق التاريخ (بما أن createdAt نص في بياناتك)
            const dateDisplay = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '---';

            html += `
                <tr class="customer-row">
                    <td class="sticky-col">${index++}</td>
                    <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.countryCode || '+966'}</td>
                    <td>${data.email || '---'}</td>
                    <td>${data.country || 'السعودية'}</td>
                    <td>${data.city || '---'}</td>
                    <td>${data.district || '---'}</td>
                    <td>${data.street || '---'}</td>
                    <td>${data.buildingNo || '---'}</td>
                    <td>${data.additionalNo || '---'}</td>
                    <td>${data.postalCode || '---'}</td>
                    <td>${data.poBox || '---'}</td>
                    <td>${dateDisplay}</td>
                    <td><span class="status-badge status-active">نشط</span></td>
                    <td><span class="badge ${data.tag === 'vip' ? 'vip' : 'reg'}">${data.tag || 'عادي'}</span></td>
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

    } catch (error) {
        console.error("🔴 خطأ أثناء العرض:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ: ${error.message}</td></tr>`;
    }
}

function updateStats(s) {
    const fields = ['total', 'vip', 'complete', 'incomplete'];
    fields.forEach(f => {
        const el = document.getElementById(`stat-${f}`);
        if (el) el.innerText = s[f] || 0;
    });
}

// الدوال العالمية
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        try {
            await deleteDoc(doc(window.db, "customers", id));
            renderCustomersTable(document.getElementById('customers-data-rows'));
        } catch (e) { alert("خطأ: " + e.message); }
    }
};

window.editCustomer = (id) => window.openCustomerModal?.('edit', id);
