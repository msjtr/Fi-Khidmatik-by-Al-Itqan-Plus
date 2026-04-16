// js/modules/customers.js
import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <h2 style="color:#2c3e50; border-bottom:2px solid #3498db; padding-bottom:10px;">
                <i class="fas fa-users"></i> إدارة عملاء تيرا
            </h2>
            <div id="list-target" style="margin-top:20px; display:grid; gap:15px;">
                <p>جاري جلب البيانات من السحابة...</p>
            </div>
        </div>
    `;

    const target = document.getElementById('list-target');
    try {
        const q = query(collection(db, "customers"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            target.innerHTML = "<p>لا يوجد عملاء مسجلين حالياً.</p>";
            return;
        }

        target.innerHTML = snap.docs.map(doc => {
            const data = doc.data();
            return `
                <div style="background:#fff; padding:15px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1); border-right:5px solid #3498db;">
                    <strong style="display:block; font-size:1.1rem;">${data.name || 'بدون اسم'}</strong>
                    <span style="color:#666; font-size:0.9rem;"><i class="fas fa-phone"></i> ${data.phone || 'لا يوجد رقم'}</span>
                </div>
            `;
        }).join('');
    } catch (err) {
        target.innerHTML = `<p style="color:red;">خطأ في الاتصال: ${err.message}</p>`;
    }
}
