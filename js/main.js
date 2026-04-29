/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار المحدث V12.12.1
 * المطور: محمد بن صالح الشمري
 * الوظيفة: الربط المركزي بين Firebase، الموديولات، وواجهة المستخدم.
 */

// استيراد الخدمات المهيئة مسبقاً من config لضمان عدم تكرار التهيئة
import { db, auth } from './core/config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { navigateTo } from './dashboard-core.js';

console.log("⚙️ Tera Engine Core: جاري تشغيل المحرك الرئيسي...");

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 * يتم ربطها بـ window لضمان وصول الموديولات القديمة والـ HTML إليها.
 */

// جلب البيانات مع فحص حالة الاتصال
window.getCollectionData = async (collectionName) => {
    if (!db) {
        console.error("❌ Tera Engine: قاعدة البيانات غير متصلة.");
        return [];
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            dateFormatted: doc.data().createdAt?.toDate ? 
                           doc.data().createdAt.toDate().toLocaleDateString('ar-SA') : 
                           new Date(doc.data().createdAt).toLocaleDateString('ar-SA')
        }));
    } catch (error) {
        console.error(`🔴 Error fetching ${collectionName}:`, error);
        return [];
    }
};

// إدارة المودالات (إغلاق شامل وتنظيف)
window.closeAllModals = () => {
    const modals = document.querySelectorAll('.modal, .tera-modal, [role="dialog"]');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show', 'active');
    });
    
    document.querySelectorAll('form').forEach(form => form.reset());
    
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    
    document.body.classList.remove('modal-open');
    document.body.style = "";
};

/**
 * 2. نظام مراقبة التنقل (Routing & Sidebar)
 */
window.handleNavigation = (hash) => {
    const view = hash.replace('#', '') || 'dashboard';
    
    // تحديث القائمة الجانبية بصرياً
    document.querySelectorAll('.nav-item, .sidebar-link').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        const dataNav = item.getAttribute('data-nav');
        if (href === hash || dataNav === view || (hash === '' && (href === '#dashboard' || dataNav === 'dashboard'))) {
            item.classList.add('active');
        }
    });

    // استدعاء محرك التنقل لتبديل المحتوى
    if (typeof navigateTo === 'function') {
        navigateTo(view);
    }
};

// حل مشكلة onclick في الـ HTML للموديولات
window.handleNavClick = (view) => {
    window.location.hash = view;
};

/**
 * 3. تشغيل المحرك والخدمات الأساسية
 */
function initCoreEngine() {
    // أ- مراقبة حالة المستخدم (Security Gate)
    onAuthStateChanged(auth, (user) => {
        const isLoginPage = window.location.pathname.includes('login.html');
        if (!user && !isLoginPage) {
            console.warn("🔒 دخول غير مصرح، تحويل لصفحة تسجيل الدخول...");
            window.location.href = 'login.html';
        } else if (user && isLoginPage) {
            window.location.href = 'admin.html';
        }
    });

    // ب- تحديث العناصر التلقائية (السنة)
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ج- مستمعات أحداث المتصفح (Hash & Keys)
    window.addEventListener('hashchange', () => {
        window.handleNavigation(window.location.hash);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    // د- تشغيل التنقل الأولي
    window.handleNavigation(window.location.hash);

    console.log("🚀 Tera Engine Core: النظام جاهز ومستقر.");
}

// الانطلاق فور جاهزية المستند
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

export { initCoreEngine };
