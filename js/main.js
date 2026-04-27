/**
 * main.js - Core Router & Global Controllers
 * نظام التوجيه وإدارة الدوال العامة لمشروع "في خدمتك"
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
 * دالة تبديل الأقسام (Modules)
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) return;

    try {
        // 1. تنظيف الحاوية وإظهار مؤشر تحميل احترافي
        container.innerHTML = `
            <div style="text-align:center; padding:100px; color:#2563eb;">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p style="margin-top:15px; font-family:'Tajawal',sans-serif;">جاري تحميل البيانات...</p>
            </div>`;

        // 2. جلب ملف الـ HTML الخاص بالموديول
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`404: ${path}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // 3. تشغيل موديول العملاء بشكل خاص إذا تم اختياره
        if (moduleName === 'customers') {
            await initializeCustomers(container);
        }

        // تحديث روابط القائمة الجانبية (Active State)
        updateSidebarUI(moduleName);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `<div style="padding:20px; color:red; text-align:center;">خطأ في تحميل القسم المطلوبة.</div>`;
    }
}

/**
 * تهيئة موديول العملاء: تحميل CSS و JS الموديول
 */
async function initializeCustomers(container) {
    if (!document.getElementById('module-customers-style')) {
        const link = document.createElement('link');
        link.id = 'module-customers-style';
        link.rel = 'stylesheet';
        link.href = `css/customers.css?v=${Date.now()}`;
        document.head.appendChild(link);
    }

    try {
        const modulePath = `./modules/customers-ui.js?v=${Date.now()}`;
        const module = await import(modulePath);
        
        if (module && module.initCustomersUI) {
            setTimeout(() => {
                const target = document.getElementById('customers-module-container') || container;
                module.initCustomersUI(target);
            }, 150);
        }
    } catch (err) {
        console.error("فشل في تحميل موديول العملاء:", err);
    }
}

/**
 * إدارة النوافذ المنبثقة (Modals)
 * حل مشكلة: Uncaught TypeError: window.closeCustomerModal is not a function
 */

// دالة فتح النافذة
window.openAddCustomerModal = function() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'flex'; // استخدام flex لضمان التمركز إذا كان التصميم يدعمه
    } else {
        console.warn("عنصر الـ Modal باسم 'customer-modal' غير موجود.");
    }
};

// دالة إغلاق النافذة (تمت إضافتها لحل المشكلة)
window.closeCustomerModal = function() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.warn("تعذر إغلاق النافذة: العنصر غير موجود.");
    }
};

/**
 * تحديث شكل القائمة الجانبية عند التنقل
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${moduleName}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * إدارة الروابط (Hash Routing)
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// الاستماع لأحداث التحميل وتغيير الرابط
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// إتاحة الدالة عالمياً
window.switchModule = switchModule;
