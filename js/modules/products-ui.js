/**
 * customers-ui.js - Tera Gateway
 * الإصدار المتوافق مع هيكلية العناوين الوطنية ومفاتيح الدول
 */

import * as Core from './customers-core.js';

let editingId = null;

export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="stats-grid">
                <div class="stat-item"><span>إجمالي العملاء</span><strong id="stat-total">0</strong></div>
                <div class="stat-item success"><span>عناوين مكتملة</span><strong id="stat-complete">0</strong></div>
                <div class="stat-item"><span>بملاحظات</span><strong id="stat-notes">0</strong></div>
            </div>

            <div class="action-bar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، أو الرمز البريدي...">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>العنوان الوطني (الرمز: ${'postalCode'})</th>
                            <th>المبنى / الإضافي</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري تحميل بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
    setupSearch();
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    const snapshot = await Core.fetchAllCustomers();
    list.innerHTML = '';
    
    let stats = { total: 0, complete: 0, notes: 0 };

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const id = docSnap.id;

        stats.total++;
        if (d.notes) stats.notes++;
        if (d.postalCode && d.buildingNo) stats.complete++;

        list.innerHTML += `
            <tr class="cust-row">
                <td>
                    <div class="avatar-cell">
                        <div class="avatar-icon">${(d.name || '?').charAt(0)}</div>
                        <div><b>${d.name || 'بدون اسم'}</b><br><small>${d.Email || '-'}</small></div>
                    </div>
                </td>
                <td dir="ltr" style="text-align:center;">${d.Phone || '-'}</td>
                <td>
                    <div class="addr-details">
                        <b>${d.city || '-'}</b> - ${d.district || '-'}<br>
                        <span>${d.street || '-'}</span> | <small>الرمز: ${d.postalCode || '-'}</small>
                    </div>
                </td>
                <td style="text-align:center;">
                    مبنى: ${d.buildingNo || '-'}<br>إضافي: ${d.additionalNo || '-'}
                </td>
                <td>
                    <div class="row-actions">
                        <button onclick="handlePrint('${id}')"><i class="fas fa-print"></i></button>
                        <button onclick="handleEdit('${id}')"><i class="fas fa-pen"></i></button>
                        <button onclick="handleDelete('${id}')" class="text-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    });
    updateStats(stats);
}

// --- إدارة المودال (النموذج) ---

window.showAddCustomerModal = () => {
    editingId = null;
    document.getElementById('customer-form').reset();
    // تصفير محرر النصوص إذا كنت تستخدم TinyMCE أو CKEditor
    if (window.tinymce) tinymce.get('cust-notes').setContent('');
    
    document.getElementById('modal-title').innerText = "إضافة عميل جديد لتيرا";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    // تعبئة الحقول بناءً على مسمياتك الدقيقة
    document.getElementById('cust-name').value = d.name || '';
    document.getElementById('cust-email').value = d.Email || '';
    document.getElementById('cust-country').value = d.country || 'السعودية';
    document.getElementById('cust-city').value = d.city || '';
    document.getElementById('cust-district').value = d.district || '';
    document.getElementById('cust-street').value = d.street || '';
    document.getElementById('cust-building').value = d.buildingNo || '';
    document.getElementById('cust-additional').value = d.additionalNo || '';
    document.getElementById('cust-postal').value = d.postalCode || '';
    document.getElementById('cust-pobox').value = d.poBox || '';
    
    // التعامل مع الملاحظات (محرر النصوص)
    if (window.tinymce) {
        tinymce.get('cust-notes').setContent(d.notes || '');
    } else {
        document.getElementById('cust-notes').value = d.notes || '';
    }

    // فصل مفتاح الدولة عن الرقم
    if (d.Phone && d.Phone.includes(' ')) {
        const parts = d.Phone.split(' ');
        document.getElementById('cust-country-code').value = parts[0];
        document.getElementById('cust-phone').value = parts[1];
    } else {
        document.getElementById('cust-phone').value = d.Phone || '';
    }

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const formProps = Object.fromEntries(fd.entries());

    // دمج المفتاح مع الرقم
    const fullPhone = `${formProps.countryCode} ${formProps.phoneNo}`;
    
    // جلب الملاحظات من محرر النصوص
    const notesContent = window.tinymce ? tinymce.get('cust-notes').getContent() : formProps.notes;

    const finalData = {
        name: formProps.name,
        Email: formProps.Email,
        Phone: fullPhone,
        country: formProps.country,
        city: formProps.city,
        district: formProps.district,
        street: formProps.street,
        buildingNo: formProps.buildingNo,
        additionalNo: formProps.additionalNo,
        postalCode: formProps.postalCode,
        poBox: formProps.poBox,
        notes: notesContent
    };

    const btn = e.target.querySelector('.btn-save');
    btn.disabled = true;

    try {
        if (editingId) await Core.updateCustomer(editingId, finalData);
        else await Core.addCustomer(finalData);

        window.closeCustomerModal();
        await loadAndRender();
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    } finally {
        btn.disabled = false;
    }
};

// الدوال المساعدة
function updateStats(s) {
    document.getElementById('stat-total').innerText = s.total;
    document.getElementById('stat-complete').innerText = s.complete;
    document.getElementById('stat-notes').innerText = s.notes;
}

function setupSearch() {
    document.getElementById('cust-filter').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.cust-row').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.handlePrint = (id) => window.open(`customer-print.html?id=${id}`, '_blank');
window.closeCustomerModal = () => document.getElementById('customer-modal').style.display = 'none';
