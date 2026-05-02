/**
 * نظام Tera V12 - محرك القائمة الجانبية (Sidebar Logic)
 */

export function initSidebarLogic() {
    // 1. منطق طي وتوسيع القائمة الجانبية
    document.addEventListener('click', function(e) {
        const toggleBtn = e.target.closest('#toggle-sidebar-btn');
        if (toggleBtn) {
            const layout = document.querySelector('.tera-layout');
            if (layout) {
                layout.classList.toggle('sidebar-collapsed');
            }
        }
    });

    // 2. منطق تلوين الزر النشط تلقائياً عند الضغط عليه
    document.addEventListener('click', function(e) {
        const navBtn = e.target.closest('.nav-btn');
        if (navBtn) {
            // إزالة التفعيل من جميع الأزرار
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            // إضافة التفعيل للزر الحالي
            navBtn.classList.add('active');
        }
    });
}

// 3. دالة التنقل المنفصلة (كما طلبت لتنظيم الصفحات)
window.handleSidebarClick = function(moduleName) {
    // جلب الإطار باسمه الجديد في تصميمنا
    const frame = document.getElementById('tera-iframe'); 
    
    // قاموس (مجلد) مسارات الصفحات المنظم
    const pages = {
        'dashboard': 'pages/customers-list.html',
        'customers': 'pages/add-customer.html',
        'stats': 'pages/customers-stats.html',
        'installments': 'pages/installments.html',
        'reports': 'pages/reports.html'
    };

    if (frame) {
        // إضافة تأثير بهتان جميل أثناء التحميل
        frame.style.opacity = '0.2';
        
        // توجيه الإطار للمسار المطلوب، وإذا لم يجده يعود للرئيسية
        frame.src = pages[moduleName] || pages['dashboard'];
        
        // إعادة إضاءة الشاشة بعد اكتمال فتح الصفحة
        frame.onload = () => { frame.style.opacity = '1'; };
    }
};
