// js/modules/orders.js

// التعديل الجوهري: إضافة النقطتين للخروج من المجلد الحالي
import { db } from '../core/firebase.js'; 
import { collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { formatCurrency, formatDate } from '../utils/formatter.js';

let currentOrders = [];

export async function initOrdersDashboard(container) {
    try {
        const resp = await fetch('admin/modules/orders-dashboard.html');
        if (!resp.ok) throw new Error("Interface file not found");
        container.innerHTML = await resp.text();

        await loadOrders();
        
        document.getElementById('refresh-orders')?.addEventListener('click', loadOrders);
        document.getElementById('search-order')?.addEventListener('input', filterOrders);
        document.getElementById('status-filter')?.addEventListener('change', filterOrders);
    } catch (err) {
        console.error("Dashboard Init Error:", err);
        container.innerHTML = '<p style="padding:20px; color:red;">خطأ في تحميل واجهة الطلبات.</p>';
    }
}

async function loadOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrders(currentOrders);
    } catch (err) {
        console.error("Firestore Error:", err);
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    container.innerHTML = orders.map(order => {
        // تحويل تاريخ فايربيس (Timestamp) إلى تاريخ جافا سكريبت
        const dateVal = order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt;
        
        return `
            <div class="order-card">
                <div><strong>رقم الطلب:</strong> ${order.orderNumber || 'N/A'}</div>
                <div><strong>العميل:</strong> ${order.customerName || 'غير محدد'}</div>
                <div><strong>التاريخ:</strong> ${formatDate(dateVal)}</div>
                <div><strong>الإجمالي:</strong> ${formatCurrency(order.total || 0)}</div>
                <div><span class="order-status status-${order.status}">${translateStatus(order.status)}</span></div>
                <div class="order-actions">
                    <button onclick="window.open('print.html?orderId=${order.id}', '_blank')"><i class="fas fa-print"></i></button>
                    <button onclick="updateOrderStatus('${order.id}', 'completed')"><i class="fas fa-check-circle"></i></button>
                    <button onclick="updateOrderStatus('${order.id}', 'cancelled')"><i class="fas fa-ban"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function translateStatus(s) {
    const statuses = { 'pending': 'قيد الانتظار', 'completed': 'مكتمل', 'cancelled': 'ملغي' };
    return statuses[s] || s;
}

window.updateOrderStatus = async (orderId, status) => {
    if(confirm('تغيير حالة الطلب؟')) {
        await updateDoc(doc(db, "orders", orderId), { status });
        loadOrders();
    }
};

function filterOrders() {
    const search = document.getElementById('search-order')?.value.toLowerCase();
    const status = document.getElementById('status-filter')?.value;
    let filtered = currentOrders.filter(o => {
        const mSearch = (o.orderNumber || '').toString().toLowerCase().includes(search) || 
                        (o.customerName || '').toLowerCase().includes(search);
        const mStatus = (status === 'all' || o.status === status);
        return mSearch && mStatus;
    });
    renderOrders(filtered);
}
