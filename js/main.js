/**
 * js/main.js - V12.12.12
 * المحرك المركزي المطور لنظام تيرا جيت واي (Tera Gateway)
 * المتوافق مع Firebase 10.7.1 ومعايير UI/UX الحديثة
 * المطور: محمد بن صالح الشمري
 */

import { db, auth } from './core/firebase.js'; // تم تحديث المسار للمعيار الجديد
import { initCustomers } from './modules/customers-ui.js';

// إدارة حالة النظام المركزية
let currentModule = null;

/**
 * دالة إدارة التنقل المركزية (Tera Router)
 */
window.handleSidebarClick = async function(element, moduleName) {
    // 1. منع التكرار وتوفير موارد الشبكة
    if (currentModule === moduleName) return; 
    
    console.log(`%c🔄 Tera Router: جاري الانتقال إلى [${moduleName}]`, "color: #0ea5e9; font-weight: bold;");
    
    // 2. تحديث الحالة البصرية للقائمة (Active State)
    document.querySelectorAll('.nav-link').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    } else {
        const target = document.querySelector(`[onclick*="'${moduleName}'"]`);
        if (target) target.classList.add('active');
    }

    // 3. تحديث الـ Hash لدعم أزرار المتصفح
    if (window.location.hash !== `#${moduleName}`) {
        history.pushState(null, null, `#${moduleName}`);
    }

    // 4. منطقة حقن المحتوى
    const container = document.getElementById('main-content-area'); // التأكد من مطابقة ID الحاوية
    if (container) {
        currentModule = moduleName;
        await renderModule(moduleName, container);
    }

    // 5. إغلاق القائمة في وضع الجوال
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar && sidebar.classList.contains('show')) {
        bootstrap.Collapse.getInstance(sidebar).hide();
    }
};

/**
 * الموزع المنطقي للموديولات (Module Switcher)
 */
async function renderModule(moduleName, container) {
    // عرض مؤشر التحميل بتصميم "تيرا" الزجاجي
    container.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 400px;">
            <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
            <h5 class="text-secondary animate-pulse">جاري مزامنة بيانات ${moduleName}...</h5>
        </div>`;

    try {
        switch(moduleName) {
            case 'dashboard':
                await renderDashboard(container);
                break;
                
            case 'customers':
                // تشغيل موديول العملاء المطور V12.12.12
                await initCustomers(container);
                break;
                
            case 'orders':
                container.innerHTML = `
                    <div class="p-4 animate-fade-in">
                        <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
                            <i class="fas fa-file-invoice-dollar fa-4x text-light mb-4"></i>
                            <h2 class="fw-900">محرك العقود الذكي</h2>
                            <p class="text-muted">نظام Snapshot Logic قيد المزامنة النهائية للإصدار القادم.</p>
                        </div>
                    </div>`;
                break;

            default:
                container.innerHTML = `
                    <div class="text-center p-5">
                        <h3 class="text-muted">الموديول [${moduleName}] قيد التطوير</h3>
                        <button class="btn btn-primary mt-3" onclick="window.handleSidebarClick(null, 'dashboard')">العودة للرئيسية</button>
                    </div>`;
        }
    } catch (error) {
        console.error(`🔴 Tera Error [${moduleName}]:`, error);
        container.innerHTML = `
            <div class="alert alert-danger m-4 rounded-4 shadow-sm">
                <i class="fas fa-exclamation-circle me-2"></i> حدث خطأ أثناء تحميل الوحدة: ${error.message}
            </div>`;
    }
}

/**
 * بناء لوحة التحكم السريعة
 */
async function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-content animate-fade-in p-4">
            <div class="welcome-section mb-4">
                <h1 class="fw-900">لوحة التحكم <span class="badge bg-soft-primary text-primary fs-6">V12.12.12</span></h1>
                <p class="text-muted">مرحباً بك أبا صالح | منصة "في خدمتكم" - فرع حائل</p>
            </div>
            
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                        <div class="d-flex align-items-center">
                            <div class="icon-box bg-soft-primary text-primary rounded-3 p-3 me-3">
                                <i class="fas fa-users fa-lg"></i>
                            </div>
                            <div>
                                <small class="text-muted d-block">إجمالي العملاء</small>
                                <h4 class="fw-bold mb-0 counter">--</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- يمكن إضافة كروت إضافية هنا -->
            </div>
        </div>
    `;
}

/**
 * مراقب التغييرات في الرابط
 */
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (currentModule !== hash) {
        window.handleSidebarClick(null, hash);
    }
});

/**
 * نقطة الانطلاق
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("%c🚀 Tera Engine V12.12.12 Initialized", "color: #f97316; font-weight: bold; font-size: 14px;");
    
    // تشغيل الموديول الافتراضي بناءً على الرابط
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    
    setTimeout(() => {
        window.handleSidebarClick(null, initialHash);
    }, 100);
});
