// js/core/firebase.js

// الاستيراد باستخدام الروابط الكاملة لمنع خطأ TypeError
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// استيراد الإعدادات من الملف المحلي (تأكد من وجود export داخل config.js)
import { firebaseConfig } from './config.js';

// تهيئة التطبيق وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تصدير المتغير ليستخدمه موديول الطلبات والعملاء
export { db };
