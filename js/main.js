/**
 * main.js - Fi-Khidmatik Core
 * نظام التوجيه الموحد لجميع الأقسام
 */

// 1. تعريف جميع المسارات بناءً على بنية المجلدات لديك
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
    if (!container) {
        console.error("خطأ: لم يتم العثور على حاوية 'module-container' في صفحة admin.html");
        return;
    }

    const path = routes[moduleName];
    if (!path) {
        console.warn(`المسار ${moduleName} غير معرف في النظام.`);
        return;
    }

    try {
        // الـ Firewall: تنظيف الحاوية تماماً قبل البدء لمنع التداخل
        container.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:300px; flex-direction:column; gap:15px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb;"></i>
                <span style="color:#64748b; font-family:'Tajawal';">جاري تحميل ${moduleName}...</span>
            </div>`;

        // تحديث حالة الأزرار في القائمة الجانبية (Sidebar)
        updateSidebarUI(moduleName);

        // تحميل ملف الـ HTML المطلوب
        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const html = await response.text();
        
        // حقن المحتوى في الحاوية
        container.innerHTML = html;

        // تنفيذ الدوال الخاصة بكل موديول إذا وجدت
        handleModuleInitialization(moduleName, container);

    } catch (error) {
        console.error("خطأ في الانتقال:", error);
        container.innerHTML = `
            <div style="padding:40px; text-align:center; color:#ef4444; background:rgba(239,68,68,0.05); border-radius:12px; border:1px dashed #ef4444; margin:20px;">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <h3 style="margin-top:15px;">تعذر تحميل القسم</h3>
                <p>الملف ${path} قد يكون غير موجود أو هناك مشكلة في الاتصال.</p>
                <button onclick="location.reload()" style="padding:8px 20px; background:#2563eb; color:white; border:none; border-radius:5px; cursor:pointer; margin-top:10px;">إعادة المحاولة</button>
            </div>`;
    }
}

// دالة لتحديث واجهة القائمة الجانبية
function updateSidebarUI(activeModule) {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${activeModule}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// دالة لمعالجة تشغيل الـ JavaScript الخاص بكل صفحة بعد تحميلها
async function handleModuleInitialization(moduleName, container) {
    // حالة خاصة لقاعدة العملاء
    if (moduleName === 'customers') {
        try {
            // تحميل التنسيق أولاً
            if (!document.getElementById('module-customers-style')) {
                const link = document.createElement('link');
                link.id = 'module-customers-style';
                link.rel = 'stylesheet';
                link.href = `css/customers.css?v=${Date.now()}`;
                document.head.appendChild(link);
            }
            
            // تحميل وتشغيل ملف الـ UI
            const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
            if (module && module.initCustomersUI) {
                setTimeout(() => {
                    const target = document.getElementById('customers-module-container') || container;
                    module.initCustomersUI(target);
                }, 100);
            }
        } catch (err) {
            console.error("تحذير: لم يتم العثور على موديول JS للعملاء، سيتم عرض الـ HTML فقط.");
        }
    }
    
    // يمكنك إضافة شروط مشابهة هنا لـ inventory أو payments إذا كان لها ملفات JS خاصة
}

// مراقبة التغير في الرابط (Hash)
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// بدء التشغيل
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// جعل الدالة متاحة عالمياً للأزرار التي تستخدم onclick
window.switchModule = switchModule;
