/**
 * js/main.js - V12.12.4
 * المحرك الرئيسي لإدارة الحالة والواجهة
 */
import { db, auth } from './core/config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // تأكد من إصدار Firebase المستخدم

/**
 * دالة عالمية لتحديث حالة القائمة الجانبية (Active State)
 * يتم استدعاؤها من الـ Router عند تغيير الـ Hash
 */
window.syncNavigationUI = (hash) => {
    const activeModule = hash.replace('#', '') || 'dashboard';
    
    // البحث عن جميع عناصر التنقل (سواء كانت li أو a)
    const navItems = document.querySelectorAll('.nav-item, .sidebar-link');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        
        // التحقق من الموديول عن طريق data-module أو الـ href
        const itemModule = item.getAttribute('data-module') || 
                           (item.getAttribute('href') ? item.getAttribute('href').replace('#', '') : null);
        
        if (itemModule === activeModule) {
            item.classList.add('active');
        }
    });

    console.log(`📍 UI Synced to: ${activeModule}`);
};

/**
 * تشغيل المحرك الأساسي للنظام
 */
function initCoreEngine() {
    // 1. مراقبة حالة تسجيل الدخول
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("✅ Tera Gateway: المستخدم مسجل دخول حالياً", user.email);
            // يمكنك هنا إضافة كود لجلب بيانات المستخدم وعرضها في الهيدر
        } else {
            console.log("ℹ️ Tera Gateway: وضع الضيف - لا يوجد مستخدم");
            // يمكنك هنا توجيه المستخدم لصفحة تسجيل الدخول إذا كان في صفحة الإدارة
            // window.location.href = 'index.html';
        }
    });

    // 2. تحديث التاريخ في الفوتر (إن وجد)
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 3. معالجة فتح وإغلاق القائمة الجانبية (Mobile Sidebar Toggle)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            // حفظ الحالة في LocalStorage لتذكر تفضيل المستخدم
            localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // 4. تحميل حالة السايدبار المحفوظة
    if (localStorage.getItem('sidebar-collapsed') === 'true' && sidebar) {
        sidebar.classList.add('collapsed');
    }

    console.log("🚀 Tera Core Engine Started Successfully.");
}

// التأكد من تشغيل الكود بعد تحميل المستند
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}
