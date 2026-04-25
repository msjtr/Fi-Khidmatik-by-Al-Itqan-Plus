/**
 * js/modules/customers-ui.js
 * الإصدار النهائي الشامل - منصة Tera Gateway
 * مخصص لبيانات: (النقرة، حي سعد المشاط، حائل)
 */

import * as Core from './customers-core.js';

// مخزن مؤقت للبيانات لضمان سرعة الفلترة والبحث
let customersCache = [];

/**
 * دالة التشغيل الرئيسية
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل (الإحصائيات، البحث، والجدول)
    renderAppStructure(container);
    
    // 2. تفعيل الأزرار والعمليات عالمياً (Global Actions)
    setupGlobalFunctions();

    // 3. تفعيل نظام الفلترة اللحظي
    setupLiveSearch();

    // 4. جلب البيانات من Firebase وعرضها
    await refreshCustomerData();
}

/**
 * رسم هيكل الواجهة الاحترافي
 */
function renderAppStructure(container) {
    container.innerHTML = `
        <div class="tera-container" style="font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div class="stats-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div class="stat-card" style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; border-bottom: 4px solid #2563eb;">
                    <span style="color: #64748b; font-size: 0.9rem;">إجمالي العملاء</span>
                    <div id="total-count" style="font-size: 2rem; font-weight: 800; color: #1e293b;">0</div>
                </div>
                <div class="stat-card" style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; border-bottom: 4px solid #f59e0b;">
                    <span style="color: #64748b; font-size: 0.9rem;">عملاء VIP</span>
                    <div id="vip-count" style="font-size: 2rem; font-weight: 800; color: #b45309;">0</div>
                </div>
                <div class="stat-card" style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; border-bottom: 4px solid #10b981;">
                    <span style="color: #64748b; font-size: 0.9rem;">منطقة حائل</span>
                    <div id="hail-count" style="font-size: 2rem; font-weight: 800; color: #065f46;">0</div>
                </div>
            </div>

            <div class="toolbar" style="background: white; padding: 15px; border-radius: 15px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 300px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="tera-search" placeholder="بحث باسم العميل، رقم الجوال، أو الحي..." 
                           style="width: 100%; padding: 12px 45px 12px 15px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 1rem;">
                </div>
                <button onclick="window.showAddModal()" style="background: #2563eb; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-holder" style="background: white; border-radius: 15px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 18px; color: #475569;">العميل</th>
                            <th style="padding: 18px; color: #475569;">الاتصال</th>
                            <th style="padding: 18px; color: #475569;">العنوان الوطني</th>
                            <th style="padding: 18px; color: #475569; text-align: center;">الحالة</th>
                            <th style="padding: 18px; color: #475569; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody id="tera-customers-body">
                        <tr><td colspan="5" style="text-align: center; padding: 50px; color: #94a3b8;"><i class="fas fa-circle-notch fa-spin"></i> جاري مزامنة بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * جلب البيانات وتحديث الجدول
 */
async function refreshCustomerData() {
    try {
        const snapshot = await Core.fetchAllCustomers();
        customersCache = [];
        snapshot.forEach(doc => {
            customersCache.push({ id: doc.id, ...doc.data() });
        });
        renderTableRows(customersCache);
        updateStatistics();
    } catch (error) {
        console.error("Firebase Error:", error);
    }
}

/**
 * رسم صفوف الجدول بناءً على البيانات
 */
function renderTableRows(data) {
    const tbody = document.getElementById('tera-customers-body');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">لا توجد نتائج مطابقة لبحثك.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(cust => {
        const fullAddress = `${cust.district || '-'}، ${cust.street || '-'} | مبنى: ${cust.buildingNo || '-'} | إضافي: ${cust.additionalNo || '-'}`;
        
        return `
        <tr style="border-bottom: 1px solid #f1f5f9;" class="cust-row">
            <td style="padding: 15px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px solid #dbeafe;">
                        ${(cust.name || "ع").charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #1e293b;">${cust.name || 'غير مسجل'}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">${cust.email || '-'}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px;" dir="ltr">
                <div style="font-weight: 600; color: #334155;">${cust.countryCode || '+966'} ${cust.phone || ''}</div>
            </td>
            <td style="padding: 15px; font-size: 0.85rem;">
                <div style="font-weight: bold; color: #1e293b;">${cust.city || 'حائل'}</div>
                <div style="color: #64748b; font-size: 0.8rem;">${fullAddress}</div>
            </td>
            <td style="padding: 15px; text-align: center;">
                <span style="background: ${cust.tag === 'vip' ? '#fef3c7' : '#f1f5f9'}; 
                             color: ${cust.tag === 'vip' ? '#92400e' : '#475569'}; 
                             padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; border: 1px solid ${cust.tag === 'vip' ? '#fde68a' : '#e2e8f0'};">
                    ${(cust.tag || 'عادي').toUpperCase()}
                </span>
            </td>
            <td style="padding: 15px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="window.handleEdit('${cust.id}')" title="تعديل" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; padding: 7px; border-radius: 8px; cursor: pointer;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.handlePrint('${cust.id}')" title="طباعة" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #2563eb; padding: 7px; border-radius: 8px; cursor: pointer;"><i class="fas fa-print"></i></button>
                    <button onclick="window.handleDelete('${cust.id}')" title="حذف" style="background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; padding: 7px; border-radius: 8px; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `}).join('');
}

/**
 * ربط الأزرار بالـ Window لضمان استجابتها
 */
function setupGlobalActions() {
    window.showAddModal = () => {
        const modal = document.getElementById('customer-modal');
        if (modal) {
            document.getElementById('customer-form').reset();
            modal.style.display = 'flex';
        }
    };

    window.handleEdit = async (id) => {
        console.log("تعديل العميل ID:", id);
        // كود فتح المودال وتعبئة البيانات للتعديل
    };

    window.handlePrint = (id) => {
        const cust = customersCache.find(c => c.id === id);
        if (cust) {
            console.log("جاري تحضير ملف الطباعة لـ:", cust.name);
            window.print(); // يمكنك تخصيص صفحة طباعة لاحقاً
        }
    };

    window.handleDelete = async (id) => {
        if (confirm("🚨 تحذير: هل أنت متأكد من حذف هذا العميل نهائياً من منصة تيرا؟")) {
            const success = await Core.removeCustomer(id);
            if (success) await refreshCustomerData();
        }
    };
}

/**
 * نظام الفلترة والبحث اللحظي
 */
function setupLiveSearch() {
    const input = document.getElementById('tera-search');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = customersCache.filter(c => 
            (c.name || "").toLowerCase().includes(term) || 
            (c.phone || "").toLowerCase().includes(term) || 
            (c.district || "").toLowerCase().includes(term)
        );
        renderTableRows(filtered);
    });
}

/**
 * تحديث الإحصائيات في الأعلى
 */
function updateStatistics() {
    const total = customersCache.length;
    const vip = customersCache.filter(c => c.tag === 'vip').length;
    const hail = customersCache.filter(c => (c.city || "").includes("حائل")).length;

    if (document.getElementById('total-count')) document.getElementById('total-count').innerText = total;
    if (document.getElementById('vip-count')) document.getElementById('vip-count').innerText = vip;
    if (document.getElementById('hail-count')) document.getElementById('hail-count').innerText = hail;
}

export default { initCustomersUI };
