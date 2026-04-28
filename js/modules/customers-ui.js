/**
 * موديول إدارة عملاء تيرا جيت واي - نسخة معالجة أخطاء الاتصال
 */

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري التحقق من اتصال قاعدة البيانات...");
    
    // دالة للانتظار حتى يصبح Firebase جاهزاً
    const waitForFirestore = () => {
        return new Promise((resolve) => {
            if (window.db) return resolve(window.db);
            const interval = setInterval(() => {
                if (window.db) {
                    clearInterval(interval);
                    resolve(window.db);
                }
            }, 100); // يفحص كل 100 ملي ثانية
        });
    };

    try {
        await waitForFirestore(); // انتظر هنا حتى يجهز window.db
        console.log("✅ تم الاتصال بـ Firestore بنجاح.");
        
        const tableBody = container.querySelector('#customers-data-rows');
        if (tableBody) {
            await renderCustomersTable(tableBody);
        } else {
            // مراقبة ظهور الجدول في الـ DOM
            const observer = new MutationObserver((mutations, obs) => {
                const target = container.querySelector('#customers-data-rows');
                if (target) {
                    renderCustomersTable(target);
                    obs.disconnect();
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        }
    } catch (err) {
        console.error("❌ فشل بدء المحرك:", err);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">جاري مزامنة البيانات...</td></tr>';

    try {
        // التحقق المزدوج لتجنب الـ TypeError
        if (!window.db) throw new Error("window.db is still undefined");

        const snapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء حالياً.</td></tr>';
            updateStats({ total: 0, vip: 0, complete: 0, incomplete: 0, active: 0 });
            return;
        }

        let html = '';
        let stats = { total: 0, vip: 0, complete: 0, incomplete: 0, active: 0 };
        let index = 1;

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            stats.total++;
            if (data.classification === 'VIP') stats.vip++;
            if (data.status === 'نشط' || data.status === 'active') stats.active++;
            
            const isComplete = data.name && data.phone && data.city;
            isComplete ? stats.complete++ : stats.incomplete++;

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
        updateStats(stats);

    } catch (error) {
        console.error("🔴 خطأ في renderCustomersTable:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ فني: ${error.message}</td></tr>`;
    }
}

function updateStats(s) {
    const ids = ['stat-total', 'stat-vip', 'stat-complete', 'stat-incomplete', 'stat-active'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = s[id.replace('stat-', '')] || 0;
    });
}

// ربط العمليات عالمياً
window.editCustomer = (id) => window.openCustomerModal?.('edit', id);
window.deleteCustomer = async (id) => {
    if (confirm("حذف العميل نهائياً؟")) {
        await window.db.collection("customers").doc(id).delete();
        renderCustomersTable(document.getElementById('customers-data-rows'));
    }
};
