// js/modules/customers.js
import { db } from '../core/firebase.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export async function initCustomers(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>إدارة العملاء</h2>
                <button id="add-cust-btn" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                    <i class="fas fa-user-plus"></i> إضافة عميل
                </button>
            </div>
            <div id="customers-list" style="margin-top:20px;"></div>
        </div>
    `;

    document.getElementById('add-cust-btn').onclick = () => addNewCustomer();
    await loadCustomers();
}

async function addNewCustomer() {
    const name = prompt("أدخل اسم العميل:");
    const phone = prompt("أدخل رقم الجوال:");
    
    if (name && phone) {
        try {
            await addDoc(collection(db, "customers"), {
                name: name,
                phone: phone,
                createdAt: new Date()
            });
            alert("تمت الإضافة بنجاح");
            location.reload(); // تحديث القائمة
        } catch (e) {
            alert("خطأ في الإضافة");
        }
    }
}

async function loadCustomers() {
    const list = document.getElementById('customers-list');
    const snap = await getDocs(collection(db, "customers"));
    list.innerHTML = snap.docs.map(doc => `
        <div style="padding:10px; border-bottom:1px solid #eee;">
            <i class="fas fa-user"></i> ${doc.data().name} - ${doc.data().phone}
        </div>
    `).join('');
}
