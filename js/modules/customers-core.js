/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway
 * الإصدار المطور: إدارة دولية، حقول ذكية، وملاحظات متقدمة
 */

import { db } from '../core/config.js';

// قائمة الدول (أمثلة ويمكن التوسع فيها)
const countryData = [
    { name: "المملكة العربية السعودية", code: "+966", flag: "🇸🇦", phoneLen: 9 },
    { name: "الإمارات العربية المتحدة", code: "+971", flag: "🇦🇪", phoneLen: 9 },
    { name: "الكويت", code: "+965", flag: "🇰🇼", phoneLen: 8 },
    { name: "قطر", code: "+974", flag: "🇶🇦", phoneLen: 8 },
    { name: "سلطنة عمان", code: "+968", flag: "🇴🇲", phoneLen: 8 },
    { name: "البحرين", code: "+973", flag: "🇧🇭", phoneLen: 8 },
    { name: "مصر", code: "+20", flag: "🇪🇬", phoneLen: 10 },
    { name: "الأردن", code: "+962", flag: "🇯🇴", phoneLen: 9 }
];

/**
 * دالة فتح نافذة العميل (للإضافة أو التعديل)
 * @param {Object|null} customer - بيانات العميل في حال التعديل
 */
export function openCustomerModal(customer = null) {
    const isEdit = !!customer;
    const selectedCountry = isEdit ? (countryData.find(c => customer.phone.startsWith(c.code.replace('+', ''))) || countryData[0]) : countryData[0];

    const modalHTML = `
    <div id="customer-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas ${isEdit ? 'fa-user-edit' : 'fa-user-plus'}"></i> ${isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button onclick="document.getElementById('customer-modal').remove()" class="close-btn">&times;</button>
            </div>
            
            <form id="customer-form" class="customer-form">
                <input type="hidden" id="cust-id" value="${customer?.id || ''}">

                <div class="form-section">
                    <h3><i class="fas fa-id-card"></i> البيانات الأساسية والاتصال</h3>
                    <div class="input-group full">
                        <label>الاسم الكامل للعميل</label>
                        <input type="text" id="cust-name" value="${customer?.name || ''}" placeholder="أدخل الاسم الثلاثي أو الرباعي" required>
                    </div>
                    
                    <div class="row">
                        <div class="input-group">
                            <label>دولة الجوال</label>
                            <select id="cust-country-select" onchange="updatePhonePlaceholder()">
                                ${countryData.map(c => `<option value="${c.code}" data-len="${c.phoneLen}" ${selectedCountry.code === c.code ? 'selected' : ''}>${c.flag} ${c.name} (${c.code})</option>`).join('')}
                            </select>
                        </div>
                        <div class="input-group flex-2">
                            <label>رقم الجوال (بدون الصفر الأول)</label>
                            <div class="phone-wrapper">
                                <span id="prefix-display">${selectedCountry.code}</span>
                                <input type="tel" id="cust-phone" value="${isEdit ? customer.phone.replace(selectedCountry.code.replace('+', ''), '') : ''}" placeholder="5xxxxxxxx" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="input-group">
                            <label>الهاتف الثابت (اختياري)</label>
                            <div class="phone-wrapper">
                                <span id="landline-prefix">${selectedCountry.code}</span>
                                <input type="tel" id="cust-landline" value="${customer?.landline || ''}" placeholder="رقم الهاتف الثابت">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>البريد الإلكتروني</label>
                            <input type="email" id="cust-email" value="${customer?.email || ''}" placeholder="example@mail.com">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-map-marked-alt"></i> تفاصيل العنوان الوطني</h3>
                    <div class="row">
                        <div class="input-group">
                            <label>المدينة</label>
                            <input type="text" id="cust-city" value="${customer?.city || 'حائل'}" required>
                        </div>
                        <div class="input-group">
                            <label>الحي</label>
                            <input type="text" id="cust-district" value="${customer?.district || ''}" placeholder="مثال: النقرة">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="input-group">
                            <label>اسم الشارع</label>
                            <input type="text" id="cust-street" value="${customer?.street || ''}">
                        </div>
                        <div class="input-group">
                            <label>رقم المبنى</label>
                            <input type="text" id="cust-building" value="${customer?.buildingNo || ''}" maxlength="5">
                        </div>
                    </div>

                    <div class="row">
                        <div class="input-group">
                            <label>الرقم الإضافي</label>
                            <input type="text" id="cust-additional" value="${customer?.additionalNo || ''}" maxlength="4">
                        </div>
                        <div class="input-group">
                            <label>صندوق البريد (اختياري)</label>
                            <input type="text" id="cust-pobox" oninput="document.getElementById('cust-zip').value = this.value" value="${customer?.poBox || ''}">
                        </div>
                        <div class="input-group">
                            <label>الرمز البريدي</label>
                            <input type="text" id="cust-zip" value="${customer?.postalCode || customer?.poBox || ''}" placeholder="يُسحب من الصندوق">
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3><i class="fas fa-edit"></i> ملاحظات إدارية</h3>
                    <div class="input-group full">
                        <label>وصف حالة العميل أو أي ملاحظات أخرى</label>
                        <textarea id="cust-notes" rows="3" placeholder="سجل هنا أي ملاحظات تهم الموظفين الآخرين...">${customer?.notes || ''}</textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" onclick="document.getElementById('customer-modal').remove()" class="btn-cancel">إلغاء</button>
                    <button type="submit" class="btn-save">${isEdit ? 'تحديث البيانات' : 'حفظ العميل الجديد'}</button>
                </div>
            </form>
        </div>
    </div>

    <style>
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 15px; backdrop-filter: blur(4px); }
        .modal-content { background: #fff; width: 100%; max-width: 750px; border-radius: 12px; max-height: 95vh; overflow-y: auto; direction: rtl; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .modal-header { padding: 15px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-header h2 { font-size: 1.2rem; color: #334155; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #94a3b8; }
        
        .customer-form { padding: 10px 25px 25px; }
        .form-section { margin-top: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .form-section:last-of-type { border-bottom: none; }
        .form-section h3 { font-size: 0.95rem; color: #e67e22; margin-bottom: 15px; border-right: 3px solid #e67e22; padding-right: 10px; }
        
        .row { display: flex; gap: 15px; margin-bottom: 12px; }
        .input-group { display: flex; flex-direction: column; flex: 1; }
        .input-group.full { width: 100%; }
        .input-group label { font-size: 0.8rem; font-weight: bold; color: #64748b; margin-bottom: 6px; }
        
        input, select, textarea { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; outline: none; transition: border 0.2s; }
        input:focus { border-color: #e67e22; }

        .phone-wrapper { display: flex; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; direction: ltr; }
        .phone-wrapper span { padding: 0 12px; color: #64748b; font-weight: bold; font-size: 0.85rem; border-right: 1px solid #cbd5e1; background: #f1f5f9; }
        .phone-wrapper input { border: none; flex: 1; background: transparent; padding-left: 10px; }
        
        .flex-2 { flex: 2; }
        .modal-footer { display: flex; justify-content: flex-start; gap: 10px; padding: 20px 25px; background: #f8fafc; border-radius: 0 0 12px 12px; }
        .btn-save { background: #16a34a; color: white; border: none; padding: 10px 25px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .btn-cancel { background: #e2e8f0; border: none; padding: 10px 25px; border-radius: 6px; cursor: pointer; color: #475569; }
        
        @media (max-width: 600px) { .row { flex-direction: column; } }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // دالة تحديث المفاتيح عند تغيير الدولة
    window.updatePhonePlaceholder = function() {
        const select = document.getElementById('cust-country-select');
        const code = select.value;
        document.getElementById('prefix-display').innerText = code;
        document.getElementById('landline-prefix').innerText = code;
    };
}
