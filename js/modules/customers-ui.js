/**
 * js/modules/customers-ui.js
 * الواجهة المتقدمة لإدارة العملاء - منصة Tera Gateway
 * الميزات: بحث لحظي، إحصائيات ذكية، وتوافق كامل مع الحقول
 */

import * as Core from './customers-core.js';

// مخزن مؤقت للبيانات للسماح بالفلترة السريعة
let localCustomersCache = [];

export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل الأساسي للواجهة
    renderSkeleton(container);
    
    // 2. ربط الدوال بالنافذة (Global Scope) لتعمل الأزرار
    setupGlobalActions();

    // 3. تفعيل مراقب البحث (Live Search)
    setupSearchFilter();

    // 4. جلب البيانات من Firebase
    await refreshData();
}

/**
 * رسم الهيكل الرئيسي (البحث، الإحصائيات، الجدول)
 */
function renderSkeleton(container) {
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; border-right: 5px solid #2563eb;">
                    <small style="color: #64748b;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size: 1.8rem; font-weight: 800; color: #1e293b;">0</div>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; border-right: 5px solid #f59e0b;">
                    <small style="color: #64748b;">عملاء VIP</small>
                    <div id="stat-vip" style="font-size: 1.8rem; font-weight: 800; color: #b45309;">0</div>
                </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 250px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="cust-search-input" placeholder="ابحث باسم العميل، رقم الجوال، أو الحي..." 
                           style="width: 100%; padding: 12px 45px 12px 15px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem;">
                </div>
                <button class="btn-tera" onclick="window.showAddCustomerModal()" 
                        style="background: #2563eb; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-plus"></i> إضافة عميل
                </button>
            </div>

            <div class="table-responsive" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 15px;">العميل</th>
                            <th style="padding: 15px;">رقم الجوال</th>
                            <th style="padding: 15px;">العنوان الوطني</th>
                            <th style="padding: 15px; text-align: center;">الحالة</th>
                            <th style="padding: 15px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">جاري جلب البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * جلب البيانات وتحديث المخزن المؤقت
 */
async function refreshData() {
    try {
        const snapshot = await Core.fetchAllCustomers();
        localCustomersCache = [];
        snapshot.forEach(doc => {
            localCustomersCache.push({ id: doc.id, ...doc.data() });
        });
        renderTable(localCustomersCache);
        updateStats();
    } catch (error) {
        console.error("خطأ في تحديث البيانات:", error);
    }
}

/**
 * عرض الصفوف في الجدول بناءً على مصفوفة معينة (للبحث والفلترة)
 */
function renderTable(dataArray) {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    if (dataArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">لم يتم العثور على نتائج تطابق بحثك.</td></tr>';
        return;
    }

    tbody.innerHTML = dataArray.map(cust => `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 35px; height: 35px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${(cust.name || "ع").charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: bold; color: #1e293b;">${cust.name || 'غير مسجل'}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${cust.email || '-'}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px;" dir="ltr">${cust.phone || '-'}</td>
            <td style="padding: 15px; font-size: 0.85rem;">
                <div style="font-weight: 600;">${cust.district || '-'}</div>
                <div style="color: #64748b; font-size: 0.75rem;">${cust.street || '-'} | مبنى: ${cust.buildingNo || '-'}</div>
            </td>
            <td style="padding: 15px; text-align: center;">
                <span style="background: ${cust.tag === 'vip' ? '#fef3c7' : '#f1f5f9'}; color: ${cust.tag === 'vip' ? '#92400e' : '#475569'}; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                    ${cust.tag || 'عادي'}
                </span>
            </td>
            <td style="padding: 15px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="window.handleDeleteCustomer('${cust.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * نظام البحث اللحظي
 */
function setupSearchFilter() {
    const searchInput = document.getElementById('cust-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        const filtered = localCustomersCache.filter(cust => {
            const name = (cust.name || "").toLowerCase();
            const phone = (cust.phone || "").toLowerCase();
            const district = (cust.district || "").toLowerCase();
            
            return name.includes(term) || phone.includes(term) || district.includes(term);
        });

        renderTable(filtered);
    });
}

/**
 * ربط العمليات بالـ Window لتعمل من الـ HTML
 */
function setupGlobalActions() {
    window.showAddCustomerModal = () => {
        const modal = document.getElementById('customer-modal');
        if (modal) modal.style.display = 'flex';
    };

    window.closeCustomerModal = () => {
        const modal = document.getElementById('customer-modal');
        if (modal) modal.style.display = 'none';
    };

    window.handleDeleteCustomer = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذا العميل من نظام تيرا؟")) {
            const success = await Core.removeCustomer(id);
            if (success) await refreshData();
        }
    };
}

/**
 * تحديث لوحة الإحصائيات
 */
function updateStats() {
    const total = localCustomersCache.length;
    const vips = localCustomersCache.filter(c => c.tag === 'vip').length;
    
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
    if (document.getElementById('stat-vip')) document.getElementById('stat-vip').innerText = vips;
}

export default { initCustomersUI };
