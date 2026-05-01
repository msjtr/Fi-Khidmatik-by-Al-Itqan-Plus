/**
 * منصة في خدمتك من الإتقان بلس | V12.12.12
 * المحرك المركزي (Main Engine)
 * الموقع: حائل، المملكة العربية السعودية
 */

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * وظيفة تهيئة النظام الأساسية
 * يتم استدعاؤها من ملف main-hub.html
 */
export function initApp() {
    console.log("%c منصة في خدمتك | نظام Tera المحرك V12.12.12 جاهز ", "color: #c5a059; background: #001f3f; padding: 5px; border-radius: 5px;");

    // 1. مراقبة حالة تسجيل الدخول
    checkUserAuth();

    // 2. تهيئة المستمعات العامة للأزرار (إن وجدت)
    setupGlobalListeners();
}

/**
 * التحقق من صلاحية المستخدم (الأمن)
 */
function checkUserAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // المستخدم مسجل دخوله
            console.log("تم التحقق من هوية المدير: ", user.email);
            updateUIForUser(user);
        } else {
            // لا يوجد مستخدم، توجيه لصفحة الدخول
            console.warn("تنبيه: لم يتم تسجيل الدخول، جاري التحويل...");
            window.location.href = 'login.html';
        }
    });
}

/**
 * تحديث عناصر الواجهة بناءً على بيانات المستخدم
 */
function updateUIForUser(user) {
    // يمكن هنا إرسال اسم المستخدم للهيدر إذا كان متوفراً في ملفات mm
    const userNameElement = document.getElementById('user-display-name');
    if (userNameElement) {
        userNameElement.innerText = "أبا صالح الشمري"; // تخصيص ثابت حسب رغبتك
    }
}

/**
 * إعداد وظائف التحكم العامة في المنصة
 */
function setupGlobalListeners() {
    // هنا يمكن إضافة مستمعات للأحداث التي تؤثر على المنصة ككل
    window.addEventListener('offline', () => {
        alert("انقطع الاتصال بالإنترنت! قد لا يتم حفظ بيانات العملاء في حائل.");
    });
}

// تصدير وظائف إضافية لاستخدامها في الصفحات الفرعية إذا لزم الأمر
export const systemConfig = {
    version: "12.12.12",
    region: "Hail",
    platform: "Tera Gateway"
};
