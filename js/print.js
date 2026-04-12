import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { BarcodeManager } from './barcodes.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) return;

        const { order, customer } = data;
        const seller = window.invoiceSettings; // مستدعى من invoice.js في ملف HTML
        const { date, time } = OrderManager.formatDateTime(order.createdAt);

        // إعدادات التقسيم
        const itemsPerPage = 6;
        const termsPerPage = 12;
        const invoicePagesCount = Math.ceil((order.items?.length || 1) / itemsPerPage);
        const totalPagesCount = invoicePagesCount + Math.ceil(TERMS_DATA.length / termsPerPage);

        let finalHtml = '';

        // 1. توليد صفحات الفاتورة باستخدام المكونات
        for (let i = 0; i < invoicePagesCount; i++) {
            const pageItems = (order.items || []).slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            
            finalHtml += `
                <div class="page">
                    ${renderHeader("فاتورة إلكترونية", seller)}
                    ${i === 0 ? renderOrderMeta(order, customer, date, time, seller) : ''}
                    ${renderItemsTable(pageItems, i * itemsPerPage)}
                    ${i === invoicePagesCount - 1 ? renderFinancials(order) : ''}
                    ${renderFooter(i + 1, totalPagesCount, seller)}
                </div>`;
        }

        // 2. توليد صفحات الشروط باستخدام المكونات
        for (let j = 0; j < TERMS_DATA.length; j += termsPerPage) {
            const pageTerms = TERMS_DATA.slice(j, j + termsPerPage);
            const currentPage = invoicePagesCount + Math.floor(j / termsPerPage) + 1;

            finalHtml += `
                <div class="page page-terms">
                    ${renderHeader("الشروط والأحكام", seller)}
                    <div class="terms-grid">
                        ${pageTerms.map((t, idx) => `<div class="term-item"><span class="term-num">${j + idx + 1}</span><p>${t}</p></div>`).join('')}
                    </div>
                    ${renderFooter(currentPage, totalPagesCount, seller)}
                </div>`;
        }

        document.getElementById('print-app').innerHTML = finalHtml;
        BarcodeManager.init(orderId, seller, order);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("Print Error:", e);
    }
};

// --- الدوال المساعدة (Components) للحفاظ على نظافة الكود ---

function renderHeader(title, seller) {
    return `
    <div class="header-main">
        <img src="${seller.logo}" class="main-logo">
        <div class="doc-label">${title}</div>
        <div class="header-left-group">
            <div>رقم شهادة العمل الحر: ${seller.licenseNumber}</div>
            <div>الرقم الضريبي: ${seller.taxNumber}</div>
        </div>
    </div>`;
}

function renderOrderMeta(order, customer, date, time, seller) {
    return `
    <div class="order-meta-row">
        <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
        <span><b>التاريخ:</b> ${date} | ${time}</span>
        <span><b>حالة الطلب:</b> تم التنفيذ</span>
    </div>
    <div class="dual-columns">
        <div class="address-card">
            <div class="card-head">مصدرة من</div>
            <div class="card-body"><b>${seller.name}</b><br>${seller.address}<br>${seller.phone}</div>
        </div>
        <div class="address-card">
            <div class="card-head">مصدرة إلى</div>
            <div class="card-body"><b>${customer.name}</b><br>${customer.city || 'المملكة العربية السعودية'}<br>${customer.phone}</div>
        </div>
    </div>`;
}

function renderItemsTable(items, startIdx) {
    return `
    <table class="main-table">
        <thead><tr><th>#</th><th>المنتج</th><th>الوصف</th><th>الصورة</th><th>الكمية</th><th>السعر</th></tr></thead>
        <tbody>
            ${items.map((item, idx) => `
                <tr>
                    <td>${startIdx + idx + 1}</td>
                    <td><b>${item.name}</b></td>
                    <td class="small-text">${item.description || '-'}</td>
                    <td><img src="${item.image}" class="product-img-print"></td>
                    <td>${item.qty}</td>
                    <td>${item.price} ر.س</td>
                </tr>`).join('')}
        </tbody>
    </table>`;
}

function renderFinancials(order) {
    return `
    <div class="financial-section">
        <div class="summary-box-final">
            <div class="s-line"><span>المجموع الفرعي:</span> <span>${order.subtotal} ر.س</span></div>
            <div class="s-line"><span>الضريبة (15%):</span> <span>${(order.total - order.subtotal).toFixed(2)} ر.س</span></div>
            <div class="s-line grand-total-line"><span>الإجمالي:</span> <span>${order.total} ر.س</span></div>
        </div>
        <div class="barcode-group-print"><div id="zatcaQR"></div><div id="websiteQR"></div><div id="downloadQR"></div></div>
    </div>`;
}

function renderFooter(current, total, seller) {
    return `
    <div class="final-footer">
        <div class="contact-strip">${seller.phone} | ${seller.email} | ${seller.website}</div>
        <div class="page-number">صفحة ${current} من ${total}</div>
    </div>`;
}
