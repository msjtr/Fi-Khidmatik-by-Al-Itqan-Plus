/**
 * js/utils/calculations.js
 * دوال الحسابات الخاصة بالمنتجات والأرباح والمخزون
 */

/**
 * حساب الربح الصافي (سعر البيع - التكلفة)
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} price - سعر البيع
 * @param {boolean} asNumber - إذا كان true يعيد رقم، وإلا يعيد نصاً منسقاً
 * @returns {number|string} الربح الصافي
 */
export const calculateProductProfit = (cost, price, asNumber = false) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    const profit = priceNum - costNum;
    return asNumber ? profit : profit.toFixed(2);
};

/**
 * حساب الربح الصافي كرقم (للاستخدام في العمليات الحسابية)
 */
export const calculateProductProfitNumber = (cost, price) => {
    return (Number(price) || 0) - (Number(cost) || 0);
};

/**
 * حساب نسبة الربح المئوية
 */
export const calculateProfitMargin = (cost, price, asNumber = false) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    if (costNum <= 0) return asNumber ? 0 : '0.0';
    const profit = priceNum - costNum;
    const margin = (profit / costNum) * 100;
    return asNumber ? margin : margin.toFixed(1);
};

/**
 * تحديد حالة المخزون بناءً على الكمية
 */
export const getStockStatus = (stock, thresholds = {}) => {
    const qty = Number(stock) || 0;
    const { critical = 0, low = 5 } = thresholds;
    
    if (qty <= critical) {
        return {
            label: "منتهي",
            color: "#e74c3c",
            icon: "fa-times-circle",
            text: "غير متوفر",
            level: "critical"
        };
    }
    if (qty <= low) {
        return {
            label: "قرب ينفد",
            color: "#e67e22",
            icon: "fa-exclamation-triangle",
            text: "كمية محدودة",
            level: "low"
        };
    }
    return {
        label: "متوفر",
        color: "#27ae60",
        icon: "fa-check-circle",
        text: "متوفر",
        level: "available"
    };
};

/**
 * حساب القيمة الإجمالية للمخزون
 */
export const calculateTotalValue = (cost, quantity) => {
    return (Number(cost) || 0) * (Number(quantity) || 0);
};

/**
 * حساب الربح المتوقع للمخزون الحالي
 */
export const calculateExpectedProfit = (cost, price, quantity) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    const qty = Number(quantity) || 0;
    const profitPerUnit = priceNum - costNum;
    const totalProfit = profitPerUnit * qty;
    return {
        perUnit: profitPerUnit,
        total: totalProfit,
        formattedPerUnit: `${profitPerUnit.toFixed(2)} ريال`,
        formattedTotal: `${totalProfit.toFixed(2)} ريال`
    };
};

export default {
    calculateProductProfit,
    calculateProductProfitNumber,
    calculateProfitMargin,
    getStockStatus,
    calculateTotalValue,
    calculateExpectedProfit
};
