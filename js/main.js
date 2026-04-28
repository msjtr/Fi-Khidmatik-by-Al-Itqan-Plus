/**
 * js/main.js
 * المحرك الرئيسي لإدارة نظام "تيرا جيت واي" - الإصدار المحدث V12.12.1
 * المطور: محمد بن صالح الشمري
 */

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from "./core/firebase.js";

// 1. تعريف موديولات النظام والروابط الخاصة بها
const routes = {
    'dashboard': { title: 'الرئيسية', file: 'dashboard.html' },
    'customers': { title: 'قاعدة العملاء', file: 'customers.html' },
    'orders':    { title: 'طلبات التقسيط', file: 'orders-dashboard.html' },
    'inventory': { title: 'المخزون', file: 'inventory.html' },
    'payments':  { title: 'المدفوعات', file: 'payments.html' },
    'settings':  { title: 'الإعدادات', file: 'settings.html' }
};

// 2. دالة إدارة التنقل (Routing)
window.handleRoute = async () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const route = routes[hash];
    const container = document.getElementById('module-container');

    if (!route || !container) return;

    document.title = `تيرا جيت واي | ${route.title}`;
    
    // إظهار مؤشر تحميل تيرا المخصص
    container.innerHTML = `
        <div class="loader-container" style="text-align:center; padding:100px;">
            <div class="spinner-border text-primary" role="status"></div>
            <p style="margin-top:20px; font-family:'Cairo';">جاري تحميل ${route.title}...</p>
        </div>`;

    try {
        const response = await fetch(`admin/modules/${route.file}?v=${Date.now()}`);
        if (!response.ok) throw new Error("فشل تحميل ملف الموديول");
        
        const html = await response.text();
        container.innerHTML = html;

        // تهيئة الموديول برمجياً
        await initModuleLogic(hash, container);

        // تحديث حالة القائمة الجانبية
        updateSidebarUI(hash);

    } catch (error) {
        console.error("🔴 Navigation Error:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:#ef4444;">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <p>تعذر تحميل الصفحة، تأكد من وجود ملف ${route.file} في مجلد modules.</p>
                <button onclick="window.handleRoute()" class="btn-refresh">إعادة المحاولة</button>
            </div>`;
    }
};

// 3. تشغيل المنطق الخاص بكل موديول (Dynamic Import)
async function initModuleLogic(hash, container) {
    try {
        switch (hash) {
            case 'customers':
                const custModule = await import(`./modules/customers-ui.js?v=${Date.now()}`);
                if (custModule.initCustomersUI) {
                    await custModule.initCustomersUI(container);
                }
                
                // الجسر البرمجي للأزرار (Bridge)
                window.openAddCustomer = () => custModule.openAddCustomerModal?.();
                window.handleCustomerSubmit = () => custModule.handleCustomerSubmit?.();
                window.editCustomer = (id) => custModule.editCustomer?.(id);
                window.deleteCustomer = (id) => custModule.deleteCustomer?.(id);
                break;
            
            case 'dashboard':
                const dashModule = await import(`./modules/dashboard.js?v=${Date.now()}`);
                if (dashModule.initDashboard) await dashModule.initDashboard();
                break;

            case 'orders':
                const orderModule = await import(`./modules/orders-dashboard.js?v=${Date.now()}`);
                if (orderModule.initOrders) await orderModule.initOrders(container);
                break;
        }
    } catch (err) {
        console.error(`🔴 Logic Error [${hash}]:`, err);
    }
}

// 4. دالة تحديث شكل القائمة الجانبية
function updateSidebarUI(activeHash) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${activeHash}`) {
            item.classList.add('active');
        }
    });
}

// 5. دوال الخدمات العامة
window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal') || document.getElementById('customerModal');
    if (modal) {
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
};

/**
 * دالة مساعدة عالمية لجلب البيانات بنظام V12 Modern
 */
window.getCollectionData = async (collectionName) => {
    if (!db) {
        console.error("Database not ready");
        return [];
    }
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
};

// 6. تشغيل النظام عند الجاهزية
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('hashchange', window.handleRoute);
        window.handleRoute();
    });
} else {
    window.addEventListener('hashchange', window.handleRoute);
    window.handleRoute();
}
