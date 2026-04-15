// js/modules/order-form.js

import { db } from '../core/firebase.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export async function initOrderForm(container) {
    // التعديل: إضافة ./ لضمان المسار الصحيح في GitHub Pages
    try {
        const resp = await fetch('./admin/modules/order-form.html');
        if (!resp.ok) throw new Error("File not found");
        container.innerHTML = await resp.text();
    } catch (err) {
        console.error("Error loading order-form.html:", err);
        container.innerHTML = '<p style="color:red; padding:20px;">خطأ في تحميل واجهة نموذج الطلب.</p>';
        return;
    }
    
    // جلب البيانات الأساسية (العملاء والمنتجات)
    const customersSnap = await getDocs(collection(db, "customers"));
    const productsSnap = await getDocs(collection(db, "products"));
    
    const customerSelect = document.getElementById('customer-select');
    if (customerSelect) {
        customerSelect.innerHTML = '<option value="">اختر عميل</option>' + 
            customersSnap.docs.map(d => `<option value="${d.id}">${d.data().name}</option>`).join('');
    }
    
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
        productSelect.innerHTML = productsSnap.docs.map(d => 
            `<option value="${d.id}" data-price="${d.data().price}">${d.data().name} - ${d.data().price}</option>`
        ).join('');
    }
    
    let items = [];
    
    // وظيفة إضافة منتج للجدول
    window.addProductToTable = () => {
        const prodId = productSelect.value;
        const qtyInput = document.getElementById('product-qty');
        const qty = parseInt(qtyInput.value) || 1;
        
        if (!prodId) return alert('الرجاء اختيار منتج');
        
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        const name = selectedOption.text.split('-')[0].trim();
        
        // منع تكرار نفس المنتج، بدلاً من ذلك نزيد الكمية
        const existingItem = items.find(i => i.productId === prodId);
        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            items.push({ productId: prodId, name, quantity: qty, price });
        }
        
        renderItemsTable();
        qtyInput.value = 1; // إعادة تعيين الكمية
    };
    
    function renderItemsTable() {
        const tbody = document.querySelector('#order-items-table tbody');
        if (!tbody) return;

        tbody.innerHTML = items.map((item, idx) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${(item.quantity * item.price).toFixed(2)}</td>
                <td><button class="btn-small danger" onclick="removeItem(${idx})"><i class="fas fa-trash"></i></button></td>
            </tr>
        `).join('');

        const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
        const taxRate = 15; // الضريبة في السعودية 15%
        const tax = subtotal * taxRate / 100;
        
        document.getElementById('subtotal').innerText = subtotal.toFixed(2);
        document.getElementById('tax-amount').innerText = tax.toFixed(2);
        document.getElementById('total').innerText = (subtotal + tax).toFixed(2);
    }
    
    window.removeItem = (idx) => { 
        items.splice(idx, 1); 
        renderItemsTable(); 
    };
    
    // ربط الأزرار بالأحداث
    document.getElementById('add-product-btn').onclick = () => window.addProductToTable();
    
    document.getElementById('save-order-btn').onclick = async () => {
        const customerId = customerSelect.value;
        const customerName = customerSelect.options[customerSelect.selectedIndex]?.text || '';
        
        if (!customerId || items.length === 0) {
            return alert('الرجاء اختيار عميل وإضافة منتج واحد على الأقل');
        }

        const total = parseFloat(document.getElementById('total').innerText);
        
        try {
            await addDoc(collection(db, "orders"), {
                orderNumber: 'ORD-' + Date.now().toString().slice(-6), // رقم طلب مختصر
                customerId, 
                customerName,
                items: items,
                total: total,
                status: 'pending',
                createdAt: new Date(),
                paidAmount: 0
            });
            
            alert('تم حفظ الطلب بنجاح في نظام تيرا');
            items = [];
            renderItemsTable();
            customerSelect.value = '';
        } catch (err) {
            console.error("Save Order Error:", err);
            alert('حدث خطأ أثناء حفظ الطلب');
        }
    };
}
