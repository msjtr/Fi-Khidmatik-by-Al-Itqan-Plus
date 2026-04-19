/**
 * js/utils/calculations.js
 * دوال الحسابات الخاصة بالمنتجات والأرباح والمخزون
 * @version 2.0.0
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
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} price - سعر البيع
 * @returns {number} الربح الصافي كرقم
 */
export const calculateProductProfitNumber = (cost, price) => {
    return (Number(price) || 0) - (Number(cost) || 0);
};

/**
 * حساب نسبة الربح المئوية
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} price - سعر البيع
 * @param {boolean} asNumber - إذا كان true يعيد رقم، وإلا يعيد نصاً منسقاً
 * @returns {number|string} نسبة الربح المئوية
 */
export const calculateProfitMargin = (cost, price, asNumber = false) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    
    if (costNum <= 0) return asNumber ? 0 : '0.0';
    
    const profit = priceNum - costNum;
    const margin = (profit / costNum) * 100;
    
    // تحديد الإشارة (+/-)
    const sign = margin >= 0 ? '+' : '';
    
    return asNumber ? margin : `${sign}${margin.toFixed(1)}`;
};

/**
 * حساب هامش الربح من سعر البيع (markup)
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} price - سعر البيع
 * @returns {number} هامش الربح المئوي من سعر البيع
 */
export const calculateMarkupMargin = (cost, price) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    
    if (priceNum <= 0) return 0;
    
    const profit = priceNum - costNum;
    return (profit / priceNum) * 100;
};

/**
 * حساب سعر البيع المقترح بناءً على نسبة الربح المطلوبة
 * @param {number|string} cost - سعر التكلفة
 * @param {number} targetMarginPercent - نسبة الربح المطلوبة (مثال: 30 تعني 30%)
 * @returns {number} سعر البيع المقترح
 */
export const calculateSuggestedPrice = (cost, targetMarginPercent = 30) => {
    const costNum = Number(cost) || 0;
    const margin = Number(targetMarginPercent) || 0;
    
    if (margin <= 0) return costNum;
    
    // سعر البيع = التكلفة / (1 - نسبة الربح المطلوبة / 100)
    return costNum / (1 - (margin / 100));
};

/**
 * تحديد حالة المخزون بناءً على الكمية
 * @param {number|string} stock - الكمية المتوفرة
 * @param {Object} thresholds - عتبات التصنيف المخصصة (اختياري)
 * @returns {Object} حالة المخزون مع التصنيف واللون والأيقونة والنص
 */
export const getStockStatus = (stock, thresholds = {}) => {
    const qty = Number(stock) || 0;
    
    // العتبات الافتراضية
    const { critical = 0, low = 5, medium = 20 } = thresholds;
    
    // تحديد الحالة
    if (qty <= critical) {
        return {
            label: "منتهي",
            color: "#e74c3c",
            icon: "fa-times-circle",
            text: "غير متوفر",
            level: "critical",
            percentage: 0
        };
    }
    
    if (qty <= low) {
        return {
            label: "قرب ينفد",
            color: "#e67e22",
            icon: "fa-exclamation-triangle",
            text: "كمية محدودة",
            level: "low",
            percentage: Math.round((qty / low) * 100)
        };
    }
    
    if (qty <= medium) {
        return {
            label: "متوفر",
            color: "#27ae60",
            icon: "fa-check-circle",
            text: "متوفر",
            level: "medium",
            percentage: Math.round((qty / medium) * 100)
        };
    }
    
    return {
        label: "وفير",
        color: "#2ecc71",
        icon: "fa-boxes",
        text: "كمية كبيرة",
        level: "high",
        percentage: 100
    };
};

/**
 * حساب القيمة الإجمالية للمخزون (التكلفة × الكمية)
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} quantity - الكمية
 * @returns {number} القيمة الإجمالية
 */
export const calculateTotalValue = (cost, quantity) => {
    const costNum = Number(cost) || 0;
    const qty = Number(quantity) || 0;
    return costNum * qty;
};

/**
 * حساب القيمة السوقية للمخزون (سعر البيع × الكمية)
 * @param {number|string} price - سعر البيع
 * @param {number|string} quantity - الكمية
 * @returns {number} القيمة السوقية
 */
export const calculateMarketValue = (price, quantity) => {
    const priceNum = Number(price) || 0;
    const qty = Number(quantity) || 0;
    return priceNum * qty;
};

/**
 * حساب الربح المتوقع للمخزون الحالي
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} price - سعر البيع
 * @param {number|string} quantity - الكمية
 * @returns {Object} تفاصيل الربح المتوقع
 */
export const calculateExpectedProfit = (cost, price, quantity) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    const qty = Number(quantity) || 0;
    
    const profitPerUnit = priceNum - costNum;
    const totalProfit = profitPerUnit * qty;
    const marginPercent = costNum > 0 ? (profitPerUnit / costNum) * 100 : 0;
    
    return {
        perUnit: profitPerUnit,
        total: totalProfit,
        marginPercent: marginPercent,
        isProfitable: profitPerUnit > 0,
        formattedPerUnit: `${profitPerUnit.toFixed(2)} ريال`,
        formattedTotal: `${totalProfit.toFixed(2)} ريال`,
        formattedMargin: `${marginPercent > 0 ? '+' : ''}${marginPercent.toFixed(1)}%`
    };
};

