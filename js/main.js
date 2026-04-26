/**
 * main.js - Fi-Khidmatik Core
 * المحرك الرئيسي لإدارة التنقل وتحميل الأقسام برمجياً
 * المسار المعتمد للموديولات: js/modules/
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

/**
 * دالة تبديل الأقسام (Module Switcher)
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. إظهار مؤشر التحميل بتصميم احترافي
        container.innerHTML = `
            <div style="text-align:center; padding:100px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i>
                <p style="margin-top:10px; color:#666;">جاري تحميل ${moduleName}...</p>
            </div>`;

        // 2. تحديث الحالة في القائمة الجانبية
        updateSidebarUI(moduleName);

        // 3. جلب الـ HTML مع كاسر التخزين المؤقت (Cache Buster)
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status} - ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 4. تشغيل الموديول البرمجي إذا كان القسم هو "العملاء"
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        }

    } catch (error) {
        console.error("❌ Navigation Error:", error);
        container.innerHTML = `
            <div style="padding:40px; color:#dc2626; text-align:center;">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <p style="margin-top:10px;">تعذر تحميل القسم المطلوب. تأكد من وجود الملف في المسار الصحيح.</p>
            </div>`;
    }
}

/**
 * تحميل موديول العملاء (JS + CSS) من المسار المعتمد
 */
async function loadCustomersModule(container) {
    // تحميل ملف التنسيق الخاص بالعملاء
    const styleId = 'module-customers-style';
    if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`; 
        document.head.appendChild(link);
    }

    try {
        /**
         * تصحيح المسار النهائي:
         * بما أن main.js موجود في مجلد js/
         * والملف المستهدف في js/modules/
         * نستخدم المسار النسبي المباشر ./modules/
         */
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            // انتظار بسيط لضمان استقرار العناصر في الصفحة (DOM Stability)
            setTimeout(async () => {
                const target = document.getElementById('customers-module-container') || container;
                await module.initCustomersUI(target);
            }, 100);
        }
    } catch (err) {
        console.error("❌ Failed to fetch dynamically imported module:", err);
    }
}

/**
 * تحديث واجهة القائمة الجانبية لإظهار القسم النشط
 */
function updateSidebarUI(activeModule) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // مقارنة الرابط بالقسم الحالي (مثلاً #customers)
            link.classList.toggle('active', href === `#${activeModule}`);
        }
    });
}

/**
 * معالج الروابط بناءً على الـ Hash في المتصفح
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// تشغيل النظام عند تحميل الصفحة وعند تغيير الـ Hash
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// إتاحة الدالة للوصول إليها من خارج الملف إذا لزم الأمر
window.switchModule = switchModule;
