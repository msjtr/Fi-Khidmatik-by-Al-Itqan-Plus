/**
 * js/modules/dashboard.js
 * موديول لوحة التحكم الرئيسية
 * @version 2.0.0
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, query, orderBy, limit, 
    where, Timestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===================== دوال مساعدة =====================

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount) + ' ر.س';
}

/**
 * عرض إشعار منبثق
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
        font-family: 'Tajawal', sans-serif;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/**
 * حساب إجمالي المبيعات (محسن)
 */
async function calculateTotalSales() {
    try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        let total = 0;
        ordersSnap.forEach(doc => {
            total += doc.data().total || 0;
        });
        return total;
    } catch (error) {
        console.error("Error calculating total sales:", error);
        return 0;
    }
}

/**
 * حساب عدد الطلبات اليوم
 */
async function getTodayOrdersCount() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(today);
        
        const q = query(collection(db, "orders"), where("createdAt", ">=", todayTimestamp));
        const snap = await getDocs(q);
        return snap.size;
    } catch (error) {
        console.error("Error getting today orders:", error);
        return 0;
    }
}

/**
 * حساب عدد المنتجات منخفضة المخزون
 */
async function getLowStockProducts() {
    try {
        const q = query(collection(db, "products"), where("stock", "<=", 5));
        const snap = await getDocs(q);
        return snap.size;
    } catch (error) {
        console.error("Error getting low stock products:", error);
        return 0;
    }
}

/**
 * تحميل الإحصائيات (محسن)
 */
async function loadStats() {
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                <span style="margin-right: 10px;">جاري تحميل الإحصائيات...</span>
            </div>
        `;
    }
    
    try {
        // تنفيذ الاستعلامات بشكل متوازي لتحسين الأداء
        const [productsSnap, ordersSnap, customersSnap, totalSales, todayOrders, lowStock] = await Promise.all([
            getDocs(collection(db, "products")),
            getDocs(collection(db, "orders")),
            getDocs(collection(db, "customers")),
            calculateTotalSales(),
            getTodayOrdersCount(),
            getLowStockProducts()
        ]);
        
        return {
            products: productsSnap.size,
            orders: ordersSnap.size,
            customers: customersSnap.size,
            totalSales: totalSales,
            todayOrders: todayOrders,
            lowStock: lowStock,
            totalSalesFormatted: formatCurrency(totalSales)
        };
    } catch (error) {
        console.error("Error loading stats:", error);
        showNotification('فشل تحميل الإحصائيات', 'error');
        return {
            products: 0,
            orders: 0,
            customers: 0,
            totalSales: 0,
            todayOrders: 0,
            lowStock: 0,
            totalSalesFormatted: '0 ر.س'
        };
    }
}

/**
 * تحميل آخر الطلبات
 */
async function loadRecentOrders() {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #95a5a6;">
            <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
        </div>
    `;
    
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #95a5a6;">
                    <i class="fas fa-inbox fa-2x" style="margin-bottom: 10px; display: block;"></i>
                    لا توجد طلبات مسجلة
                </div>
            `;
            return;
        }
        
        container.innerHTML = snap.docs.map(doc => {
            const order = doc.data();
            const date = order.createdAt?.toDate?.() 
                ? order.createdAt.toDate().toLocaleDateString('ar-SA') 
                : '---';
            
            const status = order.status || 'pending';
            const statusColor = status === 'paid' ? '#27ae60' : status === 'pending' ? '#e67e22' : '#e74c3c';
            const statusText = status === 'paid' ? 'مدفوع' : status === 'pending' ? 'قيد الانتظار' : 'متأخر';
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer;" onclick="window.switchModule('orders')">
                    <div style="flex: 2;">
                        <strong style="color: #2c3e50;">${escapeHtml(order.customerName || '---')}</strong>
                        <div style="font-size: 0.7rem; color: #95a5a6; margin-top: 3px;">
                            <i class="far fa-calendar-alt"></i> ${date} | 
                            <span style="color: ${statusColor};">${statusText}</span>
                        </div>
                    </div>
                    <div style="text-align: left;">
                        <div style="color: #27ae60; font-weight: bold;">${formatCurrency(order.total || 0)}</div>
                        <div style="font-size: 0.65rem; color: #95a5a6;">${order.orderNumber || '---'}</div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error loading recent orders:", error);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i> حدث خطأ في تحميل الطلبات
                <button onclick="loadRecentOrders()" style="display: block; margin: 10px auto; background: #e67e22; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
    }
}

/**
 * تحديث الإحصائيات بشكل دوري
 */
let refreshInterval = null;

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(async () => {
        console.log('🔄 تحديث الإحصائيات...');
        const stats = await loadStats();
        updateStatsUI(stats);
        await loadRecentOrders();
    }, 30000); // كل 30 ثانية
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

/**
 * تحديث واجهة الإحصائيات
 */
function updateStatsUI(stats) {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;
    
    statsGrid.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-box fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.8rem;">${stats.products}</h3>
            <p style="margin: 0; opacity: 0.9;">المنتجات</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-receipt fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.8rem;">${stats.orders}</h3>
            <p style="margin: 0; opacity: 0.9;">الطلبات</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-users fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.8rem;">${stats.customers}</h3>
            <p style="margin: 0; opacity: 0.9;">العملاء</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-chart-line fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.5rem;">${stats.totalSalesFormatted}</h3>
            <p style="margin: 0; opacity: 0.9;">إجمالي المبيعات</p>
        </div>
    `;
}

