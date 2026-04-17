import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, deleteDoc, updateDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * موديول إدارة العملاء - تيرا جيتواي
 */

export async function initCustomers(container) {
    // 1. بناء الواجهة (HTML)
    container.innerHTML = `
        <div class="module-container" style="font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
                <h2 style="margin:0;"><i class="fas fa-user-friends" style="color:#3498db; margin-left:10px;"></i> قاعدة بيانات العملاء</h2>
                <button id="new-customer-btn" style="background:#3498db; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="margin-bottom: 20px; background:#f8f9fa; padding:15px; border-radius:12px; border: 1px solid #eee;">
                <input type="text" id="search-customer" placeholder="بحث باسم العميل أو الجوال..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
            </div>

            <div style="background:white; border-radius:12px; border:1px solid #eee; overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; text-align:right;">
                    <thead style="background:#f1f2f6;">
                        <tr>
                            <th style="padding:15px; border-bottom:1px solid #eee;">الاسم</th>
                            <th style="padding:15px; border-bottom:1px solid #eee;">الجوال</th>
                            <th style="padding:15px; border-bottom:1px solid #eee;">العنوان</th>
                            <th style="padding:15px; border-bottom:1px solid #eee;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-body">
                        <tr><td colspan="4" style="text-align:center; padding:20px;">جاري جلب العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="cust-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; padding:20px;">
            <div style="background:white; max-width:500px; margin:50px auto; border-radius:15px; padding:25px; position:relative;">
                <h3 id="cust-modal-title">إضافة عميل جديد</h3>
                <form id="cust-form">
                    <input type="hidden" id="edit-cust-id">
                    <div style="display:grid; gap:15px; margin-top:20px;">
                        <input type="text" id="c-name" placeholder="الاسم الكامل" required style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="text" id="c-phone" placeholder="رقم الجوال" required style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="text" id="c-city" placeholder="المدينة" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="text" id="c-district" placeholder="الحي" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <button type="submit" style="background:#2ecc71; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ البيانات</button>
                        <button type="button" id="close-cust-modal" style="background:#95a5a6; color:white; padding:10px; border:none; border-radius:8px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupEventListeners();
    await loadCustomers();
}

async function loadCustomers() {
    const tbody = document.getElementById('customers-list-body');
    const snap = await getDocs(query(collection(db, "customers"), orderBy("createdAt", "desc")));
    
    tbody.innerHTML = snap.docs.map(doc => {
        const c = doc.data();
        return `
            <tr>
                <td style="padding:15px; border-bottom:1px solid #f1f1f1;">${c.name}</td>
                <td style="padding:15px; border-bottom:1px solid #f1f1f1;">${c.phone}</td>
                <td style="padding:15px; border-bottom:1px solid #f1f1f1;">${c.city || ''} - ${c.district || ''}</td>
                <td style="padding:15px; border-bottom:1px solid #f1f1f1;">
                    <button onclick="window.editCustomer('${doc.id}')" style="color:#f39c12; background:none; border:none; cursor:pointer; margin-left:10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteCustomer('${doc.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupEventListeners() {
    const modal = document.getElementById('cust-modal');
    
    document.getElementById('new-customer-btn').onclick = () => {
        document.getElementById('cust-form').reset();
        document.getElementById('edit-cust-id').value = '';
        document.getElementById('cust-modal-title').innerText = "إضافة عميل جديد";
        modal.style.display = 'block';
    };

    document.getElementById('close-cust-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('cust-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-cust-id').value;
        const data = {
            name: document.getElementById('c-name').value,
            phone: document.getElementById('c-phone').value,
            city: document.getElementById('c-city').value,
            district: document.getElementById('c-district').value,
            updatedAt: serverTimestamp()
        };

        if (id) {
            await updateDoc(doc(db, "customers", id), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), data);
        }
        modal.style.display = 'none';
        loadCustomers();
    };
}

// --- الوظائف العالمية (لحل مشكلة onclick) ---

window.deleteCustomer = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        location.reload();
    }
};

window.editCustomer = async (id) => {
    const snap = await getDoc(doc(db, "customers", id));
    if (snap.exists()) {
        const c = snap.data();
        document.getElementById('edit-cust-id').value = id;
        document.getElementById('c-name').value = c.name;
        document.getElementById('c-phone').value = c.phone;
        document.getElementById('c-city').value = c.city || '';
        document.getElementById('c-district').value = c.district || '';
        document.getElementById('cust-modal-title').innerText = "تعديل بيانات العميل";
        document.getElementById('cust-modal').style.display = 'block';
    }
};
