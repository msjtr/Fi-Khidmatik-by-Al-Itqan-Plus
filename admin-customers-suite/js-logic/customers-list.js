import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const customersRef = collection(db, "customers");
let customersDataList = [];
let quill;

// 1. تهيئة محرر Quill المتقدم
function initQuill() {
    if (!quill) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
}

// 2. تحميل الجدول بكافة الأعمدة الـ 18 المطلوبة
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        tbody.innerHTML = '';
        customersDataList = [];
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;
            customersDataList.push(data);

            const row = document.createElement('tr');
            // عرض كافة الأعمدة بالترتيب الذي طلبته
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td> <!-- التسلسل -->
                <td class="sticky-col"><strong>${data.name || '-'}</strong></td> <!-- اسم العميل -->
                <td>${data.phone || '-'}</td> <!-- الجوال -->
                <td>${data.countryCode || '+966'}</td> <!-- مفتاح الدولة -->
                <td>${data.email || '-'}</td> <!-- البريد الإلكتروني -->
                <td>${data.country || '-'}</td> <!-- الدولة -->
                <td>${data.city || '-'}</td> <!-- المدينة -->
                <td>${data.district || '-'}</td> <!-- الحي -->
                <td>${data.street || '-'}</td> <!-- الشارع -->
                <td>${data.buildingNo || '-'}</td> <!-- المبنى -->
                <td>${data.additionalNo || '-'}</td> <!-- الإضافي -->
                <td>${data.postalCode || '-'}</td> <!-- الرمز البريدي -->
                <td>${data.poBox || '-'}</td> <!-- صندوق البريد -->
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td> <!-- تاريخ الإضافة -->
                <td><span class="badge ${getStatusClass(data.accountStatus)}">${data.accountStatus || 'جديد'}</span></td> <!-- الحالة -->
                <td>${data.customerCategory || 'عادي'}</td> <!-- التصنيف -->
                <td>${data.quickNote || '-'}</td> <!-- الملاحظات/سلوك العميل -->
                <td class="sticky-col-right"> <!-- الإجراءات -->
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')" title="تعديل">✏️</button>
                    <button class="action-btn attach" onclick="viewOnlyAttachments('${data.id}')" title="عرض المرفقات">📎</button>
                    <button class="action-btn print" onclick="window.print()" title="طباعة">🖨️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')" title="حذف">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error(e); }
}

// 3. تحديد لون الحالة
function getStatusClass(status) {
    if(status === 'نشط') return 'status-active';
    if(status === 'موقوف') return 'status-paused';
    if(status === 'محظور') return 'status-blocked';
    return '';
}

// 4. فتح نافذة التعديل وتحميل البيانات (بما فيها العنوان التفصيلي)
window.openEditModal = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if (!c) return;
    
    initQuill();
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-country').value = c.country || '';
    document.getElementById('edit-city').value = c.city || '';
    document.getElementById('edit-district').value = c.district || '';
    document.getElementById('edit-street').value = c.street || '';
    document.getElementById('edit-buildingNo').value = c.buildingNo || '';
    document.getElementById('edit-additionalNo').value = c.additionalNo || '';
    document.getElementById('edit-postalCode').value = c.postalCode || '';
    document.getElementById('edit-poBox').value = c.poBox || '';
    
    document.getElementById('edit-accountStatus').value = c.accountStatus || 'جديد';
    document.getElementById('edit-customerCategory').value = c.customerCategory || 'عادي';
    document.getElementById('edit-quickNote').value = c.quickNote || 'سريع التجاوب';
    
    quill.root.innerHTML = c.detailedNotes || '';
    renderFilesList(c.attachments || [], 'files-list');
    
    document.getElementById('upload-btn').onclick = () => handleUpload(id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

// ... بقية دوال الرفع والحذف والملفات تبقى كما هي في الكود السابق لتعمل المرفقات ...
