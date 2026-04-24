/**
 * نظام إدارة العملاء المتكامل لـ Tera Gateway
 * يتضمن الإحصائيات، الفلترة، إدارة الدول، والتصنيفات المتقدمة
 */

import { db } from '../core/config.js';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة دول العالم الأساسية مع مفاتيح الاتصال
const worldCountries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦", phonePattern: "5" },
    { name: "الإمارات", code: "971", flag: "🇦🇪", phonePattern: "" },
    { name: "الكويت", code: "965", flag: "🇰🇼", phonePattern: "" },
    { name: "البحرين", code: "973", flag: "🇧🇭", phonePattern: "" },
    { name: "عمان", code: "968", flag: "🇴🇲", phonePattern: "" },
    { name: "قطر", code: "974", flag: "🇶🇦", phonePattern: "" },
    { name: "مصر", code: "20", flag: "🇪🇬", phonePattern: "" }
];

export async function initCustomers(container) {
    if (!container) return;

    // 1. هيكل الصفحة: إحصائيات + أدوات تحكم + حاوية الجدول
    container.innerHTML = `
        <div class="tera-stats-grid" id="statsGrid">
            </div>

        <div class="customers-header">
            <div class="search-and-filter">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchCust" placeholder="ابحث بالاسم، الرقم، أو المدينة...">
                </div>
                <select id="classFilter">
                    <option value="">جميع التصنيفات</option>
                    <option value="مميز">عميل مميز</option>
                    <option value="محتال">عميل محتال</option>
                    <option value="غير جدي">غير جدي</option>
                    <option value="غير متعاون">غير متعاون</option>
                </select>
            </div>
            <button class="btn-primary" onclick="openCustomerModal()">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>

        <div id="customersTableContainer">
            <div class="tera-loader">جاري جلب بيانات العملاء...</div>
        </div>
    `;

    // 2. الاستماع المباشر للبيانات من Firestore
    const q = query(collection(db, "customers"));
    onSnapshot(q, (snapshot) => {
        const customers = [];
        snapshot.forEach((doc) => customers.push({ id: doc.id, ...doc.data() }));

        renderStats(customers);
        applyFilters(customers);
    });
}

