export const validateOrder = (customerId, items) => {
    if (!customerId) return 'يرجى اختيار عميل';
    if (!items.length) return 'أضف منتج واحد على الأقل';
    return null;
};
