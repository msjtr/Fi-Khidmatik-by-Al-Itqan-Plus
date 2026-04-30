/**
 * js/modules/dashboard.js
 * موديول لوحة التحكم الرئيسية - الإصدار المطور V12.12.9
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js';
import { APP_CONFIG, COLLECTIONS, FINANCIAL_CONFIG } from '../core/config.js';
import { 
    collection, getDocs, query, orderBy, limit, 
    where, Timestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===================== دوال مساعدة =====================

/**
 * تنسيق العملة بناءً على إعدادات المنصة الأساسية
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount) + ` ${FINANCIAL_CONFIG.currencySymbol}`;
}

/**
 * تحميل الإحصائيات (نسخة محسنة تدعم منطقة حائل)
 */
async function loadStats() {
    try {
        console.log("🔄 جاري محاولة جلب البيانات من Firebase...");
        
        // استخدام مسميات المجموعات من COLLECTIONS لضمان التطابق
        const [productsSnap, ordersSnap, customersSnap] = await Promise.all([
            getDocs(collection(db, COLLECTIONS.inventory || "products")),
            getDocs(collection(db, COLLECTIONS.orders || "orders")),
            getDocs(collection(db, COLLECTIONS.customers || "customers"))
        ]);

        console.log(`✅ تم جلب ${customersSnap.size} عميل بنجاح.`);

        let totalSales = 0;
        let hailCustomers = 0;
        
        ordersSnap.forEach(doc => {
            totalSales += doc.data().total || 0;
        });

        // إحصائيات العملاء (تصفية منطقة حائل)
        customersSnap.forEach(doc => {
            const data = doc.data();
            // التحقق من الحقول التي قد تحتوي على اسم المنطقة
            if (data.city === 'حائل' || data.region === 'Hail' || data.address?.includes('حائل')) {
                hailCustomers++;
            }
        });

        return {
            products: productsSnap.size,
            orders: ordersSnap.size,
            customers: customersSnap.size,
            hailRegion: hailCustomers,
            totalSales: totalSales,
            totalSalesFormatted: formatCurrency(totalSales)
        };
    } catch (error) {
        console.error("🔴 Tera Dashboard Error:", error);
        // في حال فشل الجلب، نعيد قيم صفرية لمنع تعطل الواجهة
        return { products: 0, orders: 0, customers: 0, hailRegion: 0, totalSales: 0, totalSalesFormatted: '0' };
    }
}

/**
 * جلب آخر الطلبات لعرضها في القائمة
 */
async function loadRecentOrders() {
    const listContainer = document.getElementById('recent-orders-list');
    if (!listContainer) return;

    try {
        const q = query(collection(db, COLLECTIONS.orders || "orders"), orderBy("createdAt", "desc"), limit(5));
        const snap = await getDocs(q);

        if (snap.empty) {
            listContainer.innerHTML = '<div style="padding:10px; color:#95a5a6;">لا توجد عمليات تقسيط مسجلة حالياً.</div>';
            return;
        }

        listContainer.innerHTML = snap.docs.map(doc => {
            const order = doc.data();
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #f1f5f9;">
                    <div>
                        <strong style="color: #2c3e50;">${order.customerName || 'عميل غير معروف'}</strong>
                        <div style="font-size: 0.8rem; color: #7f8c8d;">${order.orderNumber || doc.id}</div>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-weight: bold; color: #27ae60;">${formatCurrency(order.total || 0)}</div>
                        <div style="font-size: 0.7rem; color: #95a5a6;">${order.createdAt?.toDate().toLocaleDateString('ar-SA') || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        listContainer.innerHTML = '<div style="padding:10px; color:#e74c3c;">فشل تحميل العمليات الأخيرة.</div>';
    }
}

/**
 * تحديث واجهة الإحصائيات
 */
function updateStatsUI(stats) {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid || !stats) return;
    
    statsGrid.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-users fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.8rem;">${stats.customers}</h3>
            <p style="margin: 0; opacity: 0.9;">إجمالي العملاء</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-map-marker-alt fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.8rem;">${stats.hailRegion}</h3>
            <p style="margin: 0; opacity: 0.9;">عملاء حائل</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-receipt fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.8rem;">${stats.orders}</h3>
            <p style="margin: 0; opacity: 0.9;">الطلبات المنفذة</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #2c3e50 0%, #000000 100%); padding: 20px; border-radius: 15px; color: white;">
            <i class="fas fa-chart-line fa-2x"></i>
            <h3 style="margin: 10px 0 5px; font-size: 1.5rem;">${stats.totalSalesFormatted}</h3>
            <p style="margin: 0; opacity: 0.9;">حجم المبيعات</p>
        </div>
    `;
}

// ===================== الدالة الرئيسية =====================

export async function initDashboard(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #2c3e50; margin: 0;">لوحة تحكم ${APP_CONFIG.name}</h1>
                    <p style="color: #7f8c8d;">الإصدار ${APP_CONFIG.version} | منطقة حائل</p>
                </div>
                <div id="live-clock" style="font-weight: bold; color: #e67e22;"></div>
            </div>
            
            <div id="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <!-- جاري تحميل الإحصائيات... -->
            </div>

            <div style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color:#2c3e50;"><i class="fas fa-history" style="color:#e67e22;"></i> آخر عمليات التقسيط</h3>
                <div id="recent-orders-list"> جاري جلب البيانات... </div>
            </div>
        </div>
    `;

    // تحميل أولي للبيانات
    const stats = await loadStats();
    updateStatsUI(stats);
    await loadRecentOrders();
    
    // التحديث التلقائي
    setInterval(async () => {
        const newStats = await loadStats();
        updateStatsUI(newStats);
        await loadRecentOrders();
    }, 60000);
}
