/**
 * js/main.js - V12.12.12
 * المحرك المركزي المطور لنظام تيرا جيت واي (Tera Gateway)
 * المتوافق مع Firebase 10.7.1 ومعايير UI/UX الحديثة
 * المطور: محمد بن صالح الشمري
 */

import { db, auth } from './core/firebase.js'; 
import { initCustomers, handleCustomerSubmit, openCustomerMap } from './modules/customers-ui.js';

// إدارة حالة النظام المركزية
let currentModule = null;

/**
 * دالة إدارة التنقل المركزية (Tera Router)
 */
window.handleSidebarClick = async function(element, moduleName) {
    if (currentModule === moduleName) return; 
    
    console.log(`%c🔄 Tera Router: جاري الانتقال إلى [${moduleName}]`, "color: #0ea5e9; font-weight: bold;");
    
    // تحديث الحالة البصرية للقائمة
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    
    if (element) {
        element.classList.add('active');
    } else {
        const target = document.querySelector(`[onclick*="'${moduleName}'"]`);
        if (target) target.classList.add('active');
    }

    if (window.location.hash !== `#${moduleName}`) {
        history.pushState(null, null, `#${moduleName}`);
    }

    const container = document.getElementById('main-content-area');
    if (container) {
        currentModule = moduleName;
        await renderModule(moduleName, container);
    }

    // إغلاق القائمة في وضع الجوال
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar && sidebar.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(sidebar) || new bootstrap.Collapse(sidebar);
        bsCollapse.hide();
    }
};

/**
 * الموزع المنطقي للموديولات (Module Switcher)
 */
async function renderModule(moduleName, container) {
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
                // تشغيل موديول العملاء المطور V12.12.12 مع دعم الخرائط والمزامنة
                await initCustomers(container);
                // ربط الوظائف العالمية للنموذج المحدث
                window.handleCustomerSubmit = handleCustomerSubmit;
                window.openCustomerMap = openCustomerMap;
                break;
                
            case 'orders':
                container.innerHTML = `
                    <div class="p-4 animate-fade-in">
                        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                            <i class="fas fa-file-invoice-dollar fa-4x text-light mb-4"></i>
                            <h2 class="fw-900">محرك العقود الذكي</h2>
                            <p class="text-muted">نظام Snapshot Logic قيد المزامنة النهائية للإصدار القادم.</p>
                        </div>
                    </div>`;
                break;

            default:
                container.innerHTML = `
                    <div class="text-center p-5 bg-white rounded-4 shadow-sm m-4">
                        <h3 class="text-muted">الموديول [${moduleName}] قيد التطوير</h3>
                        <button class="btn btn-primary-gradient mt-3 rounded-pill px-4" onclick="window.handleSidebarClick(null, 'dashboard')">العودة للرئيسية</button>
                    </div>`;
        }
    } catch (error) {
        console.error(`🔴 Tera Error [${moduleName}]:`, error);
        container.innerHTML = `
            <div class="alert alert-danger m-4 rounded-4 shadow-sm border-0 bg-soft-danger">
                <i class="fas fa-exclamation-circle me-2"></i> حدث خطأ أثناء تحميل الوحدة: ${error.message}
            </div>`;
    }
}

/**
 * بناء لوحة التحكم السريعة (Dashboard)
 */
async function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-content animate-fade-in p-4">
            <div class="welcome-section mb-5 p-4 rounded-4 shadow-sm" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
                <h1 class="fw-900 mb-2">لوحة التحكم <span class="badge bg-soft-primary text-primary fs-6">V12.12.12</span></h1>
                <p class="text-muted mb-0"><i class="fas fa-map-marker-alt text-danger me-2"></i> فرع حائل | مرحباً بك أبا صالح</p>
            </div>
            
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-4 bg-white hover-up transition-3">
                        <div class="d-flex align-items-center">
                            <div class="icon-box bg-soft-primary text-primary rounded-4 p-3 me-3">
                                <i class="fas fa-users fa-2x"></i>
                            </div>
                            <div>
                                <small class="text-muted d-block fw-bold mb-1">إجمالي العملاء</small>
                                <h3 class="fw-900 mb-0" id="dash-total-customers">--</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- يمكن إضافة كروت إحصائية إضافية هنا -->
            </div>
        </div>`;
    
    // تحديث إحصائيات سريعة من Firestore
    updateQuickStats();
}

/**
 * دالة تحديث الإحصائيات من Firestore
 */
async function updateQuickStats() {
    try {
        // منطق جلب عدد العملاء الفعلي من Firestore
    } catch (err) { console.warn("Stats Update Error:", err); }
}

/**
 * مراقب التغييرات في الرابط لدعم أزرار (Back/Forward)
 */
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (currentModule !== hash) {
        window.handleSidebarClick(null, hash);
    }
});

/**
 * نقطة الانطلاق المركزية
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("%c🚀 Tera Engine V12.12.12 Initialized", "color: #f97316; font-weight: bold; font-size: 14px;");
    
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    
    // تأخير طفيف لضمان تحميل جميع المكتبات (مثل Google Maps)
    setTimeout(() => {
        window.handleSidebarClick(null, initialHash);
    }, 150);
});
