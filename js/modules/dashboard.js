/**
 * js/modules/dashboard.js
 * موديول لوحة التحكم الرئيسية - الإصدار المطور V12.12.8
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
        // تنفيذ الاستعلامات بشكل متوازي لتحسين سرعة الاستجابة
        const [productsSnap, ordersSnap, customersSnap] = await Promise.all([
            getDocs(collection(db, COLLECTIONS.inventory)),
            getDocs(collection(db, COLLECTIONS.orders)),
            getDocs(collection(db, COLLECTIONS.customers))
        ]);

        let totalSales = 0;
        let hailCustomers = 0;
        
        // حساب المبيعات
        ordersSnap.forEach(doc => {
            totalSales += doc.data().total || 0;
        });

        // إحصائيات العملاء (تصفية منطقة حائل)
        customersSnap.forEach(doc => {
            if (doc.data().city === 'حائل' || doc.data().region === 'Hail') {
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
        return null;
    }
}

/**
 * تحديث واجهة الإحصائيات بتصميم "نيومورفيزم" ملون
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
    
    // وضع الهيكل البنائي أولاً
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #2c3e50; margin: 0;">لوحة تحكم ${APP_CONFIG.name}</h1>
                    <p style="color: #7f8c8d;">الإصدار ${APP_CONFIG.version} | منطقة حائل</p>
                </div>
                <div id="live-clock" style="font-weight: bold; color: #e67e22;"></div>
            </div>
            
            <div id="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <!-- سيتم تحميل الإحصائيات هنا -->
            </div>

            <div style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0;"><i class="fas fa-history"></i> آخر عمليات التقسيط</h3>
                <div id="recent-orders-list"> جاري جلب البيانات... </div>
            </div>
        </div>
    `;

    // تحميل البيانات الحقيقية
    const stats = await loadStats();
    updateStatsUI(stats);
    
    // تشغيل التحديث التلقائي كل دقيقة لتقليل استهلاك الكوتا
    setInterval(async () => {
        const newStats = await loadStats();
        updateStatsUI(newStats);
    }, 60000);
}
