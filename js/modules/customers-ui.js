/**
 * موديول إدارة عملاء تيرا جيت واي - النسخة الكاملة والمعالجة
 * نظام الانتظار الذكي لـ Firestore + تحديث الإحصائيات + 17 عموداً
 */

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري التحقق من اتصال قاعدة البيانات...");
    
    // 1. دالة الانتظار لضمان جاهزية Firebase قبل البدء
    const waitForFirestore = () => {
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
        await waitForFirestore();
        console.log("✅ تم الاتصال بـ Firestore بنجاح.");
        
        // البحث عن جسم الجدول باستخدام المعرف الصحيح في الكود الجديد
        const tableBody = container.querySelector('#customers-data-rows');
        
        if (tableBody) {
            await renderCustomersTable(tableBody);
        } else {
            console.warn("⚠️ لم يتم العثور على #customers-data-rows، جاري المراقبة...");
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
        console.error("❌ فشل بدء محرك العملاء:", err);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">جاري مزامنة البيانات من السحابة...</td></tr>';

    try {
        // جلب البيانات مرتبة حسب الاسم
        const snapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            updateStats({ total: 0, vip: 0, active: 0, complete: 0, incomplete: 0 });
            return;
        }

        let html = '';
        let index = 1;
        let stats = { total: 0, vip: 0, active: 0, complete: 0, incomplete: 0, individuals: 0, companies: 0 };

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;

            // حساب الإحصائيات لتحديث البطاقات العلوية
            stats.total++;
            if (data.classification === 'VIP') stats.vip++;
            if (data.status === 'نشط' || data.status === 'active') stats.active++;
            
            // تصنيف أفراد/شركات (حسب بياناتك)
            if (data.type === 'شركات') stats.companies++; else stats.individuals++;

            // فحص اكتمال البيانات الأساسية
            const isComplete = (data.name && data.phone && data.city && data.building_no);
            isComplete ? stats.complete++ : stats.incomplete++;

            // بناء صف الجدول (17 عموداً مطابقاً للصورة)
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
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        updateStats(stats); // تحديث الأرقام في بطاقات الإحصائيات

    } catch (error) {
        console.error("🔴 خطأ أثناء جلب العملاء:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">حدث خطأ: ${error.message}</td></tr>`;
    }
}

// دالة تحديث بطاقات الإحصائيات في الواجهة
function updateStats(s) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    setVal('stat-total', s.total);
    setVal('stat-vip', s.vip);
    setVal('stat-active', s.active);
    setVal('stat-complete', s.complete);
    setVal('stat-incomplete', s.incomplete);
    setVal('stat-individuals', s.individuals);
    setVal('stat-companies', s.companies);
}

// ربط الدوال بالنافذة العالمية (window) لتعمل الأزرار داخل الجدول
window.editCustomer = (id) => {
    if (typeof window.openCustomerModal === 'function') {
        window.openCustomerModal('edit', id);
    }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل من قاعدة بيانات تيرا؟")) {
        try {
            await window.db.collection("customers").doc(id).delete();
            // إعادة تحميل الجدول بعد الحذف
            const tbody = document.getElementById('customers-data-rows');
            if (tbody) renderCustomersTable(tbody);
        } catch (e) {
            alert("فشل الحذف: " + e.message);
        }
    }
};
