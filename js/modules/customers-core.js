/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المطور - Tera Gateway 
 * معالجة العرض الكامل، العنوان الوطني، والربط مع Firebase
 */

import { db } from '../core/config.js';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const countryData = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات العربية المتحدة", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", phoneLen: 10 }
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="customers-wrapper">
            <div class="header-section">
                <div class="search-bar">
                    <input type="text" id="customerSearch" placeholder="ابحث باسم العميل أو رقم الجوال...">
                    <i class="fas fa-search"></i>
                </div>
                <button class="btn-primary-tera" onclick="openCustomerModal()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-container-tera">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>رقم الجوال</th>
                            <th>العنوان الكامل</th>
                            <th>الرمز البريدي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customersTableBody">
                        <tr><td colspan="5" style="text-align:center;">جاري تحميل العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // تفعيل البحث اللحظي
    document.getElementById('customerSearch').addEventListener('input', (e) => filterCustomers(e.target.value));
    
    // تحميل جميع العملاء من Firebase
    loadAllCustomers();
}

async function loadAllCustomers() {
    const tbody = document.getElementById('customersTableBody');
    try {
        const q = query(collection(db, "customers"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا يوجد عملاء مضافين حالياً.</td></tr>`;
            return;
        }

        let html = "";
        querySnapshot.forEach((doc) => {
            const c = doc.data();
            const fullAddress = `${c.country || 'السعودية'} - ${c.city || 'حائل'} - ${c.district || ''}`;
            html += `
                <tr id="row-${doc.id}">
                    <td><strong>${c.name || 'بدون اسم'}</strong></td>
                    <td dir="ltr">${c.phone || '-'}</td>
                    <td>${fullAddress}</td>
                    <td><span class="zip-badge">${c.postalCode || c.poBox || '-'}</span></td>
                    <td>
                        <div class="tera-actions">
                            <button class="t-btn t-edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-edit"></i></button>
                            <button class="t-btn t-print" onclick="printCustomer('${doc.id}')"><i class="fas fa-print"></i></button>
                            <button class="t-btn t-delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">حدث خطأ أثناء تحميل البيانات.</td></tr>`;
    }
}

// نافذة الإضافة والتعديل المحدثة (بالعنوان الوطني الكامل)
window.openCustomerModal = async function(customerData = null) {
    const isEdit = !!customerData;
    const modalHTML = `
        <div id="customerModal" class="tera-modal-overlay">
            <div class="tera-modal">
                <div class="modal-header-tera">
                    <h3>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                    <button onclick="closeModalTera()">&times;</button>
                </div>
                <form id="customerForm" class="modal-body-tera">
                    <div class="input-row">
                        <label>الاسم الكامل</label>
                        <input type="text" id="m_name" value="${customerData?.name || ''}" required>
                    </div>
                    
                    <div class="row-flex">
                        <div class="sub-col">
                            <label>الدولة</label>
                            <select id="m_country" onchange="updatePrefix()">
                                ${countryData.map(d => `<option value="${d.code}" ${customerData?.country === d.name ? 'selected' : ''}>${d.flag} ${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="sub-col flex-2">
                            <label>رقم الجوال</label>
                            <div class="prefix-input">
                                <span id="m_prefix">+966</span>
                                <input type="tel" id="m_phone" value="${customerData?.phone?.replace('+966','') || ''}" placeholder="5xxxxxxxx">
                            </div>
                        </div>
                    </div>

                    <div class="row-flex">
                         <div class="sub-col">
                            <label>المدينة</label>
                            <input type="text" id="m_city" value="${customerData?.city || 'حائل'}">
                        </div>
                        <div class="sub-col">
                            <label>الحي</label>
                            <input type="text" id="m_district" value="${customerData?.district || ''}">
                        </div>
                    </div>

                    <div class="row-flex">
                        <div class="sub-col">
                            <label>صندوق البريد</label>
                            <input type="text" id="m_pobox" oninput="document.getElementById('m_zip').value=this.value" value="${customerData?.poBox || ''}">
                        </div>
                        <div class="sub-col">
                            <label>الرمز البريدي</label>
                            <input type="text" id="m_zip" value="${customerData?.postalCode || ''}">
                        </div>
                    </div>

                    <div class="input-row">
                        <label>ملاحظات إضافية</label>
                        <textarea id="m_notes" rows="2">${customerData?.notes || ''}</textarea>
                    </div>

                    <div class="modal-footer-tera">
                        <button type="submit" class="save-btn">حفظ البيانات</button>
                        <button type="button" class="cancel-btn" onclick="closeModalTera()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    updatePrefix();

    document.getElementById('customerForm').onsubmit = async (e) => {
        e.preventDefault();
        // منطق الحفظ في Firebase (Add/Update) سيتم هنا
        alert("تم استلام البيانات وجاري الحفظ...");
        closeModalTera();
        loadAllCustomers();
    };
};

window.closeModalTera = () => {
    const m = document.getElementById('customerModal');
    if(m) m.remove();
};

window.updatePrefix = () => {
    const sel = document.getElementById('m_country');
    if(sel) document.getElementById('m_prefix').innerText = sel.value;
};

// وظائف الأزرار الأساسية
window.deleteCustomer = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadAllCustomers();
    }
};

// التنسيقات لضمان العرض القائم على القائمة
const style = document.createElement('style');
style.textContent = `
    .customers-wrapper { padding: 20px; direction: rtl; }
    .header-section { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
    .search-bar { position: relative; flex: 1; }
    .search-bar input { width: 100%; padding: 12px 45px 12px 15px; border-radius: 8px; border: 1px solid #ddd; }
    .search-bar i { position: absolute; right: 15px; top: 15px; color: #aaa; }
    
    .btn-primary-tera { background: #e67e22; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.9rem; }
    
    .table-container-tera { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow-x: auto; }
    .tera-table { width: 100%; border-collapse: collapse; min-width: 800px; }
    .tera-table th { background: #f8fafc; padding: 15px; text-align: right; color: #64748b; border-bottom: 2px solid #edf2f7; font-size: 0.85rem; }
    .tera-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    
    .zip-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; color: #475569; }
    
    .tera-actions { display: flex; gap: 8px; }
    .t-btn { border: none; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .t-edit { background: #eff6ff; color: #3b82f6; }
    .t-print { background: #f0fdf4; color: #22c55e; }
    .t-delete { background: #fef2f2; color: #ef4444; }
    .t-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }

    .tera-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(3px); }
    .tera-modal { background: white; width: 95%; max-width: 650px; border-radius: 12px; overflow: hidden; animation: teraPop 0.3s ease-out; }
    .row-flex { display: flex; gap: 15px; margin-bottom: 15px; }
    .sub-col { flex: 1; display: flex; flex-direction: column; }
    .flex-2 { flex: 2; }
    
    .prefix-input { display: flex; direction: ltr; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fff; }
    #m_prefix { background: #f1f5f9; padding: 10px 12px; font-weight: bold; color: #64748b; border-right: 1px solid #ddd; }
    .prefix-input input { border: none; flex: 1; padding: 10px; outline: none; }

    @keyframes teraPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
`;
document.head.appendChild(style);
