/**
 * js/main.js
 * المحرك الرئيسي - نظام تيرا جيتواي (Tera Gateway)
 * إدارة التنقل الديناميكي والتحقق من Firebase
 */

// الاستيراد من المجلدات الفرعية (تأكد من مطابقة الأسماء في GitHub)
import { initProducts } from './modules/products-ui.js';
import { initCustomers } from './modules/customers-core.js';
// استيراد أداة الانتظار من المسار الصحيح المعتمد في صورتك السابقة
import { waitForFirebase } from './core/firebase.js';

async function switchModule(moduleName) {
    console.log("🚀 محاولة فتح قسم:", moduleName);
    const container = document.getElementById('module-container');

    if (!container) return;

    // إظهار رسالة انتظار احترافية
    container.innerHTML = `
        <div style="padding:100px; text-align:center;">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color:#1e293b; margin-bottom:15px;"></i>
            <p style="font-family:'Tajawal', sans-serif; font-weight:700;">جاري تحميل بيانات ${moduleName === 'customers' ? 'العملاء' : 'المنتجات'}...</p>
        </div>`;

    try {
        // الانتظار حتى يتم تهيئة Firebase تماماً لتجنب خطأ "db is null"
        // هذه الدالة مهمة جداً لضمان استقرار الربط في GitHub Pages
        await waitForFirebase();

        switch (moduleName) {
            case 'products':
                await initProducts(container);
                break;
            case 'customers':
                await initCustomers(container);
                break;
            case 'orders':
                container.innerHTML = `
                    <div style="padding:60px; text-align:center; background:#fff; border-radius:15px; margin:20px;">
                        <i class="fas fa-file-signature fa-4x" style="color:#cbd5e1; margin-bottom:20px;"></i>
                        <h2 style="color:#1e293b;">📦 قسم طلبات الأقساط</h2>
                        <p style="color:#64748b;">هذا القسم قيد التحديث ليتوافق مع نظام "سوا" الجديد ونموذج التقسيط.</p>
                    </div>`;
                break;
            case 'dashboard':
            default:
                container.innerHTML = `
                    <div style="padding:60px; text-align:center; background:#fff; border-radius:15px; margin:20px;">
                        <i class="fas fa-chart-pie fa-4x" style="color:#3b82f6; margin-bottom:20px;"></i>
                        <h2 style="color:#1e293b;">مرحباً بك في Tera Gateway</h2>
                        <p style="color:#64748b;">نظام إدارة "في خدمتك" - منطقة حائل.</p>
                        <hr style="width:50px; margin:20px auto; border-color:#eee;">
                        <small style="color:#94a3b8;">يرجى اختيار قسم من القائمة الجانبية للبدء.</small>
                    </div>`;
        }
    } catch (err) {
        console.error("❌ خطأ في تحميل الموديول:", err);
        container.innerHTML = `
            <div style="color:#ef4444; padding:40px; border:2px dashed #fca5a5; margin:20px; border-radius:12px; background:#fef2f2; text-align:center;">
                <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom:15px;"></i>
                <h3 style="margin-top:0;">⚠️ عطل فني في التحميل</h3>
                <p style="font-weight:700;">${err.message}</p>
                <button onclick="location.reload()" style="padding:10px 20px; border:none; background:#ef4444; color:#fff; border-radius:8px; cursor:pointer;">إعادة تحميل الصفحة</button>
            </div>`;
    }
}

// تصدير الدالة للنافذة العامة (Global Scope) لتعمل مع onclick في الـ Sidebar
window.switchModule = switchModule;

// التعامل مع تحميل الصفحة وتغيير الروابط (Hash)
const handleRoute = () => {
    // جلب اسم القسم من الـ Hash في الرابط (مثلاً #customers)
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    switchModule(hash);
};

// الاستماع لتغييرات الروابط
window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('hashchange', handleRoute);
