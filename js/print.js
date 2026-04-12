import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

/**
 * 1. تهيئة النظام والاتصال بقاعدة البيانات
 */
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

/**
 * 2. الدوال المساعدة لبناء المكونات (Components)
 */
const UI = {
    header: (title, seller) => `
        <div class="header-main">
            <img src="${seller.logo}" class="main-logo">
            <div class="doc-label">${title}</div>
            <div class="header-left-group">
                <div>رقم شهادة العمل الحر: ${seller.licenseNumber}</div>
                <div>الرقم الضريبي: ${seller.taxNumber}</div>
            </div>
        </div>`,

    footer: (current, total, seller) => `
        <div class="final-footer">
            <div class="contact-strip">${seller.phone} | ${seller.email} | ${seller.website}</div>
            <div class="page-number">صفحة ${current} من ${total}</div>
        </div>`,

    orderMeta: (order, customer, date, time, seller) => `
        <div class="order-meta-row">
            <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
            <span><b>التاريخ:</b> ${date} | ${time}</span>
        </div>
        <div class="dual-columns">
            <div class="address-card">
                <div class="card-head">المورد</div>
                <div class="card-body"><b>${seller.name}</b><br>${seller.address}</div>
            </div>
            <div class="address-card">
                <div class="card-head">العميل</div>
                <div class="card-body"><b>${customer.name}</b><br>${customer.phone}</div>
            </div>
        </div>`
};

/**
 * 3. المحرك الرئيسي عند تحميل الصفحة
 */
window.onload = async () => {
    const orderId = new URLSearchParams(window.location.search).get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) return;

        const { order, customer } = data;
        const seller = window.invoiceSettings;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);

        const itemsPerPage = 6;
        const termsPerPage = 12;
        const invPages = Math.ceil((order.items?.length || 1) / itemsPerPage);
        const totalPages = invPages + Math.ceil(TERMS_DATA.length / termsPerPage);

        let html = '';

        // بناء صفحات الفاتورة
        for (let i = 0; i < invPages; i++) {
            const pageItems = (order.items || []).slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            html += `
                <div class="page">
                    ${UI.header("فاتورة ضريبية", seller)}
                    ${i === 0 ? UI.orderMeta(order, customer, date, time, seller) : ''}
                    <table class="main-table">
                        <thead><tr><th>#</th><th>المنتج</th><th>الوصف</th><th>الصورة</th><th>الكمية</th><th>السعر</th></tr></thead>
                        <tbody>
                            ${pageItems.map((item, idx) => `
                                <tr>
                                    <td>${(i * itemsPerPage) + idx + 1}</td>
                                    <td><b>${item.name}</b></td>
                                    <td class="small-text">${item.description || '-'}</td>
                                    <td><img src="${item.image}" class="product-img-print"></td>
                                    <td>${item.qty}</td>
                                    <td>${item.price} ر.س</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                    ${i === invPages - 1 ? renderFinancials(order) : ''}
                    ${UI.footer(i + 1, totalPages, seller)}
                </div>`;
        }

        // بناء صفحات الشروط
        for (let j = 0; j < TERMS_DATA.length; j += termsPerPage) {
            const pageTerms = TERMS_DATA.slice(j, j + termsPerPage);
            const pageNum = invPages + (j / termsPerPage) + 1;
            html += `
                <div class="page page-terms">
                    ${UI.header("الشروط والأحكام", seller)}
                    <div class="terms-grid">
                        ${pageTerms.map((t, idx) => `
                            <div class="term-item"><span class="term-num">${j + idx + 1}</span><p>${t}</p></div>
                        `).join('')}
                    </div>
                    ${UI.footer(pageNum, totalPages, seller)}
                </div>`;
        }

        document.getElementById('print-app').innerHTML = html;
        BarcodeManager.init(orderId, seller, order);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("Critical Error:", e);
    }
};

/**
 * 4. إدارة الأزرار (PDF والطباعة)
 */
document.getElementById('downloadPDF').onclick = () => {
    const element = document.getElementById('print-app');
    html2pdf().set({
        margin: 0, filename: 'invoice.pdf',
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
};

document.getElementById('printPage').onclick = () => window.print();

function renderFinancials(order) {
    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع:</span> <span>${order.subtotal} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${order.total} ر.س</span></div>
        </div>
        <div class="barcode-group-print"><div id="zatcaQR"></div><div id="websiteQR"></div><div id="downloadQR"></div></div>
    </div>`;
}
