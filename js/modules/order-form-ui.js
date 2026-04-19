/**
 * js/modules/order-form-ui.js
 * دوال واجهة المستخدم لنموذج الطلب
 * @version 1.1.0
 */

// ===================== دوال مساعدة =====================

/**
 * حساب الإجماليات وتحديث الواجهة
 */
function calculateItemTotals() {
    let subtotal = 0;
    
    document.querySelectorAll('#items-body tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const rowTotal = qty * price;
        
        const totalCell = row.querySelector('.item-total');
        if (totalCell) totalCell.textContent = rowTotal.toFixed(2);
        
        subtotal += rowTotal;
    });
    
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    
    const subtotalEl = document.getElementById('val-subtotal');
    const taxEl = document.getElementById('val-tax');
    const totalEl = document.getElementById('val-total');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);
    
    return { subtotal, tax, total };
}

/**
 * ربط الأحداث بصف المنتج
 */
function attachItemEvents(row) {
    const qtyInput = row.querySelector('.item-qty');
    const priceInput = row.querySelector('.item-price');
    const removeBtn = row.querySelector('.remove-item');
    
    if (qtyInput) {
        qtyInput.addEventListener('input', () => calculateItemTotals());
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', () => calculateItemTotals());
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('#items-body tr').length > 1) {
                row.remove();
                calculateItemTotals();
            } else {
                showNotification('لا يمكن حذف جميع البنود', 'error');
            }
        });
    }
}

/**
 * إضافة صف منتج جديد
 */
export function addItemRow(item = null) {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    
    const defaultItem = item || { name: '', quantity: 1, price: 0 };
    const rowTotal = (defaultItem.quantity * defaultItem.price).toFixed(2);
    
    const row = document.createElement('tr');
    row.style.borderBottom = "1px solid #f1f5f9";
    row.innerHTML = `
        <td style="padding: 8px;">
            <input type="text" class="item-name" value="${escapeHtml(defaultItem.name)}" 
                   placeholder="اسم المنتج" 
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
        </td>
        <td style="padding: 8px; width: 100px;">
            <input type="number" class="item-qty" value="${defaultItem.quantity}" min="0.01" step="0.01"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: center;">
        </td>
        <td style="padding: 8px; width: 120px;">
            <input type="number" class="item-price" value="${defaultItem.price}" min="0" step="0.01"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; text-align: center;">
        </td>
        <td class="item-total" style="padding: 8px; text-align: center; font-weight: bold; color: #27ae60;">
            ${rowTotal}
        </td>
        <td style="padding: 8px; text-align: center; width: 50px;">
            <button type="button" class="remove-item" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1.2rem;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    attachItemEvents(row);
    calculateItemTotals();
}

/**
 * إضافة صف فارغ (للوضع الافتراضي)
 */
export function addEmptyItemRow() {
    addItemRow({ name: '', quantity: 1, price: 0 });
}

/**
 * جمع بيانات المنتجات من النموذج
 */
export function collectOrderItems() {
    const items = [];
    document.querySelectorAll('#items-body tr').forEach(row => {
        const name = row.querySelector('.item-name')?.value?.trim();
        if (name) {
            items.push({
                name: name,
                quantity: parseFloat(row.querySelector('.item-qty')?.value) || 0,
                price: parseFloat(row.querySelector('.item-price')?.value) || 0
            });
        }
    });
    return items;
}

/**
 * تنظيف نموذج الطلب
 */
export function resetOrderForm() {
    const form = document.getElementById('order-form');
    if (form) form.reset();
    
    document.getElementById('edit-id').value = '';
    
    const itemsBody = document.getElementById('items-body');
    if (itemsBody) itemsBody.innerHTML = '';
    
    addEmptyItemRow();
}

/**
 * فتح مودال الطلب
 */
export function showOrderModal(mode = 'add', orderData = null) {
    const modal = document.getElementById('order-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    const form = document.getElementById('order-form');
    
    if (!form) return;
    
    if (mode === 'add') {
        title.innerText = '📝 فاتورة مبيعات جديدة';
        resetOrderForm();
    } else if (mode === 'edit' && orderData) {
        title.innerText = `✏️ تعديل الفاتورة: ${orderData.orderNumber || ''}`;
        
        document.getElementById('edit-id').value = orderData.id || '';
        document.getElementById('c-name').value = orderData.customerName || '';
        document.getElementById('c-phone').value = orderData.phone || '';
        
        const itemsBody = document.getElementById('items-body');
        if (itemsBody) itemsBody.innerHTML = '';
        
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => addItemRow(item));
        } else {
            addEmptyItemRow();
        }
    }
    
    modal.style.display = 'block';
}

/**
 * إغلاق مودال الطلب
 */
export function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) modal.style.display = 'none';
    resetOrderForm();
}

/**
 * عرض إشعار منبثق (دالة مساعدة)
 */
function showNotification(message, type = 'error') {
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

// ===================== تصدير الدوال =====================
export default {
    showOrderModal,
    closeOrderModal,
    addItemRow,
    addEmptyItemRow,
    collectOrderItems,
    resetOrderForm,
    calculateItemTotals
};
