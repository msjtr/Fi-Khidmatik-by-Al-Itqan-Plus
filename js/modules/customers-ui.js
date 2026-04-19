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
    const tbody = document.getElementById('customers-list');
    if (!tbody) return;
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px;">لا يوجد عملاء</td></tr>`;
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.city || '-'}</td>
            <td>${new Date(customer.createdAt?.toDate()).toLocaleDateString('ar-SA')}</td>
            <td>
                <button class="edit-customer" data-id="${customer.id}" style="color: #f39c12; background: none; border: none; cursor: pointer;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-customer" data-id="${customer.id}" style="color: #e74c3c; background: none; border: none; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
