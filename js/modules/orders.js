import { db } from '../core/firebase.js';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { formatCurrency, formatDate } from '../utils/formatter.js';

let currentOrders = [];

export async function initOrdersDashboard(container) {
    container.innerHTML = await fetch('admin/modules/orders-dashboard.html').then(r => r.text());
    await loadOrders();
    document.getElementById('refresh-orders')?.addEventListener('click', loadOrders);
    document.getElementById('search-order')?.addEventListener('input', filterOrders);
    document.getElementById('status-filter')?.addEventListener('change', filterOrders);
}

async function loadOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderOrders(currentOrders);
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div><strong>رقم الطلب:</strong> ${order.orderNumber || 'N/A'}</div>
            <div><strong>العميل:</strong> ${order.customerName || 'غير محدد'}</div>
            <div><strong>التاريخ:</strong> ${formatDate(order.createdAt)}</div>
            <div><strong>الإجمالي:</strong> ${formatCurrency(order.total)}</div>
            <div><span class="order-status status-${order.status}">${order.status === 'pending' ? 'قيد الانتظار' : order.status === 'completed' ? 'مكتمل' : 'ملغي'}</span></div>
            <div class="order-actions">
                <button onclick="window.open('print.html?orderId=${order.id}', '_blank')"><i class="fas fa-print"></i></button>
                <button onclick="updateOrderStatus('${order.id}', 'completed')"><i class="fas fa-check-circle"></i></button>
                <button onclick="updateOrderStatus('${order.id}', 'cancelled')"><i class="fas fa-ban"></i></button>
            </div>
        </div>
    `).join('');
}

window.updateOrderStatus = async (orderId, status) => {
    await updateDoc(doc(db, "orders", orderId), { status });
    loadOrders();
};

function filterOrders() {
    const search = document.getElementById('search-order')?.value.toLowerCase();
    const status = document.getElementById('status-filter')?.value;
    let filtered = currentOrders;
    if (search) filtered = filtered.filter(o => (o.orderNumber || '').toLowerCase().includes(search) || (o.customerName || '').toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(o => o.status === status);
    renderOrders(filtered);
}
