/**
 * main.js - Tera Gateway 
 * الموزع الرئيسي للنظام والمسؤول عن التنقل بين الموديولات (Routing)
 */

import { APP_CONFIG } from './core/firebase.js';

/**
 * خريطة المسارات (Routes)
 * تربط مفتاح الموديول بملف الـ HTML الخاص به في مجلد admin
 */
const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'orders':    'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'settings':  'admin/modules/settings.html',
    'reports':   'admin/modules/reports.html'
};

/**
 * دالة تبديل الموديولات ديناميكياً
 * @param {string} moduleName - اسم الموديول المطلوب تحميله
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    const path = routes[moduleName];
    if (!path) {
        console.error(`❌ الموديول "${moduleName}" غير معرف في خريطة المسارات.`);
        return;
    }

    try {
        // 1. إظهار حالة التحميل
        container.innerHTML = `
            <div style="text-align:center; padding:100px 50px; color:#2563eb;">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p style="margin-top:20px; font-family:'Tajawal', sans-serif;">جاري تحميل ${moduleName}...</p>
            </div>
        `;

        // 2. جلب ملف الـ HTML الخاص بالموديول
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`خطأ ${response.status}: تعذر العثور على الملف في المسار ${path}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;

        // 3. معالجة خاصة لموديول العملاء
        if (moduleName === 'customers') {
            await initCustomersModule(container);
        }

        console.log(`✅ تم تحميل موديول: ${moduleName}`);

    } catch (error) {
        console.error("❌ خطأ في نظام التنقل:", error);
        renderErrorScreen(container, path);
    }
}

/**
 * وظيفة خاصة لتهيئة موديول العملاء (الربط البرمجي والتنسيق)
 */
async function initCustomersModule(container) {
    // أ- التأكد من تحميل ملف CSS من المسار الصحيح المعتمد
    const stylePath = 'css/customers.css'; 
    if (!document.querySelector(`link[href="${stylePath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = stylePath;
        document.head.appendChild(link);
    }

    try {
        // ب- استيراد ملف الوظائف ديناميكياً
        const { initCustomersUI } = await import('./modules/customers-ui.js');
        
        // ج- تشغيل الواجهة (ننتظر قليلاً للتأكد من حقن HTML)
        setTimeout(() => {
            const contentDiv = document.getElementById('customers-module-content') || container;
            initCustomersUI(contentDiv);
        }, 50);
    } catch (err) {
        console.error("❌ فشل تحميل وظائف العملاء البرمجية:", err);
    }
}

/**
 * دالة لعرض واجهة خطأ عند فشل تحميل أي موديول
 */
function renderErrorScreen(container, path) {
    container.innerHTML = `
        <div style="padding:40px; text-align:center; background:#fef2f2; border-radius:15px; border:1px solid #ef4444; margin:20px; font-family:'Tajawal';">
            <i class="fas fa-exclamation-triangle fa-2x" style="color:#dc2626;"></i>
            <h3 style="color:#991b1b; margin-top:15px;">تعذر تحميل الصفحة</h3>
            <p style="color:#b91c1c;">المسار المطلوب: <b>${path}</b></p>
            <p style="font-size:0.9rem; color:#475569;">تأكد من رفع الملفات على GitHub ومطابقة حالة الأحرف (Capital/Small).</p>
            <button onclick="location.reload()" style="margin-top:15px; padding:10px 25px; cursor:pointer; background:#dc2626; color:white; border:none; border-radius:8px;">إعادة تحميل النظام</button>
        </div>
    `;
}

/**
 * مراقب تغيير العناوين (Hash Router)
 */
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
    updateActiveSidebarItem(hash);
}

/**
 * تحديث الحالة النشطة في القائمة الجانبية
 */
function updateActiveSidebarItem(activeHash) {
    document.querySelectorAll('.nav-link, .nav-item').forEach(item => {
        const module = item.getAttribute('data-module') || 
                      (item.getAttribute('href') && item.getAttribute('href').replace('#', ''));
        
        if (module === activeHash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// الأحداث الرئيسية لبدء التشغيل
window.addEventListener('load', handleRoute);
window.addEventListener('hashchange', handleRoute);

// جعل دالة التحميل متاحة عالمياً (للاستدعاء من السايدبار)
window.switchModule = switchModule;
