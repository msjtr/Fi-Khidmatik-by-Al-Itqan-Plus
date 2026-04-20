/**
 * js/modules/orders-dashboard.js
 * عرض الطلبات من Firebase مباشرة - نسخة مبسطة ونظيفة
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('🚀 orders-dashboard.js (النسخة النهائية) تم تحميله');

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

// الدالة الرئيسية التي سيبحث عنها main.js
export async function initOrdersDashboard(container) {
    console.log('✅ [initOrdersDashboard] تم استدعاء الدالة بنجاح');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }

    // عرض واجهة التحميل
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif; text-align: center;">
            <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
            <p style="margin-top: 15px;">جاري تحميل بيانات الطلبات...</p>
        </div>
    `;

    try {
        // جلب الطلبات من Firebase
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(ordersQuery);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #7f8c8d;">
                    <i class="fas fa-inbox fa-3x" style="margin-bottom: 15px;"></i>
                    <p>لا توجد طلبات مسجلة حالياً.</p>
                </div>
            `;
            return;
        }

        let totalSales = 0;
        let ordersHtml = '<div style="padding: 20px;"><h3>📋 قائمة الطلبات</h3>';

        querySnapshot.forEach(doc => {
            const order = doc.data();
            const total = order.total || 0;
            totalSales += total;
            
            const date = order.createdAt?.toDate?.() 
                ? order.createdAt.toDate().toLocaleDateString('ar-SA') 
                : 'تاريخ غير معروف';
            
            ordersHtml += `
                <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px; border-right: 4px solid #e67e22;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                        <div>
                            <div><strong>رقم الطلب:</strong> ${escapeHtml(order.orderNumber || doc.id.slice(0, 8))}</div>
                            <div><strong>العميل:</strong> ${escapeHtml(order.customerName || 'غير معروف')}</div>
                            <div><strong>الهاتف:</strong> ${escapeHtml(order.phone || 'غير موجود')}</div>
                            <div><strong>التاريخ:</strong> ${date}</div>
                        </div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #27ae60;">
                            ${formatCurrency(total)}
                        </div>
                    </div>
                </div>
            `;
        });
        
        ordersHtml += `<div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
                        <h3 style="margin: 0;">💰 إجمالي المبيعات</h3>
                        <div style="font-size: 1.8rem; font-weight: bold;">${formatCurrency(totalSales)}</div>
                        <div>عدد الطلبات: ${querySnapshot.size}</div>
                    </div></div>`;
        
        container.innerHTML = ordersHtml;
        console.log('✅ تم عرض الطلبات بنجاح');

    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 15px;"></i>
                <p>حدث خطأ في تحميل الطلبات: ${error.message}</p>
                <button onclick="if(window.switchModule) window.switchModule('orders')" style="margin-top: 15px; padding: 8px 20px; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer;">إعادة المحاولة</button>
            </div>
        `;
    }
}

// دالة إضافية للتوافق مع main.js
export async function initOrders(container) {
    console.log('🔄 تم استدعاء initOrders (المرادف)');
    return initOrdersDashboard(container);
}

// تصدير افتراضي كضمان إضافي
export default { initOrdersDashboard, initOrders };
