/**
 * المسار الحالي: js/utils/formatter.js
 * وظيفة الملف: تنسيق الأرقام، العملات، والتواريخ لصيغة احترافية
 */

// 1. تنسيق العملة (ريال سعودي بأرقام إنجليزية وفواصل آلاف)
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2, // يضمن ظهور الهللات مثل 100.00
    }).format(amount);
};

// 2. تحويل الأرقام العربية (الهندية) إلى إنجليزية
// ضروري جداً عند استلام مدخلات من المستخدمين الذين يكتبون بلوحة مفاتيح عربية
export const toEnglishDigits = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

// 3. تنسيق التاريخ بصيغة بسيطة (YYYY-MM-DD)
// مفيد لعرض تاريخ طلبات التقسيط في الجداول
export const formatDate = (date) => {
    if (!date) return '---';
    const d = (date.toDate) ? date.toDate() : new Date(date); // التعامل مع Firebase Timestamp
    return d.toLocaleDateString('en-GB'); // يعطيك تنسيق مثل 19/04/2026
};

// 4. تنسيق النسبة المئوية
// مفيد إذا أردت حساب نسبة الفائدة أو الأرباح
export const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
    }).format(value / 100);
};
