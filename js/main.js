/**
 * main.js - Core Router
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
        // تنظيف الحاوية تماماً لمنع التداخل بين الأقسام
        container.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // تحميل المنطق الخاص بموديول العملاء
        if (moduleName === 'customers') {
            initializeCustomers(container);
        }
    } catch (error) {
        console.error("Navigation Error:", error);
    }
}

async function initializeCustomers(container) {
    // تصحيح مسار CSS ليكون من مجلد css/ الرئيسي
    if (!document.getElementById('module-customers-style')) {
        const link = document.createElement('link');
        link.id = 'module-customers-style';
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    try {
        // استدعاء موديول الواجهة من js/modules/
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-module-container') || container;
                module.initCustomersUI(target);
            }, 100);
        }
    } catch (err) {
        console.warn("Customer UI Module failed to load.");
    }
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