/**
 * تنسيق رقم كعملة (ريال)
 * @param {number|string} value - القيمة المراد تنسيقها
 * @param {boolean} showSymbol - عرض رمز العملة
 * @returns {string} القيمة المنسقة
 */
export const formatAsCurrency = (value, showSymbol = true) => {
    const num = Number(value) || 0;
    const formatted = num.toLocaleString('ar-SA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return showSymbol ? `${formatted} ر.س` : formatted;
};

/**
 * حساب الخصم على منتج
 * @param {number|string} price - السعر الأصلي
 * @param {number} discountPercent - نسبة الخصم (0-100)
 * @returns {Object} تفاصيل السعر بعد الخصم
 */
export const calculateDiscount = (price, discountPercent) => {
    const originalPrice = Number(price) || 0;
    const discount = Number(discountPercent) || 0;
    
    // التأكد من أن نسبة الخصم بين 0 و 100
    const validDiscount = Math.min(100, Math.max(0, discount));
    const discountAmount = originalPrice * (validDiscount / 100);
    const finalPrice = originalPrice - discountAmount;
    const savedAmount = discountAmount;
    
    return {
        originalPrice,
        discountPercent: validDiscount,
        discountAmount,
        finalPrice,
        savedAmount,
        formattedOriginal: formatAsCurrency(originalPrice),
        formattedFinal: formatAsCurrency(finalPrice),
        formattedSaved: formatAsCurrency(savedAmount)
    };
};

/**
 * حساب الضريبة (القيمة المضافة)
 * @param {number|string} amount - المبلغ قبل الضريبة
 * @param {number} taxRate - نسبة الضريبة (الافتراضي 15%)
 * @returns {Object} تفاصيل الضريبة
 */
export const calculateTax = (amount, taxRate = 15) => {
    const preTax = Number(amount) || 0;
    const rate = Number(taxRate) || 0;
    const taxAmount = preTax * (rate / 100);
    const total = preTax + taxAmount;
    
    return {
        preTax,
        taxRate: rate,
        taxAmount,
        total,
        formattedPreTax: formatAsCurrency(preTax),
        formattedTax: formatAsCurrency(taxAmount),
        formattedTotal: formatAsCurrency(total)
    };
};

/**
 * حساب إجمالي فاتورة (مجموع المنتجات + ضريبة)
 * @param {Array} items - مصفوفة من المنتجات {price, quantity}
 * @param {number} taxRate - نسبة الضريبة
 * @returns {Object} تفاصيل الفاتورة
 */
export const calculateInvoiceTotal = (items, taxRate = 15) => {
    if (!items || !items.length) {
        return {
            subtotal: 0,
            tax: 0,
            total: 0,
            itemsCount: 0,
            formattedSubtotal: '0.00 ر.س',
            formattedTax: '0.00 ر.س',
            formattedTotal: '0.00 ر.س'
        };
    }
    
    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    return {
        subtotal,
        tax,
        total,
        itemsCount: items.length,
        taxRate,
        formattedSubtotal: formatAsCurrency(subtotal),
        formattedTax: formatAsCurrency(tax),
        formattedTotal: formatAsCurrency(total)
    };
};

/**
 * حساب صافي الربح بعد الخصم والضريبة
 * @param {number|string} cost - سعر التكلفة
 * @param {number|string} price - سعر البيع
 * @param {number} discountPercent - نسبة الخصم
 * @param {number} taxRate - نسبة الضريبة
 * @returns {Object} تفاصيل الربح الصافي
 */
export const calculateNetProfit = (cost, price, discountPercent = 0, taxRate = 0) => {
    const costNum = Number(cost) || 0;
    const priceNum = Number(price) || 0;
    const discount = Number(discountPercent) || 0;
    const tax = Number(taxRate) || 0;
    
    // السعر بعد الخصم
    const discountedPrice = priceNum * (1 - discount / 100);
    
    // الربح قبل الضريبة
    const profitBeforeTax = discountedPrice - costNum;
    
    // الضريبة على الربح (إذا كانت الضريبة على الربح وليس على المبيعات)
    const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
    
    // الربح الصافي
    const netProfit = profitBeforeTax - taxAmount;
    
    return {
        cost: costNum,
        originalPrice: priceNum,
        discountedPrice,
        discountAmount: priceNum - discountedPrice,
        profitBeforeTax,
        taxAmount,
        netProfit,
        profitMargin: costNum > 0 ? (netProfit / costNum) * 100 : 0,
        isProfitable: netProfit > 0,
        formattedCost: formatAsCurrency(costNum),
        formattedOriginalPrice: formatAsCurrency(priceNum),
        formattedDiscountedPrice: formatAsCurrency(discountedPrice),
        formattedNetProfit: formatAsCurrency(netProfit)
    };
};

// تصدير افتراضي للمكتبة كاملة
export default {
    calculateProductProfit,
    calculateProductProfitNumber,
    calculateProfitMargin,
    calculateMarkupMargin,
    calculateSuggestedPrice,
    getStockStatus,
    calculateTotalValue,
    calculateMarketValue,
    calculateExpectedProfit,
    formatAsCurrency,
    calculateDiscount,
    calculateTax,
    calculateInvoiceTotal,
    calculateNetProfit
};
