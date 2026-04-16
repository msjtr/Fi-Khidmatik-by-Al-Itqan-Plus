// js/modules/orders.js
import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 style="color:#2c3e50;"><i class="fas fa-box"></i> الطلبات الحالية</h2>
                <button onclick="location.reload()" style="background:#3498db; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">تحديث</button>
            </div>
            <div id="orders-target" style="margin-top:20px;">جاري التحميل...</div>
        </div>
    `;

    const target = document.getElementById('orders-target');
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        target.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            return `
                <div style="background:white; padding:15px; border-radius:12px; margin-bottom:12px; border-right:5px solid #2ecc71; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>طلب رقم: ${o.orderNumber || '---'}</strong>
                        <span style="background:#e8f8f5; color:#2ecc71; padding:2px 10px; border-radius:20px; font-size:0.8rem;">${o.status || 'معلق'}</span>
                    </div>
                    <div style="margin-top:8px; color:#555;">العميل: ${o.customerName || 'مجهول'}</div>
                    <div style="margin-top:5px; font-weight:bold; color:#2c3e50;">المبلغ: ${o.total || 0} ريال</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        target.innerHTML = "خطأ في جلب الطلبات.";
    }
}
