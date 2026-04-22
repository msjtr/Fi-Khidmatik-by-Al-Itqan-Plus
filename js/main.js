/**
 * js/main.js
 * المحرك الرئيسي المحدث ليتوافق مع أسماء الملفات في GitHub
 */

// استيراد الموديولات بالأسماء الصحيحة الموجودة في المجلد
import { initProducts } from './modules/products-ui.js';
import { initCustomers } from './modules/customers-core.js';

async function switchModule(moduleName) {
    console.log("محاولة فتح قسم:", moduleName);
    const container = document.getElementById('module-container');
    if (!container) return;

    // تنظيف الحاوية
    container.innerHTML = '<div style="padding:20px;">جاري التحميل...</div>';

    try {
        if (moduleName === 'products') {
            await initProducts(container);
        } else if (moduleName === 'customers') {
            await initCustomers(container);
        } else if (moduleName === 'dashboard' || moduleName === 'orders') {
            container.innerHTML = '<div style="padding:20px;"><h2>قسم الطلبات</h2><p>قيد التطوير...</p></div>';
        } else {
            container.innerHTML = '<div style="padding:20px;"><h2>الرئيسية</h2></div>';
        }
    } catch (err) {
        console.error("خطأ في الموديول:", err);
        container.innerHTML = `<div style="color:red; padding:20px;">فشل تحميل القسم: ${err.message}</div>`;
    }
}

// تصدير الدالة للنافذة العامة
window.switchModule = switchModule;

// التشغيل عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    const defaultTab = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(defaultTab);
});
