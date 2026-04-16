// js/main.js
import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';

async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`لم يتم العثور على الملف: ${path}`);
        container.innerHTML = await response.text();
    } catch (err) {
        console.error("خطأ في المكونات:", err.message);
        // في حال فشل الـ 404، لا تترك المكان فارغاً
        container.innerHTML = `<div style="padding:10px; color:orange;">تنبيه: ملف ${path} غير موجود</div>`;
    }
}

// تبديل الأقسام
async function switchModule(module) {
    const main = document.getElementById('main-content');
    if (!main) return;
    
    // إخفاء الـ Loader
    main.innerHTML = '<div class="loader">جاري جلب بيانات تيرا...</div>';

    try {
        if (module === 'customers') {
            await initCustomers(main);
        } else {
            await initOrdersDashboard(main); // الافتراضي هو الطلبات
        }
    } catch (err) {
        main.innerHTML = `<div style="color:red; padding:20px;">خطأ فني: ${err.message}</div>`;
    }
}

// البدء
(async () => {
    // حاول تغيير المسارات هنا إذا استمر الـ 404
    await loadComponent('header-container', 'components/header.html'); 
    await loadComponent('sidebar-container', 'components/sidebar.html');
    
    await switchModule(window.location.hash.replace('#', ''));
    
    window.addEventListener('hashchange', () => {
        switchModule(window.location.hash.replace('#', ''));
    });
})();
