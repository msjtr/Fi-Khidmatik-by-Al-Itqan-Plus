/**
 * منصة في خدمتك من الإتقان بلس | V12.12.12
 * وضع التطوير: تم تعطيل صفحة الدخول مؤقتاً لضمان سرعة الإدارة
 * الملف: js/main.js
 */

// استيراد قاعدة البيانات والصلاحيات من ملف firebase.js الأساسي
import { auth, db } from './firebase.js';

let sessionSeconds = 0; // متغير لحساب مدة الجلسة

/**
 * دالة تشغيل النظام الرئيسية
 */
export function initApp() {
    console.log("%c 🛠️ وضع التطوير: تم تعطيل نظام الحماية والدخول مؤقتاً ", "color: #fff; background: #ff0000; padding: 5px;");

    // السماح بالدخول المباشر لواجهة أبا صالح الشمري
    updateUIForUser();
    setupGlobalListeners();
}

/**
 * تحديث الواجهة مباشرة بصلاحيات مدير النظام وتشغيل العناصر التفاعلية
 */
function updateUIForUser() {
    console.log("الدخول المباشر بصلاحيات مدير النظام...");
    
    // دالة مجمعة لتحديث بيانات الهيدر وتشغيل الوظائف
    const applyUserData = () => {
        // 1. تحديث اسم المستخدم
        const userNameElement = document.getElementById('display-user-name');
        if (userNameElement) {
            userNameElement.innerText = "أبا صالح الشمري"; 
        }

        // 2. تحديث الصورة الرمزية لتكون حرف "م"
        const avatarElement = document.getElementById('user-avatar-icon');
        if (avatarElement) {
            avatarElement.innerText = "م"; 
        }

        // 3. تشغيل الساعة الرقمية الحية في الهيدر
        startClock();

        // 4. تشغيل عداد الجلسة في القائمة المنسدلة
        startSessionTimer();

        // 5. تفعيل حركة القائمة المنسدلة للملف الشخصي (الفتح والإغلاق)
        setupProfileDropdown();
    };

    // نستخدم Event Listener للتأكد من وجود العنصر بعد حقن الهيدر
    document.addEventListener('TeraLayoutReady', applyUserData);

    // صمام أمان (Fallback): محاولة التحديث بعد نصف ثانية لضمان أن الهيدر قد تم رسمه في الشاشة
    setTimeout(applyUserData, 500);
}

/**
 * دالة تشغيل الساعة الرقمية والتاريخ
 */
function startClock() {
    const clockMount = document.getElementById('clock-mount-point');
    if (!clockMount) return;

    setInterval(() => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'م' : 'ص';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // الساعة 0 تصبح 12
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        // رسم الساعة داخل الحاوية المخصصة لها
        clockMount.innerHTML = `
            <div class="clock-container">
                <div class="date-display">${now.toLocaleDateString('ar-SA')}</div>
                <div class="time-display">
                    ${hours}<span class="sep">:</span>${minutes} 
                    <span style="font-size:0.75rem; color:#8892B0; margin-right:4px;">${ampm}</span>
                </div>
            </div>
        `;
    }, 1000); // تحديث كل ثانية
}

/**
 * دالة حساب مدة الجلسة (تظهر داخل قائمة الملف الشخصي)
 */
function startSessionTimer() {
    const sessionCounter = document.getElementById('session-time-counter');
    if (!sessionCounter) return;

    setInterval(() => {
        sessionSeconds++;
        const hrs = Math.floor(sessionSeconds / 3600);
        const mins = Math.floor((sessionSeconds % 3600) / 60);
        const secs = sessionSeconds % 60;
        
        // تنسيق الوقت ليظهر بشكل 00:00:00
        sessionCounter.innerText = 
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

/**
 * دالة التحكم بالقائمة المنسدلة للملف الشخصي
 */
function setupProfileDropdown() {
    const triggerBtn = document.getElementById('profile-trigger-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');

    if (triggerBtn && dropdownMenu) {
        // عند الضغط على الصورة أو السهم
        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع الحدث من الوصول للشاشة وإغلاق القائمة فوراً
            dropdownMenu.classList.toggle('show');
        });

        // إغلاق القائمة عند الضغط في أي مكان آخر في الشاشة
        document.addEventListener('click', (e) => {
            if (!triggerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
}

/**
 * مراقبة حالة الاتصال بالإنترنت
 */
function setupGlobalListeners() {
    window.addEventListener('offline', () => {
        alert("تنبيه يا أبا صالح: انقطع الاتصال بالإنترنت، تأكد من الشبكة في مكتب حائل!");
    });
    
    window.addEventListener('online', () => {
        console.log("تم استعادة الاتصال بنجاح.");
    });
}

// تشغيل النظام تلقائياً عند تحميل الملف
initApp();

export const systemConfig = {
    version: "12.12.12",
    region: "Hail",
    platform: "Tera Gateway - Dev Mode"
};
