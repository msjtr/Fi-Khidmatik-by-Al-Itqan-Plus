/**
 * customers-ui.js - واجهة المستخدم لـ Tera Gateway
 * تم تنظيف الملف والاعتماد على customers.css الخارجي
 */

export const UI = {
    // قالب الهيكل الرئيسي
    renderMainLayout: () => `
        <div class="module-fade-in">
            <div class="stats-grid">
                <div class="stat-card primary">
                    <div class="stat-icon"><i class="fas fa-user-group"></i></div>
                    <div class="stat-content">
                        <h3>إجمالي العملاء</h3>
                        <p id="stat-total">0</p>
                    </div>
                </div>
                <div class="stat-card success">
                    <div class="stat-icon"><i class="fas fa-check-double"></i></div>
                    <div class="stat-content">
                        <h3>بيانات مكتملة</h3>
                        <p id="stat-complete">0</p>
                    </div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-icon"><i class="fas fa-file-signature"></i></div>
                    <div class="stat-content">
                        <h3>بيانات ناقصة</h3>
                        <p id="stat-incomplete">0</p>
                    </div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-icon"><i class="fas fa-bell"></i></div>
                    <div class="stat-content">
                        <h3>ملاحظات</h3>
                        <p id="stat-flagged">0</p>
                    </div>
                </div>
            </div>

            <div class="toolbar-modern">
                <div class="search-wrapper">
                    <i class="fas fa-magnifying-glass"></i>
                    <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال، أو رقم الهوية...">
                </div>
                <div class="action-group">
                    <button onclick="exportToExcel()" class="btn-secondary-tera">
                        <i class="fas fa-file-export"></i> <span>تصدير Excel</span>
                    </button>
                    <button id="add-customer-btn" class="btn-primary-tera">
                        <i class="fas fa-plus"></i> <span>إضافة عميل جديد</span>
                    </button>
                </div>
            </div>
            
            <div class="table-card-wrapper">
                <table class="tera-table-modern">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>معلومات الاتصال</th>
                            <th>العنوان والسكن</th>
                            <th>الحالة</th>
                            <th style="text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list"></tbody>
                </table>
            </div>
        </div>
    `,

    // قالب سطر العميل
    renderCustomerRow: (id, data) => `
        <tr class="customer-row-fade">
            <td>
                <div class="user-profile-cell">
                    <div class="avatar-box">
                        ${(data.name || 'C').charAt(0)}
                    </div>
                    <div class="user-meta">
                        <span class="user-name">${data.name || 'عميل غير معروف'}</span>
                        <span class="user-subtext">${data.idNumber || 'بدون هوية'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="phone-link" dir="ltr">
                        <i class="fas fa-phone-flip" style="font-size: 0.8rem; color: #94a3b8;"></i>
                        <span><b>${data.countryCode || '+966'}</b> ${data.phone}</span>
                    </div>
                    <small class="user-subtext">${data.email || ''}</small>
                </div>
            </td>
            <td>
                <div class="user-meta">
                    <span class="user-name" style="font-size: 0.85rem;">${data.city || '-'}</span>
                    <span class="user-subtext">${data.district || '-'}</span>
                </div>
            </td>
            <td>
                <span class="badge-tera ${data.tag === 'مميز' ? 'vip' : 'standard'}">
                    <i class="fas ${data.tag === 'مميز' ? 'fa-crown' : 'fa-user'}"></i>
                    ${data.tag || 'عادي'}
                </span>
            </td>
            <td>
                <div class="action-dock">
                    <button onclick="previewPrint('${id}')" class="btn-icon print" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="editCustomer('${id}')" class="btn-icon edit" title="تعديل">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,

    // تم إبقاء الدالة فارغة أو حذفها تماماً لأن التنسيق الآن في ملف CSS منفصل
    injectStyles: () => {
        console.log("Customer UI styles loaded from external CSS file.");
    }
};
