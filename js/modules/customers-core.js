import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin:0;"><i class="fas fa-users" style="color: #e67e22;"></i> سجل عملاء Tera Gateway</h2>
                <button id="add-customer-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div id="stats-area" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="color: #7f8c8d; font-size: 0.8rem;">الإجمالي</div>
                    <div id="count-total" style="font-size: 1.4rem; font-weight: bold;">0</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 12px; border-right: 5px solid #27ae60; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="color: #7f8c8d; font-size: 0.8rem;">مكتمل البيانات</div>
                    <div id="count-complete" style="font-size: 1.4rem; font-weight: bold; color: #27ae60;">0</div>
                </div>
            </div>

            <div style="background: white; border-radius: 12px; overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: right; min-width: 1000px;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px;">الاسم</th>
                            <th style="padding: 15px; text-align: center;">الجوال</th>
                            <th style="padding: 15px;">العنوان الوطني</th>
                            <th style="padding: 15px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body"></tbody>
                </table>
            </div>
        </div>

        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; backdrop-filter: blur(3px);">
            <div style="background:white; padding:25px; border-radius:15px; width:95%; max-width:600px; max-height:90vh; overflow-y:auto;">
                <h3 id="modal-title">بيانات العميل</h3>
                <form id="customer-form" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:15px;">
                    <input type="hidden" id="edit-id">
                    <div style="grid-column: span 2;">
                        <input type="text" id="c-name" placeholder="الاسم الكامل" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #ddd;">
                    </div>
                    <input type="text" id="c-phone" placeholder="رقم الجوال" required style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="email" id="c-email" placeholder="البريد الإلكتروني" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-city" value="حائل" placeholder="المدينة" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-district" placeholder="الحي" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-street" placeholder="الشارع" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-building" placeholder="رقم المبنى" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    
                    <input type="text" id="c-postalCode" placeholder="الرمز البريدي (Postal Code)" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-additionalNo" placeholder="الرقم الإضافي" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    <input type="text" id="c-pobox" placeholder="صندوق البريد (P.O. Box)" style="padding:10px; border-radius:6px; border:1px solid #ddd;">
                    
                    <div style="grid-column: span 2; display:flex; gap:10px; margin-top:10px;">
                        <button type="submit" style="flex:2; background:#27ae60; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer;">حفظ</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('add-customer-btn').onclick = () => openModal();
    document.getElementById('close-modal').onclick = () => closeModal();
    document.getElementById('customer-form').onsubmit = handleFormSubmit;

    loadCustomers();
}

// دالة التحميل والفرز
async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    const snapshot = await getDocs(query(collection(db, "customers"), orderBy("createdAt", "desc")));
    tbody.innerHTML = "";
    let total = 0, complete = 0;

    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        total++;
        // العميل المكتمل هو من لديه (اسم، جوال، رقم مبنى، ورمز بريدي)
        const isComp = data.name && data.phone && data.buildingNo && data.postalCode;
        if (isComp) complete++;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding:15px;"><b>${data.name}</b><br><small>${data.email || ''}</small></td>
            <td style="padding:15px; text-align:center;">${data.phone}</td>
            <td style="padding:15px; font-size:0.8rem;">
                ${data.city}، حي ${data.district || '-'}<br>
                <span style="color:#e67e22;">مبنى: ${data.buildingNo || '-'} | رمز بريدي: ${data.postalCode || '-'}</span>
            </td>
            <td style="padding:15px; text-align:center;">
                <button onclick="window.editCust('${docSnap.id}')" style="color:#3498db; border:none; background:none; cursor:pointer; margin-left:10px;"><i class="fas fa-edit"></i></button>
                <button onclick="window.printCust('${docSnap.id}')" style="color:#2ecc71; border:none; background:none; cursor:pointer; margin-left:10px;"><i class="fas fa-print"></i></button>
                <button onclick="window.deleteCust('${docSnap.id}')" style="color:#e74c3c; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    document.getElementById('count-total').innerText = total;
    document.getElementById('count-complete').innerText = complete;
}

// دالة التعديل (تحل مشكلة التداخل عند العرض)
window.editCust = async (id) => {
    const snap = await getDoc(doc(db, "customers", id));
    if (snap.exists()) {
        const data = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('c-name').value = data.name || '';
        document.getElementById('c-phone').value = data.phone || '';
        document.getElementById('c-email').value = data.email || '';
        document.getElementById('c-district').value = data.district || '';
        document.getElementById('c-street').value = data.street || '';
        document.getElementById('c-building').value = data.buildingNo || '';
        document.getElementById('c-additionalNo').value = data.additionalNo || '';
        
        // هنا التصحيح: إذا كان الرمز البريدي مخزناً في poBox، نضعه في حقل الرمز البريدي
        document.getElementById('c-postalCode').value = data.postalCode || data.poBox || '';
        document.getElementById('c-pobox').value = data.postalCode === data.poBox ? "" : (data.poBox || "");

        document.getElementById('customer-modal').style.display = 'flex';
    }
};

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const customerData = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        email: document.getElementById('c-email').value,
        city: document.getElementById('c-city').value,
        district: document.getElementById('c-district').value,
        street: document.getElementById('c-street').value,
        buildingNo: document.getElementById('c-building').value,
        additionalNo: document.getElementById('c-additionalNo').value,
        postalCode: document.getElementById('c-postalCode').value, // يحفظ في الحقل الصحيح
        poBox: document.getElementById('c-pobox').value,          // يحفظ في الحقل الصحيح
        updatedAt: serverTimestamp()
    };

    if (id) await updateDoc(doc(db, "customers", id), customerData);
    else {
        customerData.createdAt = serverTimestamp();
        await addDoc(collection(db, "customers"), customerData);
    }
    closeModal();
    loadCustomers();
}

window.deleteCust = async (id) => { if(confirm("حذف؟")) { await deleteDoc(doc(db, "customers", id)); loadCustomers(); } };
window.printCust = (id) => { /* دالة الطباعة السابقة */ };
function openModal() { document.getElementById('customer-form').reset(); document.getElementById('customer-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('customer-modal').style.display = 'none'; }
