// ... (أكواد الاستيراد و firebaseConfig كما هي)

// 1. تغيير التعريف ليكون مباشر (Direct Export) لضمان رؤية الموديولات الأخرى للمتغيرات
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let isInitialized = true;
let initError = null;

/**
 * دالة التهيئة الإضافية (مثل persistense)
 */
async function setupFirebaseFeatures() {
    try {
        // تمكين التخزين المؤقت
        await enableIndexedDbPersistence(db);
        console.log('✅ Offline persistence enabled');
    } catch (err) {
        console.warn('⚠️ Persistence notice:', err.code);
    }
}

// تشغيل الميزات الإضافية في الخلفية
setupFirebaseFeatures();

// تصدير الأدوات المساعدة
export const isFirebaseReady = () => isInitialized;
export const waitForFirebase = async () => isInitialized;

// التصدير الافتراضي
export default { db, auth, app };
