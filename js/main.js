/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار V12.12.3
 * المطور: محمد بن صالح الشمري
 * الوظيفة: الإدارة المركزية مع دعم مسارات GitHub Pages الذكية.
 */

import { db, auth } from './core/config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { navigateTo } from './dashboard-core.js';

// تحديد مسار المشروع لـ GitHub Pages
const IS_GITHUB = window.location.hostname.includes('github.io');
const REPO_NAME = '/fi-khidmatik/';
const BASE_PATH = IS_GITHUB ? REPO_NAME : '/';

console.log(`⚙️ Tera Engine Core: جاري التشغيل على ${IS_GITHUB ? 'GitHub Pages' : 'Localhost'}`);

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 */

window.getCollectionData = async (collectionName) => {
    if (!db) {
        console.error("❌ Tera Engine: قاعدة البيانات غير متصلة.");
        return [];
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            let formattedDate = '---';

            if (data.createdAt) {
                const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                formattedDate = dateObj.toLocaleDateString('ar-SA');
            }

            return { 
                id: doc.id, 
                ...data,
                dateFormatted: formattedDate
            };
        });
    } catch (error) {
        console.error(`🔴 Error fetching ${collectionName}:`, error);
        return [];
    }
};

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
 * 2. نظام مراقبة التنقل (Navigation System)
 */
window.handleNavigation = (hash) => {
    const view = hash.replace('#', '') || 'dashboard';
    
    document.querySelectorAll('.nav-item, .sidebar-link').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        const dataNav = item.getAttribute('data-nav');
        
        if (href === hash || dataNav === view || (hash === '' && (href === '#dashboard' || dataNav === 'dashboard'))) {
            item.classList.add('active');
        }
    });

    if (typeof navigateTo === 'function') {
        navigateTo(view);
    }
};

window.handleNavClick = (view) => {
    window.location.hash = view;
};

/**
 * 3. تشغيل المحرك والخدمات الأساسية
 */
function initCoreEngine() {
    // مراقبة الحالة بدون تحويل إجباري لصفحة اللوجين
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.info("ℹ️ Tera Auth: وضع التطوير نشط. الدخول لـ login.html معطل برمجياً.");
            // ملاحظة: لا نضع window.location.href هنا لتجنب خطأ الـ 404
        }
    });

    // تحديث السنة
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // مستمعات الأحداث
    window.addEventListener('hashchange', () => {
        window.handleNavigation(window.location.hash);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeAllModals();
    });

    // التشغيل الأولي
    window.handleNavigation(window.location.hash);

    console.log("🚀 Tera Engine Core: المحرك جاهز.");
}

// الانطلاق
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

export { initCoreEngine, BASE_PATH };
