// js/zatca.js

/**
 * دالة توليد الباركودات الثلاثة للفاتورة
 * @param {Object} order - بيانات الطلب
 * @param {Object} seller - بيانات البائع من invoice.js
 */
export function generateAllInvoiceQRs(order, seller) {
    // التحقق من وجود مكتبة QRCode أولاً
    if (typeof QRCode === 'undefined') {
        console.error("مكتبة QRCode غير محملة. تأكد من وجودها في ملف print.html");
        return;
    }

    const timestamp = new Date().toISOString();
    
    // 1. باركود هيئة الزكاة والضريبة (ZATCA)
    const zatcaContainer = document.getElementById("zatcaQR");
    if (zatcaContainer) {
        zatcaContainer.innerHTML = ""; // تنظيف الحاوية
        new QRCode(zatcaContainer, {
            text: `Seller:${seller.name}|VAT:${seller.taxNumber}|Total:${order.total}|Date:${timestamp}`,
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff"
        });
    }

    // 2. باركود الموقع الإلكتروني
    const siteContainer = document.getElementById("websiteQR");
    if (siteContainer) {
        siteContainer.innerHTML = "";
        new QRCode(siteContainer, {
            text: seller.website,
            width: 100,
            height: 100,
            colorDark: "#1e3a5f"
        });
    }

    // 3. باركود تحميل الفاتورة (رابط الصفحة الحالي)
    const downloadContainer = document.getElementById("downloadQR");
    if (downloadContainer) {
        downloadContainer.innerHTML = "";
        new QRCode(downloadContainer, {
            text: window.location.href,
            width: 100,
            height: 100,
            colorDark: "#000000"
        });
    }
}
