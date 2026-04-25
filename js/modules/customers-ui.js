/**
 * customers-ui.js
 * واجهة المستخدم لنظام العملاء - Tera Gateway
 * التحديث: دعم العنوان الوطني الكامل (حائل) وتنسيق VIP
 */

export const UI = {
    /**
     * الهيكل الرئيسي للموديول
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
                    <div class="stat-icon"><i class="fas fa-map-location-dot"></i></div>
                    <div class="stat-content">
                        <h3>تغطية حائل</h3>
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
                    <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال، أو الحي...">
                </div>
                <div class="action-group">
                    <button onclick="openCustomerModal()" class="btn-primary-tera">
                        <i class="fas fa-plus"></i> إضافة عميل جديد
                    </button>
                </div>
            </div>
            
            <div class="table-card-wrapper">
                <table class="tera-table-modern">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>العنوان الوطني</th>
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
     */
    renderCustomerRow: (id, data) => {
        // تنسيق التاريخ والبيانات
        const joinDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-';
        const addressSummary = `${data.buildingNo || ''} ${data.street || ''}`;
        
        return `
        <tr class="customer-row-fade">
            <td>
                <div class="user-profile-cell">
                    <div class="avatar-box">${(data.name || 'C').charAt(0)}</div>
                    <div class="user-meta">
                        <span class="user-name">${data.name || 'عميل غير مسجل'}</span>
                        <span class="user-subtext"><i class="fas fa-envelope" style="font-size:0.7rem"></i> ${data.email || 'لا يوجد بريد'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div style="font-weight: 700; color: var(--tera-dark);" dir="ltr">
                        ${data.countryCode || '+966'} ${data.phone || ''}
                    </div>
                    <div class="user-subtext">انضم: ${joinDate}</div>
                </div>
            </td>
            <td>
                <div class="user-meta">
                    <span class="user-name" style="font-size: 0.85rem;">
                        <i class="fas fa-location-dot" style="color: var(--tera-primary); font-size: 0.75rem;"></i> 
                        ${data.city || 'حائل'} - ${data.district || '-'}
                    </span>
                    <span class="user-subtext">${addressSummary}</span>
                </div>
            </td>
            <td>
                <span class="badge-tera ${data.tag === 'vip' ? 'vip' : 'standard'}">
                    <i class="fas ${data.tag === 'vip' ? 'fa-crown' : 'fa-user'}"></i>
                    ${data.tag === 'vip' ? 'عضو مميز' : 'عادي'}
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
    `;
    }
};
