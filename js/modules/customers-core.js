import { db } from '../core/config.js'; // تأكد من أن هذا المسار يؤدي لإعدادات فيربيز الخاصة بك
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة الدول المحدثة
const countryData = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦", len: 9 },
    { name: "الإمارات", code: "971", flag: "🇦🇪", len: 9 },
    { name: "الكويت", code: "965", flag: "🇰🇼", len: 8 },
    { name: "عمان", code: "968", flag: "🇴🇲", len: 8 },
    { name: "مصر", code: "20", flag: "🇪🇬", len: 10 }
];

export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الواجهة العلوية
    container.innerHTML = `
        <div class="customers-header">
            <div class="search-bar">
                <i class="fas fa-search"></i>
                <input type="text" id="searchCust" placeholder="ابحث بالاسم أو رقم الجوال...">
            </div>
            <button class="btn-primary" id="addNewCustBtn">
                <i class="fas fa-plus"></i> إضافة عميل جديد
            </button>
        </div>
        <div id="customersTableContainer">
            <p class="loading-msg">جاري جلب البيانات من تيرا جيتواي...</p>
        </div>
    `;

    const tableContainer = document.getElementById('customersTableContainer');
    const searchInput = document.getElementById('searchCust');

    // 2. ربط زر الإضافة
    document.getElementById('addNewCustBtn').onclick = () => openCustomerModal();

    // 3. الاستماع المباشر للبيانات من Firebase (Real-time)
    const q = query(collection(db, "customers"));
    onSnapshot(q, (snapshot) => {
        let customers = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });

        const render = (filtered) => renderTable(tableContainer, filtered);
        render(customers);

        // تفعيل الفلترة والبحث
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = customers.filter(c => 
                (c.name || "").toLowerCase().includes(term) || 
                (c.phone || "").includes(term)
            );
            render(filtered);
        };
    });
}

function renderTable(container, data) {
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state">لا يوجد عملاء مطابقين للبحث</div>`;
        return;
    }

    container.innerHTML = `
        <table class="tera-table">
            <thead>
                <tr>
                    <th>العميل</th>
                    <th>الاتصال</th>
                    <th>العنوان الوطني</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr>
                        <td>
                            <div class="cust-info">
                                <strong>${c.name || 'بدون اسم'}</strong>
                                <span>ID: ${c.id.slice(0,5)}</span>
                            </div>
                        </td>
                        <td dir="ltr">
                            <div><i class="fas fa-mobile-alt"></i> +${c.phone || ''}</div>
                            ${c.landline ? `<div class="landline-sub"><i class="fas fa-phone"></i> +${c.landline}</div>` : ''}
                        </td>
                        <td>
                            <div class="addr-tags">
                                <span class="tag-city">${c.city || 'غير محدد'}</span>
                                <span class="tag-dist">${c.district || ''}</span>
                                <span class="tag-zip"><i class="fas fa-envelope"></i> ${c.postalCode || c.poBox || '-'}</span>
                            </div>
                        </td>
                        <td>
                            <div class="actions">
                                <button class="btn-edit" onclick="window.editCustomer('${c.id}')"><i class="fas fa-pen"></i></button>
                                <button class="btn-print" onclick="window.printCustomer('${c.id}')"><i class="fas fa-print"></i></button>
                                <button class="btn-delete" onclick="window.deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// دالة فتح النافذة (Modal)
window.openCustomerModal = function(customer = null) {
    const isEdit = !!customer;
    const modal = document.createElement('div');
    modal.id = 'custModal';
    modal.className = 'tera-modal-overlay';
    
    modal.innerHTML = `
        <div class="tera-modal">
            <div class="modal-header">
                <h3>${isEdit ? 'تحديث بيانات العميل' : 'إضافة عميل إلى النظام'}</h3>
                <button onclick="this.closest('.tera-modal-overlay').remove()">&times;</button>
            </div>
            <form id="custForm">
                <div class="form-grid">
                    <div class="field full">
                        <label>الاسم الكامل</label>
                        <input type="text" id="m_name" value="${customer?.name || ''}" required>
                    </div>
                    <div class="field">
                        <label>الدولة</label>
                        <select id="m_country" onchange="updateDialCode(this.value)">
                            ${countryData.map(d => `<option value="${d.code}" ${customer?.phone?.startsWith(d.code) ? 'selected' : ''}>${d.flag} ${d.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="field">
                        <label>رقم الجوال (يبدأ بـ 5)</label>
                        <div class="phone-box">
                            <span id="dialCode">${customer ? '' : '966'}</span>
                            <input type="tel" id="m_phone" value="${customer?.phone || ''}" placeholder="5xxxxxxxx" required>
                        </div>
                    </div>
                    <div class="field">
                        <label>الهاتف الثابت (اختياري)</label>
                        <input type="tel" id="m_landline" value="${customer?.landline || ''}">
                    </div>
                    <div class="field">
                        <label>المدينة</label>
                        <input type="text" id="m_city" value="${customer?.city || 'حائل'}">
                    </div>
                    <div class="field">
                        <label>الحي</label>
                        <input type="text" id="m_dist" value="${customer?.district || ''}">
                    </div>
                    <div class="field">
                        <label>صندوق البريد</label>
                        <input type="text" id="m_pobox" value="${customer?.poBox || ''}" oninput="document.getElementById('m_zip').value = this.value">
                    </div>
                    <div class="field">
                        <label>الرمز البريدي</label>
                        <input type="text" id="m_zip" value="${customer?.postalCode || ''}">
                    </div>
                    <div class="field full">
                        <label>ملاحظات الموظف (محرر متقدم)</label>
                        <textarea id="m_notes" rows="3">${customer?.notes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn-save">${isEdit ? 'حفظ التعديلات' : 'إضافة العميل'}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('custForm').onsubmit = async (e) => {
        e.preventDefault();
        const dial = document.getElementById('dialCode').innerText;
        const rawPhone = document.getElementById('m_phone').value.replace(/^0/, '');
        
        const data = {
            name: document.getElementById('m_name').value,
            phone: dial + rawPhone,
            landline: document.getElementById('m_landline').value,
            city: document.getElementById('m_city').value,
            district: document.getElementById('m_dist').value,
            poBox: document.getElementById('m_pobox').value,
            postalCode: document.getElementById('m_zip').value,
            notes: document.getElementById('m_notes').value,
            updatedAt: serverTimestamp()
        };

        try {
            if (isEdit) {
                await updateDoc(doc(db, "customers", customer.id), data);
            } else {
                data.createdAt = serverTimestamp();
                await setDoc(doc(collection(db, "customers")), data);
            }
            modal.remove();
        } catch (err) { alert("خطأ في الحفظ: " + err.message); }
    };
};

window.updateDialCode = (val) => { document.getElementById('dialCode').innerText = val; };

// وظائف الحذف والطباعة والتعديل
window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        await deleteDoc(doc(db, "customers", id));
    }
};

window.editCustomer = async (id) => {
    // سيتم جلب البيانات من القائمة المفتوحة وفتح المودال
    alert("سيتم جلب بيانات العميل وتعديلها..");
};

window.printCustomer = (id) => {
    window.print(); // يمكنك تخصيص صفحة طباعة لاحقاً
};
