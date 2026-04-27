/**
 * main.js - المحرك المركزي لنظام Tera Gateway
 * الإصدار: 2.1.0 - تحديث أبريل 2026
 * الوظيفة: إدارة التنقل، ربط الموديولات، والجسر البرمجي للأزرار
 */

// 1. خريطة المسارات المعتمدة (تطابق شجرة الملفات admin/modules/)
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

// متغيرات عالمية للوصول إليها من الموديولات
window.quillEditor = null;

/**
 * 2. المحرك الرئيسي لتبديل الأقسام
 */
async function switchModule(moduleName) {
    const container = document.getElementById('module-container');
    const path = routes[moduleName];
    
    if (!container) return;
    if (!path) {
        console.error(`الموديول ${moduleName} غير معرف في المسارات.`);
        return;
    }

    try {
        // إظهار واجهة التحميل اللطيفة
        container.innerHTML = `
            <div class="loader-wrapper" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px;">
                <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#2563eb; margin-bottom:20px;"></i>
                <p style="font-weight:800; color:#1e293b;">جاري مزامنة بيانات ${moduleName}...</p>
            </div>`;

        const response = await fetch(`${path}?v=${Date.now()}`);
        if (!response.ok) throw new Error(`فشل التحميل: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;

        // تحديث حالة القائمة الجانبية (Active Class)
        updateSidebarUI(moduleName);

        // تشغيل المنطق البرمجي الخاص بكل موديول
        await initializeModuleLogic(moduleName);

    } catch (error) {
        console.error("Navigation Error:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:80px; color:#ef4444;">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <p style="margin-top:15px; font-weight:bold;">حدث خطأ أثناء تحميل القسم. يرجى التأكد من مسار الملف:</p>
                <code>${path}</code>
            </div>`;
    }
}

/**
 * 3. الجسر البرمجي (The Bridge) - ربط موديول العملاء
 */
async function initializeModuleLogic(moduleName) {
    if (moduleName === 'customers') {
        try {
            // استيراد موديول الواجهة ديناميكياً
            const module = await import(`./modules/customers-ui.js?v=${Date.now()}`);
            
            if (module && module.initCustomersUI) {
                // تشغيل جلب البيانات ورسم الجدول
                module.initCustomersUI();

                // --- الجسر البرمجي: ربط أزرار الـ HTML بالدوال المعزولة داخل الموديول ---
                window.openAddCustomer = () => module.openCustomerModal('add');
                window.editCustomer = (id) => module.openCustomerModal('edit', id);
                window.saveCustomer = (e) => module.handleCustomerSubmit(e);
                window.deleteCust = (id) => module.deleteCust(id);
                
                // وظيفة إغلاق النافذة المنبثقة
                window.closeCustomerModal = () => {
                    const modal = document.getElementById('customer-modal');
                    if (modal) {
                        modal.style.display = 'none';
                        if (window.quillEditor) window.quillEditor.setContents([]);
                    }
                };

                // تهيئة محرر Quill للملاحظات
                initQuillEditor();
                console.log("✅ تم ربط جسر عمليات العملاء بنجاح");
            }
        } catch (err) {
            console.error("فشل تحميل موديول العملاء:", err);
        }
    }
    
    // يمكن إضافة جسر موديولات أخرى هنا (مثل المنتجات أو الطلبات)
}

/**
 * 4. تهيئة محرر النصوص (Quill)
 */
function initQuillEditor() {
    const editorElem = document.getElementById('customer-notes-editor');
    if (editorElem) {
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
 * 5. تحديث القائمة الجانبية بصرياً
 */
function updateSidebarUI(moduleName) {
    document.querySelectorAll('.nav-item').forEach(link => {
        // التحقق مما إذا كان الزر يستدعي الموديول الحالي
        const clickAttr = link.getAttribute('onclick') || '';
        if (clickAttr.includes(`'${moduleName}'`)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 6. نظام التوجيه عبر الروابط (Hash Routing)
 */
function handleHashRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
}

// الاستماع لأحداث التحميل وتغيير الرابط
window.addEventListener('load', handleHashRoute);
window.addEventListener('hashchange', handleHashRoute);

// إتاحة الدوال عالمياً للأزرار
window.switchModule = switchModule;
