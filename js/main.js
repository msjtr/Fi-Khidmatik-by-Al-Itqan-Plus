/**
 * المحرك الرئيسي لمنصة تيرا جيتواي - Tera Gateway
 * المسار: js/main.js
 */

// تأكد أن أسماء الملفات في مجلد modules مطابقة تماماً لهذه الأسماء
import { initOrdersDashboard } from './modules/orders-dashboard.js'; 
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const loader = document.getElementById('loader');

    if (!container) return;

    // 1. تحديث شكل القائمة الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-module') === moduleName) {
            item.classList.add('active');
        }
    });

    // 2. إظهار التحميل
    if(loader) loader.style.display = 'block';
    
    try {
        switch (moduleName) {
            case 'customers':
                await initCustomers(container);
                break;
            case 'products':
                await initProducts(container);
                break;
            case 'orders':
            case 'dashboard':
                await initOrdersDashboard(container);
                break;
            case 'settings':
                container.innerHTML = `<div style="padding:40px;"><h2>الإعدادات</h2><p>قيد التطوير...</p></div>`;
                break;
            default:
                await initOrdersDashboard(container);
        }
    } catch (error) {
        console.error("Module Load Error:", error);
        container.innerHTML = `<div style="padding:40px; color:red;">خطأ في تحميل القسم.</div>`;
    } finally {
        if(loader) setTimeout(() => { loader.style.display = 'none'; }, 300);
    }
}

// تصدير الدالة للنطاق العام
window.switchModule = switchModule;

// التشغيل التلقائي عند التحميل
(async () => {
    const getHash = () => window.location.hash.replace('#', '') || 'dashboard';
    await switchModule(getHash());
    window.addEventListener('hashchange', () => switchModule(getHash()));
})();
