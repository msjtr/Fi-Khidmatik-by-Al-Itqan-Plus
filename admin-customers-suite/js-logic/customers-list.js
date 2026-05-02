import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const customersRef = collection(db, "customers");
let customersDataList = [];
let quill;

// تهيئة محرر Quill (مرة واحدة)
function initQuill() {
    if (!quill) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
}

// تحميل الجدول
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
                <td>${data.email || '-'}</td>
                <td>${data.city || '-'} / ${data.country || '-'}</td>
                <td><span class="badge ${getStatusClass(data.accountStatus)}">${data.accountStatus || 'جديد'}</span></td>
                <td>${data.customerCategory || 'عادي'}</td>
                <td>${data.quickNote || '-'}</td>
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')">✏️</button>
                    <button class="action-btn attach" onclick="viewOnlyAttachments('${data.id}')">📎</button>
                    <button class="action-btn print" onclick="window.print()">🖨️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error(e); }
}

function getStatusClass(status) {
    if(status === 'نشط') return 'status-active';
    if(status === 'موقوف') return 'status-paused';
    if(status === 'محظور') return 'status-blocked';
    return '';
}

// فتح التعديل
window.openEditModal = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if (!c) return;
    
    initQuill();
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-accountStatus').value = c.accountStatus || 'جديد';
    document.getElementById('edit-customerCategory').value = c.customerCategory || 'عادي';
    document.getElementById('edit-quickNote').value = c.quickNote || 'سريع التجاوب';
    
    quill.root.innerHTML = c.detailedNotes || '';
    renderFilesList(c.attachments || [], 'files-list');
    
    // ربط زر الرفع بالمعرف الحالي
    document.getElementById('upload-btn').onclick = () => handleUpload(id);
    
    document.getElementById('edit-customer-modal').classList.add('active');
};

// رفع ملف
async function handleUpload(customerId) {
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const file = fileInput.files[0];
    
    if(!file || !nameInput.value) return alert("اختر ملفاً واكتب اسمه");
    
    const fileRef = ref(storage, `customers/${customerId}/${Date.now()}_${file.name}`);
    try {
        const snap = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snap.ref);
        
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const oldFiles = cDoc.data().attachments || [];
        
        const newFile = { name: nameInput.value, url: url, type: file.type, date: new Date().toISOString() };
        const updatedFiles = [...oldFiles, newFile];
        
        await updateDoc(doc(db, "customers", customerId), { attachments: updatedFiles });
        
        // تحديث القائمة فوراً في المودال
        renderFilesList(updatedFiles, 'files-list');
        nameInput.value = ''; fileInput.value = '';
        alert("تم الرفع");
        loadCustomers(); // لتحديث البيانات المحلية
    } catch(e) { console.error(e); }
}

function renderFilesList(files, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = files.map(f => `
        <div class="attachment-item">
            <span><strong>${f.name}</strong> (${f.type.split('/')[1] || 'ملف'})</span>
            <a href="${f.url}" target="_blank" style="color:var(--accent-color); text-decoration:none;">👁️ عرض</a>
        </div>
    `).join('') || '<p>لا توجد مرفقات</p>';
}

window.viewOnlyAttachments = (id) => {
    const c = customersDataList.find(item => item.id === id);
    renderFilesList(c.attachments || [], 'only-files-list');
    document.getElementById('view-files-modal').classList.add('active');
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    try {
        await updateDoc(doc(db, "customers", id), {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            accountStatus: document.getElementById('edit-accountStatus').value,
            customerCategory: document.getElementById('edit-customerCategory').value,
            quickNote: document.getElementById('edit-quickNote').value,
            detailedNotes: quill.root.innerHTML,
            updatedAt: new Date().toISOString()
        });
        alert("تم الحفظ");
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
