// js/modules/customers-ui.js

/**
 * تهيئة واجهة المستخدم لموديول العملاء
 * @param {HTMLElement} container - الحاوية التي سيتم عرض الجدول داخلها
 */
export async function initCustomersUI(container) {
    console.log("تمت تهيئة واجهة العملاء بنجاح");
    renderCustomersTable(container);
}

/**
 * دالة فتح النافذة المنبثقة (إضافة أو تعديل)
 * @param {string} mode - نمط النافذة ('add' أو 'edit')
 * @param {string|null} id - معرف العميل في حال التعديل
 */
export function openCustomerModal(mode = 'add', id = null) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    const title = document.getElementById('modal-title');

    if (!modal) {
        console.error("خطأ: لم يتم العثور على عنصر customer-modal");
        return;
    }

    // إعادة ضبط النموذج عند الفتح
    if (form) form.reset();

    if (mode === 'edit' && id) {
        if (title) title.innerHTML = '<i class="fas fa-edit"></i> تعديل بيانات العميل';
        console.log(`جاري جلب بيانات العميل للتعديل: ${id}`);
        fetchAndFillCustomerData(id);
    } else {
        if (title) title.innerHTML = '<i class="fas fa-user-plus"></i> إضافة بيانات العميل الكاملة';
    }

    modal.style.display = 'flex';
}

/**
 * دالة إغلاق النافذة المنبثقة
 */
export function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * معالجة إرسال النموذج (حفظ أو تحديث)
 */
export async function handleCustomerSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        national_id: document.getElementById('cust-id').value,
        email: document.getElementById('cust-email').value,
        dob: document.getElementById('cust-dob').value,
        gender: document.getElementById('cust-gender').value,
        classification: document.getElementById('cust-classification').value, // حقل التصنيف الجديد
        city: document.getElementById('cust-city').value,
        district: document.getElementById('cust-district').value,
        street: document.getElementById('cust-street').value,
        building_no: document.getElementById('cust-building').value,
        additional_no: document.getElementById('cust-additional').value,    // حقل الرقم الإضافي الجديد
        zip_code: document.getElementById('cust-zip').value,                // حقل الرمز البريدي الجديد
        po_box: document.getElementById('cust-pobox').value,                // حقل صندوق البريد الجديد
        employer: document.getElementById('cust-employer').value,
        salary: document.getElementById('cust-salary').value,
        status: document.getElementById('cust-status').value,
        updatedAt: new Date()
    };

    console.log("البيانات الجاهزة للحفظ:", formData);
    // هنا يتم استدعاء دالة الحفظ في Firestore من ملف firebase.js
    // example: await saveToFirestore('customers', formData);
    
    closeCustomerModal();
}

/**
 * دالة افتراضية لعرض الجدول (يمكنك ربطها ببيانات Firebase الحقيقية)
 */
function renderCustomersTable(container) {
    container.innerHTML = `
        <div class="table-container">
            <table id="customers-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>رقم الجوال</th>
                        <th>المدينة</th>
                        <th>التصنيف</th>
                        <th>رقم المبنى</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-body">
                    </tbody>
            </table>
        </div>
    `;
}

/**
 * دالة محاكاة لجلب بيانات عميل وتعبئتها في النموذج عند التعديل
 */
async function fetchAndFillCustomerData(id) {
    // محاكاة جلب بيانات
    // const data = await getCustomerFromDB(id);
    // document.getElementById('cust-name').value = data.name;
    // ... إلخ
}

// ربط حدث الإرسال بالنموذج عند تحميل الموديول
document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'customer-form') {
        handleCustomerSubmit(e);
    }
});
