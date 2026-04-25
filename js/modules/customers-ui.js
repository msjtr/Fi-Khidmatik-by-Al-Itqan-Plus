/**
 * customers-ui.js
 * قوالب واجهة المستخدم لنظام العملاء - Tera Gateway
 */

export const UI = {
    /**
     * الهيكل الرئيسي للموديول (الإحصائيات + الأدوات + الجدول)
     */
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
                    <div class="stat-icon"><i class="fas fa-id-card-clip"></i></div>
                    <div class="stat-content">
                        <h3>بيانات مكتملة</h3>
                        <p id="stat-complete">0</p>
                    </div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-icon"><i class="fas fa-user-slash"></i></div>
                    <div class="stat-content">
                        <h3>بيانات ناقصة</h3>
                        <p id="stat-incomplete">0</p>
                    </div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-icon"><i class="fas fa-crown"></i></div>
                    <div class="stat-content">
                        <h3>عملاء VIP</h3>
                        <p id="stat-flagged">0</p>
                    </div>
                </div>
            </div>

            <div class="toolbar-modern">
                <div class="search-wrapper">
                    <i class="fas fa-magnifying-glass"></i>
                    <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال، أو رقم الهوية...">
                </div>
                <div class="action-group" style="display: flex; gap: 10px;">
                    <button onclick="exportToExcel()" class="btn-secondary-tera" style="padding: 10px 18px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600; color: #64748b;">
                        <i class="fas fa-file-export"></i> تصدير
                    </button>
                    <button onclick="openCustomerModal()" class="btn-primary-tera">
                        <i class="fas fa-plus"></i> إضافة عميل
                    </button>
                </div>
            </div>
            
            <div class="table-card-wrapper">
                <table class="tera-table-modern">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>المدينة / السكن</th>
                            <th>الحالة</th>
                            <th style="text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list">
                        </tbody>
                </table>
            </div>
        </div>
    `,

    /**
     * قالب سطر العميل الواحد
     * @param {string} id - معرف الوثيقة في Firestore
     * @param {object} data - بيانات العميل
     */
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
                    <div class="phone-link" dir="ltr" style="font-weight: 700; color: var(--tera-dark);">
                        <i class="fas fa-phone" style="font-size: 0.75rem; color: #94a3b8;"></i>
                        ${data.phone || '-'}
                    </div>
                    <div class="user-subtext">${data.email || 'لا يوجد بريد'}</div>
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
                    <button onclick="previewPrint('${id}')" class="btn-icon print" title="طباعة العقد">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="editCustomer('${id}')" class="btn-icon edit" title="تعديل">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
};
