/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء الاحترافي - Tera Gateway
 * يتضمن: الطباعة، معاينة PDF، تصدير واستيراد Excel، ومعالجة undefined
 */

import { db } from '../core/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المكتبات الخارجية المطلوبة (سيتم حقنها تلقائياً)
const LIBS = {
    xlsx: "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js",
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    jspdfAutotable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"
};

export async function initCustomers(container) {
    await loadExternalLibs();
    injectStyles();

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p></div>
            <div class="stat-card success"><h3>بيانات مكتملة</h3><p id="stat-complete">0</p></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p></div>
            <div class="stat-card danger"><h3>ملاحظات هامة</h3><p id="stat-flagged">0</p></div>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث ذكي (اسم، جوال، حي)...">
            </div>
            <div class="action-buttons">
                <button onclick="exportToExcel()" class="btn-alt"><i class="fas fa-file-excel"></i> تصدير Excel</button>
                <button onclick="document.getElementById('import-excel').click()" class="btn-alt"><i class="fas fa-upload"></i> استيراد</button>
                <input type="file" id="import-excel" hidden accept=".xlsx, .xls">
                <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل</button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="tera-table" id="customers-table-to-print">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان الوطني</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>

        <div id="print-modal" class="modal-overlay" style="display:none">
            <div class="modal-content print-preview">
                <div class="modal-header">
                    <h2><i class="fas fa-print"></i> معاينة طباعة بطاقة العميل</h2>
                    <button onclick="closePrintModal()">&times;</button>
                </div>
                <div id="print-card-area" class="print-card"></div>
                <div class="modal-footer">
                    <button onclick="downloadPDF()" class="btn-save"><i class="fas fa-file-pdf"></i> تحميل PDF</button>
                    <button onclick="processPrint()" class="btn-primary-tera"><i class="fas fa-print"></i> طباعة الآن</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openCustomerModal();
    document.getElementById('customer-search').oninput = (e) => filterTable(e.target.value);
    document.getElementById('import-excel').onchange = (e) => importFromExcel(e);
    
    loadCustomers();
}

