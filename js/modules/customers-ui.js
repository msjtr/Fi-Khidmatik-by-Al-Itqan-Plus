/**
 * customers-ui.js - Tera Gateway
 * الإصدار النهائي المصلح: ترتيب شامل + إحصائيات + محرك بحث وتعديل فعال
 * تم إضافة فحص وقائي للعناصر لمنع أخطاء الـ null (setting 'innerText')
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * تهيئة الواجهة الرئيسية للعملاء
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #2563eb; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.5rem; font-weight:800;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #059669; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">بيانات مكتملة</small>
                    <div id="stat-complete" style="font-size:1.5rem; font-weight:800; color:#059669;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #dc2626; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">بيانات غير مكتملة</small>
                    <div id="stat-incomplete" style="font-size:1.5rem; font-weight:800; color:#dc2626;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #e67e22; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">تصنيف العملاء</small>
                    <div id="stat-types" style="font-size:0.9rem; font-weight:700; color:#e67e22; margin-top:5px;">نشط: 0 | تميز: 0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#f8fafc; padding:15px; border-radius:10px;">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، المدينة..." 
                           style="width: 100%; padding: 10px 40px 10px 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-family: inherit;">
                </div>
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-weight:bold; transition: 0.3s; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive" style="overflow-x: auto; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                <table style="width:100%; border-collapse: collapse; min-width:1600px; text-align: right;">
                    <thead style="background:#f8fafc; color:#475569; border-bottom: 2px solid #edf2f7;">
                        <tr>
                            <th style="padding:15px;">#</th>
                            <th>اسم العميل</th>
                            <th>رقم الجوال</th>
                            <th>المفتاح</th>
                            <th>البريد الإلكتروني</th>
                            <th>الدولة</th>
                            <th>المدينة</th>
                            <th>الحي</th>
                            <th>الشارع</th>
                            <th>المبنى</th>
                            <th>الإضافي</th>
                            <th>الرمز</th>
                            <th>ص.ب</th>
                            <th>تاريخ الإضافة</th>
                            <th>حالة العميل</th>
                            <th>تصنيف العميل</th>
                            <th style="text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="17" style="text-align:center; padding:50px; color:#64748b;"><i class="fas fa-spinner fa-spin"></i> جاري مزامنة بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

/**
 * تحميل البيانات وحساب الإحصائيات الدقيقة
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, complete: 0, incomplete: 0, active: 0, vips: 0 };
        let counter = 1;

        if (!snapshot || snapshot.empty) {
            list.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px; color:#94a3b8;">لا يوجد عملاء مسجلين حالياً في النظام.</td></tr>';
            updateStatsDisplay(stats);
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            stats.total++;
            const isComplete = (d.name && d.Phone && d.city && d.district && d.buildingNo);
            if (isComplete) stats.complete++; else stats.incomplete++;
            if (d.status === 'مميز' || d.status === 'تميز') stats.vips++; else stats.active++;

            const dateStr = d.CreatedAt?.toDate ? d.CreatedAt.toDate().toLocaleDateString('ar-SA') : '-';

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#fcfcfc'" onmouseout="this.style.background='transparent'">
                    <td style="padding:12px; color:#94a3b8;">${counter++}</td>
                    <td style="font-weight:bold; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr">${d.Phone || '-'}</td>
                    <td dir="ltr" style="color:#64748b;">${d.countryCode || '+966'}</td>
                    <td><small style="color:#2563eb;">${d.Email || '-'}</small></td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td style="font-size:0.85rem; color:#64748b;">${dateStr}</td>
                    <td><span style="padding:4px 10px; border-radius:20px; font-size:0.75rem; background:#f0fdf4; color:#166534;">${d.customerStatus || 'نشط'}</span></td>
                    <td><b style="color:#2563eb;">${d.status || 'عادي'}</b></td>
                    <td style="text-align:center;">
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer;" title="طباعة العقد"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="color:#dc2626; background:none; border:none; cursor:pointer;" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        updateStatsDisplay(stats);

    } catch (error) {
        console.error("Render Error:", error);
        list.innerHTML = '<tr><td colspan="17" style="text-align:center; color:#dc2626; padding:20px;">خطأ في جلب البيانات. يرجى مراجعة الصلاحيات.</td></tr>';
    }
}

function updateStatsDisplay(s) {
    const totalEl = document.getElementById('stat-total');
    if (totalEl) totalEl.innerText = s.total;
    
    const completeEl = document.getElementById('stat-complete');
    if (completeEl) completeEl.innerText = s.complete;

    const incompleteEl = document.getElementById('stat-incomplete');
    if (incompleteEl) incompleteEl.innerText = s.incomplete;

    const typesEl = document.getElementById('stat-types');
    if (typesEl) typesEl.innerText = `نشط: ${s.active} | تميز: ${s.vips}`;
}

function setupSearch() {
    const input = document.getElementById('cust-filter');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

// --- العمليات العالمية ---

window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    
    const title = document.getElementById('modal-title');
    const modal = document.getElementById('customer-modal');
    
    if (title) title.innerText = "إضافة عميل جديد (Tera)";
    if (modal) modal.style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة النموذج مع فحص وجود العناصر أولاً
    const fields = {
        'cust-name': d.name,
        'cust-phone': d.Phone,
        'cust-email': d.Email,
        'cust-city': d.city,
        'cust-district': d.district,
        'cust-street': d.street,
        'cust-building': d.buildingNo,
        'cust-additional': d.additionalNo,
        'cust-postal': d.postalCode,
        'cust-pobox': d.poBox,
        'cust-status-active': d.customerStatus,
        'cust-category': d.status
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    }

    const title = document.getElementById('modal-title');
    const modal = document.getElementById('customer-modal');
    if (title) title.innerText = "تعديل بيانات العميل";
    if (modal) modal.style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('تنبيه من تيرا: هل تريد حذف العميل نهائياً؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

window.saveCustomerData = async () => {
    // جلب القيم مع حماية ضد الـ null
    const getValue = (id) => document.getElementById(id) ? document.getElementById(id).value : '';

    const data = {
        name: getValue('cust-name'),
        Phone: getValue('cust-phone'),
        Email: getValue('cust-email'),
        city: getValue('cust-city'),
        district: getValue('cust-district'),
        street: getValue('cust-street'),
        buildingNo: getValue('cust-building'),
        additionalNo: getValue('cust-additional'),
        postalCode: getValue('cust-postal'),
        poBox: getValue('cust-pobox'),
        customerStatus: getValue('cust-status-active'),
        status: getValue('cust-category'),
        country: 'السعودية',
        countryCode: '+966'
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, data);
        } else {
            await Core.addCustomer(data);
        }
        window.closeCustomerModal();
        await loadAndRender();
    } catch (err) {
        alert("فشل الحفظ: يرجى التأكد من اتصال الإنترنت.");
    }
};

window.handlePrint = (id) => {
    window.open(`print-customer.html?id=${id}`, '_blank');
};

window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};
