/**
 * js/modules/customers-ui.js
 * دوال واجهة المستخدم للعملاء
 */

export function showCustomerModal(mode = 'add', customerData = null) {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    const form = document.getElementById('customer-form');
    
    if (mode === 'add') {
        title.innerText = 'إضافة عميل جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && customerData) {
        title.innerText = 'تعديل بيانات العميل';
        document.getElementById('edit-id').value = customerData.id;
        document.getElementById('c-name').value = customerData.name || '';
        document.getElementById('c-phone').value = customerData.phone || '';
        document.getElementById('c-email').value = customerData.email || '';
        document.getElementById('c-city').value = customerData.city || '';
        document.getElementById('c-district').value = customerData.district || '';
    }
    
    modal.style.display = 'block';
}

export function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
}

export function renderCustomersTable(customers) {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px;">لا يوجد عملاء</td></tr>`;
        return;
    }
    
    tbody.innerHTML = customers.map((customer, index) => `
        <tr>
            <td style="padding: 10px;">${index + 1}</td>
            <td style="padding: 10px;">${customer.name}</td>
            <td style="padding: 10px;">${customer.phone}</td>
            <td style="padding: 10px;">${customer.city || '-'}</td>
            <td style="padding: 10px; text-align: center;">
                <button class="edit-customer" data-id="${customer.id}" style="color: #f39c12; background: none; border: none; cursor: pointer; margin-left: 10px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-customer" data-id="${customer.id}" style="color: #e74c3c; background: none; border: none; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===================== الدالة الرئيسية المطلوبة في main.js =====================

/**
 * تهيئة موديول العملاء - الدالة الرئيسية
 */
export async function initCustomers(container) {
    if (!container) return;
    
    // عرض واجهة العملاء
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <h2 style="color: #2c3e50; margin: 0;">
                    <i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء
                </h2>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-user-plus"></i> عميل جديد
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="search-customers" placeholder="بحث عن عميل..." 
                       style="width: 100%; max-width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
            
            <div style="background: white; border-radius: 12px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; min-width: 500px;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 12px; text-align: right;">#</th>
                            <th style="padding: 12px; text-align: right;">الاسم</th>
                            <th style="padding: 12px; text-align: right;">الجوال</th>
                            <th style="padding: 12px; text-align: right;">المدينة</th>
                            <th style="padding: 12px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 30px;">
                                <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- مودال إضافة/تعديل عميل -->
        <div id="customer-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 90%; max-width: 500px; padding: 25px; border-radius: 12px;">
                <h3 id="modal-title" style="margin: 0 0 20px 0;">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="margin-bottom: 15px;">
                        <label>اسم العميل</label>
                        <input type="text" id="c-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>رقم الجوال</label>
                        <input type="tel" id="c-phone" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>البريد الإلكتروني</label>
                        <input type="email" id="c-email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>المدينة</label>
                        <input type="text" id="c-city" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>الحي</label>
                        <input type="text" id="c-district" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 2; background: #27ae60; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">حفظ</button>
                        <button type="button" id="close-customer-modal" style="flex: 1; background: #95a5a6; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // عرض عملاء تجريبيين
    const demoCustomers = [
        { id: '1', name: 'أحمد محمد', phone: '0501234567', city: 'الرياض', email: 'ahmed@example.com' },
        { id: '2', name: 'سارة علي', phone: '0551234567', city: 'جدة', email: 'sara@example.com' },
        { id: '3', name: 'محمد عبدالله', phone: '0581234567', city: 'الدمام', email: 'mohammed@example.com' },
        { id: '4', name: 'نورة خالد', phone: '0591234567', city: 'مكة', email: 'nora@example.com' }
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
    
    // ربط أحداث التعديل والحذف
    document.querySelectorAll('.edit-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const customer = demoCustomers.find(c => c.id === id);
            if (customer) showCustomerModal('edit', customer);
        });
    });
    
    document.querySelectorAll('.delete-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                btn.closest('tr')?.remove();
            }
        });
    });
    
    // البحث
    const searchInput = document.getElementById('search-customers');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#customers-table-body tr');
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)')?.innerText.toLowerCase() || '';
                row.style.display = name.includes(term) ? '' : 'none';
            });
        });
    }
}
