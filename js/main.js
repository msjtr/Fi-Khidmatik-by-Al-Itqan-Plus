/**
 * main.js - Tera Gateway 
 */

// استيراد التفعيل من الملف المركزي الجديد
import { db } from './core/firebase.js'; 
import { initCustomersUI } from './modules/customers-ui.js';

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders': 'admin/modules/order-form.html',
    'products': 'admin/modules/products.html',
    'settings': 'admin/modules/settings.html',
    'reports': 'admin/modules/reports.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) {
        setTimeout(() => switchModule(moduleName), 100);
        return;
    }

    const path = routes[moduleName];
    if (!path) return;

    try {
        const response = await fetch(path);
        const html = await response.text();
        container.innerHTML = html;

        if (moduleName === 'customers') {
            setTimeout(() => {
                const uiRoot = document.getElementById('customers-ui-root') || container;
                initCustomersUI(uiRoot);
            }, 50);
        }
    } catch (error) {
        console.error("❌ خطأ في التنقل:", error);
    }
}

function handleRoute() {
    const moduleName = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(moduleName);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
