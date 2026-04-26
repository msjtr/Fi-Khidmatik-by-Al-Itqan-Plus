/**
 * customers-ui.js - Fi-Khidmatik Professional UI
 * تم تصحيح مسار الاستيراد ليتطابق مع مسارك الفعلي
 */

// التصحيح الأهم: استدعاء الملف من نفس المجلد (js/modules/)
import * as Core from './customers-core.js';

let editingId = null;
let quill = null; 

// تصحيح مسار الصورة ليعمل على GitHub Pages أو استخدام البديل
const DEFAULT_AVATAR = '/fi-khidmatik/assets/default-avatar.png';
const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=C&background=random';

export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="toolbar-card">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث في العملاء...">
                </div>
                <div class="button-group">
                    <button class="btn-action edit" onclick="openAddCustomer()">
                        <i class="fas fa-user-plus"></i> إضافة عميل جديد
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>المدينة</th>
                            <th>التصنيف</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align:center;">جاري تحميل بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">بيانات العميل</h3>
                    <button type="button" onclick="closeCustomerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form" onsubmit="event.preventDefault(); saveCustomer();">
                        <div class="form-grid">
                            <div class="input-group full-width" style="text-align:center;">
                                <img id="cust-image-preview" src="${FALLBACK_AVATAR}" class="preview-img" onerror="this.src='${FALLBACK_AVATAR}'">
                                <input type="hidden" id="cust-image-url">
                            </div>
                            <div class="input-group"><label>الاسم الكامل</label><input type="text" id="cust-name" required></div>
                            <div class="input-group"><label>مفتاح الدولة</label><input type="text" id="cust-countryCode" value="+966"></div>
                            <div class="input-group"><label>رقم الجوال</label><input type="text" id="cust-phone" required></div>
                            <div class="input-group"><label>البريد الإلكتروني</label><input type="email" id="cust-email"></div>
                            <div class="input-group"><label>الدولة</label><input type="text" id="cust-country" value="المملكة العربية السعودية"></div>
                            <div class="input-group"><label>المدينة</label><input type="text" id="cust-city"></div>
                            <div class="input-group"><label>الحي</label><input type="text" id="cust-district"></div>
                            <div class="input-group"><label>الشارع</label><input type="text" id="cust-street"></div>
                            <div class="input-group"><label>المبنى</label><input type="text" id="cust-buildingNo"></div>
                            <div class="input-group"><label>الرقم الإضافي</label><input type="text" id="cust-additionalNo"></div>
                            <div class="input-group"><label>الرمز البريدي</label><input type="text" id="cust-postalCode"></div>
                            <div class="input-group"><label>صندوق البريد</label><input type="text" id="cust-poBox"></div>
                            <div class="input-group">
                                <label>التصنيف</label>
                                <select id="cust-tag">
                                    <option value="regular">Regular</option>
                                    <option value="vip">VIP</option>
                                    <option value="company">Company</option>
                                </select>
                            </div>
                            <div class="input-group full-width">
                                <label>الملاحظات</label>
                                <div id="editor-container" style="height: 120px; background: #fff; border: 1px solid #ddd;"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn-save">حفظ في قاعدة البيانات</button>
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

function initQuillEditor() {
    const el = document.getElementById('editor-container');
    if (el && typeof Quill !== 'undefined') {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: { toolbar: true }
        });
    }
}

export async function renderCustomerTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        tbody.innerHTML = '';

        if (!snapshot || snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا يوجد عملاء مسجلين.</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const d = doc.data();
            const imgSrc = d.image || FALLBACK_AVATAR;
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${imgSrc}" width="30" height="30" style="border-radius:50%; object-fit:cover;" onerror="this.src='${FALLBACK_AVATAR}'">
                            <strong>${d.name || '---'}</strong>
                        </div>
                    </td>
                    <td dir="ltr">${d.countryCode || ''} ${d.phone || ''}</td>
                    <td>${d.city || '---'}</td>
                    <td><span class="tag-badge tag-${d.tag || 'regular'}">${d.tag || 'regular'}</span></td>
                    <td class="sticky-actions">
                        <button class="btn-action edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-pen"></i></button>
                        <button class="btn-action delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        console.error("خطأ في عرض الجدول:", e);
    }
}

function setupBridge() {
    window.openAddCustomer = () => {
        editingId = null;
        const form = document.getElementById('customer-form');
        if (form) form.reset();
        if (quill) quill.setContents([]);
        document.getElementById('cust-image-preview').src = FALLBACK_AVATAR;
        document.getElementById('modal-title').innerText = "➕ إضافة عميل";
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.closeCustomerModal = () => {
        document.getElementById('customer-modal').style.display = 'none';
    };

    window.editCustomer = async (id) => {
        editingId = id;
        const d = await Core.fetchCustomerById(id);
        if (!d) return;

        document.getElementById('cust-name').value = d.name || '';
        document.getElementById('cust-countryCode').value = d.countryCode || '+966';
        document.getElementById('cust-phone').value = d.phone || '';
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
        if(imgPrev) imgPrev.src = d.image || FALLBACK_AVATAR;

        if (quill) quill.root.innerHTML = d.notes || '';

        document.getElementById('modal-title').innerText = "✏️ تعديل العميل";
        document.getElementById('customer-modal').style.display = 'flex';
    };

    window.saveCustomer = async () => {
        const data = {
            name: document.getElementById('cust-name').value,
            countryCode: document.getElementById('cust-countryCode').value,
            phone: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email').value,
            country: document.getElementById('cust-country').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-buildingNo').value,
            additionalNo: document.getElementById('cust-additionalNo').value,
            postalCode: document.getElementById('cust-postalCode').value,
            poBox: document.getElementById('cust-poBox').value,
            tag: document.getElementById('cust-tag').value,
            notes: quill ? quill.root.innerHTML : '',
            image: document.getElementById('cust-image-url').value || FALLBACK_AVATAR
        };

        try {
            if (editingId) await Core.updateCustomer(editingId, data);
            else await Core.addCustomer(data);
            
            window.closeCustomerModal();
            await renderCustomerTable();
        } catch (e) {
            alert("خطأ أثناء الحفظ: " + e.message);
        }
    };

    window.deleteCustomer = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
            await Core.deleteCustomer(id);
            await renderCustomerTable();
        }
    };
}
