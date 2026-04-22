/**
 * js/core/config.js
 * إعدادات النظام العامة والتكوينات مدمجة مع قاعدة البيانات
 */

// استيراد متغيرات Firebase من الملف المخصص لها
import { db, auth, app } from './firebase.js';

// ===================== إعدادات التطبيق =====================
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.0',
    company: 'Tera Gateway',
    defaultLanguage: 'ar',
    direction: 'rtl',
    theme: 'light', 
    sidebarState: 'expanded',
    debounceDelay: 300,
    cacheTimeout: 3600000, 
    debug: true,
    demoMode: false 
};

// ===================== إعدادات الضريبة =====================
export const TAX_CONFIG = {
    rate: 15,
    enabled: true,
    includeInPrice: false,
    taxName: 'ضريبة القيمة المضافة',
    taxNumber: '3101223456'
};

// ===================== إعدادات العملة =====================
export const CURRENCY_CONFIG = {
    code: 'SAR',
    symbol: 'ر.س',
    symbolPosition: 'after',
    decimalDigits: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
};

// (بقية الإعدادات المذكورة في ملفك تبقى كما هي بدون تغيير...)
// DATE_CONFIG, INVENTORY_CONFIG, PRINT_CONFIG, AUTH_CONFIG, API_CONFIG, 
// NOTIFICATION_CONFIG, TABLE_CONFIG, FIREBASE_CONFIG, EXTERNAL_API_CONFIG,
// INSTALLMENT_CONFIG, BACKUP_CONFIG

// ... (الإبقاء على الدوال الأصلية: getAllConfig, updateConfig, saveConfigToLocalStorage, loadConfigFromLocalStorage, resetConfig)

/**
 * التصدير النهائي
 * قمنا بإضافة db و auth و app لضمان عمل الملفات التي تستدعي config.js
 */
export { db, auth, app }; 

export default {
    db,
    auth,
    app,
    APP_CONFIG,
    TAX_CONFIG,
    CURRENCY_CONFIG,
    // (أضف بقية الكائنات هنا...)
    getAllConfig,
    updateConfig,
    saveConfigToLocalStorage,
    loadConfigFromLocalStorage,
    resetConfig
};
