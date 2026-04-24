/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway
 * يتضمن: العرض، البحث، الإضافة، التعديل، والملاحظات المتقدمة
 */

import { db } from '../core/config.js';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة مفاتيح الدول
const countries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦", len: 9 },
    { name: "الإمارات", code: "971", flag: "🇦🇪", len: 9 },
    { name: "الكويت", code: "965", flag: "🇰🇼", len: 8 },
    { name: "عمان", code: "968", flag: "🇴🇲", len: 8 },
    { name: "مصر", code: "20", flag: "🇪🇬", len: 10 }
];

/**
 * الوظيفة الرئيسية المطلوبة (Export Named)
 * تقوم بتهيئة الصفحة وعرض جدول العملاء
 */
export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم شريط الأدوات (البحث وزر الإضافة)
    container.innerHTML = `
        <div class="table-toolbar">
            <div class="toolbar-right">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="customer-search" placeholder="ابحث بالاسم أو رقم الجوال..." oninput="window.filterCustomers(this.value)">
                </div>
            </div>
            <div class="toolbar-left">
                <button class="btn-add" id="btn-add-customer">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>
        </div>
        <div id="customers-list-container">
            <div class="loading-state">جاري تحميل قائمة العملاء...</div>
        </div>
    `;

    // ربط زر الإضافة
    document.getElementById('btn-add-customer').onclick = () => openCustomerModal();

    // 2. جلب البيانات من Firebase وعرضها
    refreshCustomerTable();
}

/**
 * جلب البيانات وعرض الجدول
 */
async function refreshCustomerTable() {
    const container = document.getElementById('customers-list-container');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const customers = [];
        querySnapshot.forEach((doc) => customers.push({ id: doc.id, ...doc.data() }));

        renderTable(container, customers);
    } catch (error) {
        container.innerHTML = `<div class="error">خطأ في جلب البيانات: ${error.message}</div>`;
    }
}

/**
 * رسم الجدول
 */
function renderTable(container, customers) {
    if (customers.length === 0) {
        container.innerHTML = `<div class="empty-state">لا يوجد عملاء مضافين حالياً.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="main-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>المدينة / الحي</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(c => `
                        <tr>
                            <td>
                                <div class="user-cell">
                                    <div class="user-icon">${c.name.charAt(0)}</div>
                                    <div class="user-info">
                                        <strong>${c.name}</strong>
                                        <span>ID: ${c.id.slice(-5)}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="contact-cell">
                                    <span dir="ltr">+${c.countryCode} ${c.phone}</span>
                                    <small>${c.email || ''}</small>
                                </div>
                            </td>
                            <td>${c.city} - ${c.district}</td>
                            <td>
                                <div class="actions">
                                    <button onclick="window.editCustomerUI('${c.id}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                                    <button onclick="window.deleteCustomerUI('${c.id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // ربط وظائف التعديل والحذف بالنافذة العالمية
    window.editCustomerUI = async (id) => {
        const c = customers.find(x => x.id === id);
        openCustomerModal(c);
    };
}

/**
 * نافذة الإضافة والتعديل (Modal)
 */
export async function openCustomerModal(customerData = null) {
    const isEdit = !!customerData;
    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button type="button" onclick="this.closest('#customer-modal').remove()" class="close-btn">&times;</button>
            </div>
            <form id="customer-form">
                <div class="form-body">
                    <div class="section-box">
                        <h3 class="section-h">البيانات الشخصية</h3>
                        <div class="f-row">
                            <div class="i-group full">
                                <label>الاسم الكامل</label>
                                <input type="text" id="cust-name" value="${customerData?.name || ''}" required>
                            </div>
                        </div>
                        <div class="f-row">
                            <div class="i-group">
                                <label>مفتاح الدولة</label>
                                <select id="cust-country-code">
                                    ${countries.map(c => `<option value="${c.code}" ${customerData?.countryCode === c.code ? 'selected' : ''}>${c.flag} +${c.code}</option>`).join('')}
                                </select>
                            </div>
                            <div class="i-group flex-2">
                                <label>الجوال (يبدأ بـ 5)</label>
                                <input type="tel" id="cust-phone" value="${customerData?.phone || ''}" required maxlength="9">
                            </div>
                        </div>
                    </div>

                    <div class="section-box">
                        <h3 class="section-h">العنوان والملاحظات</h3>
                        <div class="f-row">
                            <div class="i-group"><label>المدينة</label><input type="text" id="cust-city" value="${customerData?.city || ''}"></div>
                            <div class="i-group"><label>الحي</label><input type="text" id="cust-district" value="${customerData?.district || ''}"></div>
                        </div>
                        <div class="i-group full" style="margin-top:10px">
                            <label>ملاحظات متقدمة</label>
                            <div id="cust-notes" class="editor-area" contenteditable="true" style="border:1px solid #ddd; min-height:80px; padding:10px; border-radius:5px">
                                ${customerData?.notes || ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" onclick="this.closest('#customer-modal').remove()" class="btn-secondary">إلغاء</button>
                    <button type="submit" class="btn-primary">حفظ</button>
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
            countryCode: document.getElementById('cust-country-code').value,
            phone: document.getElementById('cust-phone').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            notes: document.getElementById('cust-notes').innerHTML,
            updatedAt: new Date().toISOString()
        };

        if (isEdit) {
            await updateDoc(doc(db, "customers", customerData.id), data);
        } else {
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db, "customers"), data);
        }
        document.getElementById('customer-modal').remove();
        refreshCustomerTable();
    };
}
