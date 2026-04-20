/**
 * js/modules/customers-ui.js
 * دوال واجهة المستخدم للعملاء - تيرا جيتواي
 * @version 2.1.0
 */

// ===================== دوال مساعدة =====================

/**
 * منع هجمات XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * عرض إشعار منبثق
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
        font-family: 'Tajawal', sans-serif;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/**
 * تنسيق العنوان الكامل من بيانات العميل
 */
function formatFullAddress(customer) {
    if (!customer) return '';
    const parts = [];
    if (customer.buildingNo) parts.push(`مبنى ${customer.buildingNo}`);
    if (customer.street) parts.push(`شارع ${customer.street}`);
    if (customer.district) parts.push(`حي ${customer.district}`);
    if (customer.city) parts.push(customer.city);
    if (customer.additionalNo) parts.push(`رقم إضافي ${customer.additionalNo}`);
    if (customer.poBox) parts.push(`ص.ب ${customer.poBox}`);
    if (customer.country) parts.push(customer.country);
    return parts.length > 0 ? parts.join('، ') : 'لا يوجد عنوان';
}

// ===================== فتح وإغلاق المودال =====================

/**
 * فتح نافذة إضافة/تعديل عميل
 * @param {string} mode - 'add' أو 'edit'
 * @param {Object} customerData - بيانات العميل (في حالة التعديل)
 */
export function showCustomerModal(mode = 'add', customerData = null) {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    const form = document.getElementById('customer-form');
    
    if (!form) return;
    
    if (mode === 'add') {
        title.innerText = '➕ إضافة عميل جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && customerData) {
        title.innerText = '✏️ تعديل بيانات العميل';
        document.getElementById('edit-id').value = customerData.id || '';
        document.getElementById('c-name').value = customerData.name || '';
        document.getElementById('c-phone').value = customerData.phone || '';
        document.getElementById('c-email').value = customerData.email || '';
        document.getElementById('c-city').value = customerData.city || '';
        document.getElementById('c-district').value = customerData.district || '';
        document.getElementById('c-street').value = customerData.street || '';
        document.getElementById('c-building').value = customerData.buildingNo || '';
        document.getElementById('c-additional').value = customerData.additionalNo || '';
        document.getElementById('c-pobox').value = customerData.poBox || '';
        document.getElementById('c-country').value = customerData.country || 'السعودية';
    }
    
    modal.style.display = 'flex';
}

/**
 * إغلاق نافذة العميل
 */
export function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
    
    // تنظيف النموذج
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    document.getElementById('edit-id').value = '';
}

// ===================== عرض جدول العملاء =====================

/**
 * عرض العملاء في الجدول
 * @param {Array} customers - مصفوفة العملاء
 */
