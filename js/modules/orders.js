// js/modules/orders.js

// 1. استيراد قاعدة البيانات من ملفك المحلي (مع استخدام النقاط للخروج من المجلد)
import { db } from '../core/firebase.js';

// 2. التعديل الجوهري: استخدام الرابط الكامل (CDN) بدلاً من "firebase/firestore" لمنع خطأ Specifier
import { 
    collection, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 3. استيراد دوال التنسيق (تأكد من وجود هذا الملف في utils)
import { formatCurrency, formatDate } from '../utils/formatter.js';

let currentOrders = [];

/**
 * تهيئة لوحة الطلبات
 */
export async function initOrdersDashboard(container) {
    try {
        // تحميل واجهة الـ HTML من المسار الصحيح
        const resp = await fetch('./admin/modules/orders-dashboard.html');
        if (!resp.ok) throw new Error("Interface file not found (404)");
        container.innerHTML = await resp.text();

        // جلب البيانات من فايربيس
        await loadOrders();
        
        // ربط أحداث الأزرار (البحث والفلترة)
        document.getElementById('refresh-orders')?.addEventListener('click', loadOrders);
        document.getElementById('search-order')?.addEventListener('input', filterOrders);
        document.getElementById('status-filter')?.addEventListener('change', filterOrders);
        
    } catch (err) {
        console.error("Dashboard Init Error:", err);
        container.innerHTML = `<p style="padding:20px; color:red; text-align:center;">عذراً، تعذر تحميل واجهة الطلبات. (تأكد من مسار الملف)</p>`;
    }
}

/**
 * جلب الطلبات من Firestore
 */
async function loadOrders() {
    const listContainer = document.getElementById('orders-list');
    if (listContainer) listContainer.innerHTML = '<p style="text-align:center; padding:20px;">جاري تحديث البيانات...</p>';

    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        currentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOrders(currentOrders);
    } catch (err) {
        console.error("Firestore Load Error:", err);
        if (listContainer) listContainer.innerHTML = '<p style="color:red; text-align:center;">خطأ في الاتصال بقاعدة البيانات.</p>';
    }
}

/**
 * عرض الطلبات في الواجهة
 */
function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">لا توجد طلبات حالية.</p>';
        return;
    }

    container.innerHTML = orders.map(order => {
        // معالجة التاريخ ليعمل مع Timestamp الخاص بفايربيس
        const dateVal = order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt;
        
        return `
            <div class="order-card">
                <div class="card-info">
                    <div><strong>رقم الطلب:</strong> ${order.orderNumber || 'N/A'}</div>
                    <div><strong>العميل:</strong> ${order.customerName || 'غير محدد'}</div>
                    <div><strong>التاريخ:</strong> ${formatDate(dateVal)}</div>
                    <div><strong>الإجمالي:</strong> ${formatCurrency(order.total || 0)}</div>
                    <div>
                        <span class="order-status status-${order.status || 'pending'}">
                            ${translateStatus(order.status)}
                        </span>
                    </div>
                </div>
                <div class="order-actions" style="margin-top:15px; display:flex; gap:10px;">
                    <button class="btn-icon" onclick="window.open('print.html?orderId=${order.id}', '_blank')" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-icon success" onclick="updateOrderStatus('${order.id}', 'completed')" title="اعتماد">
                        <i class="fas fa-check-circle"></i>
                    </button>
                    <button class="btn-icon danger" onclick="updateOrderStatus('${order.id}', 'cancelled')" title="إلغاء">
                        <i class="fas fa-ban"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * ترجمة حالة الطلب
 */
function translateStatus(s) {
    const statuses = { 'pending': 'قيد الانتظار', 'completed': 'مكتمل', 'cancelled': 'ملغي' };
    return statuses[s] || 'غير معروف';
}

/**
 * تحديث حالة الطلب في فايربيس
 */
window.updateOrderStatus = async (orderId, status) => {
    if(confirm('هل أنت متأكد من تغيير حالة هذا الطلب؟')) {
        try {
            await updateDoc(doc(db, "orders", orderId), { status });
            await loadOrders(); // إعادة تحميل القائمة
        } catch (err) {
            console.error("Update Status Error:", err);
            alert("فشل تحديث الحالة.");
        }
    }
};

/**
 * فلترة البحث
 */
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
