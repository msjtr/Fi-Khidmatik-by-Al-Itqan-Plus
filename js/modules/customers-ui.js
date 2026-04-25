/**
 * customers-ui.js - Tera Gateway
 * الإصدار المعتمد بناءً على هيكلية قاعدة بيانات الأستاذ محمد (حائل)
 */

import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">إجمالي عملاء تيرا</small>
                    <div id="stat-total" style="font-size:1.6rem; font-weight:800; color:#1e293b;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #eab308; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">عملاء VIP (المميزين)</small>
                    <div id="stat-vips" style="font-size:1.6rem; font-weight:800; color:#eab308;">0</div>
                </div>
                <div class="stat-item" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #059669; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <small style="color:#64748b; display:block; margin-bottom:5px;">الموقع الرئيسي</small>
                    <div style="font-size:1.2rem; font-weight:800; color:#059669; margin-top:5px;">منطقة حائل</div>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background:#fff; padding:15px; border-radius:12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div class="search-box" style="position: relative; flex: 1; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 12px; color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، أو الحي..." 
                           style="width: 100%; padding: 12px 40px 12px 12px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-family: inherit;">
                </div>
                <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container" style="background:#fff; border-radius:15px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
                <div style="overflow-x: auto;">
                    <table style="width:100%; border-collapse: collapse; min-width:1100px; text-align: right;">
                        <thead style="background:#f8fafc; color:#64748b; font-size: 0.85rem;">
                            <tr>
                                <th style="padding:18px 15px;">الاسم الكامل</th>
                                <th>رقم الجوال</th>
                                <th>المدينة / الحي</th>
                                <th>العنوان</th>
                                <th>التصنيف</th>
                                <th>تاريخ الإضافة</th>
                                <th style="text-align:center;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render">
                            <tr><td colspan="7" style="text-align:center; padding:50px;"><i class="fas fa-sync fa-spin"></i> جاري جلب البيانات من تيرا...</td></tr>
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
 * معالج البيانات الذكي - يطابق المسميات التي زودتني بها
 */
function getVal(data, key) {
    const map = {
        'phone': data.phone || data.Phone || '-',
        'email': data.email || data.Email || '-',
        'tag': data.tag || data.status || 'عادي',
        'date': data.createdAt || (data.CreatedAt?.toDate ? data.CreatedAt.toDate().toLocaleDateString('ar-SA') : '-')
    };
    return map[key] || data[key] || '-';
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, vips: 0 };

        if (!snapshot || snapshot.empty) {
            list.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">لا يوجد عملاء حالياً.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            stats.total++;
            const currentTag = getVal(d, 'tag');
            if (currentTag.toLowerCase() === 'vip') stats.vips++;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:15px; font-weight:700;">${d.name || '-'}</td>
                    <td dir="ltr" style="font-weight:600; color:#2563eb;">${getVal(d, 'phone')}</td>
                    <td>${d.city || 'حائل'} - ${d.district || '-'}</td>
                    <td style="font-size:0.85rem; color:#64748b;">${d.street || '-'} / مبنى: ${d.buildingNo || '-'}</td>
                    <td><span style="background:${currentTag === 'vip' ? '#fefce8' : '#eff6ff'}; color:${currentTag === 'vip' ? '#a16207' : '#2563eb'}; padding:4px 10px; border-radius:6px; font-weight:bold; font-size:0.8rem;">${currentTag.toUpperCase()}</span></td>
                    <td style="font-size:0.85rem;">${getVal(d, 'date').substring(0, 10)}</td>
                    <td>
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="background:#f1f5f9; border:none; width:35px; height:35px; border-radius:8px; color:#2563eb; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="background:#fff1f2; border:none; width:35px; height:35px; border-radius:8px; color:#dc2626; cursor:pointer;"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-vips').innerText = stats.vips;

    } catch (error) {
        list.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red; padding:20px;">خطأ في تحميل البيانات.</td></tr>';
    }
}

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

// --- أزرار التفاعل ---

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // ملء النموذج بناءً على مسمياتك الدقيقة
    const set = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    
    set('cust-name', d.name);
    set('cust-phone', d.phone || d.Phone);
    set('cust-email', d.email || d.Email);
    set('cust-city', d.city);
    set('cust-district', d.district);
    set('cust-street', d.street);
    set('cust-building', d.buildingNo);
    set('cust-additional', d.additionalNo);
    set('cust-postal', d.postalCode);
    set('cust-pobox', d.poBox);
    set('cust-category', d.tag || d.status);

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.saveCustomerData = async () => {
    const get = (id) => document.getElementById(id)?.value || '';

    // تجهيز البيانات بنفس مسميات قاعدة بياناتك الأصلية
    const data = {
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
        updatedAt: new Date().toISOString() // حفظ التاريخ بصيغة النص كما في سجلاتك
    };

    try {
        if (editingId) {
            await Core.updateCustomer(editingId, data);
        } else {
            data.createdAt = new Date().toISOString();
            await Core.addCustomer(data);
        }
        window.closeCustomerModal();
        await loadAndRender();
    } catch (err) {
        alert("حدث خطأ أثناء الحفظ.");
    }
};

window.handleDelete = async (id) => {
    if (confirm('هل تريد حذف هذا العميل من نظام تيرا؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};
