/**
 * js/core/config.js
 * إعدادات النظام العامة والتكوينات
 * @version 2.0.0
 */

// ===================== إعدادات التطبيق =====================

export const APP_CONFIG = {
    // معلومات التطبيق
    name: 'Tera Gateway',
    version: '2.0.0',
    company: 'Tera Gateway',
    
    // الإعدادات العامة
    defaultLanguage: 'ar',
    direction: 'rtl',
    
    // إعدادات واجهة المستخدم
    theme: 'light', // light, dark, auto
    sidebarState: 'expanded', // expanded, collapsed
    
    // إعدادات الأداء
    debounceDelay: 300,
    cacheTimeout: 3600000, // 1 ساعة (ملي ثانية)
    
    // وضع التطوير
    debug: true, // يعرض رسائل console.log
    demoMode: false // وضع تجريبي (لا يتصل بقاعدة بيانات حقيقية)
};

// ===================== إعدادات الضريبة =====================

export const TAX_CONFIG = {
    rate: 15, // نسبة الضريبة المئوية
    enabled: true, // تفعيل الضريبة
    includeInPrice: false, // هل الضريبة مضمنة في السعر؟
    taxName: 'ضريبة القيمة المضافة',
    taxNumber: '3101223456' // الرقم الضريبي للشركة
};

// ===================== إعدادات العملة =====================

export const CURRENCY_CONFIG = {
    code: 'SAR', // SAR, USD, AED
    symbol: 'ر.س',
    symbolPosition: 'after', // after, before
    decimalDigits: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
};

// ===================== إعدادات التاريخ والوقت =====================

export const DATE_CONFIG = {
    format: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    timezone: 'Asia/Riyadh',
    locale: 'ar-SA'
};

// ===================== إعدادات المخزون =====================

export const INVENTORY_CONFIG = {
    lowStockThreshold: 5, // تنبيه عند وصول الكمية لهذا الرقم
    criticalStockThreshold: 0, // تنبيه حرج
    enableAutoReorder: false, // طلب تلقائي عند نفاد المخزون
    enableBarcode: true, // تفعيل الباركود
    defaultReorderQuantity: 10 // الكمية الافتراضية لإعادة الطلب
};

// ===================== إعدادات الطباعة =====================

export const PRINT_CONFIG = {
    paperSize: 'A4', // A4, A5, thermal, receipt
    orientation: 'portrait', // portrait, landscape
    margin: 10, // هامش الطباعة (بكسل)
    copies: 1, // عدد النسخ
    printHeader: true, // طباعة رأس الصفحة
    printFooter: true, // طباعة تذييل الصفحة
    
    // إعدادات فاتورة التقسيط
    invoiceLogo: true, // إظهار الشعار
    invoiceFooter: 'شكراً لتعاملكم مع تيرا جيتواي',
    showInstallments: true // إظهار جدول الأقساط
};

// ===================== إعدادات المصادقة =====================

export const AUTH_CONFIG = {
    sessionTimeout: 28800000, // 8 ساعات (ملي ثانية)
    enableGuestMode: true, // السماح بالدخول كزائر
    requireEmailVerification: false, // طلب تأكيد البريد الإلكتروني
    allowedDomains: [] // النطاقات المسموحة (فارغة يعني الكل)
};

// ===================== إعدادات API =====================

export const API_CONFIG = {
    baseUrl: '/api',
    timeout: 30000, // 30 ثانية
    retryAttempts: 3, // عدد محاولات إعادة الاتصال
    retryDelay: 1000, // تأخير بين المحاولات (ملي ثانية)
    
    // نقاط النهاية (endpoints)
    endpoints: {
        products: '/products',
        orders: '/orders',
        customers: '/customers',
        settings: '/settings',
        backup: '/backup'
    }
};

// ===================== إعدادات الإشعارات =====================

export const NOTIFICATION_CONFIG = {
    enabled: true,
    duration: 3000, // مدة ظهور الإشعار (ملي ثانية)
    position: 'top-center', // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    showSound: false, // تشغيل صوت عند الإشعار
    desktopNotifications: false // إشعارات سطح المكتب
};

// ===================== إعدادات الجداول =====================

export const TABLE_CONFIG = {
    rowsPerPage: 10, // عدد الصفوف في الصفحة الواحدة
    rowsPerPageOptions: [5, 10, 25, 50, 100],
    showSearch: true,
    showFilter: true,
    enableSorting: true,
    enableExport: true // تصدير البيانات (Excel, CSV, PDF)
};

// ===================== إعدادات الـ Firebase =====================

export const FIREBASE_CONFIG = {
    collections: {
        products: 'products',
        orders: 'orders',
        customers: 'customers',
        settings: 'settings',
        users: 'users',
        backups: 'backups',
        payments: 'payments',
        installments: 'installments'
    },
    
    // قواعد التخزين المؤقت
    cache: {
        enabled: true,
        maxAge: 3600000, // 1 ساعة
        maxItems: 100
    }
};

// ===================== إعدادات الـ API الخارجية =====================

export const EXTERNAL_API_CONFIG = {
    // مثال: خدمة إرسال رسائل SMS
    sms: {
        enabled: false,
        provider: 'twilio', // twilio, nexmo, sms4saudi
        apiKey: '',
        apiSecret: '',
        sender: 'TeraGateway'
    },
    
    // مثال: خدمة البريد الإلكتروني
    email: {
        enabled: false,
        provider: 'sendgrid',
        apiKey: '',
        fromEmail: 'info@teragateway.com',
        fromName: 'Tera Gateway'
    },
    
    // مثال: خدمة الدفع الإلكتروني
    payment: {
        enabled: false,
        provider: 'hyperpay',
        merchantId: '',
        apiKey: '',
        testMode: true
    }
};

