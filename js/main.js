/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار المحدث V12.12.1
 * المطور: محمد بن صالح الشمري
 * الوظيفة: الربط بين Firebase والموديولات والواجهة (UI Bridge)
 */

import { db, auth } from './core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { navigateTo } from './dashboard-core.js';

console.log("⚙️ Tera Engine Core: جاري تشغيل المحرك الرئيسي...");

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 */

// جلب البيانات مع فحص حالة الاتصال لضمان عدم توقف النظام
window.getCollectionData = async (collectionName) => {
    if (!db) {
        console.warn("⏳ Tera Engine: قاعدة البيانات غير متصلة، جاري المحاولة...");
        return [];
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            // تحويل التوقيت لسهولة التعامل معه لاحقاً
            dateFormatted: doc.data().createdAt?.toDate().toLocaleDateString('ar-SA') 
        }));
    } catch (error) {
        console.error(`🔴 Error fetching ${collectionName}:`, error);
        return [];
    }
};

/**
 * 2. إدارة المودالات (Modals) بشكل موحد
 */
window.closeAllModals = () => {
    const modals = document.querySelectorAll('.modal, .tera-modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show', 'active');
    });
    
    // تنظيف النماذج بداخلها
    document.querySelectorAll('form').forEach(form => form.reset());
    
    // إزالة الخلفيات الضبابية (Backdrops)
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
};

/**
 * 3. نظام مراقبة التنقل (Routing & Sidebar)
 */
window.handleNavigation = (hash) => {
    const view = hash.replace('#', '') || 'dashboard';
    
    // تحديث القائمة الجانبية (UI)
    document.querySelectorAll('.nav-item, .sidebar-link').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === hash || (hash === '' && href === '#dashboard')) {
            item.classList.add('active');
        }
    });

    // استدعاء محرك التنقل من dashboard-core
    if (typeof navigateTo === 'function') {
        navigateTo(view);
    }
};

/**
 * 4. تشغيل المحرك والخدمات الأساسية عند تحميل الصفحة
 */
function initCoreEngine() {
    // 1. مراقبة حالة المستخدم (الأمان)
    onAuthStateChanged(auth, (user) => {
        if (!user && !window.location.pathname.includes('login.html')) {
            console.warn("🔒 غير مصرح بالدخول، جاري التحويل للوجين...");
            window.location.href = 'login.html';
        }
    });

    // 2. تحديث السنة تلقائياً في الفوتر
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 3. تفعيل نظام التنقل بناءً على الـ Hash الحالي
    window.addEventListener('hashchange', () => {
        window.handleNavigation(window.location.hash);
    });

    // تشغيل الصفحة الأولى عند التحميل
    window.handleNavigation(window.location.hash);

    // 4. مستمعات الأحداث العامة (Esc Key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    console.log("🚀 Tera Engine Core: النظام جاهز ومستقر.");
}

// التأكد من أن DOM جاهز قبل التشغيل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

export { initCoreEngine };
