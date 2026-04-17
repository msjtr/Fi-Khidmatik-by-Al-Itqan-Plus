// js/modules/order-form.js

import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * موديول إنشاء الطلبات الجديد - تيرا جيتواي
 * يدعم: إضافة المنتجات، حساب الضريبة، وربط العملاء
 */

export async function initOrderForm(container) {
    try {
        // تحميل الواجهة من المسار النسبي الصحيح
        const resp = await fetch('./admin/modules/order-form.html');
        if (!resp.ok) throw new Error("تعذر تحميل ملف HTML الخاص بالنموذج");
        container.innerHTML = await resp.text();
        
        // تعيين تاريخ اليوم تلقائياً
        const dateInput = document.getElementById('order-date');
        if (dateInput) dateInput.valueAsDate = new Date();
        
        // توليد رقم طلب أولي
        const orderNumInput = document.getElementById('order-number');
        if (orderNumInput) orderNumInput.value = 'TR-' + Math.floor(100000 + Math.random() * 900000);

        await setupOrderLogic();
    } catch (err) {
        console.error("Order Form Load Error:", err);
        container.innerHTML = `<div style="color:red; padding:20px; text-align:center;">
            <i class="fas fa-exclamation-triangle"></i> حدث خطأ في تحميل واجهة الطلبات. تأكد من وجود الملف في المسار الصحيح.
        </div>`;
    }
}

async function setupOrderLogic() {
    const customerSelect = document.getElementById('customer-select');
    const productSelect = document.getElementById('product-select');
    const itemsTableBody = document.querySelector('#order-items-table tbody');
    let orderItems = [];

    // 1. جلب العملاء والمنتجات بالتوازي لتحسين السرعة
    const [custSnap, prodSnap] = await Promise.all([
        getDocs(query(collection(db, "customers"), orderBy("name"))),
        getDocs(query(collection(db, "products"), orderBy("name")))
    ]);

    // تعبئة قائمة العملاء
    customerSelect.innerHTML = '<option value="">-- اختر العميل --</option>';
    custSnap.forEach(doc => {
        const c = doc.data();
        customerSelect.innerHTML += `<option value="${doc.id}">${c.name} (${c.phone})</option>`;
    });

    // تعبئة قائمة المنتجات مع تخزين السعر في data-price
    productSelect.innerHTML = '<option value="">-- اختر المنتج لإضافته --</option>';
    prodSnap.forEach(doc => {
        const p = doc.data();
        productSelect.innerHTML += `<option value="${doc.id}" data-price="${p.price}" data-name="${p.name}">${p.name} - ${p.price} ريال</option>`;
    });

    // 2. وظيفة إضافة منتج للجدول
    window.addProductToTable = () => {
        const selectedOpt = productSelect.options[productSelect.selectedIndex];
        const qty = parseInt(document.getElementById('product-qty').value) || 1;

        if (!selectedOpt.value) return alert("الرجاء اختيار منتج أولاً");

        const productId = selectedOpt.value;
        const name = selectedOpt.dataset.name;
        const price = parseFloat(selectedOpt.dataset.price);

        // إذا المنتج موجود مسبقاً، نزيد الكمية فقط
        const existing = orderItems.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += qty;
        } else {
            orderItems.push({ productId, name, price, quantity: qty });
        }

        renderTable();
        document.getElementById('product-qty').value = 1; // تصغير الكمية للوضع الافتراضي
    };

    // 3. تحديث عرض الجدول والحسابات
    function renderTable() {
        if (!itemsTableBody) return;
        
        itemsTableBody.innerHTML = orderItems.map((item, index) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding:10px;">${item.name}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:center;">${item.price.toFixed(2)}</td>
                <td style="text-align:center; font-weight:bold;">${(item.quantity * item.price).toFixed(2)}</td>
                <td style="text-align:center;">
                    <button onclick="window.removeOrderItem(${index})" style="color:red; border:none; background:none; cursor:pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        calculateTotals();
    }

    function calculateTotals() {
        const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const taxRate = 0.15; // 15% ضريبة القيمة المضافة
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        document.getElementById('subtotal').innerText = subtotal.toFixed(2);
        document.getElementById('tax-amount').innerText = taxAmount.toFixed(2);
        document.getElementById('total').innerText = total.toFixed(2);
    }

    // 4. حذف منتج من القائمة
    window.removeOrderItem = (index) => {
        orderItems.splice(index, 1);
        renderTable();
    };

    // 5. حفظ الطلب النهائي في Firebase
    document.getElementById('save-order-btn').onclick = async () => {
        const customerId = customerSelect.value;
        if (!customerId) return alert("الرجاء اختيار عميل");
        if (orderItems.length === 0) return alert("قائمة الطلب فارغة! أضف منتجات أولاً");

        const btn = document.getElementById('save-order-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        try {
            const orderData = {
                orderNumber: document.getElementById('order-number').value,
                orderDate: document.getElementById('order-date').value,
                customerId: customerId,
                customerName: customerSelect.options[customerSelect.selectedIndex].text,
                items: orderItems,
                subtotal: parseFloat(document.getElementById('subtotal').innerText),
                tax: parseFloat(document.getElementById('tax-amount').innerText),
                total: parseFloat(document.getElementById('total').innerText),
                status: 'pending', // حالة أولية
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "orders"), orderData);
            
            alert("✅ تم حفظ الطلب بنجاح في قاعدة بيانات تيرا");
            location.reload(); // إعادة تحميل لتصفير النموذج
        } catch (err) {
            console.error("Error saving order:", err);
            alert("❌ حدث خطأ أثناء الحفظ، حاول مرة أخرى");
            btn.disabled = false;
            btn.innerText = "حفظ الطلب";
        }
    };

    // ربط زر الإضافة السريع
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) addBtn.onclick = window.addProductToTable;
}
