/**
 * customers-ui.js - Tera Gateway
 * الإصدار الاحترافي: ترتيب الجدول والإحصائيات بناءً على الطلب (صورة 1)
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * تهيئة واجهة العملاء بالترتيب الجديد
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 10px;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">عدد العملاء</small>
                    <div id="stat-total" style="font-size:1.4rem; font-weight:800;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #059669; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size:1.4rem; font-weight:800; color:#059669;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #dc2626; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">غير مكتمل البيانات</small>
                    <div id="stat-incomplete" style="font-size:1.4rem; font-weight:800; color:#dc2626;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #eab308; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <small style="color:#64748b;">تصنيف العملاء (VIP)</small>
                    <div id="stat-vips" style="font-size:1.4rem; font-weight:800; color:#eab308;">0</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#f8fafc; padding:15px; border-radius:10px;">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="شريط بحث (الاسم، الجوال، المدينة...)" 
                           style="width: 100%; padding: 10px 40px 10px 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-family: inherit;">
                </div>
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-weight:bold; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive" style="overflow-x: auto; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                <table style="width:100%; border-collapse: collapse; min-width:2000px; text-align: right; font-size: 0.9rem;">
                    <thead style="background:#f1f5f9; color:#475569; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding:15px;">تسلسل</th>
                            <th>اسم العميل</th>
                            <th>رقم الجوال</th>
                            <th>مفتاح الدولة</th>
                            <th>البريد الإلكتروني</th>
                            <th>اسم الدولة</th>
                            <th>المدينة</th>
                            <th>الحي</th>
                            <th>الشارع</th>
                            <th>رقم المبنى</th>
                            <th>الرقم الإضافي</th>
                            <th>رمز البريد</th>
                            <th>صندوق البريد</th>
                            <th>تاريخ الإضافة</th>
                            <th>حالة العميل</th>
                            <th>تصنيف العميل</th>
                            <th style="text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="17" style="text-align:center; padding:50px;">جاري تحميل بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

/**
 * دالة جلب البيانات وعرضها حسب الترتيب المطلوب
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, complete: 0, incomplete: 0, vips: 0 };
        let counter = 1;

        if (!snapshot || snapshot.empty) {
            list.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px;">لا يوجد عملاء مسجلين.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // حساب الإحصائيات
            stats.total++;
            const isComplete = (d.name && d.phone && d.city && d.district && d.buildingNo);
            if (isComplete) stats.complete++; else stats.incomplete++;
            if (d.tag === 'vip') stats.vips++;

            // عرض الصف بالترتيب المطلوب في الصورة
            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px; color:#94a3b8;">${counter++}</td>
                    <td style="font-weight:bold; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr">${d.phone || '-'}</td>
                    <td dir="ltr" style="color:#64748b;">${d.countryCode || '+966'}</td>
                    <td style="color:#2563eb;">${d.email || '-'}</td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td style="font-size:0.8rem;">${d.createdAt?.substring(0, 10) || '-'}</td>
                    <td><span style="color:#059669;">● نشط</span></td>
                    <td><b style="color:#eab308;">${(d.tag || 'عادي').toUpperCase()}</b></td>
                    <td>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer;" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="handleDelete('${id}')" style="color:#dc2626; background:none; border:none; cursor:pointer;" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        // تحديث أرقام الإحصائيات
        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-complete').innerText = stats.complete;
        document.getElementById('stat-incomplete').innerText = stats.incomplete;
        document.getElementById('stat-vips').innerText = stats.vips;

    } catch (error) {
        list.innerHTML = '<tr><td colspan="17" style="text-align:center; color:red; padding:20px;">خطأ في العرض.</td></tr>';
    }
}

/**
 * تفعيل شريط البحث
 */
function setupSearch() {
    const input = document.getElementById('cust-filter');
    if (input) {
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.cust-row').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }
}

// --- أزرار العمليات (إضافة، تعديل، حذف، طباعة) ---

window.showAddCustomerModal = () => {
    editingId = null;
    document.getElementById('customer-form')?.reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة الحقول للتعديل
    const set = (fid, val) => { if(document.getElementById(fid)) document.getElementById(fid).value = val || ''; };
    set('cust-name', d.name);
    set('cust-phone', d.phone);
    set('cust-email', d.email);
    set('cust-city', d.city);
    set('cust-district', d.district);
    set('cust-street', d.street);
    set('cust-building', d.buildingNo);
    set('cust-additional', d.additionalNo);
    set('cust-postal', d.postalCode);
    set('cust-pobox', d.poBox);
    set('cust-category', d.tag);

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('تأكيد الحذف: هل أنت متأكد من حذف هذا العميل؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.handlePrint = (id) => {
    window.open(`admin/modules/print-customer.html?id=${id}`, '_blank');
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
        poBox: get('cust-pobox'),
        tag: get('cust-category'),
        updatedAt: new Date().toISOString()
    };

    if (editingId) await Core.updateCustomer(editingId, payload);
    else {
        payload.createdAt = new Date().toISOString();
        await Core.addCustomer(payload);
    }
    
    document.getElementById('customer-modal').style.display = 'none';
    await loadAndRender();
};
