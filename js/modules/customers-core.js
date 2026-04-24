/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway
 * التعديل الأخير: إصلاح ReferenceError وإضافة الحقول المتقدمة
 */

import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// بيانات الدول والتصنيفات
const countryData = [
    { name: "السعودية", code: "+966", flag: "🇸🇦" },
    { name: "الإمارات", code: "+971", flag: "🇦🇪" },
    { name: "الكويت", code: "+965", flag: "🇰🇼" },
    { name: "مصر", code: "+20", flag: "🇪🇬" }
];

const customerTags = {
    "normal": { label: "عميل عادي", icon: "fa-user", color: "#64748b" },
    "vip": { label: "عميل مميز", icon: "fa-star", color: "#f1c40f" },
    "scammer": { label: "عميل محتال", icon: "fa-user-secret", color: "#e74c3c" },
    "unserious": { label: "غير جدي", icon: "fa-user-slash", color: "#95a5a6" },
    "uncooperative": { label: "غير متعاون", icon: "fa-handshake-slash", color: "#e67e22" }
};

export async function initCustomers(container) {
    injectStyles();

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p></div>
            <div class="stat-card success"><h3>بيانات مكتملة</h3><p id="stat-complete">0</p></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p></div>
            <div class="stat-card danger"><h3>ملاحظات هامة</h3><p id="stat-flagged">0</p></div>
        </div>

        <div class="module-header">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث باسم العميل أو الرقم...">
            </div>
            <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل جديد</button>
        </div>
        
        <div class="table-container">
            <table class="tera-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان الوطني</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openCustomerModal();
    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    
    loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        if (!data.buildingNo || !data.postalCode) stats.incomplete++; else stats.complete++;
        if (['scammer', 'uncooperative'].includes(data.tag)) stats.flagged++;

        const tagInfo = customerTags[data.tag || 'normal'];
        const avatar = data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`;

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-cell">
                        <img src="${avatar}" class="avatar">
                        <div class="info">
                            <span class="name">${data.name}</span>
                            <span class="email">${data.email || ''}</span>
                        </div>
                    </div>
                </td>
                <td dir="ltr"><span class="code">${data.countryCode || ''}</span> ${data.phone}</td>
                <td>
                    <small>
                        ${data.city}, ${data.district}<br>
                        بناء: ${data.buildingNo || '-'} | رمز: ${data.postalCode || '-'}
                    </small>
                </td>
                <td>
                    <span class="tag-badge" style="background:${tagInfo.color}20; color:${tagInfo.color};">
                        <i class="fas ${tagInfo.icon}"></i> ${tagInfo.label}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button onclick="editCustomer('${id}')" class="act-btn edit"><i class="fas fa-pen"></i></button>
                        <button onclick="deleteCustomer('${id}')" class="act-btn del"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
    document.getElementById('stat-flagged').innerText = stats.flagged;
}

/**
 * دالة فتح النافذة (Modal)
 */
export async function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button type="button" onclick="document.getElementById('customer-modal').remove()">&times;</button>
            </div>
            <form id="customer-form">
                <div class="form-body">
                    <div class="row">
                        <div class="field full">
                            <label>اسم العميل</label>
                            <input type="text" id="cust-name" value="${customer?.name || ''}" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="field">
                            <label>الدولة</label>
                            <select id="cust-country">
                                ${countryData.map(c => `<option value="${c.code}" ${customer?.countryCode === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="field flex-2">
                            <label>رقم الجوال</label>
                            <input type="tel" id="cust-phone" value="${customer?.phone || ''}" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="field"><label>المدينة</label><input type="text" id="cust-city" value="${customer?.city || 'حائل'}"></div>
                        <div class="field"><label>الحي</label><input type="text" id="cust-district" value="${customer?.district || ''}"></div>
                    </div>
                    <div class="row">
                        <div class="field"><label>المبنى</label><input type="text" id="cust-building" value="${customer?.buildingNo || ''}"></div>
                        <div class="field"><label>الرمز البريدي</label><input type="text" id="cust-zip" value="${customer?.postalCode || ''}"></div>
                    </div>
                    <div class="field">
                        <label>تصنيف العميل</label>
                        <select id="cust-tag">
                            ${Object.keys(customerTags).map(key => `<option value="${key}" ${customer?.tag === key ? 'selected' : ''}>${customerTags[key].label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="field">
                        <label>ملاحظات إدارية</label>
                        <textarea id="cust-notes" rows="3">${customer?.notes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn-save">حفظ البيانات</button>
                    <button type="button" class="btn-cancel" onclick="document.getElementById('customer-modal').remove()">إلغاء</button>
                </div>
            </form>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('customer-form').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('cust-name').value,
            countryCode: document.getElementById('cust-country').value,
            phone: document.getElementById('cust-phone').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            buildingNo: document.getElementById('cust-building').value,
            postalCode: document.getElementById('cust-zip').value,
            tag: document.getElementById('cust-tag').value,
            notes: document.getElementById('cust-notes').value,
            updatedAt: new Date()
        };

        if (isEdit) {
            await updateDoc(doc(db, "customers", customer.id), data);
        } else {
            data.createdAt = new Date();
            await addDoc(collection(db, "customers"), data);
        }
        document.getElementById('customer-modal').remove();
        loadCustomers();
    };
}

// --- تصدير الدوال للـ Window لتعمل مع HTML onclick ---
window.editCustomer = async (id) => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const docSnap = querySnapshot.docs.find(d => d.id === id);
    if (docSnap) openCustomerModal({ id, ...docSnap.data() });
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value.toLowerCase()) ? '' : 'none';
    });
}

function injectStyles() {
    if (document.getElementById('cust-styles')) return;
    const s = document.createElement('style');
    s.id = 'cust-styles';
    s.innerHTML = `
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: #fff; padding: 15px; border-radius: 10px; border-right: 5px solid #3b82f6; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .stat-card.success { border-color: #10b981; }
        .stat-card.warning { border-color: #f59e0b; }
        .stat-card.danger { border-color: #ef4444; }
        .stat-card h3 { font-size: 0.8rem; color: #64748b; margin-bottom: 5px; }
        .stat-card p { font-size: 1.5rem; font-weight: bold; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .modal-content { background: white; width: 90%; max-width: 500px; border-radius: 12px; padding: 20px; direction: rtl; }
        .modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .form-body .row { display: flex; gap: 10px; margin-bottom: 10px; }
        .field { display: flex; flex-direction: column; flex: 1; }
        .field label { font-size: 0.8rem; margin-bottom: 5px; font-weight: bold; }
        .field input, .field select, .field textarea { padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
        .modal-footer { margin-top: 20px; display: flex; gap: 10px; }
        .btn-save { background: #16a34a; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        .btn-cancel { background: #ccc; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        
        .tag-badge { padding: 3px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .user-cell .avatar { width: 35px; height: 35px; border-radius: 50%; }
        .actions { display: flex; gap: 5px; }
        .act-btn { border: none; width: 30px; height: 30px; border-radius: 4px; cursor: pointer; }
        .act-btn.edit { background: #e0f2fe; color: #0369a1; }
        .act-btn.del { background: #fee2e2; color: #991b1b; }
    `;
    document.head.appendChild(s);
}
