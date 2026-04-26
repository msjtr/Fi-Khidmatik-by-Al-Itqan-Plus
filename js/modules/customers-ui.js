/**
 * customers-ui.js - Tera Gateway
 * الإصدار الاحترافي: متوافق مع متطلبات الصورة بدقة 100%
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * تهيئة واجهة العملاء
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; background: #f9fbff;">
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border-right: 6px solid #2563eb;">
                    <small style="color:#64748b; font-weight:bold;">عدد العملاء</small>
                    <div id="stat-total" style="font-size:1.8rem; font-weight:800; color:#1e293b; margin-top:8px;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border-right: 6px solid #10b981;">
                    <small style="color:#64748b; font-weight:bold;">عدد العملاء مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size:1.8rem; font-weight:800; color:#10b981; margin-top:8px;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border-right: 6px solid #ef4444;">
                    <small style="color:#64748b; font-weight:bold;">عدد العملاء غير مكتمله بياناتهم</small>
                    <div id="stat-incomplete" style="font-size:1.8rem; font-weight:800; color:#ef4444; margin-top:8px;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border-right: 6px solid #f59e0b;">
                    <small style="color:#64748b; font-weight:bold;">تصنيف العملاء</small>
                    <div id="stat-vips" style="font-size:1.4rem; font-weight:800; color:#f59e0b; margin-top:8px;">VIP: 0</div>
                </div>
            </div>

            <div class="action-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:12px 28px; border-radius:10px; cursor:pointer; font-weight:bold; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(37,99,235,0.25);">
                    <i class="fas fa-plus-circle"></i> اضافة عميل جديد
                </button>
                <div class="search-container" style="position: relative; width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 15px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="شريط بحث (بالاسم، الجوال، المدينة...)" 
                           style="width: 100%; padding: 12px 45px 12px 15px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-family: inherit;">
                </div>
            </div>

            <div class="table-wrapper" style="background:#fff; border-radius:15px; box-shadow:0 10px 40px rgba(0,0,0,0.04); overflow:hidden;">
                <div style="overflow-x: auto;">
                    <table style="width:100%; border-collapse: collapse; min-width:2300px; text-align: right;">
                        <thead style="background:#f8fafc; color:#475569; font-size: 0.85rem; border-bottom: 2px solid #f1f5f9;">
                            <tr>
                                <th style="padding:20px;">التسلسل</th>
                                <th>اسم العميل</th>
                                <th>رقم الجوال</th>
                                <th>مفتاح الدولة</th>
                                <th>البريد الإلكتروني</th>
                                <th>اسم الدوله</th>
                                <th>المدينة</th>
                                <th>الحي</th>
                                <th>الشارع</th>
                                <th>رقم المبنى</th>
                                <th>الرقم الاضافي</th>
                                <th>رمز البريد</th>
                                <th>صندوق البريد</th>
                                <th>تاريخ الاضافه</th>
                                <th>حالة العميل</th>
                                <th>تصنيف العميل</th>
                                <th style="text-align:center;">الاجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render">
                            <tr><td colspan="17" style="text-align:center; padding:60px; color:#94a3b8;">جاري جلب البيانات من تيرا...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

/**
 * معالجة البيانات وعرضها
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, complete: 0, incomplete: 0, vips: 0 };
        let index = 1;

        if (!snapshot || snapshot.empty) {
            list.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px;">لا يوجد عملاء حالياً.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // حساب اكتمال البيانات (شرط: وجود الاسم، الجوال، المدينة، الحي، ورقم المبنى)
            const isComplete = (d.name && d.phone && d.city && d.district && d.buildingNo);
            stats.total++;
            if (isComplete) stats.complete++; else stats.incomplete++;
            if (d.tag?.toLowerCase() === 'vip') stats.vips++;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9; transition:0.2s;">
                    <td style="padding:15px; color:#94a3b8; font-weight:bold;">${index++}</td>
                    <td style="font-weight:700; color:#1e293b;">${d.name || '-'}</td>
                    <td dir="ltr" style="font-weight:600; color:#2563eb;">${d.phone || '-'}</td>
                    <td dir="ltr" style="color:#64748b;">${d.countryCode || '+966'}</td>
                    <td style="color:#64748b;">${d.email || '-'}</td>
                    <td>${d.country || 'المملكة العربية السعودية'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td style="font-size:0.8rem; color:#94a3b8;">${d.createdAt?.substring(0, 10) || '-'}</td>
                    <td><span style="color:#10b981; font-weight:bold;">● نشط</span></td>
                    <td><span style="background:#fefce8; color:#92400e; padding:4px 10px; border-radius:6px; font-weight:800; font-size:0.75rem;">${(d.tag || 'عادي').toUpperCase()}</span></td>
                    <td>
                        <div style="display:flex; gap:10px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer;" title="طباعه"><i class="fas fa-print"></i></button>
                            <button onclick="handleDelete('${id}')" style="color:#ef4444; background:none; border:none; cursor:pointer;" title="حذف"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        // تحديث أرقام الإحصائيات في اللوحة
        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-complete').innerText = stats.complete;
        document.getElementById('stat-incomplete').innerText = stats.incomplete;
        document.getElementById('stat-vips').innerText = `VIP: ${stats.vips}`;

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

/**
 * نظام البحث المباشر
 */
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

// --- العمليات (أزرار الأكشن) ---

window.handlePrint = (id) => {
    // فتح رابط الطباعة المخصص للعميل
    window.open(`admin/modules/print-customer.html?id=${id}`, '_blank');
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // ملء النموذج (تأكد من وجود ID لكل حقل في الـ HTML الرئيسي)
    const fill = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    fill('cust-name', d.name);
    fill('cust-phone', d.phone);
    fill('cust-email', d.email);
    fill('cust-city', d.city);
    fill('cust-district', d.district);
    fill('cust-street', d.street);
    fill('cust-building', d.buildingNo);
    fill('cust-additional', d.additionalNo);
    fill('cust-postal', d.postalCode);
    fill('cust-pobox', d.poBox);
    fill('cust-category', d.tag);

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل من منصة تيرا؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
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
        country: 'المملكة العربية السعودية',
        countryCode: '+966',
        updatedAt: new Date().toISOString()
    };

    if (editingId) {
        await Core.updateCustomer(editingId, payload);
    } else {
        payload.createdAt = new Date().toISOString();
        await Core.addCustomer(payload);
    }
    
    document.getElementById('customer-modal').style.display = 'none';
    await loadAndRender();
};
