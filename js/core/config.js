/**
 * js/core/config.js
 * إعدادات النظام العامة
 */

// إعدادات التطبيق
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.0',
    company: 'Tera Gateway',
    taxRate: 15,
    currency: 'SAR',
    dateFormat: 'en-GB'
};

// إعدادات الضريبة
export const TAX_CONFIG = {
    rate: 15,
    enabled: true,
    includeInPrice: false
};

// إعدادات المخزون
export const INVENTORY_CONFIG = {
    lowStockThreshold: 5,
    criticalStockThreshold: 0,
    enableAutoReorder: false
};

// إعدادات الطباعة
export const PRINT_CONFIG = {
    paperSize: 'A4',
    orientation: 'portrait',
    margin: 10
};

// إعدادات API
export const API_CONFIG = {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3
};

export default {
    APP_CONFIG,
    TAX_CONFIG,
    INVENTORY_CONFIG,
    PRINT_CONFIG,
    API_CONFIG
};
