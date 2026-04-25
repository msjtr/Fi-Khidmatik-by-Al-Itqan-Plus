/**
 * js/modules/customers-ui.js
 * موديول واجهة المستخدم للعملاء - منصة Tera Gateway
 * متوافق تماماً مع هيكلية بيانات: (name, phone, email, district, buildingNo, etc.)
 */

import * as Core from './customers-core.js';

let editingId = null;

/**
 * التهيئة الرئيسية للواجهة
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; padding: 10px;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: #fff; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="color: #64748b; font-size: 0.9rem; display: block; margin-bottom: 5px;">إجمالي العملاء</span>
                    <strong id="stat-total" style="font-size: 1.5rem; color: #1e293b;">0</strong>
                </div>
                <div style="background: #fff; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; border-right: 4px solid #10b981;">
                    <span style="color: #64748b; font-size: 0.9rem; display: block; margin-bottom: 5px;">عملاء VIP</span>
                    <strong id="stat-vip" style="font-size: 1.5rem; color: #059669;">0</strong>
                </div>
            </div>

            <div class="action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، أو الحي..." 
                           style="width: 100%; padding: 12px 40px 12px 15px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; transition: border-color 0.3s;">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()" 
                        style="background: #2563eb; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive" style="background: white; border-radius: 15px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <table class="tera-table" style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 18px; color: #475569; font-weight: 700;">العميل</th>
                            <th style="padding: 18px; color: #475569; font-weight: 700;">الاتصال</th>
                            <th style="padding: 18px; color: #475569; font-weight: 700;">العنوان الوطني (حائل)</th>
                            <th style="padding: 18px; color: #475569; font-weight: 700; text-align: center;">الحالة</th>
                            <th style="padding: 18px; color: #475569; font-weight: 700; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align: center; padding: 50px; color: #94a3b8;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    setupSearch();
    await loadAndRender();
}

/**
 * جلب البيانات ورسم الصفوف
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, vip: 0 };

        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">لا يوجد عملاء مسجلين حالياً في النظام.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            stats.total++;
            if (d.tag === 'vip') stats.vip++;

            // دمج كود الدولة مع رقم الجوال
            const fullPhone = `${d.countryCode || '+966'} ${d.phone || ''}`;
            const name = d.name || "غير مسجل";

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;">
                    <td style="padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 42px; height: 42px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; border: 1px solid #dbeafe;">
                                ${name.charAt(0)}
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #1e293b;">${name}</div>
                                <div style="font-size: 0.8rem; color: #64748b;">${d.email || '-'}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 15px;" dir="ltr">
                        <div style="font-size: 0.95rem; color: #334155; font-weight: 600;">${fullPhone}</div>
                    </td>
                    <td style="padding: 15px; font-size: 0.85rem; line-height: 1.5;">
                        <div style="font-weight: 600; color: #1e293b;">${d.city || 'حائل'} - ${d.district || '-'}</div>
                        <div style="color: #64748b;">${d.street || '-'} | مبنى: ${d.buildingNo || '-'}</div>
                        <div style="color: #2563eb; font-size: 0.8rem;">الرمز البريدي: ${d.postalCode || '-'}</div>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="background: ${d.tag === 'vip' ? '#fef3c7' : '#f1f5f9'}; 
                                     color: ${d.tag === 'vip' ? '#92400e' : '#475569'}; 
                                     padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">
                            ${d.tag || 'عادي'}
                        </span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="handleEdit('${id}')" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

        updateStatsUI(stats);

    } catch (error) {
        console.error("Render Error:", error);
        list.innerHTML = `<tr><td colspan="5" style="color: #ef4444; text-align: center; padding: 20px;">حدث خطأ أثناء تحميل البيانات: ${error.message}</td></tr>`;
    }
}

/**
 * تحديث لوحة الإحصائيات
 */
function updateStatsUI(s) {
    const totalEl = document.getElementById('stat-total');
    const vipEl = document.getElementById('stat-vip');
    if (totalEl) totalEl.innerText = s.total;
    if (vipEl) vipEl.innerText = s.vip;
}

/**
 * نظام البحث المباشر
 */
function setupSearch() {
    const filterInput = document.getElementById('cust-filter');
    if (!filterInput) return;

    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.cust-row');
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

// الدوال العالمية المطلوبة للعمل من داخل HTML
window.showAddCustomerModal = () => {
    // كود إظهار المودال (يجب أن يكون لديك modal بالـ ID المناسب في index.html)
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
};

window.handleEdit = async (id) => {
    console.log("تعديل العميل:", id);
    // سيتم استدعاء دالة fetchCustomerById وتعبئة النموذج هنا
};

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل من منصة تيرا؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

export default { initCustomersUI };
