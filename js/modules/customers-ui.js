/**
 * customers-ui.js - الملف الكامل (إحصائيات، طباعة، تصدير، تنسيق الأرقام)
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js (الكامل) تم تحميله');

// ===================== دوال مساعدة =====================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(msg, type) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:' + (type === 'success' ? '#2ecc71' : '#e74c3c') + ';color:white;padding:12px 24px;border-radius:8px;z-index:10001;font-family:Tajawal;direction:rtl';
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle') + '"></i> ' + msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

// تنسيق رقم الجوال (مفتاح الدولة + رقم بدون صفر)
function formatPhone(phone) {
    if (!phone) return { code: '', number: '' };
    var raw = String(phone).replace(/\s/g, '');
    if (raw.startsWith('966')) {
        var num = raw.slice(3);
        if (num.startsWith('0')) num = num.slice(1);
        return { code: '+966', number: num };
    }
    if (raw.startsWith('0')) {
        return { code: '+966', number: raw.slice(1) };
    }
    return { code: '', number: raw };
}

// التحقق من اكتمال بيانات العميل (الحقول الأساسية)
function isComplete(c) {
    return c.name && c.phone && c.email && c.city && c.district && c.street && c.buildingNo && c.poBox;
}

// ===================== جلب العملاء =====================
async function getCustomers() {
    var q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    var snap = await getDocs(q);
    var customers = [];
    snap.forEach(function(doc) {
        customers.push({ id: doc.id, ...doc.data() });
    });
    return customers;
}

// ===================== عرض الإحصائيات =====================
async function renderStats(customers) {
    var total = customers.length;
    var completed = customers.filter(isComplete).length;
    var incomplete = total - completed;
    var percent = total ? ((completed / total) * 100).toFixed(1) : 0;
    var statsDiv = document.getElementById('customers-stats');
    if (!statsDiv) return;
    statsDiv.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:15px;border-radius:12px;color:white;flex:1;min-width:140px;text-align:center">
                <div style="font-size:1.8rem">${total}</div>
                <div>إجمالي العملاء</div>
            </div>
            <div style="background:linear-gradient(135deg,#27ae60,#2ecc71);padding:15px;border-radius:12px;color:white;flex:1;min-width:140px;text-align:center">
                <div style="font-size:1.8rem">${completed}</div>
                <div>مكتملي البيانات</div>
            </div>
            <div style="background:linear-gradient(135deg,#e67e22,#f39c12);padding:15px;border-radius:12px;color:white;flex:1;min-width:140px;text-align:center">
                <div style="font-size:1.8rem">${incomplete}</div>
                <div>غير مكتملي البيانات</div>
            </div>
            <div style="background:linear-gradient(135deg,#3498db,#9b59b6);padding:15px;border-radius:12px;color:white;flex:1;min-width:140px;text-align:center">
                <div style="font-size:1.8rem">${percent}%</div>
                <div>نسبة الإكمال</div>
            </div>
        </div>
    `;
}

// ===================== عرض الجدول الكامل =====================
async function renderTable() {
    var tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">جاري التحميل...<\/td><\/tr>';
    var customers = await getCustomers();
    await renderStats(customers);
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">لا يوجد عملاء<\/td><\/tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i];
        var phoneObj = formatPhone(c.phone);
        var complete = isComplete(c);
        var rowBg = complete ? '' : 'style="background:#fff9e6;"';
        html += '<tr style="border-bottom:1px solid #f1f5f9;" ' + rowBg + '>';
        html += '<td style="padding:12px;">' + (i+1) + '<\/td>';
        html += '<td style="padding:12px;">' + escapeHtml(c.name) + '<\/td>';
        html += '<td style="padding:12px;direction:ltr;">' + phoneObj.code + ' ' + phoneObj.number + '<\/td>';
        html += '<td style="padding:12px;">' + (c.email || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.city || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.district || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.street || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.buildingNo || '-') + '<\/td>';
        html += '<td style="padding:12px;">' + (c.poBox || '-') + '<\/td>';
        html += '<td style="padding:12px;text-align:center;">';
        html += '<button class="edit-customer" data-id="' + c.id + '" style="color:#f39c12;background:none;border:none;cursor:pointer;margin-left:8px;" title="تعديل"><i class="fas fa-edit"><\/i><\/button>';
        html += '<button class="delete-customer" data-id="' + c.id + '" style="color:#e74c3c;background:none;border:none;cursor:pointer;margin-left:8px;" title="حذف"><i class="fas fa-trash-alt"><\/i><\/button>';
        html += '<button class="print-customer" data-id="' + c.id + '" style="color:#3498db;background:none;border:none;cursor:pointer;" title="طباعة"><i class="fas fa-print"><\/i><\/button>';
        html += '<span style="margin-right:8px;" title="' + (complete ? 'مكتمل' : 'غير مكتمل') + '">' + (complete ? '✅' : '⚠️') + '<\/span>';
        html += '<\/td><\/tr>';
    }
    tbody.innerHTML = html;
    // ربط الأحداث
    document.querySelectorAll('.edit-customer').forEach(btn => {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var cust = customers.find(c => c.id === id);
            if (cust) showModal('edit', cust);
        });
    });
    document.querySelectorAll('.delete-customer').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟')) {
                await deleteDoc(doc(db, "customers", this.getAttribute('data-id')));
                showNotification('تم الحذف', 'success');
                await renderTable();
            }
        });
    });
    document.querySelectorAll('.print-customer').forEach(btn => {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            var cust = customers.find(c => c.id === id);
            if (cust) printCard(cust);
        });
    });
}

// ===================== طباعة بطاقة عميل =====================
function printCard(cust) {
    var phoneObj = formatPhone(cust.phone);
    var win = window.open('', '_blank', 'width=600,height=500');
    win.document.write(`
        <!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>بيانات العميل</title>
        <style>
            body{font-family:Tajawal;padding:20px}
            .card{max-width:600px;margin:auto;border:1px solid #ddd;border-radius:16px;padding:20px}
            h3{color:#e67e22;border-bottom:2px solid #e67e22;padding-bottom:5px}
            .info{margin:10px 0;display:flex}
            .label{font-weight:bold;width:130px}
            .value{flex:1}
        </style>
        </head>
        <body>
        <div class="card">
            <h3>بطاقة بيانات العميل</h3>
            <div class="info"><span class="label">الاسم:</span><span class="value">${escapeHtml(cust.name)}</span></div>
            <div class="info"><span class="label">الجوال:</span><span class="value">${phoneObj.code} ${phoneObj.number}</span></div>
            <div class="info"><span class="label">البريد:</span><span class="value">${cust.email || '-'}</span></div>
            <div class="info"><span class="label">الدولة:</span><span class="value">${cust.country || '-'}</span></div>
            <div class="info"><span class="label">المدينة:</span><span class="value">${cust.city || '-'}</span></div>
            <div class="info"><span class="label">الحي:</span><span class="value">${cust.district || '-'}</span></div>
            <div class="info"><span class="label">الشارع:</span><span class="value">${cust.street || '-'}</span></div>
            <div class="info"><span class="label">رقم المبنى:</span><span class="value">${cust.buildingNo || '-'}</span></div>
            <div class="info"><span class="label">الرمز البريدي:</span><span class="value">${cust.poBox || '-'}</span></div>
        </div>
        <script>window.onload=function(){window.print();};<\/script>
        </body>
        </html>
    `);
    win.document.close();
}

// ===================== تصدير CSV =====================
async function exportCSV() {
    var customers = await getCustomers();
    if (!customers.length) { showNotification('لا يوجد عملاء', 'error'); return; }
    var headers = ['الاسم', 'الجوال', 'البريد', 'الدولة', 'المدينة', 'الحي', 'الشارع', 'رقم المبنى', 'الرمز البريدي'];
    var rows = [headers];
    for (var c of customers) {
        rows.push([c.name, c.phone, c.email, c.country, c.city, c.district, c.street, c.buildingNo, c.poBox]);
    }
    var csv = rows.map(row => row.map(cell => '"' + (cell || '') + '"').join(',')).join('\n');
    var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customers.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showNotification('تم التصدير', 'success');
}

// ===================== نموذج الإضافة والتعديل =====================
function showModal(mode, customer) {
    var modal = document.getElementById('customer-modal');
    var title = document.getElementById('modal-title');
    var form = document.getElementById('customer-form');
    if (mode === 'add') {
        title.innerText = '➕ إضافة عميل جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
    } else {
        title.innerText = '✏️ تعديل بيانات العميل';
        document.getElementById('edit-id').value = customer.id;
        document.getElementById('c-name').value = customer.name || '';
        document.getElementById('c-phone').value = customer.phone || '';
        document.getElementById('c-email').value = customer.email || '';
        document.getElementById('c-country').value = customer.country || 'السعودية';
        document.getElementById('c-city').value = customer.city || '';
        document.getElementById('c-district').value = customer.district || '';
        document.getElementById('c-street').value = customer.street || '';
        document.getElementById('c-building').value = customer.buildingNo || '';
        document.getElementById('c-additional').value = customer.additionalNo || '';
        document.getElementById('c-pobox').value = customer.poBox || '';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

async function saveCustomer(e) {
    e.preventDefault();
    var id = document.getElementById('edit-id').value;
    var data = {
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
            await updateDoc(doc(db, "customers", id), data);
            showNotification('تم التحديث', 'success');
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), data);
            showNotification('تمت الإضافة', 'success');
        }
        closeModal();
        await renderTable();
    } catch(err) {
        showNotification('خطأ: ' + err.message, 'error');
    }
}

// ===================== الدالة الرئيسية (لا تكرار) =====================
export async function initCustomers(container) {
    console.log('✅ initCustomers بدأت');
    if (!container) return;
    container.innerHTML = `
        <div style="padding:25px;font-family:Tajawal,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:15px">
                <h2><i class="fas fa-users" style="color:#e67e22;"></i> إدارة العملاء</h2>
                <div>
                    <button id="export-csv-btn" style="background:#27ae60;color:white;border:none;padding:8px 16px;border-radius:8px;margin-left:10px;cursor:pointer"><i class="fas fa-file-excel"></i> تصدير CSV</button>
                    <button id="add-customer-btn" style="background:#e67e22;color:white;border:none;padding:8px 16px;border-radius:8px;cursor:pointer"><i class="fas fa-user-plus"></i> إضافة عميل</button>
                </div>
            </div>
            <div id="customers-stats"></div>
            <input type="text" id="search-input" placeholder="🔍 بحث باسم العميل أو رقم الجوال..." style="width:100%;max-width:350px;padding:10px;margin-bottom:15px;border:1px solid #ddd;border-radius:8px">
            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden">
                    <thead style="background:#f8f9fa;"><tr>
                        <th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th><th>المدينة</th><th>الحي</th><th>الشارع</th><th>رقم المبنى</th><th>الرمز البريدي</th><th>الإجراءات</th>
                    </tr></thead>
                    <tbody id="customers-table-body"><tr><td colspan="10">جاري التحميل...<\/td><\/tr><\/tbody>
                </table>
            </div>
        </div>
        <div id="customer-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;justify-content:center;align-items:center;">
            <div style="background:white;width:90%;max-width:700px;padding:25px;border-radius:16px;max-height:90vh;overflow-y:auto">
                <h3 id="modal-title">إضافة عميل جديد</h3>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px">
                        <div><label>الاسم الكامل *</label><input type="text" id="c-name" required style="width:100%;padding:8px"></div>
                        <div><label>رقم الجوال *</label><input type="tel" id="c-phone" required style="width:100%;padding:8px"></div>
                        <div><label>البريد الإلكتروني</label><input type="email" id="c-email" style="width:100%;padding:8px"></div>
                        <div><label>الدولة</label><input type="text" id="c-country" value="السعودية" style="width:100%;padding:8px"></div>
                        <div><label>المدينة</label><input type="text" id="c-city" style="width:100%;padding:8px"></div>
                        <div><label>الحي</label><input type="text" id="c-district" style="width:100%;padding:8px"></div>
                        <div><label>الشارع</label><input type="text" id="c-street" style="width:100%;padding:8px"></div>
                        <div><label>رقم المبنى</label><input type="text" id="c-building" style="width:100%;padding:8px"></div>
                        <div><label>الرقم الإضافي</label><input type="text" id="c-additional" style="width:100%;padding:8px"></div>
                        <div><label>الرمز البريدي</label><input type="text" id="c-pobox" style="width:100%;padding:8px"></div>
                    </div>
                    <div style="display:flex;gap:15px;margin-top:25px">
                        <button type="submit" style="flex:2;background:#27ae60;color:white;padding:10px;border:none;border-radius:8px;cursor:pointer">حفظ</button>
                        <button type="button" id="close-modal-btn" style="flex:1;background:#95a5a6;color:white;padding:10px;border:none;border-radius:8px;cursor:pointer">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('add-customer-btn').onclick = () => showModal('add');
    document.getElementById('close-modal-btn').onclick = closeModal;
    document.getElementById('customer-form').onsubmit = saveCustomer;
    document.getElementById('export-csv-btn').onclick = exportCSV;
    await renderTable();
    document.getElementById('search-input').addEventListener('input', function(e) {
        var term = e.target.value.toLowerCase();
        var rows = document.querySelectorAll('#customers-table-body tr');
        rows.forEach(function(row) {
            var text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

// تصدير واحد فقط (لا تكرار)
export default { initCustomers };
