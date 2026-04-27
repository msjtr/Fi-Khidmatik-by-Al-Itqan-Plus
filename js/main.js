/**
 * main.js - المحرك المركزي لنظام Tera Gateway
 * الإصدار: 2.4.5 - تحديث أبريل 2026 (إصلاح جسر الموديولات)
 */

const routes = {
    'dashboard': 'admin/modules/orders-dashboard.html',
    'customers': 'admin/modules/customers.html',
    'order-form': 'admin/modules/order-form.html',
    'products':  'admin/modules/products.html',
    'inventory': 'admin/modules/inventory.html',
    'payments':  'admin/modules/payments.html',
    'invoice':   'admin/modules/invoice.html',
    'settings':  'admin/modules/settings.html',
    'backup':    'admin/modules/backup.html',
    'general':   'admin/modules/general.html'
};

window.quillEditor = null;

// --- [1] الجسر الاستباقي (Early Bridge) ---
// منع خطأ "is not a function" عبر تعريف دوال مؤقتة تتبدل تلقائياً بعد تحميل الموديول
window.openCustomerModal = function(mode = 'add', id = null) {
    console.warn("⏳ جاري تهيئة موديول العملاء... يرجى الانتظار ثانية.");
};
window.openAddCustomer = () => window.openCustomerModal('add');
window.editCustomer = (id) => window.openCustomerModal('edit', id);
window.saveCustomer = (e) => { if(e) e.preventDefault(); };
window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * 2. الجسر العالمي للتنقل
 */
window.handleNavClick = function(element, moduleName) {
    if (window.event) window.event.preventDefault();
    window.location.hash = moduleName;
};

/**
 * 3. المحرك الرئيسي لتبديل الأقسام
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const path = routes[moduleName];
    
    if (!container || !path) return;

    try {
        container.innerHTML = `
            <div class="loader-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px;">
                <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#2563eb; margin-bottom:20px;"></i>
                <p style="font-weight:800; color:#1e293b;">جاري مزامنة بيانات ${moduleName}...</p>
            </div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;

        updateSidebarUI(moduleName);

        // تشغيل المنطق البرمجي الخاص بموديول العملاء
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        }

    } catch (error) {
        console.error("❌ Navigation Error:", error);
        container.innerHTML = `<div style="text-align:center; padding:80px; color:#ef4444;"><p>تعذر تحميل الموديول. تأكد من وجود الملف في المسار الصحيح.</p></div>`;
    }
}

/**
 * 4. موديول العملاء - الاستيراد وحقن الدوال الحقيقية
 */
async function loadCustomersModule(container) {
    try {
        // استيراد الموديول مع كسر الكاش لضمان التحديث
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        
        if (module) {
            // تهيئة الواجهة
            if (typeof module.initCustomersUI === 'function') {
                module.initCustomersUI(container);
            }
            
            // --- تحديث الجسر بالدوال الحقيقية المستوردة (Override) ---
            window.openCustomerModal = (mode, id) => module.openCustomerModal(mode, id);
            window.openAddCustomer = () => module.openCustomerModal('add');
            window.editCustomer = (id) => module.openCustomerModal('edit', id);
            window.saveCustomer = (e) => module.handleCustomerSubmit(e);
            window.closeCustomerModal = () => module.closeCustomerModal();

            // تهيئة محرر الملاحظات Quill
            initQuillEditor();
            
            console.log("✅ تم حقن الدوال الحقيقية لموديول العملاء بنجاح.");
        }
    } catch (err) {
        console.error("❌ فشل في استيراد موديول العملاء. تأكد من وجود export قبل الدوال:", err);
    }
}

/**
 * 5. تهيئة محرر Quill
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem) {
        if (window.quillEditor) window.quillEditor = null;
        
        window.quillEditor = new Quill('#customer-notes-editor', {
            theme: 'snow',
            placeholder: 'سجل الملاحظات والشروط هنا...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
}

/**
 * 6. تحديث واجهة القائمة الجانبية (Sidebar)
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.nav-item').forEach(link => {
        const clickAttr = link.getAttribute('onclick') || '';
        if (clickAttr.includes(`'${moduleName}'`)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 7. معالج المسارات (Hash Routing)
 */
function handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// تشغيل النظام عند التحميل أو تغيير الـ Hash
window.addEventListener('load', handleHashRoute);
window.addEventListener('hashchange', handleHashRoute);

window.switchModule = switchModule;