export function renderCustomersTable(customers) {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-users fa-2x" style="margin-bottom: 10px; display: block;"></i>
                    لا يوجد عملاء مسجلين حالياً
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = customers.map((customer, index) => {
        const fullAddress = formatFullAddress(customer);
        return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold;">${escapeHtml(customer.name)}</td>
                <td style="padding: 12px; direction: ltr;">${escapeHtml(customer.phone)}</td>
                <td style="padding: 12px;">${escapeHtml(customer.email) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(customer.city) || '-'}</td>
                <td style="padding: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(fullAddress)}">
                    ${escapeHtml(fullAddress.length > 30 ? fullAddress.substring(0, 30) + '...' : fullAddress)}
                </td>
                <td style="padding: 12px; text-align: center;">
                    <button class="edit-customer-btn" data-id="${customer.id}" 
                            style="color: #f39c12; background: none; border: none; cursor: pointer; margin-left: 10px; font-size: 1rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-customer-btn" data-id="${customer.id}" 
                            style="color: #e74c3c; background: none; border: none; cursor: pointer; font-size: 1rem;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===================== الدالة الرئيسية لتهيئة الموديول =====================

/**
 * تهيئة موديول العملاء - الدالة الرئيسية
 */
export async function initCustomers(container) {
    if (!container) return;
    
    // عرض واجهة العملاء
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-users" style="color: #e67e22;"></i> 
                        إدارة العملاء
                    </h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 0.85rem;">
                        <i class="fas fa-address-card"></i> إدارة بيانات العملاء والعناوين
                    </p>
                </div>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(230,126,34,0.3); transition: 0.3s;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>
            
            <div style="margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; max-width: 300px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #95a5a6;"></i>
                    <input type="text" id="search-customers" placeholder="بحث عن عميل..." 
                           style="width: 100%; padding: 10px 35px 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                </div>
                <button id="refresh-customers-btn" style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> تحديث
                </button>
            </div>
            
            <div style="background: white; border-radius: 15px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                        <tr>
                            <th style="padding: 15px; text-align: right;">#</th>
                            <th style="padding: 15px; text-align: right;">الاسم</th>
                            <th style="padding: 15px; text-align: right;">الجوال</th>
                            <th style="padding: 15px; text-align: right;">البريد</th>
                            <th style="padding: 15px; text-align: right;">المدينة</th>
                            <th style="padding: 15px; text-align: right;">العنوان</th>
                            <th style="padding: 15px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 40px;">
                                <i class="fas fa-spinner fa-spin"></i> جاري تحميل العملاء...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- مودال إضافة/تعديل عميل -->
        <div id="customer-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
            <div style="background: white; width: 90%; max-width: 650px; padding: 25px; border-radius: 16px; box-shadow: 0 20px 35px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
                <h3 id="modal-title" style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">الاسم الكامل *</label>
                            <input type="text" id="c-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">رقم الجوال *</label>
                            <input type="tel" id="c-phone" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">البريد الإلكتروني</label>
                            <input type="email" id="c-email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <h4 style="color: #e67e22; margin: 20px 0 10px 0; border-right: 3px solid #e67e22; padding-right: 10px;">
                        <i class="fas fa-location-dot"></i> العنوان الوطني
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px;">الدولة</label>
                            <input type="text" id="c-country" value="السعودية" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">المدينة</label>
                            <input type="text" id="c-city" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">الحي</label>
                            <input type="text" id="c-district" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">الشارع</label>
                            <input type="text" id="c-street" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">رقم المبنى</label>
                            <input type="text" id="c-building" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">الرقم الإضافي</label>
                            <input type="text" id="c-additional" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px;">الرمز البريدي</label>
                            <input type="text" id="c-pobox" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button type="submit" style="flex: 2; background: #27ae60; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                            <i class="fas fa-save"></i> حفظ البيانات
                        </button>
                        <button type="button" id="close-customer-modal" style="flex: 1; background: #95a5a6; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // عرض عملاء تجريبيين (سيتم استبدالهم ببيانات حقيقية من Firebase)
    const demoCustomers = [
        { 
            id: '1', 
            name: 'أحمد محمد', 
            phone: '0501234567', 
            email: 'ahmed@example.com', 
            city: 'الرياض', 
            district: 'الملز',
            street: 'الرياض',
            buildingNo: '123',
            additionalNo: '456',
            poBox: '12345',
            country: 'السعودية'
        },
        { 
            id: '2', 
            name: 'سارة علي', 
            phone: '0551234567', 
            email: 'sara@example.com', 
            city: 'جدة', 
            district: 'الروضة',
            street: 'الأمير سلطان',
            buildingNo: '789',
            additionalNo: '101',
            poBox: '54321',
            country: 'السعودية'
        }
    ];
    
    renderCustomersTable(demoCustomers);
    
    // ربط الأحداث
    const addBtn = document.getElementById('add-customer-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showCustomerModal());
    }
    
    const closeBtn = document.getElementById('close-customer-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeCustomerModal());
    }
    
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCustomerModal();
        });
    }
    
    // زر تحديث
    const refreshBtn = document.getElementById('refresh-customers-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            renderCustomersTable(demoCustomers);
            showNotification('تم تحديث القائمة', 'success');
        });
    }
    
    // البحث
    const searchInput = document.getElementById('search-customers');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#customers-table-body tr');
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)')?.innerText.toLowerCase() || '';
                const phone = row.querySelector('td:nth-child(3)')?.innerText.toLowerCase() || '';
                if (name.includes(term) || phone.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // معالجة إرسال النموذج
    const form = document.getElementById('customer-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            
            const customerData = {
                name: document.getElementById('c-name').value,
                phone: document.getElementById('c-phone').value,
                email: document.getElementById('c-email').value,
                city: document.getElementById('c-city').value,
                district: document.getElementById('c-district').value,
                street: document.getElementById('c-street').value,
                buildingNo: document.getElementById('c-building').value,
                additionalNo: document.getElementById('c-additional').value,
                poBox: document.getElementById('c-pobox').value,
                country: document.getElementById('c-country').value
            };
            
            if (id) {
                showNotification('تم تحديث بيانات العميل بنجاح', 'success');
            } else {
                showNotification('تم إضافة العميل بنجاح', 'success');
            }
            
            closeCustomerModal();
            
            // إضافة العميل الجديد إلى القائمة التجريبية
            const newCustomer = { id: Date.now().toString(), ...customerData };
            demoCustomers.push(newCustomer);
            renderCustomersTable(demoCustomers);
        });
    }
    
    // ربط أحداث التعديل والحذف بعد التحميل
    document.querySelectorAll('.edit-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const customer = demoCustomers.find(c => c.id === id);
            if (customer) showCustomerModal('edit', customer);
        });
    });
    
    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟\nلا يمكن التراجع عن هذا الإجراء.')) {
                const id = btn.dataset.id;
                const index = demoCustomers.findIndex(c => c.id === id);
                if (index !== -1) {
                    demoCustomers.splice(index, 1);
                    renderCustomersTable(demoCustomers);
                    showNotification('تم حذف العميل بنجاح', 'success');
                }
            }
        });
    });
}

// ===================== تصدير الدوال =====================
export default {
    showCustomerModal,
    closeCustomerModal,
    renderCustomersTable,
    initCustomers
};
