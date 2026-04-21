import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('customers-core.js loaded');

export async function initCustomers(container) {
    console.log('initCustomers started');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="list">جاري التحميل...</div></div>';
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const div = document.getElementById('list');
        if (snap.empty) {
            div.innerHTML = '<p>لا يوجد عملاء</p>';
            return;
        }
        let html = '<table border="1" style="border-collapse:collapse;width:100%">';
        html += '<tr><th>#</th><th>الاسم</th><th>الجوال</th><th>البريد</th></tr>';
        let i = 1;
        snap.forEach(doc => {
            const d = doc.data();
            html += `<tr><td>${i}</td><td>${d.name || '-'}</td><td>${d.phone || '-'}</td><td>${d.email || '-'}</td></tr>`;
            i++;
        });
        html += '</table>';
        div.innerHTML = html;
    } catch(e) {
        document.getElementById('list').innerHTML = '<p style="color:red">خطأ: ' + e.message + '</p>';
    }
}

export default { initCustomers };
