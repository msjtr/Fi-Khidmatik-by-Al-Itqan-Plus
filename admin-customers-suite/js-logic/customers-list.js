// استيراد دوال فايربيس (تأكد من تعديل مسار الاستيراد بناءً على ملف إعداداتك)
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// افتراض أن لديك ملف تهيئة firebase-config.js جاهز يصدّر الـ app
// import { app } from './firebase-config.js'; 

const db = getFirestore(); // مرر app هنا إذا لزم الأمر
const customersRef = collection(db, "customers");

// متغير عالمي لحفظ بيانات العملاء لتسهيل التعديل
let customersDataList = [];

// 1. جلب وعرض البيانات
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        customersDataList = [];
        tbody.innerHTML = ''; // مسح رسالة التحميل

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id; // حفظ معرف الوثيقة للحذف والتعديل
            customersDataList.push(data);

            // تجهيز الصورة الرمزية (الحرف الأول أو صورة)
            const firstLetter = data.name ? data.name.charAt(0).toUpperCase() : '?';
            const avatarHtml = data.avatarUrl 
                ? `<img src="${data.avatarUrl}" alt="${data.name}">` 
                : firstLetter;

            // تجهيز رابط الخريطة (بحث جوجل مابس باستخدام العنوان)
            const fullAddress = `${data.country} ${data.city} ${data.district} ${data.street} ${data.buildingNo}`;
            const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

            // تنسيق التاريخ
            const dateAdded = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : 'غير متوفر';

            // حالة افتراضية إذا لم تكن موجودة بالقاعدة
            const status = data.status || "نشط";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td class="sticky-col">
                    <div class="avatar-cell">
                        <div class="avatar-circle">${avatarHtml}</div>
                        <strong>${data.name}</strong>
                    </div>
                </td>
                <td dir="ltr">${data.phone}</td>
                <td dir="ltr">${data.countryCode}</td>
                <td>${data.email || '-'}</td>
                <td>${data.country}</td>
                <td>${data.city}</td>
                <td>${data.district}</td>
                <td>${data.street}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td>
                    <a href="${mapSearchUrl}" target="_blank" class="map-link">
                        📍 تحقق من الموقع
                    </a>
                </td>
                <td>${dateAdded}</td>
                <td>${status}</td>
                <td><span class="tag-badge">${data.tag || 'عام'}</span></td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" title="تعديل" onclick="openEditModal('${data.id}')">✏️</button>
                    <button class="action-btn print" title="طباعة" onclick="printCustomer('${data.id}')">🖨️</button>
                    <button class="action-btn delete" title="حذف" onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('customers-count').innerText = customersDataList.length;

        if (customersDataList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="18" style="text-align:center;">لا يوجد عملاء في النظام</td></tr>`;
        }

    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
        tbody.innerHTML = `<tr><td colspan="18" style="color:red; text-align:center;">خطأ في الاتصال بقاعدة البيانات</td></tr>`;
    }
}

// 2. نظام التعديل (فتح النافذة وجلب البيانات القديمة)
window.openEditModal = (id) => {
    const customer = customersDataList.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = customer.name || '';
    document.getElementById('edit-phone').value = customer.phone || '';
    document.getElementById('edit-countryCode').value = customer.countryCode || '';
    document.getElementById('edit-email').value = customer.email || '';
    document.getElementById('edit-country').value = customer.country || '';
    document.getElementById('edit-city').value = customer.city || '';
    document.getElementById('edit-district').value = customer.district || '';
    document.getElementById('edit-street').value = customer.street || '';
    document.getElementById('edit-buildingNo').value = customer.buildingNo || '';
    document.getElementById('edit-additionalNo').value = customer.additionalNo || '';
    document.getElementById('edit-postalCode').value = customer.postalCode || '';
    document.getElementById('edit-poBox').value = customer.poBox || '';
    document.getElementById('edit-tag').value = customer.tag || '';
    document.getElementById('edit-status').value = customer.status || 'نشط';

    // تحديث صورة العرض في المودال
    const preview = document.getElementById('edit-avatar-preview');
    preview.innerHTML = customer.avatarUrl ? `<img src="${customer.avatarUrl}">` : (customer.name ? customer.name.charAt(0) : 'م');

    document.getElementById('edit-customer-modal').classList.add('active');
};

window.closeEditModal = () => {
    document.getElementById('edit-customer-modal').classList.remove('active');
};

// 3. حفظ التعديلات الجديدة في القاعدة
document.getElementById('edit-customer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    const saveBtn = document.querySelector('.save-btn');
    saveBtn.innerText = 'جارِ الحفظ...';
    saveBtn.disabled = true;

    try {
        const docRef = doc(db, "customers", id);
        // البيانات الجديدة
        await updateDoc(docRef, {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            countryCode: document.getElementById('edit-countryCode').value,
            email: document.getElementById('edit-email').value,
            country: document.getElementById('edit-country').value,
            city: document.getElementById('edit-city').value,
            district: document.getElementById('edit-district').value,
            street: document.getElementById('edit-street').value,
            buildingNo: document.getElementById('edit-buildingNo').value,
            additionalNo: document.getElementById('edit-additionalNo').value,
            postalCode: document.getElementById('edit-postalCode').value,
            poBox: document.getElementById('edit-poBox').value,
            tag: document.getElementById('edit-tag').value,
            status: document.getElementById('edit-status').value,
            updatedAt: new Date().toISOString()
        });
        
        /* 
         ملاحظة: إذا تم رفع صورة جديدة عبر id="edit-avatar-file"، 
         يجب رفعها أولاً لـ Firebase Storage ثم جلب الرابط وتحديث avatarUrl 
         (هذا يتطلب إعداد Storage)
        */

        alert('تم تحديث البيانات بنجاح!');
        closeEditModal();
        loadCustomers(); // إعادة تحميل الجدول لإظهار التعديلات
    } catch (error) {
        console.error("خطأ أثناء التعديل:", error);
        alert('حدث خطأ أثناء الحفظ');
    } finally {
        saveBtn.innerText = 'حفظ التعديلات';
        saveBtn.disabled = false;
    }
});

// 4. نظام الحذف
window.deleteCustomer = async (id) => {
    if(confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert('تم الحذف بنجاح');
            loadCustomers();
        } catch (error) {
            console.error("خطأ أثناء الحذف:", error);
        }
    }
};

// 5. نظام الطباعة البسيط
window.printCustomer = (id) => {
    // يمكنك لاحقاً تصميم فاتورة/بطاقة مخصصة للطباعة
    window.print(); 
};

// تشغيل جلب البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadCustomers);
