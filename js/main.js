/**
 * main.js - Tera Gateway 
 * نسخة مطابقة لملف index.html (استخدام module-container)
 */

import { initCustomers } from './modules/customers-core.js';

// خريطة المسارات المعتمدة
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'products': 'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'invoice': 'admin/modules/invoice.html',
    'payments': 'admin/modules/payments.html',
    'settings': 'admin/modules/settings.html',
    'general': 'admin/modules/general.html',
    'backup': 'admin/modules/backup.html'
};

async function switchModule(moduleName) {
    // التعديل هنا: نستخدم id مطابق لملف الـ HTML الخاص بك
    const container = document.getElementById('module-container');
    
    if (!container) {
        console.warn(`⏳ جاري انتظار تحميل الحاوية module-container...`);
        setTimeout(() => switchModule(moduleName), 200); 
        return;
    }

    const path = routes[moduleName];
    if (!path) {
        console.error(`⚠️ الموديول ${moduleName} غير معرف.`);
        return;
    }

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`فشل التحميل: ${path}`);

        const html = await response.text();
        
        // حقن المحتوى
        container.innerHTML = html;

        // تشغيل المنطق البرمجي
        initializeModuleLogic(moduleName);

    } catch (error) {
        console.error(`❌ خطأ:`, error);
        container.innerHTML = `<div style="padding:20px; color:red;">تعذر تحميل القسم: ${moduleName}</div>`;
    }
}

function initializeModuleLogic(moduleName) {
    setTimeout(() => {
        if (moduleName === 'customers') {
            // نمرر الحاوية الصحيحة لموديول العملاء
            const container = document.getElementById('module-container');
            if (container) initCustomers(container);
        }
    }, 100);
}

function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

// التشغيل
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

window.switchModule = switchModule;
