/**
 * js/core/config.js
 * إعدادات منصة تيرا جيت واي - الإصدار الحديث V12.12.6
 * المطور: محمد بن صالح الشمري
 */

// 1. استيراد الخدمات المهيأة من ملف المحرك الأساسي (Firebase 10.7.1)
// استخدام مسار نسبي لضمان التوافق مع GitHub Pages ومنع خطأ 404
import { db, auth, app, storage } from './firebase.js';

// 2. الثوابت الأساسية للمنصة
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '12.12.6',
    engine: 'Tera Core v12',
    company: 'في خدمتكم | Fi Khidmatik',
    location: 'Hail, KSA',
    region: 'منطقة حائل',
    owner: 'Mohammed Al-Shammari',
    // تحسين كشف البيئة لضمان عمل المسارات بشكل صحيح
    isGithub: window.location.hostname.includes('github.io'),
    baseUrl: window.location.hostname.includes('github.io') ? '/fi-khidmatik' : ''
};

// 3. تكوين أسماء المجموعات (Collections) لضمان المركزية
export const COLLECTIONS = {
    products: 'products',
    orders: 'orders',
    customers: 'customers', 
    payments: 'payments',
    inventory: 'inventory_cards', // مخزون كروت سوا/stc
    settings: 'system_settings',
    logs: 'audit_logs'
};

// 4. الإعدادات المالية (سوق التقسيط السعودي - كروت Sawa)
export const FINANCIAL_CONFIG = {
    currency: 'SAR',
    currencySymbol: 'ر.س',
    taxRate: 0.15,
    minInstallment: 500,  // الحد الأدنى للتقسيط
    maxInstallment: 2500, // الحد الأقصى للتقسيط (حسب فئات 500 إلى 2500)
    lateFees: 0           // رسوم التأخير
};

/**
 * تحسين: دالة التحقق من جاهزية قاعدة البيانات
 * تضمن استقرار الاتصال قبل بدء عمليات الاستعلام
 */
export async function ensureDbReady() {
    try {
        if (!db) throw new Error("Firestore instance is null");
        
        // التحقق من حالة الاتصال بالإنترنت
        if (!navigator.onLine) {
            console.warn("⚠️ Tera Gateway: الجهاز غير متصل بالإنترنت.");
            return false;
        }

        return true;
    } catch (err) {
        console.error("❌ Tera Config Error:", err.message);
        return false;
    }
}

/**
 * دالة جلب الإعدادات الكاملة لسهولة الاستخدام في الموديولات
 */
export function getAllConfig() {
    return { 
        app: APP_CONFIG, 
        collections: COLLECTIONS,
        financial: FINANCIAL_CONFIG 
    };
}

// 5. إعادة تصدير الخدمات ليكون هذا الملف هو المرجع الوحيد (Single Source of Truth)
export { db, auth, app, storage };

// التصدير الافتراضي المجمع لسهولة الاستدعاء
export default {
    db, 
    auth, 
    app,
    storage,
    APP_CONFIG,
    COLLECTIONS,
    FINANCIAL_CONFIG,
    getAllConfig,
    ensureDbReady
};
