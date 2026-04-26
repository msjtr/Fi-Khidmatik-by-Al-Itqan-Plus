/**
 * main.js - Fi-Khidmatik Core
 * تم تحديث المسارات بناءً على:
 * - ملف الأدمن في الجذر الرئيسي /admin.html
 * - الشعار في مجلد الصور /images/logo.svg
 */

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'payments':  'admin/modules/payments.html',
    'invoice':   'admin/modules/invoice.html',
    'settings':  'admin/modules/settings.html',
    'backup':    'admin/modules/backup.html',
    'general':   'admin/modules/general.html'
};

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // تنظيف الحاوية ووضع مؤشر تحميل
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-circle-notch fa-spin fa-2x" style="color:#2563eb;"></i>
            </div>`;

        // تحديث حالة القائمة الجانبية
        updateSidebarUI(moduleName);

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`لم يتم العثور على الملف: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // تنفيذ إعدادات الموديولات الخاصة
        handleModuleScripts(moduleName, container);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:#ef4444; border:1px dashed;">خطأ في تحميل القسم: ${moduleName}</div>`;
    }
}

function updateSidebarUI(activeModule) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeModule}`);
    });
}

async function handleModuleScripts(moduleName, container) {
    // تحميل تنسيق العملاء من المسار الصحيح /css/
    if (moduleName === 'customers') {
        const styleId = 'module-customers-style';
        if (!document.getElementById(styleId)) {
            const link = document.createElement('link');
            link.id = styleId;
            link.rel = 'stylesheet';
            link.href = `css/customers.css?v=${Date.now()}`;
            document.head.appendChild(link);
        }

        // تحميل المنطق البرمجي للعملاء من /js/modules/
        try {
            const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
            if (module.initCustomersUI) {
                setTimeout(() => {
                    const target = document.getElementById('customers-module-container') || container;
                    module.initCustomersUI(target);
                }, 100);
            }
        } catch (err) {
            console.warn("Customer JS module loading failed.");
        }
    }
}

// مراقبة تغيير الروابط
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);
window.switchModule = switchModule;
