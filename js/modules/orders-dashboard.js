/**
 * js/modules/orders-dashboard.js
 * عرض الطلبات من Firebase مباشرة
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('🚀 orders-dashboard.js تم تحميله');

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' ر.س';
}

// عرض الطلبات
async function displayOrders(container) {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-inbox fa-3x"></i>
                    <p>لا توجد طلبات مسجلة حالياً</p>
                </div>
            `;
            return;
        }
        
        let totalSales = 0;
        let ordersHtml = '';
        
        querySnapshot.forEach(doc => {
            const order = doc.data();
            const orderId = doc.id;
            const total = order.total || 0;
            totalSales += total;
            
            const date = order.createdAt?.toDate?.() 
                ? order.createdAt.toDate().toLocaleDateString('ar-SA') 
                : 'تاريخ غير معروف';
            
            ordersHtml += `
                <div style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>رقم الطلب:</strong> ${escapeHtml(order.orderNumber || orderId.slice(0, 8))}<br>
                            <strong>العميل:</strong> ${escapeHtml(order.customerName || 'غير معروف')}<br>
                            <strong>الهاتف:</strong> ${escapeHtml(order.phone || 'غير موجود')}<br>
                            <strong>التاريخ:</strong> ${date}
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: #27ae60;">
                                ${formatCurrency(total)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // عرض الإحصائيات والطلبات
        container.innerHTML = `
            <div style="padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white; margin-bottom: 20px; text-align: center;">
                    <h3 style="margin: 0;">📊 إجمالي المبيعات</h3>
                    <div style="font-size: 2rem; font-weight: bold;">${formatCurrency(totalSales)}</div>
                    <div>عدد الطلبات: ${querySnapshot.size}</div>
                </div>
                <h3>📋 قائمة الطلبات</h3>
                ${ordersHtml}
            </div>
        `;
        
    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>حدث خطأ في تحميل الطلبات: ${error.message}</p>
            </div>
        `;
    }
}

// الدالة الرئيسية
export async function initOrdersDashboard(container) {
    console.log('✅ initOrdersDashboard تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50;">
                <i class="fas fa-receipt" style="color: #e67e22;"></i> 
                نظام الطلبات والفواتير
            </h2>
            <div id="orders-content" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>جاري تحميل الطلبات...</p>
                </div>
            </div>
        </div>
    `;
    
    const ordersContainer = document.getElementById('orders-content');
    await displayOrders(ordersContainer);
}

// دالة إضافية للتوافق
export async function initOrders(container) {
    return initOrdersDashboard(container);
}

export default { initOrdersDashboard, initOrders };
