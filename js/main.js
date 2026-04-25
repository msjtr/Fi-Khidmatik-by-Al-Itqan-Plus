/**
 * js/main.js
 * المحرك الرئيسي - نظام تيرا جيتواي (Tera Gateway)
 */

import { initProducts } from './modules/products-ui.js';
import { initCustomers } from './modules/customers-core.js';
import { initDashboard } from './dashboard-core.js'; // أضفتها لأنها في مجلد js المباشر
import { waitForFirebase } from './core/firebase.js';

async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    // 1. رسالة انتظار
    container.innerHTML = `
        <div style="padding:100px; text-align:center;">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#1e293b;"></i>
            <p style="font-family:'Tajawal', sans-serif; margin-top:15px;">جاري تحميل ${moduleName}...</p>
        </div>`;

    try {
        // 2. تأكيد اتصال قاعدة البيانات
        await waitForFirebase();

        // 3. جلب ملف الـ HTML الخاص بالموديول (مهم جداً ليعمل الـ container)
        // نفترض أن ملفات الـ HTML موجودة في admin/modules/
        const response = await fetch(`admin/modules/${moduleName}.html`);
        if (!response.ok) throw new Error(`تعذر العثور على ملف ${moduleName}.html`);
        const html = await response.text();
        container.innerHTML = html;

        // 4. تشغيل المنطق البرمجي (الـ JS) بعد تحميل الـ HTML
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
                console.log("القسم لا يحتاج إلى تهيئة إضافية");
        }
    } catch (err) {
        console.error("❌ Error:", err);
        container.innerHTML = `
            <div style="color:#ef4444; padding:40px; border:2px dashed #fca5a5; margin:20px; border-radius:12px; background:#fef2f2; text-align:center;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>عطل في التحميل</h3>
                <p>${err.message}</p>
            </div>`;
    }
}

// تصدير للنافذة العامة
window.switchModule = switchModule;

const handleRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
};

window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('hashchange', handleRoute);
