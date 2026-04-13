import * as logic from './orders-logic.js';

let quill; 

document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة محرر الوصف (Word Style)
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['image', 'clean']
                ]
            }
        });
    }

    // إعداد النموذج عند الفتح
    await setupForm();
});

async function setupForm() {
    const meta = logic.generateOrderMeta();
    document.getElementById('orderNo').value = meta.orderId;
    document.getElementById('orderDate').value = meta.date;
    document.getElementById('orderTime').value = meta.time;

    // تعبئة قائمة العملاء من قاعدة البيانات
    const customers = await logic.fetchCollection('customers');
    const select = document.getElementById('customerSelect');
    if(select) {
        select.innerHTML = '<option value="">-- جلب عميل من قاعدة البيانات --</option>';
        customers.forEach(c => {
            select.innerHTML += `<option value='${JSON.stringify(c)}'>${c.name}</option>`;
        });
    }
}

// تعبئة حقول العميل تلقائياً
window.fillCustomerInfo = (jsonStr) => {
    if(!jsonStr) return;
    const c = JSON.parse(jsonStr);
    document.getElementById('cName').value = c.name || '';
    document.getElementById('cPhone').value = c.phone || '';
    document.getElementById('cEmail').value = c.email || '';
    document.getElementById('cCity').value = c.city || '';
    document.getElementById('cStreet').value = c.street || '';
};

// إدارة خيارات الشحن
window.toggleShipping = (mode) => {
    const note = document.getElementById('shippingStatus');
    if(mode === 'delivery') {
        note.innerText = "سيتم الشحن لعنوان العميل";
    } else {
        note.innerText = mode === 'pickup' ? "الاستلام من المقر الرئيسي" : "خدمة إلكترونية";
    }
};

// حفظ الطلب النهائي
window.confirmOrder = async () => {
    const orderData = {
        meta: {
            no: document.getElementById('orderNo').value,
            date: document.getElementById('orderDate').value
        },
        customer: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value
        },
        description: quill.root.innerHTML,
        payment: document.getElementById('paymentMethod').value,
        total: document.getElementById('totalLabel').innerText,
        status: 'قيد التنفيذ'
    };

    await logic.saveOrderToFirebase(orderData);
    alert("تم حفظ الطلب بنجاح!");
    window.print(); // خيار لفتح الطباعة مباشرة
};