// دالة حساب الإحصائيات 
function renderStats(data) {
    const stats = {
        total: data.length,
        new: data.filter(c => {
            const date = c.createdAt?.toDate();
            return date && (new Date() - date) < (7 * 24 * 60 * 60 * 1000); // آخر 7 أيام
        }).length,
        complete: data.filter(c => c.name && c.phone && c.city && c.postalCode).length,
        incomplete: data.filter(c => !c.name || !c.phone || !c.city || !c.postalCode).length,
        withNotes: data.filter(c => c.notes && c.notes.trim() !== "").length
    };

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><span>إجمالي العملاء</span><strong>${stats.total}</strong></div>
        <div class="stat-card"><span>عملاء جدد</span><strong>${stats.new}</strong></div>
        <div class="stat-card success"><span>مكتمل البيانات</span><strong>${stats.complete}</strong></div>
        <div class="stat-card warning"><span>ناقص البيانات</span><strong>${stats.incomplete}</strong></div>
        <div class="stat-card info"><span>لديهم ملاحظات</span><strong>${stats.withNotes}</strong></div>
    `;
}

// دالة الفلترة والبحث
function applyFilters(customers) {
    const searchInput = document.getElementById('searchCust');
    const classFilter = document.getElementById('classFilter');

    const filter = () => {
        const term = searchInput.value.toLowerCase();
        const classification = classFilter.value;

        const filtered = customers.filter(c => {
            const matchSearch = (c.name || "").toLowerCase().includes(term) || 
                               (c.phone || "").includes(term) || 
                               (c.city || "").toLowerCase().includes(term);
            const matchClass = classification === "" || c.classification === classification;
            return matchSearch && matchClass;
        });
        renderTable(filtered);
    };

    searchInput.oninput = filter;
    classFilter.onchange = filter;
    filter();
}

// رسم الجدول وحل مشكلة undefined
function renderTable(data) {
    const container = document.getElementById('customersTableContainer');
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-msg">لا توجد نتائج مطابقة.</div>`;
        return;
    }

    container.innerHTML = `
        <table class="tera-list-table">
            <thead>
                <tr>
                    <th>العميل</th>
                    <th>الاتصال</th>
                    <th>العنوان الوطني</th>
                    <th>التصنيف</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <img src="${c.avatar || 'https://ui-avatars.com/api/?name=' + (c.name || 'C')}" class="cust-avatar">
                                <div>
                                    <strong>${c.name || 'بدون اسم'}</strong>
                                    <small>ID: ${c.id.slice(0, 6)}</small>
                                </div>
                            </div>
                        </td>
                        <td dir="ltr">
                            <div><i class="fas fa-phone-alt"></i> +${c.phone || ''}</div>
                            ${c.landline ? `<small><i class="fas fa-phone"></i> +${c.landline}</small>` : ''}
                        </td>
                        <td>
                            <div class="addr-info">
                                <span>${c.country || ''} - ${c.city || 'حائل'}</span>
                                <small>${c.district || ''} | ص.ب: ${c.poBox || '-'}</small>
                                <div class="zip-tag">الرمز: ${c.postalCode || '-'}</div>
                            </div>
                        </td>
                        <td><span class="badge ${c.classification}">${c.classification || 'غير مصنف'}</span></td>
                        <td>
                            <div class="row-actions">
                                <button onclick="openCustomerModal('${c.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                                <button onclick="printCustomer('${c.id}')" title="طباعة"><i class="fas fa-print"></i></button>
                                <button onclick="deleteCustomer('${c.id}')" title="حذف" class="btn-del"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// نافذة الإضافة والتعديل المتقدمة 
window.openCustomerModal = async function(id = null) {
    let customer = id ? (await getDoc(doc(db, "customers", id))).data() : null;
    if (id) customer.id = id;

    const modalHTML = `
        <div class="tera-modal-overlay" id="custModal">
            <div class="tera-modal wide">
                <div class="m-header">
                    <h3>${customer ? 'تحديث بيانات: ' + customer.name : 'إضافة عميل جديد'}</h3>
                    <button onclick="document.getElementById('custModal').remove()">&times;</button>
                </div>
                <form id="saveCustForm">
                    <div class="m-body">
                        <div class="form-grid">
                            <div class="field">
                                <label>اسم العميل الكامل</label>
                                <input type="text" id="f_name" value="${customer?.name || ''}" required>
                            </div>
                            <div class="field">
                                <label>البريد الإلكتروني</label>
                                <input type="email" id="f_email" value="${customer?.email || ''}">
                            </div>
                            <div class="field">
                                <label>الدولة</label>
                                <select id="f_country">
                                    ${worldCountries.map(ct => `<option value="${ct.name}" data-code="${ct.code}" ${customer?.country === ct.name ? 'selected' : ''}>${ct.flag} ${ct.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="field">
                                <label>رقم الجوال (يبدأ بـ 5)</label>
                                <div class="dual-input">
                                    <span id="f_code_display">+966</span>
                                    <input type="tel" id="f_phone" value="${customer?.phone?.slice(-9) || ''}" placeholder="5xxxxxxxx" required>
                                </div>
                            </div>
                            <div class="field">
                                <label>الهاتف الثابت (اختياري)</label>
                                <input type="tel" id="f_landline" value="${customer?.landline || ''}">
                            </div>
                            <div class="field">
                                <label>تصنيف العميل</label>
                                <select id="f_class">
                                    <option value="">اختر تصنيفاً</option>
                                    <option value="مميز" ${customer?.classification === 'مميز' ? 'selected' : ''}>عميل مميز</option>
                                    <option value="محتال" ${customer?.classification === 'محتال' ? 'selected' : ''}>عميل محتال</option>
                                    <option value="غير جدي" ${customer?.classification === 'غير جدي' ? 'selected' : ''}>غير جدي</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-grid mt-20">
                            <div class="field"><label>المدينة</label><input type="text" id="f_city" value="${customer?.city || 'حائل'}"></div>
                            <div class="field"><label>الحي</label><input type="text" id="f_dist" value="${customer?.district || ''}"></div>
                            <div class="field"><label>الشارع</label><input type="text" id="f_street" value="${customer?.street || ''}"></div>
                            <div class="field"><label>رقم المبنى</label><input type="text" id="f_build" value="${customer?.buildingNo || ''}"></div>
                            <div class="field"><label>الرقم الإضافي</label><input type="text" id="f_add" value="${customer?.additionalNo || ''}"></div>
                            <div class="field"><label>صندوق البريد</label><input type="text" id="f_pobox" value="${customer?.poBox || ''}" oninput="document.getElementById('f_zip').value = this.value"></div>
                            <div class="field"><label>الرمز البريدي</label><input type="text" id="f_zip" value="${customer?.postalCode || ''}"></div>
                        </div>

                        <div class="field full mt-20">
                            <label>ملاحظات (محرر متقدم)</label>
                            <textarea id="f_notes" rows="4">${customer?.notes || ''}</textarea>
                        </div>
                    </div>
                    <div class="m-footer">
                        <button type="submit" class="btn-save">حفظ العميل</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // معالجة الحفظ
    document.getElementById('saveCustForm').onsubmit = async (e) => {
        e.preventDefault();
        const code = document.getElementById('f_country').selectedOptions[0].dataset.code;
        const data = {
            name: document.getElementById('f_name').value,
            email: document.getElementById('f_email').value,
            country: document.getElementById('f_country').value,
            phone: code + document.getElementById('f_phone').value.replace(/^0/, ''),
            landline: document.getElementById('f_landline').value,
            city: document.getElementById('f_city').value,
            district: document.getElementById('f_dist').value,
            street: document.getElementById('f_street').value,
            buildingNo: document.getElementById('f_build').value,
            additionalNo: document.getElementById('f_add').value,
            poBox: document.getElementById('f_pobox').value,
            postalCode: document.getElementById('f_zip').value,
            classification: document.getElementById('f_class').value,
            notes: document.getElementById('f_notes').value,
            updatedAt: serverTimestamp()
        };

        if (customer) {
            await updateDoc(doc(db, "customers", customer.id), data);
        } else {
            data.createdAt = serverTimestamp();
            await setDoc(doc(collection(db, "customers")), data);
        }
        document.getElementById('custModal').remove();
    };
};
