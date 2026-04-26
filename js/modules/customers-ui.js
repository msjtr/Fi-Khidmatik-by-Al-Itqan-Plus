/**
 * customers-ui.js - Tera Gateway
 * إصلاح أخطاء الـ ReferenceError وربط الدوال بالـ Global Scope
 */

import * as Core from './customers-core.js';

let editingId = null;
let quillEditor = null;

/**
 * 1. الدالة الأساسية لبناء الواجهة
 */
export async function initCustomersUI(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px;">
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #2563eb; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    <small>إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:1.6rem; font-weight:800;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; border-right:5px solid #10b981; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    <small>بيانات مكتملة</small>
                    <div id="stat-complete" style="font-size:1.6rem; font-weight:800; color:#10b981;">0</div>
                </div>
            </div>

            <div style="background:#fff; padding:20px; border-radius:15px; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:15px; align-items:center; justify-content:space-between;">
                <div style="display:flex; gap:10px;">
                    <button onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-plus"></i> إضافة عميل
                    </button>
                    <button onclick="exportCustomersToExcel()" style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-file-export"></i> تصدير إكسل
                    </button>
                    <label style="background:#f1f5f9; color:#475569; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-file-import"></i> استرداد إكسل
                        <input type="file" id="import-excel" hidden onchange="importCustomersFromExcel(this)">
                    </label>
                </div>
                
                <div style="position:relative; width:350px;">
                    <i class="fas fa-search" style="position:absolute; right:15px; top:12px; color:#94a3b8;"></i>
                    <input type="text" id="cust-filter" placeholder="بحث شامل..." style="width:100%; padding:10px 40px 10px 15px; border-radius:10px; border:1px solid #e2e8f0;">
                </div>
            </div>

            <div style="background:#fff; border-radius:15px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
                <div style="overflow-x:auto;">
                    <table style="width:100%; text-align:right; border-collapse:collapse; min-width:1500px;">
                        <thead style="background:#f8fafc; color:#64748b;">
                            <tr>
                                <th style="padding:15px;">👤</th>
                                <th>اسم العميل</th>
                                <th>الجوال</th>
                                <th>الدولة</th>
                                <th>المدينة/الحي</th>
                                <th>التاريخ</th>
                                <th style="text-align:center;">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="customers-list-render"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // تشغيل الدوال الداخلية
    initRichText();
    await loadAndRender();
    setupSearch(); 
}

/**
 * 2. الدوال الداخلية (Private Helpers)
 */

