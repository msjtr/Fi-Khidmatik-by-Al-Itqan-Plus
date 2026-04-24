/**
 * نظام إدارة العملاء الشامل - Tera Gateway v3.0
 * يشمل: محرر نصوص، إرفاق صور، وتفاصيل العنوان الوطني الكاملة
 */

import { db } from '../core/config.js';

// قائمة الدول مع مفاتيح الاتصال
const countryList = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦" },
    { name: "الإمارات", code: "+971", flag: "🇦🇪" },
    { name: "مصر", code: "+20", flag: "🇪🇬" }
];

export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const now = new Date();
    const formattedDate = isEdit ? customer.createdAt : `${now.toLocaleDateString('ar-SA')} | ${now.toLocaleTimeString('ar-SA')}`;

    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <div class="header-title">
                    <i class="fas ${isEdit ? 'fa-user-edit' : 'fa-user-plus'}"></i>
                    <span>${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</span>
                </div>
                <button onclick="document.getElementById('customer-modal').remove()" class="close-btn">&times;</button>
            </div>
            
            <form id="customer-form" class="customer-form">
                <div class="profile-intro">
                    <div class="avatar-upload">
                        <div class="avatar-preview" id="imagePreview" style="background-image: url('${customer?.photoURL || 'https://via.placeholder.com/100'}');"></div>
                        <label for="imageUpload" class="upload-label"><i class="fas fa-camera"></i></label>
                        <input type="file" id="imageUpload" accept="image/*" style="display:none" onchange="previewFile()">
                    </div>
                    <div class="timestamp-info">
                        <small>تاريخ الإضافة:</small>
                        <strong>${formattedDate}</strong>
                    </div>
                </div>

                <div class="form-section">
                    <h3>البيانات الأساسية</h3>
                    <div class="input-row">
                        <div class="field-box">
                            <label>الاسم الكامل للعميل</label>
                            <input type="text" id="cust-name" value="${customer?.name || ''}" placeholder="الاسم كما في الهوية" required>
                        </div>
                        <div class="field-box">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="cust-email" value="${customer?.email || ''}" placeholder="example@mail.com">
                        </div>
                    </div>
                    
                    <div class="input-row">
                        <div class="field-box">
                            <label>دولة الجوال</label>
                            <select id="cust-country">
                                ${countryList.map(c => `<option value="${c.code}" ${customer?.phone?.startsWith(c.code.replace('+','')) ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="field-box">
                            <label>رقم الجوال (يبدأ بـ 5)</label>
                            <input type="tel" id="cust-phone" value="${customer?.phone?.replace('966','') || ''}" placeholder="5xxxxxxxx" required>
                        </div>
                        <div class="field-box">
                            <label>الهاتف الثابت (اختياري)</label>
                            <input type="tel" id="cust-landline" value="${customer?.landline || ''}" placeholder="رقم الأرضي">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>تفاصيل العنوان الوطني</h3>
                    <div class="input-row">
                        <div class="field-box">
                            <label>المدينة</label>
                            <input type="text" id="cust-city" value="${customer?.city || ''}" placeholder="مثال: حائل">
                        </div>
                        <div class="field-box">
                            <label>الحي</label>
                            <input type="text" id="cust-district" value="${customer?.district || ''}" placeholder="مثال: النقرة">
                        </div>
                        <div class="field-box">
                            <label>اسم الشارع</label>
                            <input type="text" id="cust-street" value="${customer?.street || ''}" placeholder="مثال: سعد المشاط">
                        </div>
                    </div>
                    <div class="input-row">
                        <div class="field-box">
                            <label>رقم المبنى</label>
                            <input type="text" id="cust-building" value="${customer?.buildingNo || ''}" placeholder="88043">
                        </div>
                        <div class="field-box">
                            <label>الرقم الإضافي</label>
                            <input type="text" id="cust-additional" value="${customer?.additionalNo || ''}" placeholder="7714">
                        </div>
                        <div class="field-box">
                            <label>الرمز البريدي</label>
                            <input type="text" id="cust-zip" value="${customer?.postalCode || ''}" placeholder="55421">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>ملاحظات العميل وإرفاق الملفات</h3>
                    <div class="rich-editor">
                        <div class="editor-toolbar">
                            <button type="button" onclick="formatDoc('bold')"><b>B</b></button>
                            <button type="button" onclick="formatDoc('italic')"><i>I</i></button>
                            <button type="button" onclick="formatDoc('insertUnorderedList')"><i class="fas fa-list-ul"></i></button>
                            <button type="button" onclick="document.getElementById('noteAttach').click()"><i class="fas fa-paperclip"></i> إرفاق صورة</button>
                        </div>
                        <div id="cust-notes" class="editor-body" contenteditable="true">${customer?.notes || 'اكتب ملاحظاتك هنا...'}</div>
                        <input type="file" id="noteAttach" style="display:none" onchange="attachImageToNote()">
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn-primary">حفظ كافة البيانات</button>
                </div>
            </form>
        </div>
    </div>

    <style>
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #fff; width: 850px; max-height: 90vh; border-radius: 15px; overflow-y: auto; direction: rtl; }
        .modal-header { display: flex; justify-content: space-between; padding: 20px; background: #f8fafc; border-bottom: 1px solid #eee; border-radius: 15px 15px 0 0; }
        .close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #94a3b8; }
        
        .profile-intro { display: flex; align-items: center; gap: 20px; padding: 20px; border-bottom: 1px dashed #eee; }
        .avatar-upload { position: relative; width: 80px; height: 80px; }
        .avatar-preview { width: 100%; height: 100%; border-radius: 50%; background-size: cover; border: 3px solid #e67e22; }
        .upload-label { position: absolute; bottom: 0; right: 0; background: #e67e22; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.7rem; }
        
        .form-section { padding: 20px; }
        .form-section h3 { font-size: 1rem; color: #e67e22; margin-bottom: 15px; border-right: 4px solid #e67e22; padding-right: 10px; }
        
        .input-row { display: flex; gap: 15px; margin-bottom: 15px; }
        .field-box { display: flex; flex-direction: column; flex: 1; }
        .field-box label { font-size: 0.85rem; font-weight: bold; color: #475569; margin-bottom: 6px; }
        .field-box input, .field-box select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; }
        
        /* محرر النصوص */
        .rich-editor { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
        .editor-toolbar { background: #f1f5f9; padding: 10px; border-bottom: 1px solid #cbd5e1; display: flex; gap: 10px; }
        .editor-toolbar button { background: white; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
        .editor-body { padding: 15px; min-height: 120px; outline: none; }

        .btn-primary { background: #16a34a; color: white; border: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-size: 1.1rem; }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // وظائف المحرر والمعاينة
    window.previewFile = function() {
        const file = document.getElementById('imageUpload').files[0];
        const reader = new FileReader();
        reader.onloadend = () => document.getElementById('imagePreview').style.backgroundImage = `url(${reader.result})`;
        if (file) reader.readAsDataURL(file);
    };

    window.formatDoc = (cmd) => document.execCommand(cmd, false, null);
    
    window.attachImageToNote = function() {
        const file = document.getElementById('noteAttach').files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = `<img src="${e.target.result}" style="max-width:200px; border-radius:8px; margin:10px;">`;
            document.getElementById('cust-notes').innerHTML += img;
        };
        if (file) reader.readAsDataURL(file);
    };
}
