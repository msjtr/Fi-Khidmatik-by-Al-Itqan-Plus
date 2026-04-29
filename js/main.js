/**
 * js/main.js - V12.12.5
 * المحرك الرئيسي لإدارة الحالة والواجهة لـ Tera Gateway
 */
import { db, auth } from './core/config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * [1] دالة معالجة النقر من السايدبار (عالمية)
 * تم وضعها هنا لضمان استجابة ملف sidebar.html فور تحميله
 */
window.handleSidebarClick = function(element, moduleName) {
    // تحديث الشكل المرئي
    window.syncNavigationUI(`#${moduleName}`);
    
    // تحديث الرابط (هذا سيطلق حدث hashchange تلقائياً)
    location.hash = `#${moduleName}`;

    // إغلاق قائمة الموبايل إذا كانت مفتوحة
    const container = document.querySelector('.sidebar-container');
    if (container) container.classList.remove('mobile-open');
};

/**
 * [2] مزامنة حالة القائمة مع الرابط الحالي
 */
window.syncNavigationUI = (hash) => {
    const activeModule = hash.replace('#', '') || 'dashboard';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-module') === activeModule) {
            item.classList.add('active');
        }
    });

    console.log(`📍 UI Synced to: ${activeModule}`);
};

/**
 * [3] تشغيل المحرك الأساسي
 */
function initCoreEngine() {
    // مراقبة حالة تسجيل الدخول
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ Tera Gateway: متصل كـ", user.email);
            document.body.classList.add('auth-verified');
        } else {
            console.log("ℹ️ Tera Gateway: وضع الضيف");
            // window.location.href = '../login.html'; // فعلها عند الحاجة
        }
    });

    // معالجة تصغير السايدبار (Collapse)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const container = document.querySelector('.sidebar-container');
    
    if (sidebarToggle && container) {
        sidebarToggle.addEventListener('click', () => {
            container.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', container.classList.contains('collapsed'));
        });

        // استرجاع حالة السايدبار المحفوظة
        if (localStorage.getItem('sidebar-collapsed') === 'true') {
            container.classList.add('collapsed');
        }
    }

    // تحديث التاريخ في أي مكوّن يحمل id="current-year"
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    console.log("🚀 Tera Core Engine Ready.");
}

// مراقبة تغيير الـ Hash لمزامنة القائمة تلقائياً (عند ضغط زر الخلف في المتصفح مثلاً)
window.addEventListener('hashchange', () => {
    window.syncNavigationUI(location.hash);
});

// التشغيل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}
