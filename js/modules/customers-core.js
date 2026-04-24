/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway
 * التحديث الأخير: ربط كامل مع Firebase وتحسينات الواجهة
 */

import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const countryData = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات العربية المتحدة", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", phoneLen: 10 },
    { name: "الأردن", code: "+962", flag: "🇯🇴", phoneLen: 9 }
];

/**
 * 1. الدالة الرئيسية لتشغيل موديول العملاء
 */
export async function initCustomers(container) {
    container.innerHTML = `
        <div class="module-header">
            <div>
                <h1>دليل العملاء</h1>
                <p>إدارة بيانات العملاء وعناوينهم الوطنية</p>
            </div>
            <button id="add-customer-btn" class="btn-primary">
                <i class="fas fa-plus"></i> إضافة عميل جديد
            </button>
        </div>
        
        <div class="table-container">
            <table class="tera-table">
                <thead>
                    <tr>
                        <th>الاسم الكامل</th>
                        <th>رقم الجوال</th>
                        <th>المدينة / الحي</th>
                        <th>ملاحظات</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list">
                    <tr><td colspan="5" style="text-align:center;">جاري تحميل العملاء...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openCustomerModal();
    loadCustomers();
}

/**
 * 2. جلب وتحميل العملاء من Firebase
 */
async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    try {
        const q = query(collection(db, "customers"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        listBody.innerHTML = '';

        if (querySnapshot.empty) {
            listBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            listBody.innerHTML += `
                <tr>
                    <td><strong>${data.name}</strong></td>
                    <td dir="ltr" style="text-align:right;">${data.phone}</td>
                    <td>${data.city} - ${data.district || 'غير محدد'}</td>
                    <td><small>${data.notes || '-'}</small></td>
                    <td>
                        <button class="action-btn edit" onclick="editCustomer('${id}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteCustomer('${id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading customers:", error);
        listBody.innerHTML = '<tr><td colspan="5" style="color:red;">فشل تحميل البيانات.</td></tr>';
    }
}

/**
 * 3. فتح نافذة العميل (إضافة/تعديل)
 */
export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const selectedCountry = isEdit ? (countryData.find(c => customer.phone.startsWith(c.code)) || countryData[0]) : countryData[0];

    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas ${isEdit ? 'fa-user-edit' : 'fa-user-plus'}"></i> ${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button type="button" id="close-modal" class="close-btn">&times;</button>
            </div>
            
            <form id="customer-form" class="customer-form">
                <div class="form-section">
                    <h3><i class="fas fa-id-card"></i> البيانات الأساسية</h3>
                    <div class="input-group full">
                        <label>الاسم الكامل</label>
                        <input type="text" id="cust-name" value="${customer?.name || ''}" required>
                    </div>
                    <div class="row">
                        <div class="input-group">
                            <label>الدولة</label>
                            <select id="cust-country-select">
                                ${countryData.map(c => `<option value="${c.code}" data-len="${c.phoneLen}" ${selectedCountry.code === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-group flex-2">
                            <label>رقم الجوال</label>
                            <div class="phone-wrapper">
                                <span id="prefix-display">${selectedCountry.code}</span>
                                <input type="tel" id="cust-phone" dir="ltr" value="${isEdit ? customer.phone.replace(selectedCountry.code, '') : ''}" required>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-map-marked-alt"></i> العنوان الوطني</h3>
                    <div class="row">
                        <div class="input-group">
                            <label>المدينة</label>
                            <input type="text" id="cust-city" value="${customer?.city || 'حائل'}" required>
                        </div>
                        <div class="input-group">
                            <label>الحي</label>
                            <input type="text" id="cust-district" value="${customer?.district || ''}">
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-group">
                            <label>رقم المبنى</label>
                            <input type="text" id="cust-building" value="${customer?.buildingNo || ''}" maxlength="5">
                        </div>
                        <div class="input-group">
                            <label>الرمز البريدي</label>
                            <input type="text" id="cust-zip" value="${customer?.postalCode || ''}">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-edit"></i> ملاحظات</h3>
                    <textarea id="cust-notes" rows="2">${customer?.notes || ''}</textarea>
                </div>

                <div class="modal-footer">
                    <button type="button" id="cancel-modal" class="btn-cancel">إلغاء</button>
                    <button type="submit" class="btn-save">${isEdit ? 'تحديث' : 'حفظ'}</button>
                </div>
            </form>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // معالجة إغلاق النافذة
    const closeModal = () => document.getElementById('customer-modal').remove();
    document.getElementById('close-modal').onclick = closeModal;
    document.getElementById('cancel-modal').onclick = closeModal;

    // تحديث المفتاح عند تغيير الدولة
    document.getElementById('cust-country-select').onchange = (e) => {
        document.getElementById('prefix-display').innerText = e.target.value;
    };

    // معالجة الحفظ
    document.getElementById('customer-form').onsubmit = async (e) => {
        e.preventDefault();
        if (window.toggleLoader) window.toggleLoader(true);

        const countryCode = document.getElementById('cust-country-select').value;
        const phoneSuffix = document.getElementById('cust-phone').value.trim();

        const customerData = {
            name: document.getElementById('cust-name').value.trim(),
            phone: countryCode + phoneSuffix,
            city: document.getElementById('cust-city').value.trim(),
            district: document.getElementById('cust-district').value.trim(),
            buildingNo: document.getElementById('cust-building').value.trim(),
            postalCode: document.getElementById('cust-zip').value.trim(),
            notes: document.getElementById('cust-notes').value.trim(),
            updatedAt: new Date()
        };

        try {
            if (isEdit) {
                await updateDoc(doc(db, "customers", customer.id), customerData);
            } else {
                customerData.createdAt = new Date();
                await addDoc(collection(db, "customers"), customerData);
            }
            closeModal();
            loadCustomers();
        } catch (error) {
            alert("حدث خطأ أثناء الحفظ: " + error.message);
        } finally {
            if (window.toggleLoader) window.toggleLoader(false);
        }
    };
}

/**
 * 4. دوال التعديل والحذف (تعريفها على window لتصل إليها أزرار الجدول)
 */
window.editCustomer = async (id) => {
    // جلب بيانات العميل أولاً
    const querySnapshot = await getDocs(collection(db, "customers"));
    const docSnap = querySnapshot.docs.find(d => d.id === id);
    if (docSnap) {
        openCustomerModal({ id, ...docSnap.data() });
    }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذه الخطوة.")) {
        if (window.toggleLoader) window.toggleLoader(true);
        try {
            await deleteDoc(doc(db, "customers", id));
            loadCustomers();
        } catch (error) {
            alert("فشل الحذف: " + error.message);
        } finally {
            if (window.toggleLoader) window.toggleLoader(false);
        }
    }
};