/**
 * منع هجمات XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===================== الدالة الرئيسية =====================

/**
 * تهيئة موديول لوحة التحكم
 */
export async function initDashboard(container) {
    if (!container) {
        console.error("❌ container غير موجود");
        return;
    }
    
    // تحميل الإحصائيات
    const stats = await loadStats();
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <!-- الرأس -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h1 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-chart-line" style="color: #e67e22;"></i> 
                        لوحة التحكم الرئيسية
                    </h1>
                    <p style="color: #7f8c8d; margin: 5px 0 0;">مرحباً بك في نظام تيرا جيتواي</p>
                </div>
                <div style="background: white; padding: 10px 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <i class="fas fa-calendar-alt" style="color: #e67e22;"></i> 
                    ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
            
            <!-- بطاقات الإحصائيات -->
            <div id="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="display: flex; justify-content: center; align-items: center; min-height: 120px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                </div>
            </div>
            
            <!-- إحصائيات إضافية -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <i class="fas fa-calendar-day fa-2x" style="color: #3498db;"></i>
                    <h3 style="margin: 10px 0 5px; font-size: 1.5rem;">${stats.todayOrders}</h3>
                    <p style="margin: 0; color: #7f8c8d;">طلبات اليوم</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: #e67e22;"></i>
                    <h3 style="margin: 10px 0 5px; font-size: 1.5rem; color: ${stats.lowStock > 0 ? '#e67e22' : '#27ae60'};">${stats.lowStock}</h3>
                    <p style="margin: 0; color: #7f8c8d;">منتجات منخفضة المخزون</p>
                </div>
            </div>
            
            <!-- اختصارات سريعة -->
            <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50;">
                    <i class="fas fa-bolt" style="color: #e67e22;"></i> اختصارات سريعة
                </h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="window.switchModule('products')" 
                            style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                        <i class="fas fa-box"></i> إدارة المنتجات
                    </button>
                    <button onclick="window.switchModule('orders')" 
                            style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                        <i class="fas fa-receipt"></i> إنشاء فاتورة
                    </button>
                    <button onclick="window.switchModule('customers')" 
                            style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                        <i class="fas fa-user-plus"></i> إضافة عميل
                    </button>
                    <button onclick="window.switchModule('settings')" 
                            style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                        <i class="fas fa-cog"></i> الإعدادات
                    </button>
                </div>
            </div>
            
            <!-- آخر الطلبات -->
            <div style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50;">
                    <i class="fas fa-clock" style="color: #e67e22;"></i> آخر الطلبات
                </h3>
                <div id="recent-orders-list" style="max-height: 400px; overflow-y: auto;">
                    <div style="text-align: center; padding: 20px; color: #95a5a6;">
                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .stat-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;
            }
            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            }
        </style>
    `;
    
    // تحديث واجهة الإحصائيات
    updateStatsUI(stats);
    
    // تحميل آخر الطلبات
    await loadRecentOrders();
    
    // بدء التحديث التلقائي
    startAutoRefresh();
}

// عند إغلاق الصفحة، أوقف التحديث التلقائي
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// ===================== تصدير الدوال =====================
export { loadStats, loadRecentOrders, startAutoRefresh, stopAutoRefresh };
