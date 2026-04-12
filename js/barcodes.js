/**
 * نظام الباركودات الذكي - منصة في خدمتك
 */

export const BarcodeManager = {
    init(orderId, seller, orderData) {
        // 1. توليد رابط الفاتورة
        const invoiceURL = `${window.location.origin}${window.location.pathname}?id=${orderId}`;
        const invoiceLinkElem = document.getElementById('invoiceLink');
        if (invoiceLinkElem) {
            invoiceLinkElem.href = invoiceURL;
            invoiceLinkElem.innerText = `ID: ${orderId.substring(0, 8)}`;
        }

        // 2. إعداد إعدادات الـ QR (حجم موحد)
        const qrConfig = {
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        };

        // 3. توليد باركود الموقع (Linktree)
        if (document.getElementById("websiteQR")) {
            new QRCode(document.getElementById("websiteQR"), {
                ...qrConfig,
                text: "https://linktr.ee/fikhidmatik"
            });
        }

        // 4. توليد باركود تحميل الفاتورة
        if (document.getElementById("downloadQR")) {
            new QRCode(document.getElementById("downloadQR"), {
                ...qrConfig,
                text: invoiceURL
            });
        }

        // 5. باركود الزكاة (ZATCA) يتم استدعاؤه من zatca.js كما هو
        if (typeof window.generateAllInvoiceQRs === 'function') {
            window.generateAllInvoiceQRs(orderData, seller, ["zatcaQR"]);
        }
    }
};
