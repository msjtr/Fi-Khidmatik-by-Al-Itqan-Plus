/**
 * js/modules/customers-ui.js
 * موديول واجهة العملاء - Tera Gateway
 * الإصلاح النهائي للأزرار وربط العمليات الحيوية
 */
import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // 1. بناء هيكل الواجهة
    container.innerHTML = `
        <div class="customers-dashboard" style="direction: rtl; font-family: 'Tajawal', sans-serif;">
            <div id="stats-container" class="stats-grid"></div>

            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="main-search" placeholder="بحث بالاسم، الجوال، المدينة، أو التصنيف...">
                </div>
                
                <div class="filter-group" style="display:flex; gap:10px; flex-wrap: wrap;">
                    <select id="filter-status" class="tera-input" style="width:120px;">
                        <option value="">كل الحالات</option>
                        <option value="نشط">نشط</option>
                        <option value="معلق">معلق</option>
                        <option value="موقوف">موقوف</option>
                    </select>
                    <select id="filter-type" class="tera-input" style="width:120px;">
                        <option value="">كل التصنيفات</option>
                        <option value="فرد">فرد</option>
                        <option value="شركة">شركة</option>
                        <option value="VIP">VIP</option>
                    </select>
                    <button id="btn-add-customer" class="btn btn-primary" onclick="window.openAddCustomerAction()">
                        <i class="fas fa-user-plus"></i> إضافة عميل
                    </button>
                </div>
            </div>

            <div class="table-container shadow-sm">
                <table id="main-customers-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الاسم الكامل</th>
                            <th>الجوال</th>
                            <th>البريد</th>
                            <th>المدينة</th>
                            <th>الحي</th>
                            <th>الحالة</th>
                            <th>التصنيف</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody">
                        <tr><td colspan="9" style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin"></i> جاري جلب البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 2. ربط البحث الفوري
    const searchInput = document.getElementById('main-search');
    if (searchInput) searchInput.oninput = debounce(() => window.refreshCustomerTable(), 300);

    const filterStatus = document.getElementById('filter-status');
    const filterType = document.getElementById('filter-type');
    if (filterStatus) filterStatus.onchange = () => window.refreshCustomerTable();
    if (filterType) filterType.onchange = () => window.refreshCustomerTable();

    // 3. تحميل البيانات
    await window.refreshCustomerTable();
}

/**
 * دالة تحديث الجدول (عالمية)
 */
window.refreshCustomerTable = async () => {
    const tbody = document.getElementById('customers-tbody');
    if (!tbody) return;

    const searchTerm = document.getElementById('main-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const typeFilter = document.getElementById('filter-type')?.value || '';

    try {
        const snapshot = await Core.fetchAllCustomers();
        let rowsHtml = '';
        let stats = { total: 0, active: 0, incomplete: 0 };
        let counter = 1;

        snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const id = docSnap.id;

            // تطبيق الفلترة
            const matchesSearch = !searchTerm || d.name?.toLowerCase().includes(searchTerm) || d.phone?.includes(searchTerm);
            const matchesStatus = !statusFilter || d.status === statusFilter;
            const matchesType = !typeFilter || d.type === typeFilter;

            if (matchesSearch && matchesStatus && matchesType) {
                stats.total++;
                if (d.status === 'نشط') stats.active++;
                if (!d.city || !d.district) stats.incomplete++;

                rowsHtml += `
                    <tr>
                        <td>${counter++}</td>
                        <td style="font-weight:bold;">${d.name || '-'}</td>
                        <td dir="ltr">${d.phone || '-'}</td>
                        <td>${d.email || '-'}</td>
                        <td>${d.city || '-'}</td>
                        <td>${d.district || '-'}</td>
                        <td><span class="badge status-${d.status || 'معلق'}">${d.status || 'معلق'}</span></td>
                        <td><span class="badge type-${d.type || 'فرد'}">${d.type || 'فرد'}</span></td>
                        <td class="sticky-actions">
                            <button onclick="window.editCustomerAction('${id}')" class="btn-sm btn-edit"><i class="fas fa-pen"></i></button>
                            <button onclick="window.printCustomerAction('${id}')" class="btn-sm btn-print"><i class="fas fa-print"></i></button>
                            <button onclick="window.deleteCustomerAction('${id}', '${d.name}')" class="btn-sm btn-delete"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            }
        });

        tbody.innerHTML = rowsHtml || '<tr><td colspan="9" style="text-align:center;">لا توجد نتائج</td></tr>';
        updateStatsUI(stats);
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" style="color:red; text-align:center;">خطأ في الاتصال بالخادم</td></tr>';
    }
};

/**
 * دوال الأزرار (عالمية لتعمل مع onclick)
 */
window.openAddCustomerAction = () => {
    editingId = null;
    if (window.openCustomerModal) {
        window.openCustomerModal("إضافة عميل جديد");
        document.getElementById('customer-form')?.reset();
    }
};

window.editCustomerAction = async (id) => {
    try {
        const data = await Core.fetchCustomerById(id);
        if (data && window.openCustomerModal) {
            editingId = id;
            window.openCustomerModal(`تعديل بيانات: ${data.name}`);
            fillFormFields(data);
        }
    } catch (err) { alert("خطأ في جلب البيانات"); }
};

window.saveCustomerData = async () => {
    const formData = gatherFormData();
    if (!formData.name || !formData.phone) return alert("الاسم والجوال حقول إجبارية.");

    try {
        if (editingId) await Core.updateCustomer(editingId, formData);
        else await Core.addCustomer(formData);
        
        if (window.closeCustomerModal) window.closeCustomerModal();
        await window.refreshCustomerTable();
    } catch (err) { alert("خطأ في الحفظ: " + err.message); }
};

window.deleteCustomerAction = async (id, name) => {
    if (confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
        await Core.deleteCustomer(id);
        await window.refreshCustomerTable();
    }
};

window.printCustomerAction = async (id) => {
    const data = await Core.fetchCustomerById(id);
    if (!data) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html dir="rtl"><body onload="window.print()"><h2>بطاقة عميل: ${data.name}</h2><hr><p>الجوال: ${data.phone}</p><p>المدينة: ${data.city}</p></body></html>`);
    printWindow.document.close();
};

// وظائف مساعدة
function fillFormFields(data) {
    const map = { 'cust-name': data.name, 'cust-phone': data.phone, 'cust-email': data.email, 'cust-city': data.city, 'cust-district': data.district, 'cust-status': data.status, 'cust-type': data.type };
    for (let id in map) {
        const el = document.getElementById(id);
        if (el) el.value = map[id] || '';
    }
}

function gatherFormData() {
    return {
        name: document.getElementById('cust-name')?.value,
        phone: document.getElementById('cust-phone')?.value,
        email: document.getElementById('cust-email')?.value,
        city: document.getElementById('cust-city')?.value,
        district: document.getElementById('cust-district')?.value,
        status: document.getElementById('cust-status')?.value || 'معلق',
        type: document.getElementById('cust-type')?.value || 'فرد',
        updatedAt: new Date().toISOString()
    };
}

function updateStatsUI(s) {
    const container = document.getElementById('stats-container');
    if (container) {
        container.innerHTML = `
            <div class="stat-card"><span>إجمالي العملاء</span><strong>${s.total}</strong></div>
            <div class="stat-card"><span>نشط</span><strong style="color:#10b981">${s.active}</strong></div>
            <div class="stat-card"><span>بيانات ناقصة</span><strong style="color:#ef4444">${s.incomplete}</strong></div>
        `;
    }
}

function debounce(func, timeout) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout
