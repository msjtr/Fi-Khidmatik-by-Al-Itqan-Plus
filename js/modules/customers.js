/**
 * js/modules/customers.js
 * موديول إدارة العملاء - تيرا جيتواي
 * يدعم تفاصيل العنوان الوطني والبيانات الشخصية
 */

import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===================== دوال مساعدة =====================

/**
 * منع هجمات XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * التحقق من صحة رقم الجوال (رقم سعودي)
 */
function validatePhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(05|5)[0-9]{8}$/;
    return phoneRegex.test(cleanPhone);
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
function validateEmail(email) {
    if (!email) return true; // البريد الإلكتروني اختياري
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * التحقق من صحة بيانات العميل
 */
function validateCustomerData(data) {
    const errors = [];
    
    // التحقق من الاسم
    if (!data.name || data.name.trim().length < 3) {
        errors.push('⚠️ الاسم يجب أن يكون 3 أحرف على الأقل');
    }
    
    // التحقق من رقم الجوال
    if (!validatePhone(data.phone)) {
        errors.push('⚠️ رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05');
    }
    
    // التحقق من البريد الإلكتروني
    if (!validateEmail(data.email)) {
        errors.push('⚠️ البريد الإلكتروني غير صحيح');
    }
    
    return errors;
}

/**
 * عرض إشعار منبثق
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
        font-family: 'Tajawal', sans-serif;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}

/**
 * إغلاق المودال وتنظيف الحقول
 */
function closeModal() {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;
    
    modal.style.display = 'none';
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';
    
    // إزالة أي أخطاء سابقة
    const errorDivs = document.querySelectorAll('.validation-error');
    errorDivs.forEach(div => div.remove());
}

/**
 * إظهار أخطاء التحقق بجانب الحقول
 */
function showValidationErrors(errors) {
    // إزالة الأخطاء السابقة
    document.querySelectorAll('.validation-error').forEach(el => el.remove());
    
    errors.forEach(error => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = 'color: #e74c3c; font-size: 12px; margin-top: 5px;';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
        
        // إضافة الخطأ تحت الحقل المناسب
        if (error.includes('الاسم')) {
            document.getElementById('c-name')?.parentElement?.appendChild(errorDiv.cloneNode(true));
        } else if (error.includes('الجوال')) {
            document.getElementById('c-phone')?.parentElement?.appendChild(errorDiv.cloneNode(true));
        } else if (error.includes('البريد')) {
            document.getElementById('c-email')?.parentElement?.appendChild(errorDiv.cloneNode(true));
        }
    });
}

// ===================== ربط الأحداث =====================

/**
 * ربط أحداث أزرار التعديل والحذف
 */
function attachCustomerEvents() {
    // أزرار التعديل
    document.querySelectorAll('.edit-customer-btn').forEach(btn => {
        // إزالة المستمع القديم إذا وجد
        btn.removeEventListener('click', btn._listener);
        // إضافة المستمع الجديد
        const handler = () => editCustomer(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._listener = handler;
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
        btn.removeEventListener('click', btn._listener);
        const handler = () => deleteCustomer(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._listener = handler;
    });
}

// ===================== تحميل وعرض البيانات =====================

/**
 * تحميل قائمة العملاء من Firebase
 */
async function loadCustomers() {
    const list = document.getElementById('customers-list');
    if (!list) return;
    
    // إظهار مؤشر تحميل
    list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">
        <i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...
    </td></tr>`;
    
    try {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">
                <i class="fas fa-users" style="font-size: 48px; color: #bdc3c7; display: block; margin-bottom: 10px;"></i>
                لا يوجد عملاء مسجلين حالياً.
            </td></tr>`;
            return;
        }

        list.innerHTML = snap.docs.map(doc => {
            const c = doc.data();
            const date = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('ar-SA') : '---';
            return `
                <tr data-id="${doc.id}" style="border-bottom: 1px solid #eee;">
                    <td style="padding:15px; font-weight:bold;">${escapeHtml(c.name)}</td>
                    <td style="padding:15px; direction: ltr; text-align: left;">${escapeHtml(c.phone)}</td>
                    <td style="padding:15px; font-size:0.9rem; color:#7f8c8d;">
                        ${escapeHtml(c.city || '')} ${c.city && c.district ? '-' : ''} ${escapeHtml(c.district || '')}
                    </td>
                    <td style="padding:15px; color:#95a5a6;">${date}</td>
                    <td style="padding:15px; text-align:center;">
                        <button class="edit-customer-btn" data-id="${doc.id}" style="color:#3498db; background:none; border:none; cursor:pointer; margin-left:10px; font-size: 18px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-customer-btn" data-id="${doc.id}" style="color:#e74c3c; background:none; border:none; cursor:pointer; font-size: 18px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // ربط الأحداث بعد إنشاء الأزرار
        attachCustomerEvents();
        
    } catch (error) {
        console.error("❌ Error loading customers:", error);
        list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#e74c3c;">
            <i class="fas fa-exclamation-triangle"></i> خطأ في تحميل البيانات: ${error.message}
        </td></tr>`;
        showNotification('فشل تحميل بيانات العملاء', 'error');
    }
}

// ===================== عمليات CRUD =====================

/**
 * حفظ عميل (إضافة أو تعديل)
 */
async function saveCustomer(data, id = null) {
    const submitBtn = document.querySelector('#customer-form button[type="submit"]');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    
    // تعطيل الزر وإظهار مؤشر التحميل
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    try {
        if (id) {
            // تعديل عميل موجود
            await updateDoc(doc(db, "customers", id), {
                ...data,
                updatedAt: serverTimestamp()
            });
            showNotification('تم تحديث بيانات العميل بنجاح', 'success');
        } else {
            // إضافة عميل جديد
            await addDoc(collection(db, "customers"), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            showNotification('تم إضافة العميل بنجاح', 'success');
        }
        
        closeModal();
        await loadCustomers();
        
    } catch (err) {
        console.error("❌ Error saving customer:", err);
        showNotification('حدث خطأ أثناء حفظ البيانات: ' + err.message, 'error');
    } finally {
        // إعادة الزر إلى حالته الطبيعية
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

/**
 * تعديل بيانات عميل
 */
async function editCustomer(id) {
    if (!id) return;
    
    try {
        const snap = await getDoc(doc(db, "customers", id));
        if (snap.exists()) {
            const c = snap.data();
            
            // تعبئة الحقول
            document.getElementById('edit-id').value = id;
            document.getElementById('c-name').value = c.name || '';
            document.getElementById('c-phone').value = c.phone || '';
            document.getElementById('c-email').value = c.email || '';
            document.getElementById('c-country').value = c.country || 'السعودية';
            document.getElementById('c-city').value = c.city || '';
            document.getElementById('c-district').value = c.district || '';
            document.getElementById('c-street').value = c.street || '';
            document.getElementById('c-building').value = c.buildingNo || '';
            document.getElementById('c-additional').value = c.additionalNo || '';
            document.getElementById('c-pobox').value = c.poBox || '';
            
            document.getElementById('modal-title').innerText = "✏️ تعديل بيانات العميل";
            document.getElementById('customer-modal').style.display = 'block';
        } else {
            showNotification('العميل غير موجود', 'error');
        }
    } catch (error) {
        console.error("❌ Error loading customer for edit:", error);
        showNotification('حدث خطأ في تحميل بيانات العميل', 'error');
    }
}

/**
 * حذف عميل
 */
async function deleteCustomer(id) {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذا العميل؟\nلا يمكن التراجع عن هذا الإجراء.")) {
        return;
    }
    
    // إزالة الصف من الجدول فوراً (تحديث متفائل)
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.style.opacity = '0.5';
    }
    
    try {
        await deleteDoc(doc(db, "customers", id));
        showNotification('تم حذف العميل بنجاح', 'success');
        await loadCustomers();
    } catch (err) {
        console.error("❌ Error deleting customer:", err);
        showNotification('حدث خطأ أثناء الحذف: ' + err.message, 'error');
        // إعادة تحميل البيانات في حالة الفشل
        await loadCustomers();
    }
}

// ===================== تهيئة الواجهة =====================

/**
 * إعداد منطق النموذج والأحداث
 */
function setupLogic() {
    const modal = document.getElementById('customer-modal');
    const addBtn = document.getElementById('btn-add-customer');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('customer-form');
    
    if (!modal || !addBtn || !closeBtn || !form) {
        console.error("❌ بعض عناصر الواجهة غير موجودة");
        return;
    }
    
    // إضافة عميل جديد
    addBtn.onclick = () => {
        form.reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = "➕ إضافة عميل جديد";
        // تعبئة القيم الافتراضية
        document.getElementById('c-country').value = 'السعودية';
        modal.style.display = 'block';
    };
    
    // إغلاق المودال
    closeBtn.onclick = closeModal;
    
    // إغلاق عند النقر خارج المودال
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // إغلاق بالضغط على ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // حفظ البيانات
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-id').value;
        
        const data = {
            name: document.getElementById('c-name').value.trim(),
            phone: document.getElementById('c-phone').value.trim(),
            email: document.getElementById('c-email').value.trim(),
            country: document.getElementById('c-country').value.trim(),
            city: document.getElementById('c-city').value.trim(),
            district: document.getElementById('c-district').value.trim(),
            street: document.getElementById('c-street').value.trim(),
            buildingNo: document.getElementById('c-building').value.trim(),
            additionalNo: document.getElementById('c-additional').value.trim(),
            poBox: document.getElementById('c-pobox').value.trim()
        };
        
        // التحقق من صحة البيانات
        const errors = validateCustomerData(data);
        if (errors.length > 0) {
            showValidationErrors(errors);
            showNotification('يرجى تصحيح الأخطاء في النموذج', 'error');
            return;
        }
        
        // حفظ البيانات
        await saveCustomer(data, id || null);
    };
}

// ===================== الدالة الرئيسية =====================

/**
 * تهيئة موديول العملاء
 */
export async function initCustomers(container) {
    if (!container) {
        console.error("❌ container غير موجود");
        return;
    }
    
    container.innerHTML = `
        <div class="customers-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap: wrap; gap: 15px;">
                <h2 style="color:#2c3e50; margin:0;">
                    <i class="fas fa-users" style="color:#3498db; margin-left:10px;"></i> 
                    إدارة العملاء
                </h2>
                <button id="btn-add-customer" style="background:#3498db; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; transition: all 0.3s ease;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="background:white; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05); overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; text-align:right; min-width: 600px;">
                    <thead style="background:#f8f9fa;">
                        <tr>
                            <th style="padding:15px; border-bottom:2px solid #eee;">الاسم</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">الجوال</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">المدينة / الحي</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">تاريخ الإضافة</th>
                            <th style="padding:15px; border-bottom:2px solid #eee;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري جلب بيانات العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- مودال إضافة/تعديل عميل -->
        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:800px; margin:20px auto; border-radius:15px; padding:30px; direction: rtl;">
                <h3 id="modal-title" style="color:#3498db; margin-top:0; border-bottom:2px solid #f1f2f6; padding-bottom:15px;">بيانات العميل الجديد</h3>
                
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:15px; margin-bottom:20px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">اسم العميل *</label>
                            <input type="text" id="c-name" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">رقم الجوال *</label>
                            <input type="tel" id="c-phone" required placeholder="05XXXXXXXX" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">البريد الإلكتروني</label>
                            <input type="email" id="c-email" placeholder="example@domain.com" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                    </div>

                    <h4 style="color:#e67e22; border-right:4px solid #e67e22; padding-right:10px; margin:25px 0 15px;">
                        <i class="fas fa-location-dot"></i> تفاصيل العنوان الوطني
                    </h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                        <div>
                            <label>الدولة</label>
                            <input type="text" id="c-country" value="السعودية" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>المدينة</label>
                            <input type="text" id="c-city" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الحي</label>
                            <input type="text" id="c-district" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الشارع</label>
                            <input type="text" id="c-street" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>رقم المبنى</label>
                            <input type="text" id="c-building" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الرقم الإضافي</label>
                            <input type="text" id="c-additional" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label>الرمز البريدي</label>
                            <input type="text" id="c-pobox" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                    </div>

                    <div style="margin-top:30px; display:flex; gap:15px; flex-wrap: wrap;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:12px; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition: all 0.3s ease;">
                            <i class="fas fa-save"></i> حفظ بيانات العميل
                        </button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; border-radius:8px; cursor:pointer; transition: all 0.3s ease;">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupLogic();
    await loadCustomers();
}

// ===================== تصدير الدوال للاستخدام الخارجي =====================
export { loadCustomers, saveCustomer, deleteCustomer, editCustomer };
