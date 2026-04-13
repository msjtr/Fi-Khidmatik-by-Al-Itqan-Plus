import * as logic from './orders-logic.js';

let quill; // محرر النصوص

// تشغيل المحرر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline'], ['image', 'code-block'], [{ 'list': 'ordered'}, { 'list': 'bullet' }]] }
        });
    }
});

// فتح نافذة طلب جديد وتجهيز البيانات
window.initNewOrder = async () => {
    const meta = logic.generateOrderMetadata();
    document.getElementById('orderNo').value = meta.orderId;
    document.getElementById('orderDate').value = meta.date;
    document.getElementById('orderTime').value = meta.time;
    
    // جلب العملاء لتعبئة القائمة
    const customers = await logic.fetchData('customers');
    const select = document.getElementById('customerSelect');
    select.innerHTML = '<option value="">-- اختر عميل سابق --</option>';
    customers.forEach(c => {
        select.innerHTML += `<option value='${JSON.stringify(c)}'>${c.name}</option>`;
    });
};

// تعبئة بيانات العميل عند الاختيار
window.autoFillCustomer = (data) => {
    if(!data) return;
    const c = JSON.parse(data);
    document.getElementById('cName').value = c.name;
    document.getElementById('cPhone').value = c.phone || '';
    document.getElementById('cEmail').value = c.email || '';
    document.getElementById('cCity').value = c.city || '';
    // إضافة باقي الحقول...
};

// منطق الشحن والاستلام
window.handleShipping = (val) => {
    const addressFields = document.getElementById('addressSection');
    if(val === 'delivery') {
        addressFields.classList.remove('opacity-50');
    } else {
        addressFields.classList.add('opacity-50');
        if(val === 'pickup') {
            document.getElementById('shippingNote').innerText = "الموقع: فرع الشركة الرئيسي";
        }
    }
};
