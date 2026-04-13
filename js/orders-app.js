// --- 5. وظائف إدارة الطلبات (تعديل وحذف) ---

// دالة جلب العملاء للقائمة المنسدلة
async function loadCustomerDropdown() {
    const customerSelect = document.getElementById('customerSelect');
    if (!customerSelect) return;
    
    try {
        // افترضنا وجود مجموعة باسم customers في Firebase
        const snapshot = await getDocs(collection(db, "customers"));
        customerSelect.innerHTML = '<option value="">-- اختر العميل --</option>';
        snapshot.forEach(doc => {
            const data = doc.data();
            customerSelect.innerHTML += `<option value="${doc.id}">${data.name || 'عميل غير مسمى'}</option>`;
        });
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
    }
}

// تعديل طلب موجود
window.editOrder = async (id) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    currentOrderId = id;
    document.getElementById('modalTitle').innerText = "تعديل سجل الطلب #" + order.orderNumber;
    
    // تعبئة البيانات الأساسية
    document.getElementById('orderNumber').value = order.orderNumber;
    document.getElementById('orderDate').value = order.date;
    document.getElementById('orderStatus').value = order.status;
    document.getElementById('customerSelect').value = order.customerId;
    document.getElementById('discountValue').value = order.discount || 0;
    
    // تحديث وسيلة الدفع في الواجهة (CSS)
    selectedPaymentMethod = order.paymentMethod || 'mada';
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.payment === selectedPaymentMethod);
    });

    // هام: مزامنة المنتجات مع ملف المنطق (Logic)
    import('./orders-logic.js').then(logic => {
        logic.setCurrentItems([...order.products]);
        logic.renderProductList('productsContainer', window.updateTotalDisplay);
    });
    
    openModal('orderModal');
};

// حذف طلب من القاعدة
window.deleteOrder = async (id) => {
    // استخدام تأكيد بتصميم بسيط
    if (confirm('تنبيه: هل تريد حقاً حذف هذا السجل نهائياً؟')) {
        try {
            await deleteDoc(doc(db, "orders", id));
            showToast("تم مسح السجل بنجاح", "success");
            await loadOrders(); // إعادة تحميل القائمة
        } catch (error) {
            console.error(error);
            showToast("فشل الحذف، تحقق من الاتصال", "error");
        }
    }
};

// --- 6. أدوات مساعدة (Helpers) ---

// تحديث بيانات المنتج من داخل الجدول
window.updateProduct = (index, field, value) => {
    import('./orders-logic.js').then(logic => {
        const items = logic.getCurrentItems();
        if (items[index]) {
            items[index][field] = field === 'name' ? value : parseFloat(value);
            logic.renderProductList('productsContainer', window.updateTotalDisplay);
        }
    });
};

// حذف سطر منتج واحد
window.removeProductRow = (index) => {
    import('./orders-logic.js').then(logic => {
        const items = logic.getCurrentItems();
        items.splice(index, 1);
        logic.renderProductList('productsContainer', window.updateTotalDisplay);
    });
};
