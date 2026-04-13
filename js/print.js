import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js'; 
import { BarcodeManager } from './barcodes.js';

// 1. إعدادات Firebase
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

// 2. واجهة المستخدم (UI) - محسنة لدعم الـ Snapshot
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
        // الأولوية لبيانات اللقطة Snapshot لضمان دقة الفاتورة تاريخياً
        const cust = order.customerSnapshot || customer || {};
        const addr = cust.address || {};
        
        return `
        <div class="order-info-line">
            <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
            <span><b>التاريخ:</b> ${order.orderDate || date}</span>
            <span><b>الوقت:</b> ${order.orderTime || time}</span>
            <span><b>حالة الطلب:</b> <span class="status-badge">تم التنفيذ</span></span>
        </div>

        <div class="dual-columns">
            <div class="address-card">
                <div class="card-head">مصدرة من</div>
                <div class="card-body">
                    <p class="company-name">منصة في خدمتك (تيرة)</p>
                    <p>المملكة العربية السعودية - حائل</p>
                    <p>حي النقرة : شارع سعد المشاط</p>
                    <p>رقم المبنى: 3085 | الرمز البريدي: 55431</p>
                </div>
            </div>
            <div class="address-card">
                <div class="card-head">مصدرة إلى (العميل)</div>
                <div class="card-body">
                    <p><b>اسم العميل:</b> ${cust.name || '---'}</p>
                    <p><b>الهاتف:</b> ${cust.phone || '---'}</p>
                    <p><b>العنوان:</b> ${addr.city || cust.city || ''} - ${addr.district || cust.district || ''}</p>
                    <p><b>الشارع:</b> ${addr.street || cust.street || '---'}</p>
                    <p><b>تفاصيل المبنى:</b> ${addr.building || cust.buildingNumber || '---'} | <b>الرمز البريدي:</b> ${addr.postal || cust.postalCode || '---'}</p>
                </div>
            </div>
        </div>

        <div class="order-info-line payment-line">
            <span><b>طريقة الدفع:</b> ${order.payment?.method || order.paymentMethod || 'إلكتروني'}</span>
            <span><b>طريقة الاستلام:</b> ${order.shipping?.type || order.deliveryMethod || 'تحميل رقمي'}</span>
        </div>`;
    },

    footer: (current, total) => `
        <div class="final-footer">
            <div class="contact-info-strip">
                <span>الهاتف: 966534051317+</span> | <span>الواتساب: 966545312021+</span> | <span>info@fi-khidmatik.com</span>
            </div>
            <div class="page-number-box">صفحة ${current} من ${total}</div>
        </div>`
};

// 3. الوظيفة الرئيسية
window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    const loader = document.getElementById('loader');
    const printApp = document.getElementById('print-app');

    if (!orderId) return;

    try {
        const fullDetails = await OrderManager.getOrderFullDetails(orderId);
        if (!fullDetails) throw new Error("لم يتم العثور على بيانات الطلب");

        const { order, customer } = fullDetails;
        const seller = window.invoiceSettings || {};
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        
        const termsArray = Object.values(TERMS_DATA);
        const items = order.items || [];
        const itemsPerPage = 6;
        const invPagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPages = invPagesCount + Math.ceil(termsArray.length / 10);

        let html = '';

        for (let i = 0; i < invPagesCount; i++) {
            const pageItems = items.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            html += `
                <div class="page">
                    ${UI.header(seller)}
                    ${UI.orderMeta(order, customer, date, time)}
                    <table class="main-table text-right">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageItems.map((item, idx) => `
                                <tr>
                                    <td>${(i * itemsPerPage) + idx + 1}</td>
                                    <td class="product-cell">
                                        <div class="flex-prod" style="display: flex; align-items: center; gap: 10px;">
                                            ${item.image ? `<img src="${item.image}" style="width: 40px; height: 40px; border-radius: 5px; object-cover: cover;">` : ''}
                                            <div>
                                                <b>${item.name}</b>
                                                <div style="font-size: 10px; color: #666;">${item.desc || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${item.qty || 1}</td>
                                    <td>${parseFloat(item.price || 0).toLocaleString()} ر.س</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                    ${i === invPagesCount - 1 ? renderFinancials(order) : ''}
                    ${UI.footer(i + 1, totalPages)}
                </div>`;
        }

        // صفحات الشروط
        const termsPerPage = 10;
        for (let j = 0; j < termsArray.length; j += termsPerPage) {
            const pageTerms = termsArray.slice(j, j + termsPerPage);
            html += `
                <div class="page page-terms">
                    ${UI.header(seller)}
                    <h3 class="terms-title">الشروط والأحكام العامة</h3>
                    <div class="terms-container-print">
                        ${pageTerms.map(text => `<div class="term-row-print"><p>${text}</p></div>`).join('')}
                    </div>
                    ${UI.footer(invPagesCount + Math.floor(j/termsPerPage) + 1, totalPages)}
                </div>`;
        }

        printApp.innerHTML = html;
        if (loader) loader.style.display = 'none';

        if (typeof BarcodeManager !== 'undefined') {
            BarcodeManager.init(order.id, seller, order);
        }

    } catch (error) {
        console.error("Print Error:", error);
        if (loader) loader.innerHTML = "خطأ في الربط: " + error.message;
    }
};

function renderFinancials(order) {
    const t = order.totals || {
        subtotal: order.subtotal || 0,
        tax: (order.total || 0) - (order.subtotal || 0),
        total: order.total || 0
    };

    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع الفرعي:</span> <span>${t.subtotal.toLocaleString()} ر.س</span></div>
            <div class="s-line"><span>الضريبة (15%):</span> <span>${t.tax.toLocaleString()} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${t.total.toLocaleString()} ر.س</span></div>
        </div>
        <div class="barcode-group-print">
            <div id="zatcaQR"></div>
            <div id="websiteQR"></div>
        </div>
    </div>`;
}

// أزرار التحكم
document.getElementById('downloadPDF').onclick = () => {
    const element = document.getElementById('print-app');
    html2pdf().set({
        margin: 0, 
        filename: `Invoice_${new Date().getTime()}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
};

if(document.getElementById('printPage')){
    document.getElementById('printPage').onclick = () => window.print();
}
