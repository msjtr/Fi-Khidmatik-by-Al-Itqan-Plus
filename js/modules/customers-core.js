/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway
 * تشمل: الإضافة، العرض القائم على القائمة، الفلترة، والعمليات (تعديل، حذف، طباعة)
 */

import { db } from '../core/config.js';

export async function initCustomers(container) {
    if (!container) return;

    // واجهة التحكم العلوية (بحث + إضافة)
    renderToolbar(container);
    
    // حاوية الجدول
    const tableContainer = document.createElement('div');
    tableContainer.id = 'customers-list-container';
    container.appendChild(tableContainer);

    // جلب وعرض البيانات (مثال تجريبي)
    const mockCustomers = [
        {
            id: "966597771565",
            name: "محمد صالح جميعان الشمري",
            city: "حائل",
            district: "النقرة",
            phone: "966597771565",
            postalCode: "55421",
            status: "active"
        }
    ];

    renderCustomersTable(tableContainer, mockCustomers);
}

// 1. رسم شريط الأدوات والفلترة
function renderToolbar(container) {
    const toolbar = document.createElement('div');
    toolbar.className = 'table-toolbar';
    toolbar.innerHTML = `
        <div class="toolbar-right">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="ابحث باسم العميل أو رقم الجوال...">
            </div>
            <select id="city-filter" class="filter-select">
                <option value="">كل المدن</option>
                <option value="حائل">حائل</option>
            </select>
        </div>
        <div class="toolbar-left">
            <button class="btn-add" onclick="openCustomerModal()">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>
    `;
    container.appendChild(toolbar);
}

// 2. رسم جدول العملاء (القائمة)
function renderCustomersTable(container, customers) {
    container.innerHTML = `
        <div class="table-responsive">
            <table class="main-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>المنطقة</th>
                        <th>رقم الجوال</th>
                        <th>الرمز البريدي</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr>
                            <td>
                                <div class="user-cell">
                                    <div class="user-icon">${c.name.charAt(0)}</div>
                                    <div class="user-info">
                                        <span class="u-name">${c.name}</span>
                                        <span class="u-id">ID: ${c.id.slice(-4)}</span>
                                    </div>
                                </div>
                            </td>
                            <td>${c.city} - ${c.district}</td>
                            <td dir="ltr">${c.phone}</td>
                            <td><span class="zip-tag">${c.postalCode}</span></td>
                            <td><span class="status-dot ${c.status}"></span> نشط</td>
                            <td>
                                <div class="actions-btns">
                                    <button title="تعديل" onclick="editCustomer('${c.id}')" class="act-btn edit"><i class="fas fa-edit"></i></button>
                                    <button title="طباعة" onclick="printCustomer('${c.id}')" class="act-btn print"><i class="fas fa-print"></i></button>
                                    <button title="حذف" onclick="deleteCustomer('${c.id}')" class="act-btn delete"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// --- تنسيقات CSS مدمجة للموديول ---
const style = document.createElement('style');
style.textContent = `
    .table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; }
    .toolbar-right { display: flex; gap: 10px; flex: 1; }
    
    .search-box { position: relative; flex: 1; max-width: 400px; }
    .search-box i { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-box input { width: 100%; padding: 10px 40px 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; outline: none; transition: 0.3s; }
    .search-box input:focus { border-color: #e67e22; box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1); }

    .filter-select { padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
    .btn-add { background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; }

    /* الجدول */
    .table-responsive { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden; }
    .main-table { width: 100%; border-collapse: collapse; text-align: right; }
    .main-table th { background: #f8fafc; padding: 15px; color: #64748b; font-size: 0.9rem; border-bottom: 1px solid #edf2f7; }
    .main-table td { padding: 15px; border-bottom: 1px solid #edf2f7; color: #334155; }
    
    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-icon { width: 35px; height: 35px; background: #fef5e8; color: #e67e22; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .u-name { display: block; font-weight: 700; color: #1e293b; }
    .u-id { font-size: 0.75rem; color: #94a3b8; }
    
    .zip-tag { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-left: 5px; }
    .status-dot.active { background: #22c55e; }

    /* الأزرار */
    .actions-btns { display: flex; gap: 8px; }
    .act-btn { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .edit { background: #eff6ff; color: #3b82f6; }
    .print { background: #f0fdf4; color: #22c55e; }
    .delete { background: #fef2f2; color: #ef4444; }
    .act-btn:hover { transform: translateY(-2px); filter: brightness(0.9); }
`;
document.head.appendChild(style);
