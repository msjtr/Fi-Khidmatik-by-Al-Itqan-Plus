import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
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

// 2. تحميل الجدول وإظهار أيقونة العرض (📎)
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
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td>
                <td class="sticky-col"><strong>${data.name || '-'}</strong></td>
                <td>${data.phone || '-'}</td>
                <td>${data.countryCode || '+966'}</td>
                <td>${data.email || '-'}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
                <td><span class="badge ${getStatusClass(data.accountStatus)}">${data.accountStatus || 'جديد'}</span></td>
                <td>${data.customerCategory || 'عادي'}</td>
                <td>${data.quickNote || '-'}</td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')" title="تعديل">✏️</button>
                    <button class="action-btn attach" onclick="viewOnlyAttachments('${data.id}')" title="عرض المرفقات">📎</button>
                    <button class="action-btn print" onclick="window.print()" title="طباعة">🖨️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')" title="حذف">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error("خطأ:", e); }
}

function getStatusClass(status) {
    if(status === 'نشط') return 'status-active';
    if(status === 'موقوف') return 'status-paused';
    if(status === 'محظور') return 'status-blocked';
    return '';
}

// 3. معالجة رفع الملفات (إصلاح زر الرفع)
async function handleUpload(customerId) {
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const file = fileInput.files[0];
    
    if(!file || !nameInput.value) return alert("يرجى اختيار ملف وكتابة اسم الوثيقة");
    
    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn.disabled = true;
    uploadBtn.innerText = "جارِ الرفع...";

    const filePath = `customers/${customerId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);
    try {
        const snap = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snap.ref);
        
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const oldFiles = cDoc.data().attachments || [];
        
        const newFile = { name: nameInput.value, url: url, path: filePath, type: file.type, date: new Date().toISOString() };
        const updatedFiles = [...oldFiles, newFile];
        
        await updateDoc(doc(db, "customers", customerId), { attachments: updatedFiles });
        
        // تحديث القائمة فوراً
        const currentCustomer = customersDataList.find(item => item.id === customerId);
        currentCustomer.attachments = updatedFiles;
        renderFilesList(updatedFiles, 'files-list', customerId);
        
        nameInput.value = ''; fileInput.value = '';
        alert("تم الرفع بنجاح");
    } catch(e) { console.error(e); }
    finally {
        uploadBtn.disabled = false;
        uploadBtn.innerText = "رفع الوثيقة";
    }
}

function renderFilesList(files, containerId, customerId) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = files.map((f, index) => `
        <div class="attachment-item">
            <span><strong>${f.name}</strong></span>
            <div>
                <a href="${f.url}" target="_blank" style="color:#3498db; text-decoration:none; margin-left:10px;">👁️ عرض</a>
                <button type="button" onclick="deleteSingleFile('${customerId}', ${index})" style="color:#e74c3c; border:none; background:none; cursor:pointer;">🗑️ حذف</button>
            </div>
        </div>
    `).join('') || '<p style="color:gray; font-size:0.9em;">لا توجد مرفقات حالياً</p>';
}

window.deleteSingleFile = async (customerId, index) => {
    if(!confirm("حذف هذا المرفق نهائياً؟")) return;
    try {
        const cDoc = await getDoc(doc(db, "customers", customerId));
        let files = cDoc.data().attachments || [];
        files.splice(index, 1);
        await updateDoc(doc(db, "customers", customerId), { attachments: files });
        renderFilesList(files, 'files-list', customerId);
        loadCustomers();
    } catch(e) { console.error(e); }
};

window.viewOnlyAttachments = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if(c) {
        renderFilesList(c.attachments || [], 'only-files-list', id);
        document.getElementById('view-files-modal').classList.add('active');
    }
};

window.openEditModal = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if (!c) return;
    
    initQuill();
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-countryCode').value = c.countryCode || '';
    document.getElementById('edit-email').value = c.email || '';
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
    renderFilesList(c.attachments || [], 'files-list', id);
    
    // ربط الحدث بالزر
    document.getElementById('upload-btn').onclick = () => handleUpload(id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    try {
        await updateDoc(doc(db, "customers", id), {
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
            accountStatus: document.getElementById('edit-accountStatus').value,
            customerCategory: document.getElementById('edit-customerCategory').value,
            quickNote: document.getElementById('edit-quickNote').value,
            detailedNotes: quill.root.innerHTML,
            updatedAt: new Date().toISOString()
        });
        alert("تم التحديث");
        window.closeEditModal();
        loadCustomers();
    } catch(e) { console.error(e); }
};

window.deleteCustomer = async (id) => {
    if(confirm("حذف العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

document.addEventListener('DOMContentLoaded', loadCustomers);
