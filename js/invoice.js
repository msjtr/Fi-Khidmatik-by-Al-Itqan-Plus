window.invoiceSettings = {
    name: "منصة في خدمتك",
    slogan: "خيارك الأمثل للخدمات الرقمية",
    logo: "images/logo.svg",
    licenseNumber: "FL-765735204",
    taxNumber: "312495447600003",
    address: "حائل : حي النقرة : شارع :سعد المشاط",
    buildingNumber: "3085",
    additionalNumber: "7718",
    postalCode: "55431",
    country: "المملكة العربية السعودية",
    phone: "+966534051317",
    whatsapp: "+966545312021",
    email: "info@fi-khidmatik.com",
    website: "www.khidmatik.com",
    currency: "ريال",
    taxRate: 0.15
};

window.getPaymentName = (method) => {
    const m = { 'tamara': 'تمارا', 'tabby': 'تابي', 'emkan': 'إمكان', 'stcpay': 'STC Pay', 'mada': 'مدى', 'visa': 'فيزا' };
    return m[method] || 'دفع إلكتروني';
};

window.getStatusText = (s) => {
    const st = { 'completed': 'تم التنفيذ', 'processing': 'جاري المعالجة', 'pending': 'قيد الانتظار' };
    return st[s] || 'تحت المراجعة';
};
