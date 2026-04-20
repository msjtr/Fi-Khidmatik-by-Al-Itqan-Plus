/**
 * js/modules/orders-dashboard.js
 * موديول الطلبات والفواتير - تيرا جيتواي
 * @version 3.5.0
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('🚀 orders-dashboard.js تم تحميله بنجاح');

// ===================== دوال مساعدة =====================

/**
 * تحويل أي قيمة إلى نص آمن (منع هجمات XSS)
 */
function escapeHtml(str) {
    var text = String(str === undefined || str === null ? '' : str);
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * تنسيق العملة بالريال السعودي
 */
function formatCurrency(amount) {
    var num = Number(amount) || 0;
    return num.toFixed(2) + ' ر.س';
}

/**
 * تنسيق العنوان الكامل من بيانات العميل
 * يستخدم: city, district, street, buildingNo, additionalNo, poBox, country
 */
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
    return parts.length > 0 ? parts.join('، ') : '';
}

/**
 * جلب بيانات العميل الكاملة من مجموعة customers
 */
async function fetchCustomerData(customerId) {
    if (!customerId) return null;
    try {
        var customerDoc = await getDoc(doc(db, "customers", customerId));
        if (customerDoc.exists()) {
            return customerDoc.data();
        }
    } catch (error) {
        console.error("Error fetching customer:", error);
    }
    return null;
}

/**
 * دمج بيانات الطلب مع بيانات العميل (تطبيق Fallback)
 * أولوية: بيانات الطلب ← ثم بيانات العميل
 */
function mergeOrderWithCustomer(order, customer) {
    if (!customer) {
        return {
            ...order,
            customerName: order.customerName || 'غير معروف',
            phone: order.phone || 'غير موجود',
            email: order.email || '',
            address: order.shippingAddress || order.address || ''
        };
    }
    
    return {
        ...order,
        customerName: order.customerName || customer.name || 'غير معروف',
        phone: order.phone || customer.phone || 'غير موجود',
        email: order.email || customer.email || '',
        address: order.shippingAddress || order.address || formatFullAddress(customer)
    };
}

// ===================== عرض الطلبات =====================

async function displayOrders(container) {
    container.innerHTML = '<div style="padding: 40px; text-align: center;"><i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i><p style="margin-top: 10px;">جاري تحميل الطلبات...</p></div>';

    try {
        var ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        var querySnapshot = await getDocs(ordersQuery);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div style="padding: 60px 20px; text-align: center; color: #7f8c8d;">
                    <i class="fas fa-inbox fa-4x" style="margin-bottom: 15px; display: block;"></i>
                    <p>لا توجد طلبات مسجلة حالياً.</p>
                    <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-sync-alt"></i> تحديث
                    </button>
                </div>
            `;
            return;
        }

        var totalSales = 0;
        var ordersHtml = '<div style="padding: 20px;"><h3 style="margin-bottom: 20px; color: #2c3e50;">📋 قائمة الطلبات</h3>';
        
        for (var i = 0; i < querySnapshot.docs.length; i++) {
            var docSnapshot = querySnapshot.docs[i];
            var order = docSnapshot.data();
            var orderId = docSnapshot.id;
            var total = Number(order.total) || 0;
            totalSales += total;
            
            // جلب بيانات العميل باستخدام customerId
            var customer = null;
            if (order.customerId) {
                customer = await fetchCustomerData(order.customerId);
            }
            
            // دمج البيانات
            var mergedOrder = mergeOrderWithCustomer(order, customer);
            
            // تنسيق التاريخ
            var date = 'تاريخ غير معروف';
            if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                date = order.createdAt.toDate().toLocaleDateString('ar-SA');
            } else if (order.orderDate) {
                date = String(order.orderDate);
            } else if (order.createdAt) {
                date = String(order.createdAt);
            }
            
            // رقم الطلب
            var orderNumber = order.orderNumber ? String(order.orderNumber) : orderId.slice(0, 8);
            
            ordersHtml += `
                <div class="order-card" style="background: white; border-radius: 12px; padding: 18px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-right: 4px solid #e67e22; transition: transform 0.2s;">
                    
                    <!-- رأس البطاقة -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                        <span style="background: #e67e22; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">
                            🧾 ` + escapeHtml(orderNumber) + `
                        </span>
                        <span style="color: #7f8c8d; font-size: 0.8rem;">
                            <i class="far fa-calendar-alt"></i> ` + escapeHtml(date) + `
                        </span>
                    </div>
                    
                    <!-- معلومات العميل -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-user" style="color: #e67e22; width: 25px;"></i>
                            <strong style="margin-left: 8px;">العميل:</strong>
                            <span style="margin-right: 5px;">` + escapeHtml(mergedOrder.customerName) + `</span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-phone" style="color: #e67e22; width: 25px;"></i>
                            <strong style="margin-left: 8px;">الجوال:</strong>
                            <span dir="ltr" style="margin-right: 5px;">` + escapeHtml(mergedOrder.phone) + `</span>
                        </div>
                        ` + (mergedOrder.email ? `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-envelope" style="color: #e67e22; width: 25px;"></i>
                            <strong style="margin-left: 8px;">البريد:</strong>
                            <span style="margin-right: 5px;">` + escapeHtml(mergedOrder.email) + `</span>
                        </div>
                        ` : '') + `
                        ` + (mergedOrder.address ? `
                        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                            <i class="fas fa-location-dot" style="color: #e67e22; width: 25px; margin-top: 3px;"></i>
                            <strong style="margin-left: 8px;">العنوان:</strong>
                            <span style="flex: 1; margin-right: 5px;">` + escapeHtml(mergedOrder.address) + `</span>
                        </div>
                        ` : '') + `
                    </div>
                    
                    <!-- المنتجات والمبلغ -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid #eee;">
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
                        <div style="font-size: 1.3rem; font-weight: bold; color: #27ae60;">
                            ` + formatCurrency(total) + `
                        </div>
                    </div>
                    
                    <!-- الحالة -->
                    ` + (order.status ? `
                    <div style="margin-top: 10px; text-align: left;">
                        <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">
                            <i class="fas fa-info-circle"></i> الحالة: ` + escapeHtml(order.status) + `
                        </span>
                    </div>
                    ` : '') + `
                </div>
            `;
        }
        
        // إضافة إجمالي المبيعات في الأعلى
        ordersHtml = `
            <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center;">
                <h3 style="margin: 0;">💰 إجمالي المبيعات</h3>
                <div style="font-size: 1.8rem; font-weight: bold;">` + formatCurrency(totalSales) + `</div>
                <div style="margin-top: 5px;">عدد الطلبات: ` + querySnapshot.size + `</div>
            </div>
        ` + ordersHtml;
        
        ordersHtml += '</div>';
        container.innerHTML = ordersHtml;
        console.log('✅ تم عرض الطلبات بنجاح');

    } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 15px;"></i>
                <h3>حدث خطأ</h3>
                <p>` + error.message + `</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

// ===================== الدوال الرئيسية =====================

/**
 * تهيئة موديول الطلبات (الدالة الرئيسية)
 */
export async function initOrdersDashboard(container) {
    console.log('✅ initOrdersDashboard تم استدعاؤها بنجاح');
    
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

/**
 * دالة إضافية للتوافق مع main.js
 */
export async function initOrders(container) {
    console.log('🔄 initOrders تم استدعاؤها');
    return initOrdersDashboard(container);
}

// تصدير افتراضي للمكتبة
export default { initOrdersDashboard, initOrders };