function initRichText() {
    if (typeof Quill !== 'undefined' && document.getElementById('notes-editor')) {
        quillEditor = new Quill('#notes-editor', {
            theme: 'snow',
            placeholder: 'ملاحظات العميل...',
            modules: { toolbar: [['bold', 'italic'], [{ 'list': 'bullet' }]] }
        });
    }
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        let stats = { total: 0, complete: 0 };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            stats.total++;
            if(d.name && d.phone && d.city) stats.complete++;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:15px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:#f1f5f9; overflow:hidden;">
                            ${d.photoUrl ? `<img src="${d.photoUrl}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-user" style="margin:10px; color:#cbd5e1;"></i>`}
                        </div>
                    </td>
                    <td style="font-weight:bold;">${d.name || '-'}</td>
                    <td dir="ltr">${d.phone || '-'}</td>
                    <td>${d.country || 'السعودية'}</td>
                    <td>${d.city || '-'} / ${d.district || '-'}</td>
                    <td>${d.createdAt ? d.createdAt.substring(0, 10) : '-'}</td>
                    <td style="text-align:center;">
                        <button onclick="handleEdit('${id}')" style="color:#2563eb; background:none; border:none; cursor:pointer; margin:0 5px;"><i class="fas fa-edit"></i></button>
                        <button onclick="handlePrint('${id}')" style="color:#64748b; background:none; border:none; cursor:pointer; margin:0 5px;"><i class="fas fa-print"></i></button>
                        <button onclick="handleDelete('${id}')" style="color:#ef4444; background:none; border:none; cursor:pointer; margin:0 5px;"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>`;
        });

        document.getElementById('stat-total').innerText = stats.total;
        document.getElementById('stat-complete').innerText = stats.complete;

    } catch (e) { console.error("Render Error:", e); }
}

function setupSearch() {
    const filterInput = document.getElementById('cust-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.cust-row').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }
}

/**
 * 3. ربط الدوال بـ window (مهم جداً لحل خطأ undefined)
 */

window.showAddCustomerModal = () => {
    editingId = null;
    document.getElementById('customer-form')?.reset();
    if(quillEditor) quillEditor.root.innerHTML = '';
    document.getElementById('modal-title').innerText = "إضافة عميل جديد";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.closeCustomerModal = () => {
    document.getElementById('customer-modal').style.display = 'none';
};

window.previewCustomerPhoto = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('photo-preview').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            document.getElementById('photo-preview').dataset.base64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.saveCustomerData = async () => {
    const getVal = (id) => document.getElementById(id)?.value || '';
    const countrySel = document.getElementById('cust-country-select');
    
    const payload = {
        name: getVal('cust-name'),
        phone: getVal('cust-phone'),
        email: getVal('cust-email'),
        city: getVal('cust-city'),
        district: getVal('cust-district'),
        street: getVal('cust-street'),
        buildingNo: getVal('cust-building'),
        additionalNo: getVal('cust-additional'),
        postalCode: getVal('cust-postal'),
        tag: getVal('cust-category'),
        country: countrySel?.value || 'Saudi Arabia',
        countryCode: countrySel?.options[countrySel.selectedIndex]?.dataset.code || '+966',
        notes: quillEditor ? quillEditor.root.innerHTML : '',
        photoUrl: document.getElementById('photo-preview')?.dataset.base64 || '',
        updatedAt: new Date().toISOString()
    };

    try {
        if (editingId) await Core.updateCustomer(editingId, payload);
        else {
            payload.createdAt = new Date().toISOString();
            await Core.addCustomer(payload);
        }
        window.closeCustomerModal();
        await loadAndRender();
    } catch (err) { alert("حدث خطأ أثناء الحفظ"); }
};

window.handleEdit = async (id) => {
    editingId = id;
    const d = await Core.fetchCustomerById(id);
    if (!d) return;

    const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
    setVal('cust-name', d.name);
    setVal('cust-phone', d.phone);
    setVal('cust-email', d.email);
    setVal('cust-city', d.city);
    setVal('cust-district', d.district);
    setVal('cust-street', d.street);
    setVal('cust-building', d.buildingNo);
    setVal('cust-additional', d.additionalNo);
    setVal('cust-postal', d.postalCode);
    setVal('cust-category', d.tag);

    if (quillEditor) quillEditor.root.innerHTML = d.notes || '';
    if (d.photoUrl) document.getElementById('photo-preview').innerHTML = `<img src="${d.photoUrl}" style="width:100%; height:100%; object-fit:cover;">`;

    document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
    document.getElementById('customer-modal').style.display = 'flex';
};

window.handleDelete = async (id) => {
    if (confirm('حذف العميل؟')) {
        await Core.removeCustomer(id);
        await loadAndRender();
    }
};

window.exportCustomersToExcel = async () => {
    try {
        const snapshot = await Core.fetchAllCustomers();
        const data = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            data.push({ "الاسم": d.name, "الجوال": d.phone, "المدينة": d.city });
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "العملاء");
        XLSX.writeFile(wb, "Tera_Customers.xlsx");
    } catch (e) { alert("خطأ في التصدير"); }
};

window.importCustomersFromExcel = (input) => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        for (let row of rows) {
            await Core.addCustomer({ name: row["الاسم"], phone: row["الجوال"], city: row["المدينة"], createdAt: new Date().toISOString() });
        }
        alert("تم الاستيراد بنجاح");
        await loadAndRender();
    };
    reader.readAsArrayBuffer(file);
};
