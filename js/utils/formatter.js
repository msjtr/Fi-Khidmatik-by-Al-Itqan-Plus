/**
 * js/utils/formatter.js
 * دوال تنسيق الأرقام والعملات والتواريخ
 */

/**
 * تنسيق العملة (ريال سعودي)
 */
export const formatCurrency = (amount, showSymbol = true, showFraction = true) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'SAR',
        minimumFractionDigits: showFraction ? 2 : 0,
        maximumFractionDigits: showFraction ? 2 : 0
    }).format(num);
};

/**
 * تنسيق رقم عادي مع فواصل الآلاف
 */
export const formatNumber = (number, decimals = 0) => {
    const num = Number(number) || 0;
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};

/**
 * تحويل الأرقام العربية إلى إنجليزية
 */
export const toEnglishDigits = (str) => {
    if (str === undefined || str === null) return '';
    if (typeof str === 'number') return str.toString();
    const arabicDigits = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return str.toString().replace(/[٠-٩]/g, (digit) => arabicDigits[digit] || digit);
};

/**
 * تنسيق التاريخ
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '---';
    let d;
    if (typeof date === 'object' && date !== null) {
        d = date.toDate ? date.toDate() : new Date(date);
    } else {
        d = new Date(date);
    }
    if (isNaN(d.getTime())) return '---';
    const formats = {
        'short': () => d.toLocaleDateString('en-GB'),
        'long': () => d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
        'iso': () => d.toISOString().split('T')[0]
    };
    return formats[format] ? formats[format]() : formats.short();
};

/**
 * تنسيق النسبة المئوية
 */
export const formatPercent = (value, decimals = 1) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num / 100);
};

/**
 * تنسيق رقم الجوال السعودي
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.toString().replace(/[^\d]/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('05')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
    if (cleaned.length === 9 && cleaned.startsWith('5')) {
        return `0${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
    }
    return phone;
};

export default {
    formatCurrency,
    formatNumber,
    toEnglishDigits,
    formatDate,
    formatPercent,
    formatPhoneNumber
};
