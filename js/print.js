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
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        
        // جلب الإعدادات من window.invoiceSettings (الموجود في invoice.js)
        const seller = window.invoiceSettings; 

        const items = order.items || [];
        const itemsPerPage = 6; 
        const invoicePagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        
        const termsList = TERMS_DATA || [];
        const termsPerPage = 12;
        const termsPagesCount = Math.ceil(termsList.length / termsPerPage);
        const totalPagesCount = invoicePagesCount + termsPagesCount;

        let html = '';

        // --- وظيفة توليد الترويسة الثابتة ---
        const getHeader = (title) => `
            <div class="header-main">
                <div class="header-right-group">
                    <img src="images/logo.svg" class="main-logo" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='">
                </div>
                <div class="header-center-title">
                    <div class="doc-label">${title}</div>
                </div>
                <div class="header-left-group">
                    <div>رقم شهادة العمل الحر: ${seller.licenseNumber}</div>
                    <div>الرقم الضريبي: ${seller.taxNumber}</div>
                </div>
            </div>`;

        // --- وظيفة توليد التذييل الثابت ---
        const getFooter = (pageNum) => `
            <div class="final-footer">
                <div class="instruction-box">
                    <p><b>تعليمات الفاتورة:</b> تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة. شكراً لتسوقكم معنا.</p>
                </div>
                <div class="contact-strip">
                    <span>الهاتف: ${seller.phone}</span> | <span>واتساب: ${seller.whatsapp}</span> | <span>${seller.email}</span> | <span>${seller.website}</span>
                </div>
                <div class="legal-notice">فاتورة إلكترونية والشروط والأحكام - نسخة معتمدة قانونياً</div>
                <div class="page-number">صفحة ${pageNum} من ${totalPagesCount}</div>
            </div>`;

        // --- 1. توليد صفحات الفاتورة ---
        for (let i = 0; i < items.length || (i === 0 && items.length === 0); i += itemsPerPage) {
            const pageIndex = Math.floor(i / itemsPerPage);
            const pageItems = items.slice(i, i + itemsPerPage);
            const isFirstPage = pageIndex === 0;
            const isLastInvoicePage = pageIndex === invoicePagesCount - 1;

            html += `
            <div class="page">
                ${getHeader("فاتورة إلكترونية")}

                ${isFirstPage ? `
                <div class="order-meta-row">
                    <div class="meta-item"><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</div>
                    <div class="meta-item"><b>التاريخ:</b> ${date} | <b>الوقت:</b> ${time}</div>
                    <div class="meta-item"><b>حالة الطلب:</b> ${window.getStatusText(order.status)}</div>
                </div>

                <div class="dual-columns">
                    <div class="address-card">
                        <div class="card-head">مصدرة من</div>
                        <div class="card-body">
                            <p><b>${seller.name}</b></p>
                            <p>المملكة العربية السعودية</p>
                            <p>${seller.address}</p>
                            <p>رقم المبنى: ${seller.buildingNumber} | الرمز البريدي: ${seller.postalCode}</p>
                        </div>
                    </div>
                    <div class="address-card">
                        <div class="card-head">مصدرة إلى</div>
                        <div class="card-body">
                            <p><b>اسم العميل:</b> ${customer.name || '---'}</p>
                            <p>الدولة: المملكة العربية السعودية</p>
                            <p>المدينة: ${customer.city || '---'} | الحي: ${customer.district || '---'}</p>
                            <p>رقم الجوال: ${customer.phone || '---'}</p>
                        </div>
                    </div>
                </div>

                <div class="payment-logistics-row">
                    <div class="p-log-box"><b>طريقة الدفع:</b> ${window.getPaymentName(order.paymentMethod)}</div>
                    <div class="p-log-box"><b>رمز الموافقة:</b> ${order.approvalCode || '---'}</div>
                    <div class="p-log-box"><b>طريقة الاستلام:</b> ${order.deliveryMethod || 'شحن إلكتروني'}</div>
                </div>` : ''}

                <div class="content-title">تفاصيل المنتجات والخدمات</div>
                <table class="main-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المنتج</th>
                            <th>وصف المنتج</th>
                            <th>صورة المنتج</th>
                            <th>الكمية</th>
                            <th>سعر الوحدة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageItems.map((item, idx) => `
                        <tr>
                            <td>${i + idx + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td class="small-text">${item.description || '---'}</td>
                            <td><img src="${item.image || 'images/placeholder.png'}" class="product-img-print"></td>
                            <td>${item.qty || 1}</td>
                            <td>${(item.price || 0).toLocaleString()} ر.س</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                ${isLastInvoicePage ? `
                <div class="financial-section">
                    <div class="summary-box-final">
                        <div class="s-line"><span>المجموع الفرعي:</span> <span>${(order.subtotal || 0).toLocaleString()} ر.س</span></div>
                        <div class="s-line discount"><span>إجمالي الخصم:</span> <span>- ${(order.discount || 0).toLocaleString()} ر.س</span></div>
                        <div class="s-line"><span>ضريبة القيمة المضافة (15%):</span> <span>${((order.total || 0) - (order.subtotal || 0)).toLocaleString()} ر.س</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي النهائي شامل الضريبة:</span> <span>${(order.total || 0).toLocaleString()} ر.س</span></div>
                    </div>
                    <div class="barcode-group-print">
                        <div id="zatcaQR"></div>
                        <div id="websiteQR"></div>
                        <div id="downloadQR"></div>
                    </div>
                </div>` : ''}

                ${getFooter(pageIndex + 1)}
            </div>`;
        }

        // --- 2. توليد صفحات الشروط والأحكام ---
        for (let j = 0; j < termsList.length; j += termsPerPage) {
            const currentTermPage = Math.floor(j / termsPerPage) + invoicePagesCount + 1;
            const pageTerms = termsList.slice(j, j + termsPerPage);

            html += `
            <div class="page page-terms">
                ${getHeader("الشروط والأحكام")}
                <div class="terms-grid">
                    ${pageTerms.map((term, idx) => `
                        <div class="term-item">
                            <span class="term-num">${j + idx + 1}</span>
                            <p class="term-text">${term}</p>
                        </div>
                    `).join('')}
                </div>
                ${getFooter(currentTermPage - 1)}
            </div>`;
        }

        document.getElementById('print-app').innerHTML = html;

        // تشغيل الباركودات
        BarcodeManager.init(orderId, seller, order);
        
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("خطأ في معالجة الفاتورة:", e);
    }
};
