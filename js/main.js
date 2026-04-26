/**
 * main.js - Fi-Khidmatik Core
 * المسارات المحدثة بناءً على صور الهيكل الفعلي
 */

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'payments':  'admin/modules/payments.html',
    'invoice':   'admin/modules/invoice.html',
    'settings':  'admin/modules/settings.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // تنظيف الحاوية لمنع التداخل
        container.innerHTML = `<div style="text-align:center; padding:100px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i></div>`;

        // تحميل ملف HTML مع كاسر التخزين المؤقت
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // معالجة موديول العملاء بناءً على الصور المرفقة
        if (moduleName === 'customers') {
            handleCustomersLoading(container);
        }

    } catch (error) {
        console.error("خطأ في التحميل:", error);
        container.innerHTML = `<div style="padding:20px; color:red;">خطأ: تعذر تحميل الصفحة.</div>`;
    }
}

async function handleCustomersLoading(container) {
    // 1. إصلاح مسار CSS: الملف موجود في مجلد css/ وليس js/
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`; // المسار الصحيح بناءً على صورك
        document.head.appendChild(link);
    }

    // 2. استيراد JavaScript: الملف موجود في مجلد js/modules/
    try {
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                // البحث عن الحاوية الداخلية في ملف customers.html
                const contentDiv = document.getElementById('customers-module-container');
                module.initCustomersUI(contentDiv || container);
            }, 100);
        }
    } catch (err) {
        console.error("خطأ في تحميل موديول JS للعملاء:", err);
    }
}

// التوجيه بناءً على Hash الرابط
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
