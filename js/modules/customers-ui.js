/**
 * customers-ui.js - Tera Gateway
 * إدارة واجهة المستخدم وجدول العملاء والعمليات التفاعلية
 */

import * as Core from './customers-core.js';

let editingId = null; // لتتبع العميل الذي يتم تعديله حالياً

/**
 * تهيئة واجهة العملاء وحقن العناصر في الحاوية
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. بناء هيكل الواجهة
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="stats-grid">
                <div class="stat-item">
                    <span>إجمالي العملاء</span>
                    <strong id="stat-total">0</strong>
                </div>
                <div class="stat-item success">
                    <span>بيانات مكتملة</span>
                    <strong id="stat-complete">0</strong>
                </div>
                <div class="stat-item danger">
                    <span>بملاحظات فنية</span>
                    <strong id="stat-notes">0</strong>
                </div>
            </div>

            <div class="action-bar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، أو المدينة...">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>معلومات الاتصال</th>
                            <th>العنوان الوطني</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr>
                            <td colspan="5" style="text-align:center; padding:40px;">
                                <i class="fas fa-spinner fa-spin"></i> جاري مزامنة بيانات تيرا...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // 2. تحميل البيانات وعرضها
    await loadAndRender();

    // 3. تفعيل ميزة البحث الفوري
    const filterInput = document.getElementById('cust-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.cust-row');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }
}

/**
 * جلب البيانات من الكور ورسمها في الجدول
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, complete: 0, notes: 0 };

        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين في النظام حالياً.</td></tr>';
            updateStatsDisplay(stats);
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // تحديث الإحصائيات
            stats.total++;
            if (d.notes && d.notes.trim() !== '') stats.notes++;
            if (d.buildingNo && d.postalCode) stats.complete++;

            // بناء الصف
            list.innerHTML += `
                <tr class="cust-row">
                    <td>
                        <div class="avatar-cell">
                            <div class="avatar-icon">${(d.name || '?').charAt(0)}</div>
                            <div class="cust-info">
                                <b>${d.name || 'غير مسجل'}</b>
                                <small>${d.Email || 'لا يوجد بريد'}</small>
                            </div>
                        </div>
                    </td>
                    <td dir="ltr" style="text-align:center;">${d.Phone || '-'}</td>
                    <td>
                        <div class="addr-details">
                            <b>${d.city || '-'}</b>، ${d.district || '-'}<br>
                            <small>مبنى: ${d.buildingNo || '-'} | فرعي: ${d.additionalNo || '-'}</small>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <span class="status-tag ${d.status === 'محتال' ? 'danger' : d.status === 'مميز' ? 'success' : 'default'}">
                            ${d.status || 'عادي'}
                        </span>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button onclick="handlePrint('${id}')" title="طباعة البطاقة"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="handleDelete('${id}')" class="text-danger" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        updateStatsDisplay(stats);

    } catch (error) {
        console.error("Render Error:", error);
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">فشل جلب البيانات. تأكد من اتصال الإنترنت أو إعدادات Firebase.</td></tr>';
    }
}

/**
 * تحديث عدادات الإحصائيات في الواجهة
 */
function updateStatsDisplay(s) {
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = s.total;
    if (document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = s.complete;
    if (document.getElementById('stat-notes')) document.getElementById('stat-notes').innerText = s.notes;
}

// --- الوظائف العالمية (Global Actions) لربطها بأزرار HTML ---

window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة المودال بالبيانات الحالية
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-email').value = d.Email || '';
    document.getElementById('cust-city').value = d.city || '';
    document.getElementById('cust-district').value = d.district || '';
    document.getElementById('cust-street').value = d.street || '';
    document.getElementById('cust-building').value = d.buildingNo || '';
    document.getElementById('cust-additional').value = d.additionalNo || '';
    document.getElementById('cust-postal').value = d.postalCode || '';
    document.getElementById('cust-pobox').value = d.poBox || '';
    document.getElementById('cust-notes').value = d.notes || '';
    document.getElementById('cust-tag').value = d.status || 'عادي';

    // معالجة رقم الجوال (تقسيم الكود والرقم)
    if (d.Phone && d.Phone.includes(' ')) {
        const parts = d.Phone.split(' ');
        document.getElementById('cust-country-code').value = parts[0];
        document.getElementById('cust-phone').value = parts[1];
    } else {
        document.getElementById('cust-phone').value = d.Phone || '';
    }

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleCustomerSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData.entries());

    // تجهيز الكائن النهائي للإرسال
    const finalData = {
        name: formProps.name,
        Email: formProps.Email,
        Phone: `${formProps.countryCode} ${formProps.Phone}`,
        city: formProps.city,
        district: formProps.district,
        street: formProps.street,
        buildingNo: formProps.buildingNo,
        additionalNo: formProps.additionalNo,
        postalCode: formProps.postalCode,
        poBox: formProps.poBox,
        notes: formProps.notes,
        status: formProps.status
    };

    try {
        const btn = event.target.querySelector('.btn-save');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "جاري الحفظ...";

        if (editingId) {
            await Core.updateCustomer(editingId, finalData);
        } else {
            await Core.addCustomer(finalData);
        }

        window.closeCustomerModal();
        await loadAndRender();
        btn.disabled = false;
        btn.innerText = originalText;
    } catch (e) {
        alert("خطأ في الحفظ: " + e.message);
    }
};

window.handleDelete = async (id) => {
    if (confirm('⚠️ تنبيه: هل أنت متأكد من حذف هذا العميل نهائياً؟ لا يمكن التراجع عن هذه الخطوة.')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

window.handlePrint = (id) => {
    // فتح صفحة الطباعة مع تمرير المعرف في الرابط
    window.open(`customer-print.html?id=${id}`, '_blank');
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};
