/**
 * customers-ui.js - Tera Gateway
 * الإصدار المعتمد: إصلاح الأزرار ودمج حقول الإضافة الكاملة
 */

import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    // بناء الواجهة مع أزرار متوافقة مع الـ CSS الجديد
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="grid-4" style="margin-bottom: 25px;">
                <div class="stat-item" style="border-right: 5px solid var(--primary);">
                    <small>إجمالي العملاء</small>
                    <div id="stat-total" style="font-size: 1.5rem; font-weight: 800;">0</div>
                </div>
                <div class="stat-item" style="border-right: 5px solid var(--hail-green);">
                    <small>مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size: 1.5rem; font-weight: 800; color: var(--hail-green);">0</div>
                </div>
                <div class="stat-item" style="border-right: 5px solid #ef4444;">
                    <small>غير مكتمل</small>
                    <div id="stat-incomplete" style="font-size: 1.5rem; font-weight: 800; color: #ef4444;">0</div>
                </div>
                <div class="stat-item" style="border-right: 5px solid var(--vip-gold);">
                    <small>عملاء VIP</small>
                    <div id="stat-vips" style="font-size: 1.5rem; font-weight: 800; color: var(--vip-gold);">0</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 15px; box-shadow: var(--shadow-sm);">
                <div style="position: relative; width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 13px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" class="tera-input" placeholder="بحث في سجلات العملاء..." style="padding-right: 45px;">
                </div>
                <button id="btn-open-add" class="btn-primary-tera">
                    <i class="fas fa-plus-circle"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-wrapper">
                <div style="overflow-x: auto;">
                    <table class="tera-table-modern">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>الاسم</th>
                                <th>الجوال</th>
                                <th>المفتاح</th>
                                <th>البريد</th>
                                <th>الدولة</th>
                                <th>المدينة</th>
                                <th>الحي</th>
                                <th>الشارع</th>
                                <th>المبنى</th>
                                <th>الإضافي</th>
                                <th>الرمز</th>
                                <th>ص.ب</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th>التصنيف</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render">
                            <tr><td colspan="17" style="text-align:center; padding:40px;">جاري المزامنة...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="customer-modal" class="tera-modal-overlay">
            <div class="tera-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid var(--primary-light); padding-bottom: 15px;">
                    <h2 id="modal-title" style="color: var(--dark);"><i class="fas fa-user-edit"></i> بيانات العميل</h2>
                    <button onclick="closeCustomerModal()" style="background:none; border:none; font-size: 1.5rem; cursor:pointer; color: #94a3b8;">&times;</button>
                </div>
                
                <form id="customer-form">
                    <div class="grid-3">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" id="cust-name" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">رقم الجوال</label>
                            <input type="text" id="cust-phone" class="form-input" placeholder="5xxxxxxxx" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" id="cust-email" class="form-input">
                        </div>
                    </div>

                    <div class="grid-3">
                        <div class="form-group">
                            <label class="form-label">الدولة</label>
                            <input type="text" id="cust-country" class="form-input" value="المملكة العربية السعودية">
                        </div>
                        <div class="form-group">
                            <label class="form-label">مفتاح الدولة</label>
                            <input type="text" id="cust-countryCode" class="form-input" value="+966">
                        </div>
                        <div class="form-group">
                            <label class="form-label">المدينة</label>
                            <input type="text" id="cust-city" class="form-input" value="حائل">
                        </div>
                    </div>

                    <div class="grid-4">
                        <div class="form-group">
                            <label class="form-label">الحي</label>
                            <input type="text" id="cust-district" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الشارع</label>
                            <input type="text" id="cust-street" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">رقم المبنى</label>
                            <input type="text" id="cust-buildingNo" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الرقم الإضافي</label>
                            <input type="text" id="cust-additionalNo" class="form-input">
                        </div>
                    </div>

                    <div class="grid-3">
                        <div class="form-group">
                            <label class="form-label">الرمز البريدي</label>
                            <input type="text" id="cust-postalCode" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">صندوق البريد</label>
                            <input type="text" id="cust-poBox" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">تصنيف العميل</label>
                            <select id="cust-tag" class="form-select">
                                <option value="standard">عميل عادي</option>
                                <option value="vip">عميل تميز (VIP)</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeCustomerModal()" class="btn-secondary" style="padding: 12px 25px; border-radius: 12px; border: 1px solid #e2e8f0; cursor: pointer;">إلغاء</button>
                        <button type="submit" class="btn-primary-tera">حفظ البيانات</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // ربط الأزرار برمجياً لضمان العمل
    document.getElementById('btn-open-add').addEventListener('click', showAddCustomerModal);
    document.getElementById('customer-form').addEventListener('submit', handleFormSubmit);
    
    await loadAndRender();
    setupSearch();
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, vips: 0, complete: 0, incomplete: 0 };
        let i = 1;

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            stats.total++;

            // التحقق من اكتمال البيانات الأساسية (اسم، جوال، مدينة، حي، مبنى)
            const complete = (d.name && d.phone && d.city && d.district && d.buildingNo);
            if (complete) stats.complete++; else stats.incomplete++;
            if (d.tag === 'vip') stats.vips++;

            list.innerHTML += `
                <tr class="cust-row">
                    <td>${i++}</td>
                    <td style="font-weight: 800;">${d.name || '-'}</td>
                    <td dir="ltr" style="color: var(--primary); font-weight: 600;">${d.phone || '-'}</td>
                    <td>${d.countryCode || '+966'}</td>
                    <td style="font-size: 0.85rem;">${d.email || '-'}</td>
                    <td>${d.country || '-'}</td>
                    <td>${d.city || '-'}</td>
                    <td>${d.district || '-'}</td>
                    <td>${d.street || '-'}</td>
                    <td>${d.buildingNo || '-'}</td>
                    <td>${d.additionalNo || '-'}</td>
                    <td>${d.postalCode || '-'}</td>
                    <td>${d.poBox || '-'}</td>
                    <td style="font-size: 0.8rem;">${d.createdAt?.substring(0, 10) || '-'}</td>
                    <td><span style="color: var(--hail-green);">● نشط</span></td>
                    <td><span class="${d.tag === 'vip' ? 'tag-vip' : ''}" style="padding: 4px 8px; border-radius: 6px;">${(d.tag || 'عادي').toUpperCase()}</span></td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="handleEdit('${id}')" style="color: var(--primary); border:none; background:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="color: #ef4444; border:none; background:none; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-complete').innerText = stats.complete;
        document.getElementById('stat-incomplete').innerText = stats.incomplete;
        document.getElementById('stat-vips').innerText = stats.vips;

    } catch (e) { console.error(e); }
}

// وظائف التحكم
function showAddCustomerModal() {
    editingId = null;
    document.getElementById('customer-form').reset();
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-user-plus"></i> إضافة عميل جديد لتيرا';
    document.getElementById('customer-modal').style.display = 'flex';
}

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    const set = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    set('cust-name', d.name);
    set('cust-phone', d.phone);
    set('cust-email', d.email);
    set('cust-country', d.country);
    set('cust-countryCode', d.countryCode);
    set('cust-city', d.city);
    set('cust-district', d.district);
    set('cust-street', d.street);
    set('cust-buildingNo', d.buildingNo);
    set('cust-additionalNo', d.additionalNo);
    set('cust-postalCode', d.postalCode);
    set('cust-poBox', d.poBox);
    set('cust-tag', d.tag);

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

async function handleFormSubmit(e) {
    e.preventDefault();
    const get = (id) => document.getElementById(id).value;
    
    const data = {
        name: get('cust-name'),
        phone: get('cust-phone'),
        email: get('cust-email'),
        country: get('cust-country'),
        countryCode: get('cust-countryCode'),
        city: get('cust-city'),
        district: get('cust-district'),
        street: get('cust-street'),
        buildingNo: get('cust-buildingNo'),
        additionalNo: get('cust-additionalNo'),
        postalCode: get('cust-postalCode'),
        poBox: get('cust-poBox'),
        tag: get('cust-tag'),
        updatedAt: new Date().toISOString()
    };

    if (editingId) await Core.updateCustomer(editingId, data);
    else await Core.addCustomer(data);

    closeCustomerModal();
    await loadAndRender();
}

window.handleDelete = async (id) => {
    if (confirm('حذف العميل؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

function setupSearch() {
    document.getElementById('cust-filter')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}
