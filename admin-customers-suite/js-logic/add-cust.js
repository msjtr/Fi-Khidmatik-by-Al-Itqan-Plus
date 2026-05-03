import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
// استخدام المسار المباشر بناءً على هيكلة المجلدات التي اعتمدناها
import { db } from '../js/firebase.js'; 

/**
 * تهيئة محرر Quill ليدعم تنسيقات Word[cite: 1]
 */
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'اكتب ملاحظات العميل هنا بخصائص Word...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ]
    }
});

const addForm = document.getElementById('add-customer-form');

/**
 * معالجة إرسال النموذج وحفظ البيانات في Firebase
 */
addForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    
    // 1. التحقق من أن رقم الجوال يبدأ بـ 5
    const phoneInput = document.getElementById('cust-phone').value;
    if (!phoneInput.startsWith('5')) {
        alert("تنبيه أبا صالح: يجب أن يبدأ رقم الجوال بالرقم 5 (مثال: 5xxxxxxxx)");
        return; // إيقاف العملية إذا كان الرقم غير صحيح
    }

    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    try {
        // جمع البيانات من الحقول الـ 16 المطلوبة[cite: 1, 2]
        const customerData = {
            name: document.getElementById('cust-name').value,
            phone: phoneInput,
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
            accountStatus: document.getElementById('cust-accountStatus').value,
            customerCategory: document.getElementById('cust-customerCategory').value,
            detailedNotes: quill.root.innerHTML, // جلب المحتوى المنسق من المحرر[cite: 1]
            createdAt: new Date().toISOString(), // تسجيل تاريخ الإضافة آلياً
            attachments: [] // مصفوفة فارغة للمرفقات المستقبلية[cite: 1]
        };

        // إضافة العميل لقاعدة بيانات fi-khidmatik-admin[cite: 1]
        await addDoc(collection(db, "customers"), customerData);

        alert("تم إضافة العميل بنجاح للقاعدة");

        // 2. تفريغ جميع الحقول بعد النجاح لضمان واجهة فارغة[cite: 2]
        addForm.reset(); 
        quill.setContents([]); // تفريغ محرر النصوص المتقدم

        // التوجيه التلقائي للقائمة لمشاهدة النتيجة (اختياري، يمكنك تعطيله إذا أردت البقاء في الصفحة)[cite: 2]
        window.location.href = "customers-list.html"; 

    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        alert("فشلت عملية الإضافة، يرجى التأكد من استقرار الإنترنت في مكتب حائل");
    } finally {
        btn.innerText = "إضافة العميل للقاعدة";
        btn.disabled = false;
    }
};
