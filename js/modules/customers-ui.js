/**
 * customers-ui.js - Tera Gateway
 * إصلاح خطأ null: دمج النافذة المنبثقة (Modal) داخل الموديل لضمان العمل في أي صفحة
 */

import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // حقن الواجهة كاملة (الإحصائيات + الجدول + النافذة المنبثقة) في الحاوية
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; background: #f9fbff;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #2563eb; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; font-weight:bold;">عدد العملاء</small>
                    <div id="stat-total" style="font-size:1.8rem; font-weight:800; margin-top:5px;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #10b981; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; font-weight:bold;">مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size:1.8rem; font-weight:800; color:#10b981; margin-top:5px;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #ef4444; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; font-weight:bold;">غير مكتمل</small>
                    <div id="stat-incomplete" style="font-size:1.8rem; font-weight:800; color:#ef4444; margin-top:5px;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; border-right: 6px solid #f59e0b; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; font-weight:bold;">تصنيف VIP</small>
                    <div id="stat-vips" style="font-size:1.8rem; font-weight:800; color:#f59e0b; margin-top:5px;">0</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center;">
                <button onclick="window.showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> اضافة عميل جديد
                </button>
                <input type="text" id="cust-filter" placeholder="بحث سريع..." style="width:300px; padding:10px; border-radius:10px; border:1px solid #e2e8f0; outline:none;">
            </div>

            <div style="background:#fff; border-radius:15px; overflow-x:auto; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
                <table style="width:100%; border-collapse: collapse; text-align: right; min-width:2000px;">
                    <thead style="background:#f8fafc; color:#64748b; border-bottom: 2px solid #f1f5f9;">
                        <tr>
                            <th style="padding:15px;">تسلسل</th>
                            <th>اسم العميل</th><th>رقم الجوال</th><th>مفتاح الدولة</th><th>البريد</th>
                            <th>الدولة</th><th>المدينة</th><th>الحي</th><th>الشارع</th>
                            <th>المبنى</th><th>الإضافي</th><th>الرمز البريدي</th><th>صندوق البريد</th>
                            <th>تاريخ الاضافه</th><th>حالة العميل</th><th>تصنيف العميل</th>
                            <th style="text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render"></tbody>
                </table>
            </div>

            <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
                <div style="background:#fff; width:90%; max-width:700px; padding:30px; border-radius:20px; max-height:90vh; overflow-y:auto;">
                    <h2 id="modal-title" style="color:#2563eb; margin-bottom:20px;">إضافة عميل</h2>
                    <form id="customer-form" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <input type="text" id="cust-name" placeholder="الاسم الكامل" style="grid-column:span 2; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-phone" placeholder="رقم الجوال" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="email" id="cust-email" placeholder="البريد الإلكتروني" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-city" placeholder="المدينة" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-district" placeholder="الحي" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-street" placeholder="الشارع" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-building" placeholder="رقم المبنى" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-additional" placeholder="الرقم الإضافي" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <input type="text" id="cust-postal" placeholder="الرمز البريدي" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <select id="cust-category" style="padding:12px; border-radius:8px; border:1px solid #ddd;">
                            <option value="عادي">عميل عادي</option>
                            <option value="vip">VIP</option>
                        </select>
                        <div style="grid-column:span 2; display:flex; gap:10px; justify-content:flex-end; margin-top:20px;">
                            <button type="button" onclick="window.closeCustomerModal()" style="padding:10px 20px; border-radius:8px; border:none; background:#eee; cursor:pointer;">إلغاء</button>
                            <button type="button" onclick="window.saveCustomerData()" style="padding:10px 30px; border-radius:8px; border:none; background:#2563eb; color:white; cursor:pointer; font-weight:bold;">حفظ</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

// --- ربط الدوال بـ window لضمان عملها من أي مكان ---

window.showAddCustomerModal = () => {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    
    const title = document.getElementById('modal-title');
    if (title) title.innerText = "إضافة عميل جديد";
    
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    const set = (fid, val) => { const el = document.getElementById(fid); if(el) el.value = val || ''; };
    set('cust-name', d.name);
    set('cust-phone', d.phone);
    set('cust-email', d.email);
    set('cust-city', d.city);
    set('cust-district', d.district);
    set('cust-street', d.street);
    set('cust-building', d.buildingNo);
    set('cust-additional', d.additionalNo);
    set('cust-postal', d.postalCode);
    set('cust-category', d.tag);

    const title = document.getElementById('modal-title');
    if (title) title.innerText = "تعديل بيانات العميل";
    
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
};

window.saveCustomerData = async () => {
    const get = (id) => document.getElementById(id)?.value || '';
    const payload = {
        name: get('cust-name'),
        phone: get('cust-phone'),
        email: get('cust-email'),
        city: get('cust-city'),
        district: get('cust-district'),
        street: get('cust-street'),
        buildingNo: get('cust-building'),
        additionalNo: get('cust-additional'),
        postalCode: get('cust-postal'),
        tag: get('cust-category'),
        updatedAt: new Date().toISOString()
    };

    if (editingId) await Core.updateCustomer(editingId, payload);
    else {
        payload.createdAt = new Date().toISOString();
        await Core.addCustomer(payload);
    }

    window.closeCustomerModal();
    await loadAndRender();
};

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.handlePrint = (id) => {
    window.open(`admin/modules/print-customer.html?id=${id}`, '_blank');
};

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    const snapshot = await Core.fetchAllCustomers();
    list.innerHTML = '';
    let stats = { total: 0, complete: 0, incomplete: 0, vips: 0 };
    let counter = 1;

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const id = docSnap.id;
        const isComplete = (d.name && d.phone && d.city);
        
        stats.total++;
        if (isComplete) stats.complete++; else stats.incomplete++;
        if (d.tag === 'vip') stats.vips++;

        list.innerHTML += `
            <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px; color:#94a3b8;">${counter++}</td>
                <td><b>${d.name || '-'}</b></td>
                <td dir="ltr">${d.phone || '-'}</td>
                <td>${d.countryCode || '+966'}</td>
                <td>${d.email || '-'}</td>
                <td>السعودية</td>
                <td>${d.city || '-'}</td>
                <td>${d.district || '-'}</td>
                <td>${d.street || '-'}</td>
                <td>${d.buildingNo || '-'}</td>
                <td>${d.additionalNo || '-'}</td>
                <td>${d.postalCode || '-'}</td>
                <td>${d.poBox || '-'}</td>
                <td style="font-size:0.8rem;">${d.createdAt?.substring(0, 10) || '-'}</td>
                <td style="color:#10b981;">نشط</td>
                <td style="font-weight:bold; color:#f59e0b;">${(d.tag || 'عادي').toUpperCase()}</td>
                <td style="text-align:center;">
                    <button onclick="window.handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer; margin-left:10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer; margin-left:10px;"><i class="fas fa-print"></i></button>
                    <button onclick="window.handleDelete('${id}')" style="color:#ef4444; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
    document.getElementById('stat-vips').innerText = stats.vips;
}

function setupSearch() {
    const filter = document.getElementById('cust-filter');
    if (!filter) return;
    filter.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    });
}
