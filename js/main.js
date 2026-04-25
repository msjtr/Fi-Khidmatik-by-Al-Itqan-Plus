/**
 * js/main.js
 * المحرك الرئيسي - نظام تيرا جيتواي (Tera Gateway)
 */

import { initProducts } from './modules/products-ui.js';
import { initCustomers } from './modules/customers-core.js';
import { initDashboard } from './dashboard-core.js'; 
import { waitForFirebase } from './core/firebase.js';

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    // 1. رسالة انتظار أثناء التحميل
    container.innerHTML = `
        <div style="padding:100px; text-align:center;">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#1e293b;"></i>
            <p style="margin-top:15px; font-family:'Tajawal', sans-serif; font-weight:bold;">جاري تحميل ${moduleName}...</p>
        </div>`;

    try {
        // 2. التأكد من اتصال Firebase
        await waitForFirebase();

        // 3. جلب ملف الـ HTML الخاص بالقسم
        const response = await fetch(`admin/modules/${moduleName}.html`);
        if (!response.ok) throw new Error(`تعذر العثور على الملف: admin/modules/${moduleName}.html`);
        const html = await response.text();
        
        // 4. حقن الـ HTML في الحاوية
        container.innerHTML = html;

        // 5. انتظار بسيط جداً لضمان استقرار العناصر في المتصفح قبل تشغيل البرمجة
        await new Promise(resolve => setTimeout(resolve, 100));

        // 6. تشغيل ملف الـ JS الخاص بكل موديول
        switch (moduleName) {
            case 'products':
                await initProducts(container);
                break;
            case 'customers':
                await initCustomers(container);
                break;
            case 'dashboard':
                await initDashboard(container);
                break;
            default:
                console.log(`القسم ${moduleName} تم تحميله بنجاح.`);
        }
    } catch (err) {
        console.error("❌ خطأ في النظام:", err);
        container.innerHTML = `
            <div style="color:#ef4444; padding:40px; border:2px dashed #fca5a5; margin:20px; border-radius:12px; background:#fef2f2; text-align:center;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3 style="margin-top:10px;">عطل في تحميل القسم</h3>
                <p>${err.message}</p>
                <button onclick="location.reload()" style="margin-top:15px; padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:8px; cursor:pointer;">إعادة تحميل النظام</button>
            </div>`;
    }
}

// جعل الدالة متاحة للنافذة العامة
window.switchModule = switchModule;

// نظام التوجيه بناءً على الـ Hash (#)
const handleRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
};

window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('hashchange', handleRoute);
