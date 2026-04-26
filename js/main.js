/**
 * main.js - Fi-Khidmatik Core
 * تم اعتماد المسار: css/customers.css
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
        // تنظيف الحاوية لمنع تداخل الصفحات
        container.innerHTML = `<div style="text-align:center; padding:100px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i></div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // التحقق من موديول العملاء
        if (moduleName === 'customers') {
            await loadCustomersStyleAndScript(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

async function loadCustomersStyleAndScript(container) {
    // 1. التأكد من مسار CSS الصحيح (fi-khidmatik/css/customers.css)
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`; // السطر الأهم للتصحيح
        document.head.appendChild(link);
    }

    // 2. تحميل سكربت الواجهة الخاص بالعملاء
    try {
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-ui-root') || container;
                module.initCustomersUI(target);
            }, 100);
        }
    } catch (err) {
        console.warn("Customer UI Script error:", err);
    }
}

// مراقبة الروابط
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
