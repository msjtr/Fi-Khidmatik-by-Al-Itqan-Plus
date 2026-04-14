export const calculateInvoice = (subtotal, discountRate = 0.30) => {
    // بناءً على بياناتك: الخصم تقريباً 30% من المجموع الفرعي 
    const discount = subtotal * discountRate;
    const netBeforeTax = subtotal - discount;
    const vat = netBeforeTax * 0.15; // ضريبة القيمة المضافة 15% 
    const total = netBeforeTax + vat;

    return {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        vat: vat.toFixed(2),
        total: total.toFixed(2)
    };
};
