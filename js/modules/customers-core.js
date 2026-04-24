/**
 * js/modules/customers-core.js
 * الإصدار الاحترافي - Tera Gateway
 * يشمل الإحصائيات، تصنيف العملاء، وفصل مفاتيح الدول
 */

import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const countryData = [
    { name: "السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", phoneLen: 10 }
];

// تصنيفات العملاء
const customerTags = {
    "normal": { label: "عميل عادي", icon: "fa-user", color: "#64748b" },
    "vip": { label: "عميل مميز", icon: "fa-star", color: "#f1c40f" },
    "scammer": { label: "عميل محتال", icon: "fa-user-secret", color: "#e74c3c" },
    "unserious": { label: "غير جدي", icon: "fa-user-slash", color: "#95a5a6" },
    "uncooperative": { label: "غير متعاون", icon: "fa-handshake-slash", color: "#e67e22" }
};

export async function initCustomers(container) {
    // 1. هيكل الواجهة مع الإحصائيات
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p></div>
            <div class="stat-card"><h3>عملاء جدد</h3><p id="stat-new">0</p></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p></div>
            <div class="stat-card danger"><h3>ملاحظات سلبية</h3><p id="stat-flagged">0</p></div>
        </div>

        <div class="module-header">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث باسم العميل، الرقم، أو المدينة...">
            </div>
            <button id="add-customer-btn" class="btn-primary"><i class="fas fa-plus"></i> إضافة عميل جديد</button>
        </div>
        
        <div class="table-container">
            <table class="tera-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان الوطني</th>
                        <th>التصنيف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openCustomerModal();
    loadCustomers();

    // فلتر البحث السهل
    document.getElementById('customer-search').oninput = (e) => {
        filterTable(e.target.value);
    };
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, incomplete: 0, flagged: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        if (!data.buildingNo || !data.postalCode) stats.incomplete++;
        if (data.tag === 'scammer' || data.tag === 'uncooperative') stats.flagged++;

        const tagInfo = customerTags[data.tag || 'normal'];

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-info">
                        <img src="${data.photoURL || 'https://ui-avatars.com/api/?name='+data.name+'&background=random'}" class="user-avatar">
                        <div>
                            <div class="user-name">${data.name}</div>
                            <small>${data.email || 'لا يوجد بريد'}</small>
                        </div>
                    </div>
                </td>
                <td dir="ltr">
                    <span class="country-tag">${data.countryCode || ''}</span> ${data.phone}
                </td>
                <td>
                    <div class="address-brief">
                        <i class="fas fa-map-marker-alt"></i> ${data.city}, ${data.district}<br>
                        <small>مبنى: ${data.buildingNo || '-'} | رمز: ${data.postalCode || '-'}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge" style="background:${tagInfo.color}">
                        <i class="fas ${tagInfo.icon}"></i> ${tagInfo.label}
                    </span>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn-icon edit" onclick="editCustomer('${id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon print" onclick="window.printCustomer('${id}')" title="طباعة"><i class="fas fa-print"></i></button>
                        <button class="btn-icon delete" onclick="deleteCustomer('${id}')" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    // تحديث الأرقام في الإحصائيات
    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
    document.getElementById('stat-flagged').innerText = stats.flagged;
}

export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content large">
            <div class="modal-header">
                <h2><i class="fas fa-user-circle"></i> ${isEdit ? 'تعديل الملف الشخصي' : 'ملف عميل جديد'}</h2>
                <button type="button" class="close-modal" onclick="document.getElementById('customer-modal').remove()">&times;</button>
            </div>
            <form id="customer-form">
                <div class="modal-body-scroll">
                    <div class="form-grid">
                        <div class="photo-upload-section">
                            <img id="preview-photo" src="${customer?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}">
                            <input type="text" id="cust-photo-url" placeholder="رابط الصورة (اختياري)" value="${customer?.photoURL || ''}">
                        </div>
                        <div class="main-info">
                            <label>اسم العميل الكامل</label>
                            <input type="text" id="cust-name" value="${customer?.name || ''}" required placeholder="محمد بن صالح...">
                            
                            <div class="row">
                                <div class="field">
                                    <label>الدولة</label>
                                    <select id="cust-country">
                                        ${countryData.map(c => `<option value="${c.code}" ${customer?.countryCode === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="field flex-2">
                                    <label>رقم الجوال</label>
                                    <input type="tel" id="cust-phone" value="${customer?.phone || ''}" placeholder="5xxxxxxxx" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section-title">العنوان الوطني والاتصال</div>
                    <div class="row">
                        <input type="email" id="cust-email" placeholder="البريد الإلكتروني" value="${customer?.email || ''}">
                        <input type="text" id="cust-city" placeholder="المدينة" value="${customer?.city || 'حائل'}">
                        <input type="text" id="cust-district" placeholder="الحي" value="${customer?.district || ''}">
                    </div>
                    <div class="row">
                        <input type="text" id="cust-street" placeholder="اسم الشارع" value="${customer?.street || ''}">
                        <input type="text" id="cust-building" placeholder="رقم المبنى" value="${customer?.buildingNo || ''}">
                        <input type="text" id="cust-additional" placeholder="الرقم الإضافي" value="${customer?.additionalNo || ''}">
                    </div>
                    <div class="row">
                        <input type="text" id="cust-pobox" placeholder="صندوق البريد" value="${customer?.poBox || ''}">
                        <input type="text" id="cust-zip" placeholder="الرمز البريدي" value="${customer?.postalCode || ''}">
                    </div>

                    <div class="section-title">تصنيف العميل وملاحظات إدارية</div>
                    <select id="cust-tag" class="tag-select">
                        ${Object.keys(customerTags).map(key => `<option value="${key}" ${customer?.tag === key ? 'selected' : ''}>${customerTags[key].label}</option>`).join('')}
                    </select>
                    
                    <div class="rich-text-area">
                        <label>الملاحظات (دعم كامل)</label>
                        <textarea id="cust-notes" rows="4" placeholder="اكتب ملاحظاتك هنا...">${customer?.notes || ''}</textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn-save">${isEdit ? 'تحديث البيانات' : 'حفظ العميل'}</button>
                    <button type="button" class="btn-cancel" onclick="document.getElementById('customer-modal').remove()">إلغاء</button>
                </div>
            </form>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('customer-form').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('cust-name').value,
            countryCode: document.getElementById('cust-country').value,
            phone: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-building').value,
            additionalNo: document.getElementById('cust-additional').value,
            poBox: document.getElementById('cust-pobox').value,
            postalCode: document.getElementById('cust-zip').value,
            tag: document.getElementById('cust-tag').value,
            notes: document.getElementById('cust-notes').value,
            photoURL: document.getElementById('cust-photo-url').value,
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

// دالة البحث السريع
function filterTable(value) {
    const rows = document.querySelectorAll('.customer-row');
    const term = value.toLowerCase();
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
}

// وظائف عالمية
window.editCustomer = async (id) => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const docSnap = querySnapshot.docs.find(d => d.id === id);
    if (docSnap) openCustomerModal({ id, ...docSnap.data() });
};

window.printCustomer = (id) => {
    // منطق الطباعة المبسط
    window.open(`/print-customer.html?id=${id}`, '_blank');
};

window.deleteCustomer = async (id) => {
    if (confirm("حذف العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};
