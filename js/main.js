/**
 * main.js - Fi-Khidmatik Core
 * المسارات المعتمدة: CSS في مجلد css/ والسكربتات في js/modules/
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

let activeModuleInstance = null;

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. تنظيف الحاوية لمنع ظهور محتوى الصفحة السابقة (حل مشكلة التداخل)
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i>
            </div>`;

        // 2. تحديث روابط القائمة الجانبية (Active State)
        updateSidebarUI(moduleName);

        // 3. جلب ملف الـ HTML مع كاسر التخزين المؤقت
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 4. تحميل الملفات المساعدة عند فتح قسم "قاعدة العملاء"
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        }

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:red; text-align:center;">تعذر تحميل القسم المطلوب.</div>`;
    }
}

async function loadCustomersModule(container) {
    // التصحيح: ربط ملف التنسيق من المسار الذي أكدته (css/customers.css)
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`; 
        document.head.appendChild(link);
    }

    // تحميل موديول الـ JS الخاص بالعملاء من js/modules/
    try {
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                // البحث عن حاوية المحتوى داخل ملف customers.html
                const target = document.getElementById('customers-module-container') || container;
                activeModuleInstance = module.initCustomersUI(target);
                
                // تفعيل جسر التواصل لربط أزرار onclick بالدوال البرمجية
                setupCustomerBridge(module);
            }, 100);
        }
    } catch (err) {
        console.error("Failed to load customer script:", err);
    }
}

/**
 * جسر التواصل (Bridge): لجعل دوال الموديول متاحة لأزرار onclick في HTML
 */
function setupCustomerBridge(module) {
    window.saveCustomer = module.saveCustomer || null;
    window.closeCustomerModal = module.closeCustomerModal || null;
    window.openAddCustomer = module.openAddCustomer || null;
    window.deleteCustomer = module.deleteCustomer || null;
}

function updateSidebarUI(activeModule) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeModule}`);
    });
}

function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// تشغيل النظام عند التحميل وعند تغيير الرابط
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// إتاحة الدالة عالمياً
window.switchModule = switchModule;
