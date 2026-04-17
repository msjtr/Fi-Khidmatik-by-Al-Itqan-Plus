// js/modules/orders.js
import { db } from '../core/firebase.js';
import { collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2><i class="fas fa-box"></i> الطلبات الحالية</h2>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="order-search" placeholder="بحث برقم الطلب..." style="padding:8px; border-radius:5px; border:1px solid #ddd;">
                    <button id="refresh-btn" class="btn-primary" style="padding:8px 15px; cursor:pointer;">تحديث <i class="fas fa-sync"></i></button>
                </div>
            </div>
            <div id="orders-list">جاري التحميل...</div>
        </div>
    `;

    // ربط زر التحديث
    document.getElementById('refresh-btn').onclick = () => loadOrders();
    // ربط البحث
    document.getElementById('order-search').oninput = (e) => filterOrders(e.target.value);

    await loadOrders();
}

async function loadOrders() {
    const list = document.getElementById('orders-list');
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.currentOrders = orders; // تخزين مؤقت للفلترة
        renderOrders(orders);
    } catch (e) {
        list.innerHTML = "خطأ في جلب البيانات.";
    }
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    list.innerHTML = orders.map(o => `
        <div class="order-card" style="background:#fff; padding:15px; border-radius:10px; margin-bottom:10px; border-right:5px solid #2ecc71; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between;">
                <strong>${o.customerName || 'عميل'}</strong>
                <span>${o.total || 0} ريال</span>
            </div>
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button onclick="changeStatus('${o.id}', 'completed')" style="color:green; border:none; background:none; cursor:pointer;"><i class="fas fa-check"></i> اكتمال</button>
                <button onclick="window.open('print.html?id=${o.id}')" style="color:#3498db; border:none; background:none; cursor:pointer;"><i class="fas fa-print"></i> طباعة</button>
            </div>
        </div>
    `).join('');
}

// جعل الدالة عامة ليراها المتصفح
window.changeStatus = async (id, status) => {
    if(confirm('تغيير حالة الطلب؟')) {
        await updateDoc(doc(db, "orders", id), { status });
        alert('تم التحديث');
        loadOrders();
    }
};

function filterOrders(term) {
    const filtered = window.currentOrders.filter(o => 
        (o.orderNumber || '').toString().includes(term) || 
        (o.customerName || '').includes(term)
    );
    renderOrders(filtered);
}
