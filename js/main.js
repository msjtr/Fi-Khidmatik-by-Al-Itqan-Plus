/**
 * المحرك الرئيسي لمنصة تيرا جيتواي - Tera Gateway
 * المسار: js/main.js
 */

import { initOrdersDashboard } from './modules/orders-dashboard.js'; 
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';

// الدالة الأساسية لتبديل الأقسام
async function switchModule(moduleName) {
    // استهداف الحاوية الصحيحة بناءً على admin.html
    const container = document.getElementById('module-container');
    const loader = document.getElementById('loader');

    if (!container) {
        console.error("خطأ: لم يتم العثور على حاوية module-container");
        return;
    }

    // 1. تحديث الحالة البصرية في القائمة الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-module') === moduleName) {
            item.classList.add('active');
        }
    });

    // 2. تفعيل مؤشر التحميل وتصفير الحاوية
    if(loader) loader.style.display = 'block';
    container.innerHTML = ''; 

    // 3. توجيه المسارات (Router Logic)
    try {
        switch (moduleName) {
            case 'customers':
                await initCustomers(container);
                break;
            case 'products':
                await initProducts(container);
                break;
            case 'orders':
                await initOrdersDashboard(container);
                break;
            case 'settings':
                container.innerHTML = `
                    <div style="padding:40px; animation: fadeIn 0.5s;">
                        <h2 style="color:#1a202c; border-bottom:3px solid #e67e22; display:inline-block; padding-bottom:10px;">إعدادات النظام</h2>
                        <div style="margin-top:30px; background:#f8fafc; padding:20px; border-radius:15px; border:1px dashed #cbd5e1;">
                            <p style="font-weight:600; color:#64748b;">هذا القسم قيد التطوير لمنصة تيرا جيتواي...</p>
                        </div>
                    </div>`;
                break;
            case 'dashboard':
            default:
                await initOrdersDashboard(container);
                break;
        }
    } catch (error) {
        console.error(`خطأ في موديول ${moduleName}:`, error);
        container.innerHTML = `
            <div style="padding:40px; text-align:center; color:#e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3 style="margin-top:15px;">عذراً، تعذر تحميل البيانات</h3>
                <p>${error.message}</p>
            </div>`;
    } finally {
        if(loader) setTimeout(() => { loader.style.display = 'none'; }, 300);
    }
}

// التصدير للـ Window ليعمل مع الأزرار في HTML
window.switchModule = switchModule;

// تشغيل النظام
(async () => {
    console.log("Tera Gateway Core Started...");

    // قراءة الـ Hash من الرابط (مثال: #products)
    const getHash = () => window.location.hash.replace('#', '') || 'dashboard';
    
    // تحميل القسم المطلوب فوراً
    await switchModule(getHash());

    // تحديث المحتوى عند تغيير الـ Hash (يدعم أزرار الخلف/للأمام في المتصفح)
    window.addEventListener('hashchange', () => {
        switchModule(getHash());
    });
})();
