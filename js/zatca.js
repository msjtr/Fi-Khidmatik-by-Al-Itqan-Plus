// ========================================
// دوال ZATCA للباركود الضريبي
// ========================================

function generateZATCAQRData(order) {
    // الحصول على sellerData من window
    const seller = window.sellerData;
    
    if (!seller || !seller.taxNumber) {
        console.error('sellerData not found');
        return btoa('test');
    }
    
    var totals = window.calculateTotals ? window.calculateTotals(order) : calculateTotalsFallback(order);
    var timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var totalStr = totals.total.toFixed(2);
    var taxStr = totals.tax.toFixed(2);
    
    var tlvData = '';
    tlvData += String.fromCharCode(1) + String.fromCharCode(1) + '1';
    tlvData += String.fromCharCode(2) + String.fromCharCode(seller.taxNumber.length) + seller.taxNumber;
    tlvData += String.fromCharCode(3) + String.fromCharCode(timestamp.length) + timestamp;
    tlvData += String.fromCharCode(4) + String.fromCharCode(totalStr.length) + totalStr;
    tlvData += String.fromCharCode(5) + String.fromCharCode(taxStr.length) + taxStr;
    
    try {
        return btoa(tlvData);
    } catch(e) {
        console.error('btoa error:', e);
        return '';
    }
}

function calculateTotalsFallback(order) {
    var subtotal = order.subtotal || 0;
    if (!subtotal && order.items) {
        subtotal = 0;
        for (var i = 0; i < order.items.length; i++) {
            subtotal += (order.items[i].price || 0) * (order.items[i].quantity || 1);
        }
    }
    var discount = order.discount || 0;
    var tax = order.tax || ((subtotal - discount) * 0.15);
    var total = order.total || (subtotal - discount + tax);
    return { subtotal: subtotal, discount: discount, tax: tax, total: total };
}

// تصدير الدوال
window.generateZATCAQRData = generateZATCAQRData;
