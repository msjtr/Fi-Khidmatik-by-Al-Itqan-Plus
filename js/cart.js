// js/cart.js
let cart = [];

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch(e) { cart = []; }
    }
    renderCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart() {
    const code = document.getElementById('product_code').value.trim();
    const name = document.getElementById('product_name').value.trim();
    const desc = document.getElementById('product_desc').value.trim();
    const price = parseFloat(document.getElementById('product_price').value);
    let qty = parseInt(document.getElementById('product_qty').value);
    let discount = parseFloat(document.getElementById('product_discount').value) || 0;

    if (!code || !name || isNaN(price) || price <= 0) {
        alert('❌ يرجى إدخال كود المنتج واسم المنتج وسعر صحيح');
        return;
    }
    if (isNaN(qty) || qty < 1) qty = 1;
    if (isNaN(discount) || discount < 0) discount = 0;

    const existingIndex = cart.findIndex(item => item.code === code);
    if (existingIndex !== -1) {
        cart[existingIndex].qty += qty;
        alert(`✅ تم تحديث كمية ${name}`);
    } else {
        cart.push({ code, name, desc, price, qty, discount });
        alert(`✅ تم إضافة ${name} إلى السلة`);
    }
    saveCart();
    renderCart();
    clearProductForm();
}

function renderCart() {
    const cartDiv = document.getElementById('cart');
    if (!cartDiv) return;

    if (cart.length === 0) {
        cartDiv.innerHTML = '<div class="empty-cart">🛒 السلة فارغة</div>';
        return;
    }

    let html = '';
    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const itemTotal = (item.price * item.qty) - item.discount;
        total += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${escapeHtml(item.name)}</strong><br>
                    <small>كود: ${escapeHtml(item.code)}</small>
                    ${item.desc ? `<br><small>${escapeHtml(item.desc)}</small>` : ''}
                </div>
                <div>${item.price.toFixed(2)} ريال</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQty(${i}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
                </div>
                <div>- ${item.discount.toFixed(2)} ريال</div>
                <div class="cart-item-price">${itemTotal.toFixed(2)} ريال</div>
                <button class="remove-btn" onclick="removeItem(${i})">🗑️ حذف</button>
            </div>
        `;
    }
    html += `<div class="cart-total">💰 المجموع الكلي: ${total.toFixed(2)} ريال</div>`;
    cartDiv.innerHTML = html;
}

function updateQty(index, delta) {
    if (!cart[index]) return;
    const newQty = cart[index].qty + delta;
    if (newQty <= 0) {
        removeItem(index);
    } else {
        cart[index].qty = newQty;
        saveCart();
        renderCart();
    }
}

function removeItem(index) {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}

function clearProductForm() {
    document.getElementById('product_code').value = '';
    document.getElementById('product_name').value = '';
    document.getElementById('product_desc').value = '';
    document.getElementById('product_price').value = '';
    document.getElementById('product_qty').value = '1';
    document.getElementById('product_discount').value = '0';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    // تعيين التاريخ والوقت الحاليين
    const dateInput = document.getElementById('order_date');
    const timeInput = document.getElementById('order_time');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0,10);
    }
    if (timeInput && !timeInput.value) {
        timeInput.value = new Date().toLocaleTimeString('ar-SA').slice(0,5);
    }
});
