import * as Core from '../core/customers-core.js';

let editingId = null;
let quill = null; // المحرر الاحترافي

export async function initCustomersUI(container) {
    // ... بناء الهيكل (كما في الملف السابق) ...
    initQuillEditor();
    setupBridge();
}

// دالة التعديل (جلب البيانات الـ 17 حقل)
window.editCustomer = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // ملء الحقول الـ 17 بدقة
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-phone').value = d.phone || '';
    document.getElementById('cust-countryCode').value = d.countryCode || '+966';
    document.getElementById('cust-email').value = d.email || '';
    document.getElementById('cust-country').value = d.country || '';
    document.getElementById('cust-city').value = d.city || '';
    document.getElementById('cust-district').value = d.district || '';
    document.getElementById('cust-street').value = d.street || '';
    document.getElementById('cust-buildingNo').value = d.buildingNo || '';
    document.getElementById('cust-additionalNo').value = d.additionalNo || '';
    document.getElementById('cust-postalCode').value = d.postalCode || '';
    document.getElementById('cust-poBox').value = d.poBox || '';
    document.getElementById('cust-tag').value = d.tag || 'regular';
    
    // جلب الصورة (الحقل 17)
    const imgPrev = document.getElementById('cust-image-preview');
    if(imgPrev) imgPrev.src = d.image || 'assets/default-avatar.png';

    // جلب الملاحظات للمحرر (Rich Text)
    if (quill) quill.root.innerHTML = d.notes || '';

    showModal("✏ تعديل بيانات العميل الكاملة");
};

// دالة الحفظ النهائي
window.saveCustomer = async () => {
    const data = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        countryCode: document.getElementById('cust-countryCode').value,
        email: document.getElementById('cust-email').value,
        country: document.getElementById('cust-country').value,
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        buildingNo: document.getElementById('cust-buildingNo').value,
        additionalNo: document.getElementById('cust-additionalNo').value,
        postalCode: document.getElementById('cust-postalCode').value,
        poBox: document.getElementById('cust-poBox').value,
        tag: document.getElementById('cust-tag').value,
        notes: quill.root.innerHTML, // الملاحظات من المحرر
        image: document.getElementById('cust-image-url').value // رابط الصورة أو Base64
    };

    try {
        if (editingId) await Core.updateCustomer(editingId, data);
        else await Core.addCustomer(data);
        
        closeModal();
        renderCustomerTable();
    } catch (e) { alert("خطأ في الحفظ: " + e.message); }
};
