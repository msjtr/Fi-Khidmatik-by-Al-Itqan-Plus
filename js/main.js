/**
 * main.js - المحرك المركزي لنظام Tera Gateway
 * الإصدار: 2.4.0 - تحديث أبريل 2026
 * الوظيفة: إدارة التنقل مع جسر برمجي استباقي لمنع أخطاء التعريف
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
// تعريف الدوال عالمياً فور تشغيل الملف لمنع خطأ "is not a function"
window.openCustomerModal = function(mode = 'add', id = null) {
    console.warn("جاري تهيئة الموديول... يرجى المحاولة مرة أخرى خلال لحظة.");
};
window.openAddCustomer = () => window.openCustomerModal('add');
window.saveCustomer = (e) => { if(e) e.preventDefault(); };
window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal') || document.getElementById('customerModal');
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

        // تشغيل المنطق البرمجي بناءً على القسم
        if (moduleName === 'customers') {
            await loadCustomersModule(container);
        }

    } catch (error) {
        console.error("❌ Navigation Error:", error);
        container.innerHTML = `<div style="text-align:center; padding:80px; color:#ef4444;"><p>تعذر تحميل الموديول.</p></div>`;
    }
}

/**
 * 4. موديول العملاء - التحميل وحقن الدوال الحقيقية
 */
async function loadCustomersModule(container) {
    try {
        // استيراد الموديول
        const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
        
        if (module && module.initCustomersUI) {
            module.initCustomersUI(container);
            
            // --- تحديث الجسر بالدوال الحقيقية (Override) ---
            window.openCustomerModal = (mode, id) => module.openCustomerModal(mode, id);
            window.openAddCustomer = () => module.openCustomerModal('add');
            window.editCustomer = (id) => module.openCustomerModal('edit', id);
            window.saveCustomer = (e) => module.handleCustomerSubmit(e);
            
            window.closeCustomerModal = () => {
                const modal = document.getElementById('customer-modal') || document.getElementById('customerModal');
                if (modal) {
                    modal.style.display = 'none';
                    if (window.quillEditor) window.quillEditor.setContents([]);
                }
            };

            initQuillEditor();
            console.log("✅ تم ربط الدوال الحقيقية لموديول العملاء");
        }
    } catch (err) {
        console.error("❌ فشل في استيراد موديول العملاء:", err);
    }
}

/**
 * 5. تهيئة محرر Quill
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem) {
        // تصفير المرجع القديم إذا وجد لمنع التكرار
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
 * 6. تحديث واجهة القائمة الجانبية
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

// تشغيل النظام
window.addEventListener('load', handleHashRoute);
window.addEventListener('hashchange', handleHashRoute);

window.switchModule = switchModule;
