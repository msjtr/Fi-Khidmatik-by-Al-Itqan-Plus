/**
 * نظام Tera V12 - محرك تتبع العمليات (Log Tracker)
 * مؤسسة الإتقان بلس - حائل
 */

const LogTracker = {
    // دالة تسجيل العمليات الناجحة (إضافة، تعديل، حذف)
    async logAction(actionType, details) {
        try {
            const logEntry = {
                adminName: "أبا صالح الشمري", // توثيق المسؤول
                action: actionType, // نوع العملية
                description: details, // وصف تفصيلي
                timestamp: new Date(), // وقت الحدوث
                location: "Hail Office", // فرع حائل
                userAgent: navigator.userAgent // معلومات الجهاز والمتصفح
            };

            // الحفظ في مجموعة السجلات بـ Firebase
            await db.collection("system_logs").add(logEntry);
            console.log(`✅ Tera Log: تم تسجيل عملية ${actionType} بنجاح.`);
        } catch (error) {
            console.error("❌ فشل تسجيل السجل:", error);
        }
    },

    // دالة تسجيل الأخطاء البرمجية (للصيانة والتدقيق)
    async logError(errorSource, errorMessage) {
        try {
            const errorEntry = {
                adminName: "أبا صالح الشمري",
                type: "ERROR",
                source: errorSource,
                message: errorMessage,
                timestamp: new Date(),
                status: "لم يتم الحل"
            };

            await db.collection("system_errors").add(errorEntry);
            console.warn(`⚠️ Tera Alert: تم رصد خطأ في ${errorSource}.`);
        } catch (e) {
            console.error("فشل إرسال تقرير الخطأ:", e);
        }
    }
};

// جعل الـ Tracker متاحاً لكافة ملفات النظام
window.LogTracker = LogTracker;