async function loadCustomers() {
    const listBody = document.getElementById('customers-list');
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let stats = { total: 0, complete: 0, incomplete: 0, flagged: 0 };
    listBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        
        // معالجة القيم الفارغة لمنع ظهور undefined
        const cleanData = {
            city: data.city || 'غير محدد',
            district: data.district || 'غير محدد',
            buildingNo: data.buildingNo || '-',
            postalCode: data.postalCode || '-',
            additionalNo: data.additionalNo || '-',
            street: data.street || '-',
            name: data.name || 'عميل بدون اسم'
        };

        if (cleanData.buildingNo === '-' || cleanData.postalCode === '-') stats.incomplete++; else stats.complete++;

        listBody.innerHTML += `
            <tr class="customer-row">
                <td>
                    <div class="user-cell">
                        <div class="avatar-text">${cleanData.name.charAt(0)}</div>
                        <div class="info">
                            <span class="name">${cleanData.name}</span>
                            <small>${data.email || 'لا يوجد بريد'}</small>
                        </div>
                    </div>
                </td>
                <td dir="ltr"><b>${data.countryCode || '+966'}</b> ${data.phone}</td>
                <td>
                    <div class="address-details">
                        <b>${cleanData.city}</b> - ${cleanData.district}<br>
                        <small>مبنى: ${cleanData.buildingNo} | إضافي: ${cleanData.additionalNo} | رمز: ${cleanData.postalCode}</small>
                    </div>
                </td>
                <td><span class="status-badge">${data.tag || 'عادي'}</span></td>
                <td>
                    <div class="actions">
                        <button onclick="previewPrint('${id}')" class="act-btn print" title="طباعة وتحميل"><i class="fas fa-print"></i></button>
                        <button onclick="editCustomer('${id}')" class="act-btn edit"><i class="fas fa-pen"></i></button>
                        <button onclick="deleteCustomer('${id}')" class="act-btn del"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.complete;
    document.getElementById('stat-incomplete').innerText = stats.incomplete;
}

// --- وظائف الطباعة و PDF ---
window.previewPrint = async (id) => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const customer = querySnapshot.docs.find(d => d.id === id)?.data();
    
    if (!customer) return;

    const printArea = document.getElementById('print-card-area');
    printArea.innerHTML = `
        <div class="business-card">
            <div class="card-header">
                <img src="logo.png" style="height:40px">
                <h3>بطاقة بيانات العميل</h3>
            </div>
            <div class="card-body">
                <div class="info-row"><span>الاسم:</span> <b>${customer.name}</b></div>
                <div class="info-row"><span>الجوال:</span> <b dir="ltr">${customer.countryCode}${customer.phone}</b></div>
                <div class="info-row"><span>المدينة:</span> <b>${customer.city}</b></div>
                <div class="info-row"><span>الحي:</span> <b>${customer.district}</b></div>
                <div class="info-row"><span>العنوان الوطني:</span> <b>${customer.buildingNo} - ${customer.postalCode}</b></div>
                <div class="info-row"><span>ملاحظات:</span> <p>${customer.notes || 'لا يوجد'}</p></div>
            </div>
            <div class="card-footer">Tera Gateway - نظام إدارة العملاء</div>
        </div>
    `;
    document.getElementById('print-modal').style.display = 'flex';
};

window.downloadPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // ملاحظة: دعم العربية في PDF يحتاج ملف خطوط .ttf، هنا نستخدم autoTable كحل بديل سريع
    doc.text("Customer Report - Tera Gateway", 10, 10);
    doc.autoTable({
        html: '#customers-table-to-print',
        styles: { font: 'Amiri', halign: 'right' }
    });
    doc.save("customers_report.pdf");
};

window.processPrint = () => {
    const printContents = document.getElementById('print-card-area').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    location.reload(); // لإعادة النظام بعد الطباعة
};

window.closePrintModal = () => { document.getElementById('print-modal').style.display = 'none'; };

// --- وظائف Excel (تصدير واستيراد) ---
window.exportToExcel = async () => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
            "الاسم": d.name,
            "الجوال": d.phone,
            "المدينة": d.city,
            "الحي": d.district,
            "الشارع": d.street,
            "رقم المبنى": d.buildingNo,
            "الرقم الاضافي": d.additionalNo,
            "الرمز البريدي": d.postalCode,
            "صندوق البريد": d.poBox,
            "البريد الإلكتروني": d.email,
            "ملاحظات": d.notes
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "Tera_Customers_Export.xlsx");
};

async function importFromExcel(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const batch = writeBatch(db);
        data.forEach(row => {
            const newDocRef = doc(collection(db, "customers"));
            batch.set(newDocRef, {
                name: row["الاسم"] || "",
                phone: row["الجوال"] || "",
                city: row["المدينة"] || "",
                district: row["الحي"] || "",
                street: row["الشارع"] || "",
                buildingNo: row["رقم المبنى"] || "",
                additionalNo: row["الرقم الاضافي"] || "",
                postalCode: row["الرمز البريدي"] || "",
                poBox: row["صندوق البريد"] || "",
                email: row["البريد الإلكتروني"] || "",
                notes: row["ملاحظات"] || "",
                createdAt: new Date()
            });
        });
        await batch.commit();
        alert("تم استيراد البيانات بنجاح!");
        loadCustomers();
    };
    reader.readAsBinaryString(file);
}

// --- خدمات النظام ---
async function loadExternalLibs() {
    for (let lib in LIBS) {
        if (!document.querySelector(`script[src="${LIBS[lib]}"]`)) {
            const script = document.createElement('script');
            script.src = LIBS[lib];
            document.head.appendChild(script);
        }
    }
}

function injectStyles() {
    if (document.getElementById('tera-adv-styles')) return;
    const s = document.createElement('style');
    s.id = 'tera-adv-styles';
    s.innerHTML = `
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; background: white; padding: 15px; border-radius: 12px; }
        .action-buttons { display: flex; gap: 10px; }
        .btn-alt { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 15px; border-radius: 8px; cursor: pointer; color: #475569; font-weight: 600; }
        .btn-alt:hover { background: #e2e8f0; }
        
        .avatar-text { width: 40px; height: 40px; background: #e67e22; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 1.2rem; }
        
        /* تصميم بطاقة الطباعة */
        .print-card { background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px dashed #ccc; margin: 20px 0; }
        .business-card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 0 10px rgba(0,0,0,0.1); direction: rtl; }
        .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e67e22; padding-bottom: 10px; margin-bottom: 20px; }
        .info-row { margin-bottom: 10px; display: flex; gap: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
        .info-row span { color: #64748b; width: 100px; }
        
        @media print {
            body * { visibility: hidden; }
            .print-card, .print-card * { visibility: visible; }
            .print-card { position: absolute; left: 0; top: 0; width: 100%; }
        }
    `;
    document.head.appendChild(s);
}
