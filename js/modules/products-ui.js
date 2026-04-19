/**
 * js/modules/products-ui.js
 * دوال واجهة المستخدم للمنتجات
 */

export function showProductModal(mode = 'add', productData = null) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    
    if (mode === 'add') {
        title.innerText = 'إضافة منتج جديد';
        document.getElementById('product-form').reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && productData) {
        title.innerText = 'تعديل المنتج';
        document.getElementById('edit-id').value = productData.id;
        document.getElementById('p-name').value = productData.name || '';
        document.getElementById('p-cost').value = productData.cost || 0;
        document.getElementById('p-price').value = productData.price || 0;
        document.getElementById('p-stock').value = productData.stock || 0;
    }
    
    modal.style.display = 'flex';
}

export function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
}

export function renderProductsGrid(products) {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;
    
    if (!products || products.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">لا توجد منتجات</div>`;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h4>${product.name}</h4>
            <div>السعر: ${product.price} ر.س</div>
            <div>المخزون: ${product.stock}</div>
            <button class="edit-product" data-id="${product.id}" style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                تعديل
            </button>
            <button class="delete-product" data-id="${product.id}" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                حذف
            </button>
        </div>
    `).join('');
}
