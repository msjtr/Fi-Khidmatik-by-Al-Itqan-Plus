/**
 * js/modules/customers-ui.js
 * موديول العملاء - نسخة متطورة مع إحصائيات، طباعة، تصدير، وتنسيق الأرقام
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js (المتطورة) تم تحميله');

// ===================== دوال مساعدة =====================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
}

function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'}; color: white;
        padding: 12px 24px; border-radius: 8px; z-index: 10001;
        font-family: 'Tajawal', sans-serif; direction: rtl;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// تنسيق رقم الجوال: استخراج مفتاح الدولة والرقم بدون الصفر الأول
function formatPhone(phone) {
    if (!phone) return { code: '', number: '' };
    let raw = String(phone).replace(/\s/g, '');
    // إذا كان يبدأ بـ 966 (مفتاح السعودية)
    if (raw.startsWith('966')) {
        let num = raw.slice(3);
        if (num.startsWith('0')) num = num.slice(1);
        return { code: '+966', number: num };
    }
    // إذا كان يبدأ بـ 0
    if (raw.startsWith('0')) {
        return { code: '+966', number: raw.slice(1) };
    }
    // افتراضي
    return { code: '', number: raw };
}

// التحقق من اكتمال بيانات العميل (حسب الحقول الأساسية)
function isCustomerComplete(customer) {
    const required = ['name', 'phone', 'email', 'city', 'district', 'street', 'buildingNo', 'poBox'];
    return required.every(field => customer[field] && customer[field].trim() !== '');
}

// ===================== جلب العملاء من Firebase =====================
async function getCustomersFromFirebase() {
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const customers = [];
        snap.forEach(doc => customers.push({ id: doc.id, ...doc.data() }));
        return customers;
    } catch (error) {
        console.error('خطأ في جلب العملاء:', error);
        return [];
    }
}

// ===================== عرض إحصائيات العملاء =====================
async function renderStats(customers) {
    const total = customers.length;
    const completed = customers.filter(c => isCustomerComplete(c)).length;
    const incomplete = total - completed;
    const completionPercent = total ? ((completed / total) * 100).toFixed(1) : 0;

    const statsHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 12px; color: white; text-align: center;">
                <div style="font-size: 2rem;">${total}</div>
                <div>إجمالي العملاء</div>
            </div>
            <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 15px; border-radius: 12px; color: white; text-align: center;">
                <div style="font-size: 2rem;">${completed}</div>
                <div>مكتملي البيانات</div>
            </div>
            <div style="background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%); padding: 15px; border-radius: 12px; color: white; text-align: center;">
                <div style="font-size: 2rem;">${incomplete}</div>
                <div>غير مكتملي البيانات</div>
            </div>
            <div style="background: linear-gradient(135deg, #3498db 0%, #9b59b6 100%); padding: 15px; border-radius: 12px; color: white; text-align: center;">
                <div style="font-size: 2rem;">${completionPercent}%</div>
                <div>نسبة الإكمال</div>
            </div>
        </div>
    `;
    const statsContainer = document.getElementById('customers-stats');
    if (statsContainer) statsContainer.innerHTML = statsHtml;
}

// ===================== عرض جدول العملاء =====================
async function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">جاري التحميل...</td></tr>';
    const customers = await getCustomersFromFirebase();
    await renderStats(customers);

    if (!customers.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا يوجد عملاء</td></tr>';
        return;
    }

    let html = '';
    customers.forEach((c, i) => {
        const phoneObj = formatPhone(c.phone);
        const isComplete = isCustomerComplete(c);
        const statusIcon = isComplete ? '✅' : '⚠️';
        const statusColor = isComplete ? '#27ae60' : '#e67e22';

        html += `
            <tr style="border-bottom: 1px solid #f1f5f9; ${!isComplete ? 'background: #fff9e6;' : ''}">
                <td style="padding: 12px;">${i+1}</td>
                <td style="padding: 12px; font-weight: bold;">${escapeHtml(c.name)}</td>
                <td style="padding: 12px; direction: ltr;">
                    <span style="font-size:0.8rem; color:#7f8c8d;">${phoneObj.code}</span> ${phoneObj.number}
                </td>
                <td style="padding: 12px;">${escapeHtml(c.email) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(c.city) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(c.district) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(c.street) || '-'}</td>
                <td style="padding: 12px; text-align: center;">
                    <button class="edit-customer" data-id="${c.id}" style="color:#f39c12; background:none; border:none; cursor:pointer; margin-left:8px;" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-customer" data-id="${c.id}" style="color:#e74c3c; background:none; border:none; cursor:pointer; margin-left:8px;" title="حذف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="print-customer" data-id="${c.id}" style="color:#3498db; background:none; border:none; cursor:pointer;" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <span style="margin-right: 8px; color: ${statusColor};" title="${isComplete ? 'مكتمل' : 'غير مكتمل'}">${statusIcon}</span>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;

    // ربط الأحداث
    document.querySelectorAll('.edit-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const customer = customers.find(c => c.id === id);
            if (customer) showCustomerModal('edit', customer);
        });
    });
    document.querySelectorAll('.delete-customer').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟')) {
                await deleteDoc(doc(db, "customers", btn.dataset.id));
                showNotification('تم حذف العميل بنجاح');
                await renderCustomersTable();
            }
        });
    });
    document.querySelectorAll('.print-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const customer = customers.find(c => c.id === id);
            if (customer) printCustomerCard(customer);
        });
    });
}

// ===================== طباعة بطاقة عميل =====================
function printCustomerCard(customer) {
    const phoneObj = formatPhone(customer.phone);
    const printWindow = window.open('', '_blank', 'width=600,height=500');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>بيانات العميل</title>
        <style>
            body { font-family: 'Tajawal', Arial; padding: 20px; }
            .card { border: 1px solid #ddd; border-radius: 12px; padding: 20px; max-width: 500px; margin: auto; }
            h3 { color: #e67e22; border-bottom: 2px solid #e67e22; padding-bottom: 5px; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; display: inline-block; width: 120px; }
        </style>
        </head>
        <body>
        <div class="card">
            <h3>بطاقة بيانات العميل</h3>
            <div class="info"><span class="label">الاسم:</span> ${escapeHtml(customer.name)}</div>
            <div class="info"><span class="label">الجوال:</span> ${phoneObj.code} ${phoneObj.number}</div>
            <div class="info"><span class="label">البريد:</span> ${escapeHtml(customer.email) || '-'}</div>
            <div class="info"><span class="label">الدولة:</span> ${escapeHtml(customer.country) || '-'}</div>
            <div class="info"><span class="label">المدينة:</span> ${escapeHtml(customer.city) || '-'}</div>
            <div class="info"><span class="label">الحي:</span> ${escapeHtml(customer.district) || '-'}</div>
            <div class="info"><span class="label">الشارع:</span> ${escapeHtml(customer.street) || '-'}</div>
            <div class="info"><span class="label">رقم المبنى:</span> ${escapeHtml(customer.buildingNo) || '-'}</div>
            <div class="info"><span class="label">الرقم الإضافي:</span> ${escapeHtml(customer.additionalNo) || '-'}</div>
            <div class="info"><span class="label">الرمز البريدي:</span> ${escapeHtml(customer.poBox) || '-'}</div>
        </div>
        <script>window.onload = () => window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ===================== تصدير العملاء إلى CSV =====================
async function exportCustomersToCSV() {
    const customers = await getCustomersFromFirebase();
    if (!customers.length) {
        showNotification('لا يوجد عملاء للتصدير', 'error');
        return;
    }
    // تحضير البيانات
    const headers = ['الاسم', 'الجوال', 'البريد', 'الدولة', 'المدينة', 'الحي', 'الشارع', 'رقم المبنى', 'الرقم الإضافي', 'الرمز البريدي'];
    const rows = customers.map(c => [
        c.name, c.phone, c.email, c.country, c.city, c.district, c.street, c.buildingNo, c.additionalNo, c.poBox
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('تم تصدير العملاء بنجاح');
}

// ===================== نموذج إضافة/تعديل عميل =====================
function showCustomerModal(mode = 'add', customerData = null) {
    const modal = document.getElementById('customer-modal');
    if (!modal) return;
    const title = document.getElementById('modal-title');
    const form = document.getElementById('customer-form');

    if (mode === 'add') {
        title.innerText = '➕ إضافة عميل جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && customerData) {
        title.innerText = '✏️ تعديل بيانات العميل';
        document.getElementById('edit-id').value = customerData.id;
        document.getElementById('c-name').value = customerData.name || '';
        document.getElementById('c-phone').value = customerData.phone || '';
        document.getElementById('c-email').value = customerData.email || '';
        document.getElementById('c-country').value = customerData.country || 'السعودية';
        document.getElementById('c-city').value = customerData.city || '';
        document.getElementById('c-district').value = customerData.district || '';
        document.getElementById('c-street').value = customerData.street || '';
        document.getElementById('c-building').value = customerData.buildingNo || '';
        document.getElementById('c-additional').value = customerData.additionalNo || '';
        document.getElementById('c-pobox').value = customerData.poBox || '';
    }
    modal.style.display = 'flex';
}

function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
}

async function saveCustomer(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const customerData = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        email: document.getElementById('c-email').value,
        country: document.getElementById('c-country').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        street: document.getElementById('c-street').value,
        buildingNo: document.getElementById('c-building').value,
        additionalNo: document.getElementById('c-additional').value,
        poBox: document.getElementById('c-pobox').value,
        updatedAt: serverTimestamp()
    };
    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), customerData);
            showNotification('تم تحديث العميل بنجاح');
        } else {
            customerData.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), customerData);
            showNotification('تم إضافة العميل بنجاح');
        }
        closeCustomerModal();
        await renderCustomersTable();
    } catch (error) {
        console.error(error);
        showNotification('حدث خطأ أثناء الحفظ', 'error');
    }
}

// ===================== الدالة الرئيسية =====================
export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
                <h2 style="color: #2c3e50;"><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء</h2>
                <div>
                    <button id="export-customers-btn" style="background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-left: 10px;">
                        <i class="fas fa-file-excel"></i> تصدير CSV
                    </button>
                    <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-user-plus"></i> إضافة عميل
                    </button>
                </div>
            </div>
            <div id="customers-stats"></div>
            <div style="margin-bottom: 15px;">
                <input type="text" id="search-customers" placeholder="بحث باسم العميل أو الجوال..." style="width: 100%; max-width: 300px; padding: 8px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th><th>المدينة</th><th>الحي</th><th>الشارع</th><th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body"><tr><td colspan="8">جاري التحميل...</td></tr>
                </tbody>
            </table>
            </div>
        </div>

        <!-- مودال إضافة/تعديل -->
        <div id="customer-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 90%; max-width: 700px; padding: 25px; border-radius: 16px; max-height: 90vh; overflow-y: auto;">
                <h3 id="modal-title" style="margin-bottom: 20px;">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap: 15px;">
                        <div><label>الاسم الكامل *</label><input type="text" id="c-name" required style="width:100%; padding:8px;"></div>
                        <div><label>رقم الجوال *</label><input type="tel" id="c-phone" required style="width:100%; padding:8px;"></div>
                        <div><label>البريد الإلكتروني</label><input type="email" id="c-email" style="width:100%; padding:8px;"></div>
                        <div><label>الدولة</label><input type="text" id="c-country" value="السعودية" style="width:100%; padding:8px;"></div>
                        <div><label>المدينة</label><input type="text" id="c-city" style="width:100%; padding:8px;"></div>
                        <div><label>الحي</label><input type="text" id="c-district" style="width:100%; padding:8px;"></div>
                        <div><label>الشارع</label><input type="text" id="c-street" style="width:100%; padding:8px;"></div>
                        <div><label>رقم المبنى</label><input type="text" id="c-building" style="width:100%; padding:8px;"></div>
                        <div><label>الرقم الإضافي</label><input type="text" id="c-additional" style="width:100%; padding:8px;"></div>
                        <div><label>الرمز البريدي</label><input type="text" id="c-pobox" style="width:100%; padding:8px;"></div>
                    </div>
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button type="submit" style="flex:2; background:#27ae60; color:white; padding:10px; border:none; border-radius:8px;">حفظ</button>
                        <button type="button" id="close-customer-modal" style="flex:1; background:#95a5a6; color:white; padding:10px; border:none; border-radius:8px;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // ربط الأحداث
    document.getElementById('add-customer-btn').onclick = () => showCustomerModal();
    document.getElementById('close-customer-modal').onclick = closeCustomerModal;
    document.getElementById('customer-form').onsubmit = saveCustomer;
    document.getElementById('export-customers-btn').onclick = exportCustomersToCSV;

    // تحميل البيانات
    await renderCustomersTable();

    // البحث
    document.getElementById('search-customers').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#customers-table-body tr');
        rows.forEach(row => {
            if (row.cells.length < 2) return;
            const name = row.cells[1]?.innerText.toLowerCase() || '';
            const phone = row.cells[2]?.innerText.toLowerCase() || '';
            row.style.display = (name.includes(term) || phone.includes(term)) ? '' : 'none';
        });
    });
}

export default { initCustomers };
