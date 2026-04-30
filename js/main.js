/**
 * js/main.js - V12.12.8
 * المحرك المركزي لنظام تيرا جيت واي (Tera Gateway)
 * المتوافق مع Firebase 10.7.1 ونظام الـ 17 حقلاً
 * المطور: محمد بن صالح الشمري
 */

import { db, auth, ensureDbReady } from './core/config.js';
import { initCustomersUI } from './modules/customers-ui.js';
import { getCustomersStats } from './modules/customers-core.js';

// متغير داخلي لإدارة حالة النظام ومنع التكرار
let currentModule = null;

/**
 * دالة إدارة التنقل المركزية (Tera Router)
 * تم تسجيلها في window لتكون متاحة لجميع عناصر واجهة المستخدم
 */
window.handleSidebarClick = async function(element, moduleName) {
    // منع إعادة تحميل الموديول إذا كان نشطاً لتوفير موارد الشبكة
    if (currentModule === moduleName) return; 
    
    console.log(`🔄 Tera Router: جاري الانتقال إلى [${moduleName}]`);
    
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

    // 2. تحديث الـ Hash في المتصفح لدعم أزرار الرجوع
    if (window.location.hash !== `#${moduleName}`) {
        history.pushState(null, null, `#${moduleName}`);
    }

    // 3. تحديد منطقة عرض المحتوى (module-container)
    const container = document.getElementById('module-container');
    if (container) {
        currentModule = moduleName;
        await renderModule(moduleName, container);
    }

    // 4. إغلاق القائمة الجانبية في وضع الجوال تلقائياً بعد الاختيار
    document.getElementById('main-sidebar')?.classList.remove('mobile-open');
};

/**
 * الموزع المنطقي للموديولات (Module Switcher)
 * يقوم بحقن الـ HTML والوظائف بناءً على الاختيار
 */
async function renderModule(moduleName, container) {
    // التأكد من استقرار الاتصال بقاعدة البيانات قبل التحميل
    const isReady = await ensureDbReady();
    if (!isReady) {
        container.innerHTML = `
            <div class="loader-box text-center p-5" style="color:#ef4444;">
                <i class="fas fa-database fa-3x mb-3"></i>
                <h3>بوابة تيرا غير متصلة</h3>
                <p>تعذر الوصول للسحابة. يرجى التحقق من إعدادات Firebase والإنترنت.</p>
                <button class="btn-tera primary mt-3" onclick="location.reload()">إعادة المحاولة</button>
            </div>`;
        return;
    }

    // عرض مؤشر التحميل الخاص بمنصة تيرا
    container.innerHTML = `
        <div class="loader-box">
            <div class="spinner-tera"></div>
            <p style="margin-top:20px; font-weight:700; color: #1e293b;">جاري مزامنة بيانات ${moduleName}...</p>
        </div>`;

    try {
        switch(moduleName) {
            case 'customers':
                // تشغيل واجهة إدارة العملاء (17 حقلاً)
                await initCustomersUI(container);
                break;
                
            case 'dashboard':
                // جلب إحصائيات حقيقية من Firestore للوحة التحكم
                const stats = await getCustomersStats();
                container.innerHTML = `
                    <div class="dashboard-wrapper animated fadeIn">
                        <div class="welcome-banner glassmorphism mb-4">
                            <h1>لوحة تحكم تيرا <span class="v-tag">12.12.8</span></h1>
                            <p>مرحباً بك أبا صالح في نظام "في خدمتكم" - منطقة حائل</p>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <i class="fas fa-users"></i>
                                <h3>إجمالي العملاء</h3>
                                <span class="stat-value">${stats?.total || 0}</span>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-check-circle text-success"></i>
                                <h3>العملاء النشطون</h3>
                                <span class="stat-value">${stats?.active || 0}</span>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-map-marker-alt text-primary"></i>
                                <h3>عملاء حائل</h3>
                                <span class="stat-value">${stats?.hailRegion || 0}</span>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-crown text-warning"></i>
                                <h3>عملاء VIP</h3>
                                <span class="stat-value">${stats?.vip || 0}</span>
                            </div>
                        </div>
                    </div>`;
                break;

            case 'orders':
                // موديول الطلبات والعقود
                container.innerHTML = `
                    <div class="orders-section p-4 animated slideInUp">
                        <div class="section-header d-flex justify-content-between align-items-center mb-4">
                            <h3><i class="fas fa-file-invoice-dollar ml-2"></i> عقود وطلبات التقسيط</h3>
                        </div>
                        <div class="empty-state text-center p-5 glassmorphism">
                            <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                            <p>جاري تطوير محرك العقود الذكي (Snapshot Logic)...</p>
                        </div>
                    </div>`;
                break;

            default:
                container.innerHTML = `
                    <div class="loader-box text-center p-5">
                        <i class="fas fa-tools fa-3x mb-3" style="color: #94a3b8;"></i>
                        <h3>الموديول [${moduleName}]</h3>
                        <p>هذه الميزة قيد البرمجة حالياً ضمن تحديثات المحرك القادمة.</p>
                        <button class="btn-tera primary" onclick="window.location.hash='#dashboard'">العودة للرئيسية</button>
                    </div>`;
        }
    } catch (error) {
        console.error(`🔴 Render Error [${moduleName}]:`, error);
        container.innerHTML = `
            <div class="alert error-toast">
                <i class="fas fa-exclamation-triangle"></i>
                حدث خطأ أثناء تحميل الوحدة. تفاصيل: ${error.message}
            </div>`;
    }
}

/**
 * مراقب تغيير الرابط (Hash Change Listener)
 * يسمح للمستخدم بالانتقال عبر أزرار المتصفح (خلف/أمام)
 */
window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash.replace('#', '') || 'dashboard';
    if (currentModule !== currentHash) {
        window.handleSidebarClick(null, currentHash);
    }
});

/**
 * نقطة الانطلاق (System Entry Point)
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("%c🚀 Tera Engine V12.12.8 Initialized", "color: #f97316; font-weight: bold; font-size: 14px;");
    
    // تشغيل المزامنة الأولى بناءً على الرابط الحالي أو الافتراضي
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    
    // تأخير بسيط لضمان استقرار تحميل القائمة الجانبية في المتصفح
    setTimeout(() => {
        window.handleSidebarClick(null, initialHash);
    }, 150);
});
