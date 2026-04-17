import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-file-invoice"></i> نظام إدارة الطلبات</h2>
                <div style="display:flex; gap:10px;">
                    <button id="btn-add-order" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                        <i class="fas fa-plus"></i> إنشاء طلب جديد
                    </button>
                    <button id="btn-refresh" style="background:#3498db; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                        <i class="fas fa-sync-alt"></i> تحديث
                    </button>
                </div>
            </div>

            <div id="orders-list-target" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:20px;">
                <p style="text-align:center; grid-column:1/-1;">جاري تحميل البيانات...</p>
            </div>
        </div>
    `;

    // ربط الأزرار
    document.getElementById('btn-refresh').onclick = loadOrders;
    document.getElementById('btn-add-order').onclick = showAddOrderForm;

    await loadOrders();
}

async function loadOrders() {
    const target = document.getElementById('orders-list-target');
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            target.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; background:#f9f9f9; border-radius:15px;">لا توجد طلبات.</div>`;
            return;
        }

        target.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            // تجميع العنوان الكامل
            const fullAddress = `${o.shippingAddress?.city || o.city || ''}، ${o.shippingAddress?.district || o.district || ''}، ${o.shippingAddress?.street || o.street || ''}`;
            
            return `
                <div class="order-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 12px rgba(0,0,0,0.08); border-top:5px solid #3498db;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <span style="font-weight:bold; color:#3498db;"># ${o.orderNumber || '---'}</span>
                        <span style="background:#ebf5fb; color:#3498db; padding:3px 10px; border-radius:10px; font-size:0.8rem;">${o.status || 'جديد'}</span>
                    </div>
                    
                    <h4 style="margin:0 0 10px 0; color:#2c3e50;">${o.customerName || 'عميل غير مسجل'}</h4>
                    
                    <div style="font-size:0.9rem; color:#666; margin-bottom:15px; line-height:1.6;">
                        <div><i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> <strong>العنوان الكامل:</strong> ${fullAddress}</div>
                        <div><i class="fas fa-phone" style="color:#27ae60;"></i> ${o.phone || o.shippingAddress?.phone || '---'}</div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:15px; border-top:1px solid #eee;">
                        <span style="font-size:1.2rem; font-weight:bold; color:#2c3e50;">${o.total || 0} ريال</span>
                        <button onclick="window.printOrder('${doc.id}')" style="background:#f1f2f6; border:none; padding:8px 15px; border-radius:5px; color:#2c3e50; cursor:pointer;">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        target.innerHTML = "خطأ في تحميل الطلبات.";
    }
}

// وظيفة الطباعة
window.printOrder = function(orderId) {
    alert("سيتم تحويلك لصفحة الطباعة للطلب رقم: " + orderId);
    // window.open(`print-invoice.html?id=${orderId}`, '_blank');
};

// وظيفة إنشاء طلب جديد (نافذة منبثقة بسيطة)
function showAddOrderForm() {
    const name = prompt("اسم العميل:");
    const amount = prompt("المبلغ الإجمالي:");
    const city = prompt("المدينة (مثلاً: حائل):");
    
    if (name && amount) {
        addDoc(collection(db, "orders"), {
            customerName: name,
            total: parseFloat(amount),
            city: city,
            orderNumber: "TERA-" + Math.floor(Math.random() * 10000),
            createdAt: new Date().toISOString(),
            status: "جديد"
        }).then(() => {
            alert("تم إنشاء الطلب بنجاح!");
            loadOrders();
        });
    }
}
