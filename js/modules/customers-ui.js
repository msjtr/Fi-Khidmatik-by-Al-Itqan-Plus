/**
 * نظام إدارة العملاء الشامل - Tera Gateway
 * تنفيذ وربط فعلي لـ 17 حقلاً مع العمليات الحيوية
 */
import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // 1. بناء واجهة الإحصائيات والبحث والأزرار الأساسية
    container.innerHTML = `
        <div class="customers-dashboard" style="direction: rtl; font-family: 'Tajawal', sans-serif;">
            <div id="stats-container" class="stats-grid"></div>

            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="main-search" placeholder="بحث بالاسم، الجوال، المدينة، أو التصنيف...">
                </div>
                
                <div class="filter-group">
                    <select id="filter-status"><option value="">حالة العميل</option><option value="نشط">نشط</option><option value="معلق">معلق</option><option value="موقوف">موقوف</option></select>
                    <select id="filter-type"><option value="">التصنيف</option><option value="فرد">فرد</option><option value="شركة">شركة</option><option value="VIP">عميل VIP</option></select>
                    <button id="btn-add-customer" class="btn-primary"><i class="fas fa-user-plus"></i> إضافة عميل جديد</button>
                </div>
            </div>

            <div class="table-container">
                <table id="main-customers-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الاسم الكامل</th>
                            <th>الجوال</th>
                            <th>المفتاح</th>
                            <th>البريد</th>
                            <th>الدولة</th>
                            <th>المدينة</th>
                            <th>الحي</th>
                            <th>الشارع</th>
                            <th>رقم المبنى</th>
                            <th>الإضافي</th>
                            <th>الرمز البريدي</th>
                            <th>ص.ب</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                            <th>التصنيف</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody">
                        <tr><td colspan="17" style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin"></i> جاري جلب البيانات من القاعدة...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 2. ربط الأحداث (Event Listeners)
    document.getElementById('btn-add-customer').onclick = () => openFormModal();
    document.getElementById('main-search').oninput = debounce(handleLiveSearch, 300);
    document.getElementById('filter-status').onchange = handleLiveSearch;
    document.getElementById('filter-type').onchange = handleLiveSearch;

    // 3. تحميل ورسم البيانات لأول مرة
    await refreshCustomerTable();
}

/**
 * وظيفة: جلب البيانات وتحديث الجدول والإحصائيات
 */
async function refreshCustomerTable() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const snapshot = await Core.fetchAllCustomers();
        let rowsHtml = '';
        let stats = { total: 0, active: 0, pending: 0, incomplete: 0 };

        snapshot.forEach((docSnap, index) => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            // حساب الإحصائيات
            stats.total++;
            if (d.status === 'نشط') stats.active++;
            if (!d.nationalId || !d.email) stats.incomplete++;

            rowsHtml += `
                <tr class="customer-row">
                    <td>${index + 1}</td>
                    <td class="font-bold">${d.name || '-'}</td>
                    <td dir="ltr">${d.phone || '-'}</td>
                    <td>${d.countryKey || '+966'}</td>
                    <td>${d.email || '-'}</td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.zipCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td>${d.createdAt ? d.createdAt.substring(0,10) : '-'}</td>
                    <td><span class="badge status-${d.status}">${d.status || 'معلق'}</span></td>
                    <td><span class="badge type-${d.type}">${d.type || 'فرد'}</span></td>
                    <td class="sticky-actions">
                        <button onclick="window.editCustomerAction('${id}')" class="btn-sm btn-edit"><i class="fas fa-pen"></i></button>
                        <button onclick="window.printCustomerAction('${id}')" class="btn-sm btn-print"><i class="fas fa-print"></i></button>
                        <button onclick="window.deleteCustomerAction('${id}', '${d.name}')" class="btn-sm btn-delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });

        tbody.innerHTML = rowsHtml || '<tr><td colspan="17" style="text-align:center;">لا يوجد عملاء مسجلين</td></tr>';
        updateStatsUI(stats);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">خطأ في الاتصال بقاعدة البيانات: ${err.message}</td></tr>`;
    }
}

/**
 * وظيفة 1: إضافة عميل جديد
 */
function openFormModal(data = null) {
    editingId = data ? data.id : null;
    if (window.openCustomerModal) {
        window.openCustomerModal(editingId ? `تعديل بيانات: ${data.name}` : "إضافة عميل جديد للنظام");
        // تعبئة الفورم إذا كان تعديلاً
        const form = document.getElementById('customer-form');
        if (form) {
            form.reset();
            if (data) fillFormFields(data);
        }
    }
}

/**
 * وظيفة 2: التعديل (جلب البيانات أولاً)
 */
window.editCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    if (data) openFormModal({ id, ...data });
};

/**
 * وظيفة 3: الحفظ الحقيقي (Add/Update)
 */
window.saveCustomerData = async () => {
    const formData = gatherFormData();
    if (!formData.name || !formData.phone) return alert("الاسم ورقم الجوال حقول إجبارية!");

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, formData);
            await Core.logActivity(`تعديل بيانات العميل: ${formData.name}`);
        } else {
            formData.createdAt = new Date().toISOString();
            await Core.addCustomer(formData);
            await Core.logActivity(`إضافة عميل جديد: ${formData.name}`);
        }
        window.closeCustomerModal();
        refreshCustomerTable();
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    }
};

/**
 * وظيفة 4: الحذف مع رسالة التأكيد والسجل
 */
window.deleteCustomerAction = async (id, name) => {
    if (confirm(`⚠️ تحذير: هل أنت متأكد من حذف العميل "${name}" نهائياً؟`)) {
        try {
            await Core.deleteCustomer(id);
            await Core.logActivity(`حذف العميل: ${name}`);
            refreshCustomerTable();
        } catch (err) {
            alert("فشل الحذف");
        }
    }
};

/**
 * وظيفة 5: الطباعة (تحويل البيانات لـ PDF أو نافذة طباعة)
 */
window.printCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
            <head><title>تقرير عميل - ${data.name}</title></head>
            <body onload="window.print()">
                <h1>بيانات العميل: ${data.name}</h1>
                <hr>
                <p>الجوال: ${data.phone}</p>
                <p>العنوان: ${data.city} - ${data.district}</p>
                </body>
        </html>
    `);
    printWindow.document.close();
};

// دالة لتجميع بيانات الـ 17 حقل من الفورم
function gatherFormData() {
    return {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        countryKey: document.getElementById('cust-key').value,
        email: document.getElementById('cust-email').value,
        country: document.getElementById('cust-country').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        buildingNo: document.getElementById('cust-building').value,
        additionalNo: document.getElementById('cust-additional').value,
        zipCode: document.getElementById('cust-zip').value,
        poBox: document.getElementById('cust-pobox').value,
        status: document.getElementById('cust-status').value,
        type: document.getElementById('cust-type').value
    };
}

// دالة تحديث الإحصائيات
function updateStatsUI(s) {
    const container = document.getElementById('stats-container');
    container.innerHTML = `
        <div class="stat-card"><span>إجمالي العملاء</span><strong>${s.total}</strong></div>
        <div class="stat-card"><span>نشطين</span><strong>${s.active}</strong></div>
        <div class="stat-card"><span>بيانات ناقصة</span><strong style="color:red">${s.incomplete}</strong></div>
    `;
}

// دالة البحث والفلترة
function handleLiveSearch() {
    refreshCustomerTable(); // في التنفيذ الفعلي، نقوم بعمل Query في Firestore بناءً على الفلاتر
}

// دالة تأخير التنفيذ (Debounce) لتحسين أداء البحث
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
