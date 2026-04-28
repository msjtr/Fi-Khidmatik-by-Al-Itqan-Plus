/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار المحدث V12.12.1
 * المطور: محمد بن صالح الشمري
 */

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

console.log("⚙️ Tera Engine Core: جاري تشغيل المحرك الرئيسي...");

/**
 * 1. الدوال العالمية المساعدة (Global Utilities)
 */

// جلب البيانات مع فحص حالة الاتصال
window.getCollectionData = async (collectionName) => {
    // الانتظار قليلاً إذا كان db لم يجهز بعد (تجنب مشاكل السباق البرمجي)
    if (!window.db) {
        console.warn("⏳ Tera Engine: قاعدة البيانات قيد التحضير، جاري الانتظار...");
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!window.db) {
        console.error("❌ Tera Engine: فشل الوصول لقاعدة البيانات.");
        return [];
    }

    try {
        const querySnapshot = await getDocs(collection(window.db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`🔴 Error fetching ${collectionName}:`, error);
        return [];
    }
};

// إدارة المودالات (إغلاق)
window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal') || document.getElementById('customerModal');
    if (modal) {
        modal.classList.remove('active', 'show'); // دعم لمختلف كلاسات CSS
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // إزالة الطبقة الخلفية إذا كنت تستخدم Bootstrap
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }
};

/**
 * 2. إدارة واجهة المستخدم (UI Bridge)
 */

// تحديث القائمة الجانبية بشكل احترافي
window.updateSidebarUI = (activeHash) => {
    const hash = (activeHash || window.location.hash).replace('#', '') || 'dashboard';
    
    document.querySelectorAll('.nav-item, .sidebar-link').forEach(item => {
        item.classList.remove('active');
        const target = item.getAttribute('href') || item.getAttribute('onclick') || '';
        if (target.includes(hash)) {
            item.classList.add('active');
        }
    });
};

/**
 * 3. تشغيل المحرك والخدمات الأساسية
 */
function initCoreEngine() {
    // 1. تحديث السنة تلقائياً
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. تحديث القائمة الجانبية بناءً على الرابط الحالي
    window.updateSidebarUI(window.location.hash);

    // 3. مستمع لغلق المودالات عند الضغط على مفتاح Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeCustomerModal();
    });

    console.log("🚀 Tera Engine Core: النظام جاهز للعمل.");
}

// التأكد من التشغيل الصحيح
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}

export { initCoreEngine };
