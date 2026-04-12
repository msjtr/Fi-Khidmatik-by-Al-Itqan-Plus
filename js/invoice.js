// js/invoice.js

// بيانات البائع الرسمية
const sellerData = {
    name: "في خدمتك",
    slogan: "من الإتقان بلس",
    taxNumber: "312495447600003",
    licenseNumber: "FL-765735204",
    address: "حائل - حي النقرة - شارع سعد المشاط - مبنى 3085 - الرمز البريدي 55431",
    phone: "+966 534051317",
    whatsapp: "+966 545312021",
    email: "info@fi-khidmatik.com",
    website: "https://fi-khidmatik.com.sa"
};

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"45\" height=\"45\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23999\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"%3E%3Crect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"2.18\" ry=\"2.18\"%3E%3C/rect%3E%3Cpath d=\"M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5\"%3E%3C/path%3E%3C/svg%3E";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const CORS_BLOCKED_DOMAINS = ['cdn.salla.sa', 'cdn.salla.com.sa', 'salla.sa'];

// وظائف مساعدة لمعالجة الروابط والصور
window.invoiceSettings = sellerData;

window.getFinalImageUrl = (imageUrl) => {
    if (!imageUrl) return PLACEHOLDER_IMAGE;
    try {
        const url = new URL(imageUrl.startsWith('http') ? imageUrl : window.location.origin + imageUrl);
        if (CORS_BLOCKED_DOMAINS.some(d => url.hostname.includes(d))) {
            return CORS_PROXY + encodeURIComponent(url.href);
        }
        return url.href;
    } catch(e) { return PLACEHOLDER_IMAGE; }
};

window.getStatusText = (status) => {
    const map = { 'جديد':'جديد', 'تحت التنفيذ':'قيد التنفيذ', 'تم التنفيذ':'مكتمل', 'ملغي':'ملغي' };
    return map[status] || status || 'مكتمل';
};

window.getPaymentName = (method) => {
    const names = { 'mada':'مدى', 'stcpay':'STCPay', 'tamara':'تمارا', 'tabby':'تابي' };
    return names[method] || method || 'مدى';
};
