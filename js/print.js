import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const UI = {
    header: (seller) => `
        <div class="header-main">
            <img src="${seller.logo || ''}" class="main-logo">
            <div class="doc-label">فاتورة إلكترونية ضريبية</div>
            <div class="header-left-group">
                <div>شهادة العمل الحر: ${seller.licenseNumber || '---'}</div>
                <div>الرقم الضريبي: ${seller.taxNumber || '---'}</div>
            </div>
        </div>`,

    orderMeta: (order, customer, date, time) => {
        // دالة داخلية للبحث عن القيمة بأكثر من مسمى (حساسية الأحرف)
        const findVal = (obj, keys) => {
            if (!obj) return null;
            for (let key of keys) {
                if (obj[key]) return obj[key];
                // بحث غير حساس لحالة الأحرف
                const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
                if (found) return obj[found];
            }
            return null;
        };

        const bldgKeys = ['buildingNumber', 'building_number', 'buildingNo', 'building'];
        const addlKeys = ['additionalNumber', 'additional_number', 'extraNumber', 'additional'];
        const postKeys = ['postalCode', 'postal_code', 'zipCode', 'postCode'];

        // البحث في الطلب أولاً (في حال كان العميل زائراً) ثم في ملف العميل
        const bldg = findVal(order, bldgKeys) || findVal(customer, bldgKeys) || "---";
        const addl = findVal(order, addlKeys) || findVal(customer, addlKeys) || "---";
        const post = findVal(order, postKeys) || findVal(customer, postKeys) || "---";

        return `
        <div class="order-info-line">
            <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
            <span><b>التاريخ:</b> ${date}</span>
            <span><b>الوقت:</b> ${time}</span>
            <span><b>حالة الطلب:</b> <span class="status-badge">تم التنفيذ</span></span>
        </div>

        <div class="dual-columns">
            <div class="address-card">
                <div class="card-head">مصدرة من</div>
                <div class="card-body">
                    <p class="company-name">منصة في خدمتك</p>
                    <p>المملكة العربية السعودية</p>
                    <p>حائل : حي النقرة : شارع : سعد المشاط</p>
                    <p>رقم المبنى: 3085 | الرقم الإضافي: 7718 | الرمز البريدي: 55431</p>
                </div>
            </div>
            <div class="address-card">
                <div class="card-head">مصدرة إلى</div>
                <div class="card-body">
                    <p><b>اسم العميل:</b> ${customer.name || '---'}</p>
                    <p><b>المدينة:</b> ${customer.city || '---'} | <b>الحي:</b> ${customer.district || '---'}</p>
                    <p><b>رقم المبنى:</b> ${bldg} | <b>الرقم الإضافي:</b> ${addl} | <b>الرمز البريدي:</b> ${post}</p>
                    <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                </div>
            </div>
        </div>`;
    }
};

window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    const loader = document.getElementById('loader');
    const printApp = document.getElementById('print-app');

    if (!orderId) return;

    try {
        const orderSnap = await db.collection('orders').doc(orderId).get();
        if (!orderSnap.exists) throw new Error("الطلب غير موجود");
        
        const orderData = { id: orderSnap.id, ...orderSnap.data() };
        let customerData = {};

        if (orderData.customerId) {
            const custSnap = await db.collection('customers').doc(orderData.customerId).get();
            if (custSnap.exists) customerData = custSnap.data();
        }

        const seller = window.invoiceSettings || {};
        const { date, time } = OrderManager.formatDateTime(orderData.createdAt);
        
        // بناء المحتوى (كما في النسخة السابقة)
        // ... (كود الـ Loop والـ Pagination)

        printApp.innerHTML = html; // تأكد من استكمال بناء متغير html
        if (loader) loader.style.display = 'none';

    } catch (error) {
        console.error("Error:", error);
    }
};
