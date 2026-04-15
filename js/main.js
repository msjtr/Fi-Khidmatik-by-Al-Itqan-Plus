// js/main.js

// التعديل الجوهري: إزالة كلمة "modules/" لأن الملفات تظهر في المتصفح في نفس المستوى
import { initOrdersDashboard } from './orders.js';
import { initCustomers } from './customers.js';
import { initProducts } from './products.js';
import { initSettings } from './settings.js';
import { initOrderForm } from './order-form.js';

async function loadComponent(id, path) {
    try {
        // كسر الكاش لضمان تحميل التعديلات الجديدة فوراً
        const resp = await fetch(`${path}?v=${Date.now()}`); 
        if (!resp.ok) throw new Error(`HTTP 404: ${path}`);
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = await resp.text();
        }
    } catch (e) {
        console.error("Component Load Error:", e);
    }
}

async function init() {
    // تحميل المكونات الهيكلية (تأكد من صحة هذه المسارات في مجلد admin)
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    
    // تحميل الموديل الافتراضي (لوحة الطلبات)
    await switchModule('orders-dashboard');

    // إعداد التنقل بين الأقسام
    document.addEventListener('click', async (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            navItem.classList.add('active');
            await switchModule(navItem.dataset.module);
        }
    });
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    if (!main) return;
    
    main.innerHTML = '<div style="text-align:center; padding:50px;">جاري تحميل القسم...</div>';
    
    try {
        switch(moduleName) {
            case 'orders-dashboard': await initOrdersDashboard(main); break;
            case 'order-form': await initOrderForm(main); break;
            case 'customers': await initCustomers(main); break;
            case 'products': await initProducts(main); break;
            case 'settings': await initSettings(main); break;
            default: main.innerHTML = '<h2 style="text-align:center; padding:50px;">القسم قيد التطوير</h2>';
        }
    } catch (err) {
        console.error("Module Switch Error:", err);
        main.innerHTML = `<div style="color:red; text-align:center; padding:50px;">خطأ في تحميل الموديول: ${err.message}</div>`;
    }
}

// تشغيل النظام
init();