// ===================== إعدادات التقسيط =====================

export const INSTALLMENT_CONFIG = {
    defaultInstallments: 6, // عدد الأقساط الافتراضي
    maxInstallments: 24, // الحد الأقصى للأقساط
    minOrderAmount: 500, // أقل مبلغ للتقسيط
    interestRate: 0, // نسبة الفائدة (0% للتقسيط بدون فوائد)
    lateFee: 50, // رسوم التأخير الشهرية (ريال)
    enableLateFee: true, // تفعيل رسوم التأخير
    gracePeriod: 5 // فترة سماح (أيام)
};

// ===================== إعدادات النسخ الاحتياطي =====================

export const BACKUP_CONFIG = {
    autoBackup: false, // نسخ احتياطي تلقائي
    autoBackupInterval: 86400000, // كل 24 ساعة
    maxBackups: 10, // عدد النسخ الاحتياطية المحفوظة
    backupLocation: 'cloud', // cloud, local, both
    includeImages: false // تضمين الصور في النسخة الاحتياطية
};

// ===================== دالة للحصول على إعدادات مدمجة =====================

/**
 * الحصول على جميع الإعدادات في كائن واحد
 * @returns {Object} جميع الإعدادات
 */
export function getAllConfig() {
    return {
        app: APP_CONFIG,
        tax: TAX_CONFIG,
        currency: CURRENCY_CONFIG,
        date: DATE_CONFIG,
        inventory: INVENTORY_CONFIG,
        print: PRINT_CONFIG,
        auth: AUTH_CONFIG,
        api: API_CONFIG,
        notification: NOTIFICATION_CONFIG,
        table: TABLE_CONFIG,
        firebase: FIREBASE_CONFIG,
        external: EXTERNAL_API_CONFIG,
        installment: INSTALLMENT_CONFIG,
        backup: BACKUP_CONFIG
    };
}

/**
 * تحديث إعداد معين (يُستخدم من صفحة الإعدادات)
 * @param {string} category - فئة الإعداد (app, tax, currency, ...)
 * @param {string} key - اسم الإعداد
 * @param {any} value - القيمة الجديدة
 */
export function updateConfig(category, key, value) {
    const configs = {
        app: APP_CONFIG,
        tax: TAX_CONFIG,
        currency: CURRENCY_CONFIG,
        date: DATE_CONFIG,
        inventory: INVENTORY_CONFIG,
        print: PRINT_CONFIG,
        auth: AUTH_CONFIG,
        api: API_CONFIG,
        notification: NOTIFICATION_CONFIG,
        table: TABLE_CONFIG,
        firebase: FIREBASE_CONFIG,
        external: EXTERNAL_API_CONFIG,
        installment: INSTALLMENT_CONFIG,
        backup: BACKUP_CONFIG
    };
    
    if (configs[category] && configs[category][key] !== undefined) {
        configs[category][key] = value;
        console.log(`⚙️ تم تحديث الإعداد: ${category}.${key} =`, value);
        
        // حفظ في localStorage
        saveConfigToLocalStorage();
        
        return true;
    }
    
    console.warn(`⚠️ الإعداد غير موجود: ${category}.${key}`);
    return false;
}

/**
 * حفظ الإعدادات في localStorage
 */
export function saveConfigToLocalStorage() {
    const allConfig = getAllConfig();
    localStorage.setItem('tera_gateway_config', JSON.stringify(allConfig));
}

/**
 * تحميل الإعدادات من localStorage
 */
export function loadConfigFromLocalStorage() {
    const saved = localStorage.getItem('tera_gateway_config');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            
            // تحديث الإعدادات المحفوظة
            if (config.app) Object.assign(APP_CONFIG, config.app);
            if (config.tax) Object.assign(TAX_CONFIG, config.tax);
            if (config.currency) Object.assign(CURRENCY_CONFIG, config.currency);
            if (config.date) Object.assign(DATE_CONFIG, config.date);
            if (config.inventory) Object.assign(INVENTORY_CONFIG, config.inventory);
            if (config.print) Object.assign(PRINT_CONFIG, config.print);
            if (config.auth) Object.assign(AUTH_CONFIG, config.auth);
            if (config.notification) Object.assign(NOTIFICATION_CONFIG, config.notification);
            if (config.table) Object.assign(TABLE_CONFIG, config.table);
            if (config.installment) Object.assign(INSTALLMENT_CONFIG, config.installment);
            if (config.backup) Object.assign(BACKUP_CONFIG, config.backup);
            
            console.log('✅ تم تحميل الإعدادات من localStorage');
        } catch (e) {
            console.warn('⚠️ فشل تحميل الإعدادات:', e);
        }
    }
}

/**
 * إعادة تعيين الإعدادات إلى القيم الافتراضية
 */
export function resetConfig() {
    // إعادة تحميل الصفحة لاستعادة الإعدادات الافتراضية
    localStorage.removeItem('tera_gateway_config');
    window.location.reload();
}

// محاولة تحميل الإعدادات المحفوظة
loadConfigFromLocalStorage();

// تصدير افتراضي للمكتبة كاملة
export default {
    APP_CONFIG,
    TAX_CONFIG,
    CURRENCY_CONFIG,
    DATE_CONFIG,
    INVENTORY_CONFIG,
    PRINT_CONFIG,
    AUTH_CONFIG,
    API_CONFIG,
    NOTIFICATION_CONFIG,
    TABLE_CONFIG,
    FIREBASE_CONFIG,
    EXTERNAL_API_CONFIG,
    INSTALLMENT_CONFIG,
    BACKUP_CONFIG,
    getAllConfig,
    updateConfig,
    saveConfigToLocalStorage,
    loadConfigFromLocalStorage,
    resetConfig
};
