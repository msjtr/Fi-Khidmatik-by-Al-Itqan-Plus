/**
 * نظام الباركودات المتكامل - منصة في خدمتك
 * يشمل: باركود الزكاة (ZATCA) + باركود الموقع + باركود تحميل الفاتورة
 */

export const BarcodeManager = {
    init(orderId, seller, orderData) {
        // 1. إعداد رابط الفاتورة
        const invoiceURL = `${window.location.origin}${window.location.pathname}?id=${orderId}`;
        const invoiceLinkElem = document.getElementById('invoiceLink');
        if (invoiceLinkElem) {
            invoiceLinkElem.href = invoiceURL;
            invoiceLinkElem.innerText = "عرض الفاتورة الرقمية";
        }

        // 2. إعدادات الـ QR الموحدة (للفخامة والوضوح)
        const qrConfig = {
            width: 120,
            height: 120,
            colorDark: "#121212",
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

        // 5. توليد باركود الزكاة (ZATCA) - مدمج داخلياً
        if (document.getElementById("zatcaQR")) {
            const zatcaString = this.generateZatcaString(
                seller.name,
                seller.taxNumber,
                orderData.createdAt,
                orderData.total,
                (orderData.total - orderData.subtotal)
            );
            
            new QRCode(document.getElementById("zatcaQR"), {
                ...qrConfig,
                text: zatcaString
            });
        }
    },

    /**
     * منطق تحويل بيانات الفاتورة إلى تنسيق TLV الخاص بهيئة الزكاة
     */
    generateZatcaString(sellerName, taxNumber, timestamp, total, tax) {
        const encode = (tag, value) => {
            const val = String(value);
            const valBuffer = new TextEncoder().encode(val);
            const tagBuffer = String.fromCharCode(tag);
            const lenBuffer = String.fromCharCode(valBuffer.length);
            
            let res = tagBuffer + lenBuffer;
            valBuffer.forEach(b => res += String.fromCharCode(b));
            return res;
        };

        const tlvData = 
            encode(1, sellerName) + 
            encode(2, taxNumber) + 
            encode(3, timestamp) + 
            encode(4, total) + 
            encode(5, tax);

        return btoa(tlvData); // التحويل لـ Base64
    }
};

// إتاحة الكائن عالمياً
window.BarcodeManager = BarcodeManager;
