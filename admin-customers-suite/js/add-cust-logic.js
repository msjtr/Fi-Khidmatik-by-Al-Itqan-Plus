import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري"; // تقييد العمليات باسم أبا صالح

// تهيئة محرر Quill بكامل خصائص Word
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'اكتب ملاحظات العميل بخصائص وورد المتقدمة...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image', 'video', 'blockquote'],
            ['clean'] 
        ]
    }
});
quill.format('direction', 'rtl'); quill.format('align', 'right');

// دالة تحميل سجل العمليات في أسفل الصفحة
async function loadOperationsLog() {
    const tbody = document.getElementById('operations-log-tbody');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);
        tbody.innerHTML = '';
        snap.forEach(docSnap => {
            const data = docSnap.data();
            const date = new Date(data.createdAt);
            tbody.innerHTML += `
                <tr>
                    <td>${date.toLocaleString('ar-SA')}</td>
                    <td><strong>${data.createdBy || 'محمد بن صالح'}</strong></td>
                    <td>${data.name}</td>
                    <td>${data.accountStatus}</td>
                    <td style="color:green">إضافة ناجحة</td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

const addForm = document.getElementById('add-customer-form');
addForm.onsubmit = async (e) => {
    e.preventDefault();
    const phone = document.getElementById('cust-phone').value;
    if (!phone.startsWith('5')) return alert("يجب أن يبدأ الجوال بـ 5");

    const btn = document.getElementById('submit-btn');
    btn.innerText = "جاري الحفظ والتقييد...";
    btn.disabled = true;

    try {
        const customerData = {
            name: document.getElementById('cust-name').value,
            phone: phone,
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
            detailedNotes: quill.root.innerHTML,
            createdAt: new Date().toISOString(),
            createdBy: currentEmployee, // تقييد العملية
            attachments: []
        };

        await addDoc(collection(db, "customers"), customerData);
        alert("تم الحفظ وتقييد العملية في السجل");
        addForm.reset(); quill.setContents([]);
        loadOperationsLog(); // تحديث الجدول فوراً
    } catch (error) { alert("خطأ في القاعدة"); }
    finally { btn.innerText = "حفظ وإضافة العميل"; btn.disabled = false; }
};

document.addEventListener('DOMContentLoaded', loadOperationsLog);
