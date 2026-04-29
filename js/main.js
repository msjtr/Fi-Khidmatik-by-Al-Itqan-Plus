/**
 * js/main.js - V12.12.4
 */
import { db, auth } from './core/config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

// دالة لتحديث شكل الروابط في السايدبار
window.syncNavigationUI = (hash) => {
    const view = hash.replace('#', '') || 'dashboard';
    document.querySelectorAll('.sidebar-link, .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === hash || (hash === '#dashboard' && item.getAttribute('href') === '#')) {
            item.classList.add('active');
        }
    });
};

function initCoreEngine() {
    onAuthStateChanged(auth, (user) => {
        console.log(user ? "✅ مستخدم مسجل" : "ℹ️ وضع الضيف");
    });

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    window.syncNavigationUI(window.location.hash);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreEngine);
} else {
    initCoreEngine();
}
