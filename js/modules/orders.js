import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#2c3e50;"><i class="fas fa-file-invoice-dollar"></i> الطلبات الواردة</h2>
                <button id="refresh-orders" style="background:#3498db; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">تحديث القائمة</button>
            </div>
            <div id="orders-list-target" style="display:grid; gap:15px;">
                <div style="text-align:center; padding:40px; color:#95a5a6;">جاري جلب بيانات تيرا...</div>
            </div>
        </div>
    `;

    document.getElementById('refresh-orders').onclick = loadOrders;
    await loadOrders();
}

async function loadOrders() {
    const target = document.getElementById('orders-list-target');
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            target.innerHTML = "<p>لا توجد طلبات مسجلة.</p>";
            return;
        }

        target.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            const date = o.orderDate || '---';
            const total = typeof o.total === 'number' ? o.total.toLocaleString() : o.total;
            
            return `
                <div class="order-card" style="background:white; padding:18px; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); border-right:6px solid #2ecc71;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <div style="font-weight:bold; color:#7f8c8d; font-size:0.85rem; margin-bottom:5px;">رقم الطلب: ${o.orderNumber}</div>
                            <div style="font-size:1.1rem; font-weight:bold; color:#2c3e50; margin-bottom:5px;">${o.customerName || 'عميل'}</div>
                            <div style="font-size:0.85rem; color:#95a5a6;">${date} | ${o.orderTime || ''}</div>
                        </div>
                        <div style="text-align:left;">
                            <div style="background:#e8f8f5; color:#2ecc71; padding:4px 10px; border-radius:15px; font-size:0.75rem; font-weight:bold; margin-bottom:8px; display:inline-block;">${o.status || 'جديد'}</div>
                            <div style="font-size:1.2rem; font-weight:bold; color:#27ae60;">${total} ريال</div>
                        </div>
                    </div>
                    <div style="margin-top:15px; padding-top:12px; border-top:1px solid #f8f9fa; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.85rem; color:#34495e;"><i class="fas fa-credit-card"></i> الدفع: ${o.paymentMethodName || 'مدى'}</span>
                        <button onclick="alert('تفاصيل السلة: ${o.items?.length || 0} منتجات')" style="background:#f1f2f6; border:none; padding:5px 12px; border-radius:5px; color:#3498db; cursor:pointer; font-size:0.8rem;">عرض التفاصيل</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        target.innerHTML = `<div style="color:red; padding:20px;">خطأ في جلب البيانات: ${err.message}</div>`;
    }
}
