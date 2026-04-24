/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء الشامل - Tera Gateway
 * يدعم: الإضافة، التعديل، الحذف، والربط مع Firestore
 */

import { db } from '../core/config.js';
// استيراد وظائف Firestore (تأكد من تهيئتها في ملف config)
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// قائمة مفاتيح الدول
const countries = [
    { name: "السعودية", code: "+966", flag: "🇸🇦", len: 9 },
    { name: "الإمارات", code: "+971", flag: "🇦🇪", len: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", len: 8 },
    { name: "عمان", code: "+968", flag: "🇴🇲", len: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", len: 10 }
];

/**
 * فتح نافذة العميل (إضافة أو تعديل)
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
                <div class="section">
                    <h3 class="section-title"><i class="fas fa-user-circle"></i> البيانات الشخصية</h3>
                    <div class="field-row">
                        <div class="input-block full">
                            <label>اسم العميل الكامل</label>
                            <input type="text" id="cust-name" value="${customerData?.name || ''}" placeholder="الاسم كما هو في الهوية" required>
                        </div>
                    </div>
                    
                    <div class="field-row">
                        <div class="input-block flex-1">
                            <label>مفتاح الدولة</label>
                            <select id="cust-country-code">
                                ${countries.map(c => `<option value="${c.code}" ${customerData?.countryCode === c.code ? 'selected' : ''}>${c.flag} ${c.code}</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-block flex-2">
                            <label>رقم الجوال (يبدأ بـ 5)</label>
                            <input type="tel" id="cust-phone" value="${customerData?.phone || ''}" placeholder="5xxxxxxxx" required>
                        </div>
                        <div class="input-block flex-2">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="cust-email" value="${customerData?.email || ''}" placeholder="name@example.com">
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3 class="section-title"><i class="fas fa-map-marker-alt"></i> تفاصيل العنوان الوطني</h3>
                    <div class="field-row">
                        <div class="input-block">
                            <label>الدولة</label>
                            <input type="text" id="cust-country-name" value="${customerData?.countryName || 'المملكة العربية السعودية'}" placeholder="مثال: السعودية">
                        </div>
                        <div class="input-block">
                            <label>المدينة</label>
                            <input type="text" id="cust-city" value="${customerData?.city || ''}" placeholder="مثال: حائل">
                        </div>
                    </div>
                    
                    <div class="field-row">
                        <div class="input-block flex-2">
                            <label>الحي</label>
                            <input type="text" id="cust-district" value="${customerData?.district || ''}" placeholder="مثال: النقرة">
                        </div>
                        <div class="input-block flex-2">
                            <label>الشارع</label>
                            <input type="text" id="cust-street" value="${customerData?.street || ''}" placeholder="اسم الشارع">
                        </div>
                    </div>

                    <div class="field-row">
                        <div class="input-block">
                            <label>رقم المبنى</label>
                            <input type="text" id="cust-building" value="${customerData?.buildingNo || ''}" maxlength="5">
                        </div>
                        <div class="input-block">
                            <label>الرقم الإضافي</label>
                            <input type="text" id="cust-additional" value="${customerData?.additionalNo || ''}" maxlength="4">
                        </div>
                        <div class="input-block">
                            <label>الرمز البريدي / الصندوق</label>
                            <input type="text" id="cust-zip" value="${customerData?.postalCode || ''}" placeholder="أدخل الرمز البريدي">
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3 class="section-title"><i class="fas fa-pen-fancy"></i> ملاحظات العميل (محرر متقدم)</h3>
                    <div class="rich-editor-container">
                        <div class="editor-toolbar">
                            <button type="button" onclick="execCmd('bold')"><b>B</b></button>
                            <button type="button" onclick="execCmd('italic')"><i>I</i></button>
                            <button type="button" onclick="execCmd('insertUnorderedList')">• القائمة</button>
                        </div>
                        <div id="cust-notes" class="rich-editor" contenteditable="true">
                            ${customerData?.notes || 'لا توجد ملاحظات...'}
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" onclick="this.closest('#customer-modal').remove()" class="btn-cancel">إلغاء</button>
                    <button type="submit" class="btn-save">${isEdit ? 'تحديث البيانات' : 'حفظ العميل'}</button>
                </div>
            </form>
        </div>
    </div>

    <style>
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; direction: rtl; }
        .modal-content { background: white; width: 90%; max-width: 800px; border-radius: 12px; max-height: 90vh; overflow-y: auto; padding: 0; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fcfcfc; }
        .section { padding: 20px; border-bottom: 1px solid #f9f9f9; }
        .section-title { font-size: 0.95rem; color: #e67e22; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-weight: bold; }
        
        .field-row { display: flex; gap: 15px; margin-bottom: 15px; }
        .input-block { display: flex; flex-direction: column; flex: 1; }
        .input-block label { font-size: 0.8rem; font-weight: bold; color: #666; margin-bottom: 5px; }
        .input-block input, .input-block select { padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; }
        
        /* محرر النصوص */
        .rich-editor-container { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
        .editor-toolbar { background: #f5f5f5; padding: 5px; border-bottom: 1px solid #ddd; display: flex; gap: 5px; }
        .editor-toolbar button { padding: 5px 10px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 3px; font-size: 0.8rem; }
        .rich-editor { min-height: 100px; padding: 10px; outline: none; background: white; line-height: 1.6; }

        .modal-actions { padding: 20px; background: #f9f9f9; display: flex; justify-content: flex-end; gap: 10px; }
        .btn-save { background: #27ae60; color: white; border: none; padding: 10px 30px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .btn-cancel { background: #ddd; border: none; padding: 10px 30px; border-radius: 6px; cursor: pointer; }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // التعامل مع حفظ النموذج
    const form = document.getElementById('customer-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('cust-name').value,
            countryCode: document.getElementById('cust-country-code').value,
            phone: document.getElementById('cust-phone').value,
            email: document.getElementById('cust-email').value,
            countryName: document.getElementById('cust-country-name').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-building').value,
            additionalNo: document.getElementById('cust-additional').value,
            postalCode: document.getElementById('cust-zip').value,
            notes: document.getElementById('cust-notes').innerHTML,
            updatedAt: new Date().toISOString()
        };

        try {
            if (isEdit) {
                // تحديث عميل قديم
                const customerRef = doc(db, "customers", customerData.id);
                await updateDoc(customerRef, data);
                alert("تم تحديث بيانات العميل بنجاح");
            } else {
                // إضافة عميل جديد
                data.createdAt = new Date().toISOString();
                await addDoc(collection(db, "customers"), data);
                alert("تم إضافة العميل الجديد بنجاح");
            }
            document.getElementById('customer-modal').remove();
            // هنا يفضل استدعاء دالة تحديث الجدول الرئيسي
        } catch (error) {
            console.error("Error saving customer: ", error);
            alert("حدث خطأ أثناء حفظ البيانات");
        }
    };
}

// دالة محرر النصوص البسيطة
window.execCmd = (cmd) => {
    document.execCommand(cmd, false, null);
};
