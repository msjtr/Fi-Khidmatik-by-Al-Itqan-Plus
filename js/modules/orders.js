// js/modules/orders.js
import { db } from '../core/firebase.js'; 
import { collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { formatCurrency, formatDate } from '../utils/formatter.js';

let currentOrders = [];

export async function initOrdersDashboard(container) {
    try {
        const resp = await fetch('./admin/modules/orders-dashboard.html'); 
        if (!resp.ok) throw new Error("404");
        container.innerHTML = await resp.text();
        await loadOrders();
    } catch (err) {
        container.innerHTML = `<p style="color:red; text-align:center;">خطأ في تحميل الواجهة</p>`;
    }
}

async function loadOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrders(currentOrders);
    } catch (err) { console.error(err); }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    container.innerHTML = orders.map(order => `
        <div class="order-card" style="background:#fff; padding:15px; border-radius:10px; margin-bottom:10px; border-right:5px solid #2ecc71;">
            <div><strong>العميل:</strong> ${order.customerName}</div>
            <div><strong>الإجمالي:</strong> ${formatCurrency(order.total)}</div>
            <div><strong>الحالة:</strong> ${order.status}</div>
        </div>
    `).join('');
}
