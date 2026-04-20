/**
 * js/modules/orders-dashboard.js
 * موديول الطلبات - عرض بيانات العملاء بشكل كامل
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('🚀 orders-dashboard.js تم تحميله بنجاح');

// ===================== دوال مساعدة =====================

function escapeHtml(str) {
    var text = String(str === undefined || str === null ? '' : str);
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatCurrency(amount) {
    var num = Number(amount) || 0;
    return num.toFixed(2) + ' ر.س';
}

function formatFullAddress(customer) {
    if (!customer) return '';
    var parts = [];
    if (customer.buildingNo) parts.push('مبنى ' + customer.buildingNo);
    if (customer.street) parts.push('شارع ' + customer.street);
    if (customer.district) parts.push('حي ' + customer.district);
    if (customer.city) parts.push(customer.city);
    if (customer.additionalNo) parts.push('رقم إضافي ' + customer.additionalNo);
    if (customer.poBox) parts.push('ص.ب ' + customer.poBox);
    if (customer.country) parts.push(customer.country);
    return parts.length > 0 ? parts.join('، ') : 'لا يوجد عنوان';
}

// ===================== عرض الطلبات =====================

async function displayOrders(container) {
    container.innerHTML = '<div style="padding: 40px; text-align: center;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>جاري تحميل الطلبات...</p></div>';

    try {
        var ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        var querySnapshot = await getDocs(ordersQuery);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: #7f8c8d;"><i class="fas fa-inbox fa-3x"></i><p>لا توجد طلبات مسجلة حالياً.</p></div>';
            return;
        }

        var totalSales = 0;
        var ordersHtml = '<div style="padding: 20px;"><h3 style="margin-bottom: 20px;">📋 قائمة الطلبات</h3>';
        
        for (var i = 0; i < querySnapshot.docs.length; i++) {
            var docSnapshot = querySnapshot.docs[i];
            var order = docSnapshot.data();
            var orderId = docSnapshot.id;
            var total = Number(order.total) || 0;
            totalSales += total;
            
            // محاولة جلب بيانات العميل إذا كان هناك customerId
            var customer = null;
            var customerId = order.customerId;
            if (customerId) {
                try {
                    var customerDoc = await getDoc(doc(db, "customers", customerId));
                    if (customerDoc.exists()) {
                        customer = customerDoc.data();
                    }
                } catch (err) {
                    console.error("خطأ في جلب العميل:", err);
                }
            }
            
            // دمج البيانات (الطلب + العميل)
            var customerName = order.customerName || (customer ? customer.name : 'غير معروف');
            var phone = order.phone || (customer ? customer.phone : 'غير موجود');
            var email = order.email || (customer ? customer.email : '');
            var address = order.address || order.shippingAddress || (customer ? formatFullAddress(customer) : '');
            
            // تنسيق التاريخ
            var date = 'تاريخ غير معروف';
            if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                date = order.createdAt.toDate().toLocaleDateString('ar-SA');
            } else if (order.orderDate) {
                date = String(order.orderDate);
            } else if (order.createdAt) {
                date = String(order.createdAt);
            }
            
            var orderNumber = order.orderNumber ? String(order.orderNumber) : orderId.slice(0, 8);
            
            ordersHtml += `
                <div style="background: white; border-radius: 12px; padding: 18px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-right: 4px solid #e67e22;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                        <span style="background: #e67e22; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">
                            🧾 ` + escapeHtml(orderNumber) + `
                        </span>
                        <span style="color: #7f8c8d; font-size: 0.8rem;">
                            <i class="far fa-calendar-alt"></i> ` + escapeHtml(date) + `
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-user" style="color: #e67e22; width: 25px;"></i>
                            <strong style="width: 70px;">العميل:</strong>
                            <span>` + escapeHtml(customerName) + `</span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-phone" style="color: #e67e22; width: 25px;"></i>
                            <strong style="width: 70px;">الجوال:</strong>
                            <span dir="ltr">` + escapeHtml(phone) + `</span>
                        </div>
                        ` + (email ? `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-envelope" style="color: #e67e22; width: 25px;"></i>
                            <strong style="width: 70px;">البريد:</strong>
                            <span>` + escapeHtml(email) + `</span>
                        </div>
                        ` : '') + `
                        ` + (address ? `
                        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                            <i class="fas fa-location-dot" style="color: #e67e22; width: 25px; margin-top: 3px;"></i>
                            <strong style="width: 70px;">العنوان:</strong>
                            <span style="flex: 1;">` + escapeHtml(address) + `</span>
                        </div>
                        ` : '') + `
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #eee;">
                        <div>
                            <span style="color: #7f8c8d; font-size: 0.8rem;">
                                <i class="fas fa-box"></i> المنتجات: ` + (order.items ? order.items.length : 0) + `
                            </span>
                            ` + (order.paymentMethodName ? `
                            <span style="color: #7f8c8d; font-size: 0.8rem; margin-right: 15px;">
                                <i class="fas fa-credit-card"></i> ` + escapeHtml(order.paymentMethodName) + `
                            </span>
                            ` : '') + `
                        </div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: #27ae60;">
                            ` + formatCurrency(total) + `
                        </div>
                    </div>
                    
                    ` + (order.status ? `
                    <div style="margin-top: 10px; text-align: left;">
                        <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">
                            الحالة: ` + escapeHtml(order.status) + `
                        </span>
                    </div>
                    ` : '') + `
                </div>
            `;
        }
        
        ordersHtml = `
            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
                <h3 style="margin: 0;">💰 إجمالي المبيعات</h3>
                <div style="font-size: 1.8rem; font-weight: bold;">` + formatCurrency(totalSales) + `</div>
                <div>عدد الطلبات: ` + querySnapshot.size + `</div>
            </div>
        ` + ordersHtml;
        
        ordersHtml += '</div>';
        container.innerHTML = ordersHtml;
        console.log('✅ تم عرض الطلبات بنجاح');

    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>حدث خطأ: ` + error.message + `</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer;">إعادة المحاولة</button>
            </div>
        `;
    }
}

// ===================== الدوال الرئيسية =====================

export async function initOrdersDashboard(container) {
    console.log('✅ initOrdersDashboard تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }

    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-receipt" style="color: #e67e22;"></i> 
                نظام الطلبات والفواتير
            </h2>
            <div id="orders-content" style="margin-top: 20px;"></div>
        </div>
    `;
    
    var ordersContainer = document.getElementById('orders-content');
    await displayOrders(ordersContainer);
}

export async function initOrders(container) {
    return initOrdersDashboard(container);
}

export default { initOrdersDashboard, initOrders };
