/**
 * منصة في خدمتك من الإتقان بلس | V12.12.12
 * تم تعطيل صفحة الدخول مؤقتاً (وضع التطوير)
 */

import { auth, db } from './firebase.js';

export function initApp() {
    console.log("%c 🛠️ وضع التطوير: تم تعطيل نظام الحماية والدخول مؤقتاً ", "color: #fff; background: #ff0000; padding: 5px;");

    // تعطيل فحص المستخدم (checkUserAuth) والسماح بالدخول المباشر
    updateUIForUser();
    setupGlobalListeners();
}

/**
 * تحديث الواجهة مباشرة دون انتظار سجل الدخول
 */
function updateUIForUser() {
    console.log("الدخول المباشر بصلاحيات مدير النظام...");
    const userNameElement = document.getElementById('user-display-name');
    if (userNameElement) {
        userNameElement.innerText = "أبا صالح الشمري (وضع الإدارة)"; 
    }
}

function setupGlobalListeners() {
    window.addEventListener('offline', () => {
        alert("تنبيه: أنت تعمل دون إنترنت!");
    });
}

export const systemConfig = {
    version: "12.12.12",
    region: "Hail",
    platform: "Tera Gateway - Dev Mode"
};
