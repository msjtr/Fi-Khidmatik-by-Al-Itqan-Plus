/**
 * js/main.js - V12.12.6
 * المحرك المركزي لنظام تيرا جيت واي (Tera Gateway)
 * متوافق مع إصدار Firebase 10.7.1
 */

import { db, auth, ensureDbReady } from './core/config.js';
import { initCustomersUI } from './modules/customers-ui.js';

// ثابت لمنع التحميل المتكرر لنفس الموديول
let currentModule = null;

/**
 * دالة إدارة التنقل (Sidebar Router)
 * تم ربطها بـ window لضمان عملها مع onclick في HTML
 */
window.handleSidebarClick = async function(element, moduleName) {
    if (currentModule === moduleName) return; // منع إعادة التحميل إذا كان الموديول نشطاً بالفعل
    
    console.log(`🔄 Tera Router: جاري التحميل... [${moduleName}]`);
    
    // 1. تحديث الحالة البصرية للقائمة الجانبية (Active State)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    } else {
        const target = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
        if (target) target.classList.add('active');
    }

    // 2. تحديث رابط الصفحة (Hash) دون إثارة حدث hashchange مرتين
    if (window.location.hash !== `#${moduleName}`) {
        history.pushState(null, null, `#${moduleName}`);
    }

    // 3. تحديد منطقة عرض المحتوى (اسم المعرف في admin.html هو module-container)
    const container = document.getElementById('module-container');
    if (container) {
        currentModule = moduleName;
        await renderModule(moduleName, container);
    }

    // 4. إغلاق القائمة في وضع الجوال
    document.getElementById('main-sidebar')?.classList.remove('mobile-open');
};

/**
 * الموزع المنطقي للموديولات (Module Switcher)
 */
async function renderModule(moduleName, container) {
    // التأكد من جاهزية قاعدة البيانات (Firebase 10.7.1)
    const isReady = await ensureDbReady();
    if (!isReady) {
        container.innerHTML = `
            <div class="loader-box" style="color:#dc2626;">
                <i class="fas fa-wifi-slash fa-3x"></i>
                <h3 style="margin-top:15px;">خطأ في الاتصال بالسحابة</h3>
                <p>تعذر الوصول إلى قاعدة بيانات تيرا، يرجى التحقق من الإنترنت.</p>
            </div>`;
        return;
    }

    // عرض مؤشر التحميل الخاص بـ تيرا
    container.innerHTML = `
        <div class="loader-box">
            <div class="spinner-tera"></div>
            <p style="margin-top:20px; font-weight:700;">جاري مزامنة بيانات ${moduleName}...</p>
        </div>`;

    try {
        switch(moduleName) {
            case 'customers':
                // استدعاء موديول الواجهة الأساسي
                await initCustomersUI(container);
                break;
                
            case 'dashboard':
                // يمكن استدعاء موديول منفصل أو عرض محتوى سريع
                container.innerHTML = `
                    <div class="dashboard-wrapper animated fadeIn">
                        <div class="welcome-banner">
                            <h1>لوحة تحكم تيرا <span class="v-tag">12.12.6</span></h1>
                            <p>نظام "في خدمتكم" لإدارة التقسيط - منطقة حائل</p>
                        </div>
                        <!-- هنا يتم حقن ملخص الإحصائيات لاحقاً -->
                    </div>`;
                break;

            case 'orders':
                // موديول الطلبات
                container.innerHTML = `<div class="p-4"><h3>قائمة طلبات التقسيط</h3><p>جاري جلب العقود من Firestore...</p></div>`;
                break;

            default:
                container.innerHTML = `
                    <div class="loader-box text-center">
                        <i class="fas fa-microchip fa-3x mb-3" style="color: #94a3b8;"></i>
                        <h3>وحدة [${moduleName}]</h3>
                        <p>هذا الموديول قيد البرمجة حالياً ضمن تحديثات المحرك.</p>
                        <button class="btn-tera primary" onclick="window.location.hash='#dashboard'">العودة للرئيسية</button>
                    </div>`;
        }
    } catch (error) {
        console.error(`Render Error [${moduleName}]:`, error);
        container.innerHTML = `<div class="alert error">حدث خطأ أثناء تحميل الموديول.</div>`;
    }
}

/**
 * مراقب تغيير الرابط (Hash Change Listener)
 */
window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '') || 'dashboard';
    window.handleSidebarClick(null, currentHash);
});

/**
 * نقطة الانطلاق (System Entry Point)
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Tera Engine V12.12.6 [Firebase 10.7.1] Initialized.");
    
    // تشغيل المزامنة الأولى بناءً على الرابط الحالي
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    
    // تأخير بسيط لضمان تحميل الـ DOM الخاص بـ Sidebar أولاً عبر admin.html
    setTimeout(() => {
        window.handleSidebarClick(null, initialHash);
    }, 100);
});
