/**
 * js/main.js - الملف الرئيسي لنظام Tera Gateway
 */

console.log('🚀 Tera Gateway System Initialized');

// دالة تبديل الموديولات
async function switchModule(moduleName) {
    console.log('🔄 Loading module:', moduleName);
    
    const loader = document.getElementById('loader');
    const container = document.getElementById('module-container');
    
    if (!container) return;
    
    if (loader) loader.style.display = 'block';
    container.innerHTML = '';
    
    if (typeof window.setActiveNavItem === 'function') {
        window.setActiveNavItem(moduleName);
    }
    
    if (window.location.hash !== `#${moduleName}`) {
        window.location.hash = moduleName;
    }
    
    try {
        let content = '';
        
        switch (moduleName) {
            case 'dashboard':
                content = getDashboardContent();
                break;
            case 'products':
                content = getProductsContent();
                break;
            case 'orders':
                content = getOrdersContent();
                break;
            case 'customers':
                content = getCustomersContent();
                break;
            case 'settings':
                content = getSettingsContent();
                break;
            default:
                content = getDashboardContent();
        }
        
        container.innerHTML = content;
        console.log('✅ Module loaded:', moduleName);
        
    } catch (err) {
        console.error('❌ Error loading module:', err);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>حدث خطأ</h3>
                <p>${err.message}</p>
            </div>
        `;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

function getDashboardContent() {
    const today = new Date().toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div style="padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50;"><i class="fas fa-chart-line" style="color: #e67e22;"></i> لوحة التحكم الرئيسية</h1>
                <div style="background: white; padding: 10px 20px; border-radius: 10px;">
                    <i class="fas fa-calendar-alt" style="color: #e67e22;"></i> ${today}
                </div>
            </div>
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 30px;">
                <div class="stat-card" data-module="products" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer;">
                    <i class="fas fa-box fa-3x" style="margin-bottom: 15px;"></i>
                    <h3>المنتجات</h3>
                    <p>إدارة المخزون والمنتجات</p>
                </div>
                <div class="stat-card" data-module="orders" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer;">
                    <i class="fas fa-receipt fa-3x" style="margin-bottom: 15px;"></i>
                    <h3>الطلبات</h3>
                    <p>متابعة طلبات التقسيط</p>
                </div>
                <div class="stat-card" data-module="customers" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; border-radius: 15px; color: white; cursor: pointer;">
                    <i class="fas fa-users fa-3x" style="margin-bottom: 15px;"></i>
                    <h3>العملاء</h3>
                    <p>إدارة بيانات العملاء</p>
                </div>
            </div>
            
            <div style="background: white; border-radius: 15px; padding: 20px; text-align: center;">
                <i class="fas fa-chart-simple fa-2x" style="color: #e67e22;"></i>
                <p style="margin-top: 10px; color: #7f8c8d;">مرحباً بك في نظام Tera Gateway لإدارة المبيعات والتقسيط</p>
            </div>
        </div>
        
        <script>
            document.querySelectorAll('.stat-card').forEach(card => {
                card.addEventListener('click', () => {
                    const module = card.getAttribute('data-module');
                    if (module && typeof window.switchModule === 'function') {
                        window.switchModule(module);
                    }
                });
            });
        </script>
    `;
}

function getProductsContent() {
    return `
        <div style="padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2><i class="fas fa-box" style="color: #e67e22;"></i> إدارة المنتجات</h2>
                <button class="btn-primary" onclick="alert('سيتم إضافة المنتج قريباً')">
                    <i class="fas fa-plus"></i> إضافة منتج
                </button>
            </div>
            <div class="card">
                <p style="color: #7f8c8d; text-align: center; padding: 40px;">
                    <i class="fas fa-box-open fa-3x" style="color: #bdc3c7; margin-bottom: 15px; display: block;"></i>
                    قائمة المنتجات ستظهر هنا قريباً
                </p>
            </div>
        </div>
    `;
}

function getOrdersContent() {
    return `
        <div style="padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2><i class="fas fa-receipt" style="color: #e67e22;"></i> طلبات التقسيط</h2>
                <button class="btn-primary" onclick="alert('سيتم إنشاء طلب جديد قريباً')">
                    <i class="fas fa-plus"></i> طلب جديد
                </button>
            </div>
            <div class="card">
                <p style="color: #7f8c8d; text-align: center; padding: 40px;">
                    <i class="fas fa-file-invoice fa-3x" style="color: #bdc3c7; margin-bottom: 15px; display: block;"></i>
                    قائمة الطلبات ستظهر هنا قريباً
                </p>
            </div>
        </div>
    `;
}

function getCustomersContent() {
    return `
        <div style="padding: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2><i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء</h2>
                <button class="btn-primary" onclick="alert('سيتم إضافة عميل جديد قريباً')">
                    <i class="fas fa-user-plus"></i> إضافة عميل
                </button>
            </div>
            <div class="card">
                <p style="color: #7f8c8d; text-align: center; padding: 40px;">
                    <i class="fas fa-address-card fa-3x" style="color: #bdc3c7; margin-bottom: 15px; display: block;"></i>
                    قائمة العملاء ستظهر هنا قريباً
                </p>
            </div>
        </div>
    `;
}

function getSettingsContent() {
    return `
        <div style="padding: 25px;">
            <h2><i class="fas fa-cog" style="color: #e67e22;"></i> الإعدادات</h2>
            <div class="card">
                <p style="color: #7f8c8d; text-align: center; padding: 40px;">
                    <i class="fas fa-sliders-h fa-3x" style="color: #bdc3c7; margin-bottom: 15px; display: block;"></i>
                    لوحة الإعدادات قيد التطوير
                </p>
            </div>
        </div>
    `;
}

window.switchModule = switchModule;

// تحميل الموديول الافتراضي
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    const defaultModule = hash || 'dashboard';
    switchModule(defaultModule);
});
