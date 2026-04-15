// js/core/firebase.js

// 1. الاستيراد باستخدام الروابط الكاملة (CDN) لمنع أخطاء Specifier
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";

// 2. استيراد الإعدادات من الملف المحلي
// تأكد أن ملف config.js يحتوي على كلمة export قبل المتغير
import { firebaseConfig } from './config.js';

// 3. تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// 4. تصدير المتغيرات لاستخدامها في الموديولات الأخرى
export { db, analytics };
