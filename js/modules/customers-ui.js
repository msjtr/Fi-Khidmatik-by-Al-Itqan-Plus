import * as Core from './customers-core.js';

let editingId = null; // متغير لمتابعة حالة التعديل

export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="stats-grid">
                <div class="stat-item"><span>إجمالي العملاء</span><strong id="stat-total">0</strong></div>
                <div class="stat-item success"><span>مكتمل البيانات</span><strong id="stat-complete">0</strong></div>
                <div class="stat-item warning"><span>غير مكتمل</span><strong id="stat-incomplete">0</strong></div>
                <div class="stat-item danger"><span>لديهم ملاحظات</span><strong id="stat-notes">0</strong></div>
            </div>

            <div class="action-bar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث باسم العميل، المدينة، أو الجوال...">
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
                            <th>العنوان الوطني</th>
                            <th>الحالة</th>
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

    const filterInput = document.getElementById('cust-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => filterData(e.target.value));
    }
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, complete: 0, incomplete: 0, notes: 0 };

        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">لا يوجد عملاء.</td></tr>';
            updateStatsDisplay(stats);
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            stats.total++;
            if (d.notes) stats.notes++;
            if (d.buildingNo && d.postalCode) stats.complete++; else stats.incomplete++;

            list.innerHTML += `
                <tr class="cust-row">
                    <td>
                        <div class="avatar-cell">
                            <div class="avatar-icon">${d.name ? d.name.charAt(0) : '?'}</div>
                            <div><b>${d.name || 'بدون اسم'}</b><br><small>${d.Email || ''}</small></div>
                        </div>
                    </td>
                    <td dir="ltr" style="text-align:center;">${d.Phone || '-'}</td>
                    <td>
                        <div class="addr-details">
                            <b>${d.city || '-'}</b> - ${d.district || '-'}<br>
                            <small>مبنى: ${d.buildingNo || '-'} | حي: ${d.district || '-'}</small>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <span class="status-tag ${getStatusClass(d.status)}">${d.status || 'عادي'}</span>
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
        updateStatsDisplay(stats);
    } catch (e) { list.innerHTML = '<tr><td colspan="5">خطأ في التحميل</td></tr>'; }
}

function getStatusClass(s) {
    const map = { 'محتال': 'danger', 'مميز': 'success', 'غير جدي': 'warning', 'غير متعاون': 'warning' };
    return map[s] || 'default';
}

function updateStatsDisplay(s) {
    ['total', 'complete', 'incomplete', 'notes'].forEach(k => {
        const el = document.getElementById(`stat-${k}`);
        if (el) el.innerText = s[k];
    });
}

function filterData(val) {
    const term = val.toLowerCase();
    document.querySelectorAll('.cust-row').forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
}

// --- الدوال المرتبطة بالنافذة ---

window.showAddCustomerModal = () => {
    editingId = null; // تصفير معرف التعديل
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.querySelector('.btn-save').innerText = "حفظ العميل الجديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};

window.handleEdit = async (id) => {
    editingId = id;
    const data = await Core.fetchCustomerById(id);
    if (!data) return alert("تعذر جلب بيانات العميل");

    // تعبئة الفورم بالبيانات الحالية
    document.getElementById('cust-name').value = data.name || '';
    document.getElementById('cust-email').value = data.Email || '';
    document.getElementById('cust-city').value = data.city || '';
    document.getElementById('cust-district').value = data.district || '';
    document.getElementById('cust-street').value = data.street || '';
    document.getElementById('cust-building').value = data.buildingNo || '';
    document.getElementById('cust-additional').value = data.additionalNo || '';
    document.getElementById('cust-postal').value = data.postalCode || '';
    document.getElementById('cust-pobox').value = data.poBox || '';
    document.getElementById('cust-notes').value = data.notes || '';
    document.getElementById('cust-tag').value = data.status || 'عادي';

    // معالجة رقم الجوال (فصل الكود عن الرقم)
    if (data.Phone && data.Phone.includes(' ')) {
        const parts = data.Phone.split(' ');
        document.getElementById('cust-country-code').value = parts[0];
        document.getElementById('cust-phone').value = parts[1];
    } else {
        document.getElementById('cust-phone').value = data.Phone || '';
    }

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.querySelector('.btn-save').innerText = "تحديث البيانات";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleCustomerSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.Phone = `${data.countryCode} ${data.Phone}`;

    try {
        const btn = event.target.querySelector('.btn-save');
        btn.disabled = true;
        btn.innerText = "جاري المعالجة...";

        if (editingId) {
            await Core.updateCustomer(editingId, data);
        } else {
            await Core.addCustomer(data);
        }

        window.closeCustomerModal();
        await loadAndRender();
    } catch (error) {
        alert("خطأ: " + error.message);
    } finally {
        event.target.querySelector('.btn-save').disabled = false;
    }
};

window.handleDelete = async (id) => {
    if (confirm('هل تريد حذف هذا العميل؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.handlePrint = (id) => window.open(`print-card.html?id=${id}`, '_blank');
