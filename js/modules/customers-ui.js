/**
 * customers-ui.js - Fi-Khidmatik Professional UI
 * موديول واجهة المستخدم - الإصلاح الشامل للمسارات والحقول الـ 17
 */

import * as Core from '../core/customers-core.js';

let editingId = null;
let quill = null; 

// 1. الدالة الرئيسية لبناء الواجهة
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث في قاعدة بيانات العملاء...">
                </div>
                <div class="button-group">
                    <button class="btn-action edit" onclick="openAddCustomer()" title="إضافة عميل جديد">
                        <i class="fas fa-plus"></i> إضافة عميل
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>رقم الجوال</th>
                            <th>المدينة</th>
                            <th>التصنيف</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align:center;">جاري تحميل بيانات العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">بيانات العميل</h3>
                    <button onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="event.preventDefault(); saveCustomer();">
                        <div class="form-grid">
                            <div class="input-group full-width" style="text-align:center;">
                                <img id="cust-image-preview" src="https://ui-avatars.com/api/?name=C" class="preview-img">
                                <input type="hidden" id="cust-image-url">
                            </div>

                            <div class="input-group"><label>اسم العميل الكامل</label><input type="text" id="cust-name" required></div>
                            <div class="input-group"><label>مفتاح الدولة</label><input type="text" id="cust-countryCode" value="+966"></div>
                            <div class="input-group"><label>رقم الجوال</label><input type="text" id="cust-phone" required></div>
                            <div class="input-group"><label>البريد الإلكتروني</label><input type="email" id="cust-email"></div>
                            <div class="input-group"><label>الدولة</label><input type="text" id="cust-country" value="المملكة العربية السعودية"></div>
                            <div class="input-group"><label>المدينة</label><input type="text" id="cust-city"></div>
                            <div class="input-group"><label>الحي</label><input type="text" id="cust-district"></div>
                            <div class="input-group"><label>الشارع</label><input type="text" id="cust-street"></div>
                            <div class="input-group"><label>رقم المبنى</label><input type="text" id="cust-buildingNo"></div>
                            <div class="input-group"><label>الرقم الإضافي</label><input type="text" id="cust-additionalNo"></div>
                            <div class="input-group"><label>الرمز البريدي</label><input type="text" id="cust-postalCode"></div>
                            <div class="input-group"><label>صندوق البريد</label><input type="text" id="cust-poBox"></div>
                            <div class="input-group">
                                <label>تصنيف العميل</label>
                                <select id="cust-tag">
                                    <option value="regular">Regular</option>
                                    <option value="vip">VIP</option>
                                    <option value="company">Company</option>
                                    <option value="individual">Individual</option>
                                </select>
                            </div>

                            <div class="input-group full-width">
                                <label>الملاحظات (محرر احترافي)</label>
                                <div id="editor-container" style="height: 150px; background: #fff;"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn-save">حفظ البيانات في تيرا</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    initQuillEditor();
    setupBridge();
    await renderCustomerTable();
}

// 2. تهيئة محرر النصوص
function initQuillEditor() {
    if (document.getElementById('editor-container')) {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            placeholder: 'اكتب ملاحظات العميل هنا...',
            modules: { toolbar: true }
        });
    }
}

// 3. عرض بيانات الجدول
export async function renderCustomerTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    const snapshot = await Core.fetchAllCustomers();
    tbody.innerHTML = '';

    snapshot.forEach(doc => {
        const d = doc.data();
        tbody.innerHTML += `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${d.image || 'https://ui-avatars.com/api/?name='+d.name}" width="30" style="border-radius:50%">
                        ${d.name}
                    </div>
                </td>
                <td>${d.countryCode} ${d.phone}</td>
                <td>${d.city || '---'}</td>
                <td><span class="tag-${d.tag}">${d.tag}</span></td>
                <td class="sticky-actions">
                    <button class="btn-action edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// 4. الربط مع النافذة (Window Bridge)
function setupBridge() {
    window.openAddCustomer = () => {
        editingId = null;
        document.getElementById('customer-form').reset();
        if(quill) quill.root.innerHTML = '';
        document.getElementById('modal-title').innerText = "➕ إضافة عميل جديد";
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.closeCustomerModal = () => {
        document.getElementById('customer-modal').style.display = 'none';
    };

    window.editCustomer = async (id) => {
        editingId = id;
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        // تعبئة الـ 17 حقل
        document.getElementById('cust-name').value = d.name || '';
        document.getElementById('cust-phone').value = d.phone || '';
        document.getElementById('cust-countryCode').value = d.countryCode || '+966';
        document.getElementById('cust-email').value = d.email || '';
        document.getElementById('cust-country').value = d.country || '';
        document.getElementById('cust-city').value = d.city || '';
        document.getElementById('cust-district').value = d.district || '';
        document.getElementById('cust-street').value = d.street || '';
        document.getElementById('cust-buildingNo').value = d.buildingNo || '';
        document.getElementById('cust-additionalNo').value = d.additionalNo || '';
        document.getElementById('cust-postalCode').value = d.postalCode || '';
        document.getElementById('cust-poBox').value = d.poBox || '';
        document.getElementById('cust-tag').value = d.tag || 'regular';
        
        const imgPrev = document.getElementById('cust-image-preview');
        if(imgPrev) imgPrev.src = d.image || `https://ui-avatars.com/api/?name=${d.name}`;
        
        if (quill) quill.root.innerHTML = d.notes || '';

        document.getElementById('modal-title').innerText = "✏️ تعديل بيانات العميل";
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.saveCustomer = async () => {
        const data = {
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            countryCode: document.getElementById('cust-countryCode').value,
            email: document.getElementById('cust
