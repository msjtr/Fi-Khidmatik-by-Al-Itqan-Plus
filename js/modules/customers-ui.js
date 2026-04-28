/**
 * js/modules/customers-ui.js
 * موديول إدارة العملاء المتطور لـ Tera Gateway
 */

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تحضير واجهة العملاء...");

    // نظام الانتظار الذكي لضمان توفر اتصال قاعدة البيانات
    const waitForDb = () => {
        return new Promise((resolve) => {
            if (window.db) return resolve(window.db);
            const interval = setInterval(() => {
                if (window.db) {
                    clearInterval(interval);
                    resolve(window.db);
                }
            }, 150);
        });
    };

    try {
        await waitForDb();
        const tableBody = container.querySelector('#customers-data-rows');
        
        if (tableBody) {
            await renderCustomersTable(tableBody);
        } else {
            const observer = new MutationObserver(() => {
                const target = container.querySelector('#customers-data-rows');
                if (target) {
                    renderCustomersTable(target);
                    observer.disconnect();
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        }
    } catch (err) {
        console.error("❌ فشل تشغيل موديول العملاء:", err);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px;">جاري مزامنة قاعدة بيانات Firestore...</td></tr>';

    try {
        const snapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">قاعدة البيانات فارغة حالياً.</td></tr>';
            return;
        }

        let html = '';
        let index = 1;

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            html += `
                <tr>
                    <td class="sticky-col">${index++}</td>
                    <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.countryCode || '+966'}</td>
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
                    <td><span class="status-badge ${data.status === 'active' ? 'status-active' : 'status-inactive'}">${data.status || 'نشط'}</span></td>
                    <td><span class="badge ${data.classification === 'VIP' ? 'vip' : 'regular'}">${data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions-header">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        
        // تحديث إحصائيات لوحة التحكم تلقائياً
        if (document.getElementById('stat-total')) {
            document.getElementById('stat-total').innerText = snapshot.size;
        }

    } catch (error) {
        console.error("🔴 خطأ في عرض الجدول:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">فشل جلب البيانات: ${error.message}</td></tr>`;
    }
}
