/**
 * main.js - Tera Gateway 
 * الموزع الرئيسي للنظام والمسؤول عن التنقل بين الموديولات
 */

// 1. استيراد الإعدادات المركزية (تضمن تفعيل Firebase أولاً)
import { APP_CONFIG, db } from './core/config.js';

// 2. استيراد دوال تهيئة الواجهات من الموديولات
import { initCustomersUI } from './modules/customers-ui.js';

/**
 * خريطة المسارات (Routes)
 * تربط اسم الموديول بمسار ملف الـ HTML الخاص به
 */
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'settings':  'admin/modules/settings.html',
    'reports':   'admin/modules/reports.html'
};

/**
 * دالة تبديل الموديولات ديناميكياً
 * @param {string} moduleName - اسم الموديول المطلوب تحميله
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    
    if (!container) {
        // إذا لم يتم تحميل الحاوية بعد، ننتظر قليلاً ونحاول مرة أخرى
        setTimeout(() => switchModule(moduleName), 100);
        return;
    }

    const path = routes[moduleName];
    if (!path) {
        console.error(`❌ الموديول "${moduleName}" غير معرف في نظام تيرا.`);
        return;
    }

    try {
        // إظهار مؤشر التحميل
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:#64748b;">
                <i class="fas fa-circle-notch fa-spin fa-2x"></i>
                <p style="margin-top:10px;">جاري تحميل ${moduleName}...</p>
            </div>
        `;

        const response = await fetch(path);
        if (!response.ok) throw new Error(`404: فشل تحميل الملف من ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // --- تشغيل المنطق البرمجي بناءً على الموديول المحمل ---
        
        if (moduleName === 'customers') {
            // ننتظر حقن الـ HTML في المتصفح ثم نطلق الواجهة
            setTimeout(() => {
                const uiRoot = document.getElementById('customers-ui-root') || container;
                initCustomersUI(uiRoot);
            }, 50);
        }
        
        // هنا يمكنك إضافة تهيئة موديولات أخرى مستقبلاً (مثل المنتجات أو الطلبات)
        // if (moduleName === 'products') { initProductsUI(container); }

        console.log(`✅ تم تحميل موديول: ${moduleName}`);

    } catch (error) {
        console.error("❌ خطأ في التنقل بين الأقسام:", error);
        container.innerHTML = `<div class="alert-danger">حدث خطأ أثناء تحميل القسم: ${error.message}</div>`;
    }
}

/**
 * معالجة الـ Hash في الرابط (Routing)
 * مثال: index.html#customers
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
    
    // تحديث الحالة النشطة (Active) في القائمة الجانبية
    updateActiveSidebarItem(hash);
}

/**
 * تحديث شكل الزر النشط في القائمة الجانبية
 */
function updateActiveSidebarItem(activeHash) {
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemHash = item.getAttribute('href').replace('#', '');
        if (itemHash === activeHash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// استماع لتغييرات الرابط وتحميل الصفحة
window.addEventListener('load', () => {
    console.log(`🚀 نظام ${APP_CONFIG.name} جاهز العمل.`);
    handleRoute();
});

window.addEventListener('hashchange', handleRoute);

// جعل دالة التنقل متاحة للنافذة (للتحكم اليدوي إذا لزم الأمر)
window.switchModule = switchModule;
