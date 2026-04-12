import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) return;

        const { order, customer } = data;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        const logistics = OrderManager.getLogisticDetails(order);
        const seller = window.invoiceSettings;

        const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // تقسيم المنتجات
        const items = order.items || [];
        const itemsPerPage = 8;
        const invoicePagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPagesCount = invoicePagesCount + 3;

        let html = '';

        // 1. توليد صفحات الفاتورة
        for (let i = 0; i < items.length || (i === 0 && items.length === 0); i += itemsPerPage) {
            const pageIndex = Math.floor(i / itemsPerPage);
            const pageItems = items.slice(i, i + itemsPerPage);
            const isFirstPage = pageIndex === 0;
            const isLastInvoicePage = pageIndex === invoicePagesCount - 1;

            html += `
            <div class="page" id="invoice-content">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo" onerror="this.src='${fallbackImg}'">
                        <div class="brand-info">
                            <div class="brand-name">في خدمتك</div>
                            <div class="brand-slogan">من الإتقان بلس</div>
                        </div>
                    </div>
                    <div class="header-center-title"><div class="doc-label">فاتورة إلكترونية</div></div>
                    <div class="header-left-group">
                        <div>رقم شهادة العمل الحر: FL-765735204</div>
                        <div>الرقم الضريبي: 312495447600003</div>
                    </div>
                </div>

                ${isFirstPage ? `
                <div class="order-meta-row">
                    <span><b>رقم الفاتورة:</b> ${order.orderNumber || order.id}</span>
                    <span><b>التاريخ:</b> ${date}</span>
                    <span><b>الوقت:</b> ${time}</span>
                </div>

                <div class="dual-columns">
                    <div class="address-card">
                        <div class="card-head">مصدرة من</div>
                        <div class="card-body">
                            <p><b>منصة في خدمتك</b></p>
                            <p>المملكة العربية السعودية - حائل</p>
                            <p>حي النقرة : شارع سعد المشاط</p>
                        </div>
                    </div>
                    <div class="address-card">
                        <div class="card-head">مصدرة إلى</div>
                        <div class="card-body">
                            <p><b>اسم العميل:</b> ${customer.name || '---'}</p>
                            <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                        </div>
                    </div>
                </div>

                <div class="single-row-payment">
                    <div class="p-item"><b>طريقة الدفع:</b> ${logistics.paymentMethod}</div>
                    <div class="p-item"><b>رمز الموافقة:</b> ${logistics.approvalCode}</div>
                    <div class="p-item"><b>طريقة الاستلام:</b> ${logistics.deliveryMethod}</div>
                </div>
                ` : ''}

                <table class="main-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المنتج</th>
                            <th>الكمية</th>
                            <th>سعر الوحدة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageItems.map((item, idx) => `
                        <tr>
                            <td>${i + idx + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td>${item.qty || 1}</td>
                            <td>${(item.price || 0).toLocaleString()} ريال</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                ${isLastInvoicePage ? `
                <div class="financial-section">
                    <div class="summary-box-final">
                        <div class="s-line"><span>المجموع الفرعي:</span> <span>${(order.subtotal || 0).toLocaleString()} ريال</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${(order.total || 0).toLocaleString()} ريال</span></div>
                    </div>
                </div>
                <div class="qr-container-print">
                    <div id="zatcaQR"></div>
                </div>
                ` : ''}

                <div class="final-footer">
                    <div class="contact-strip">
                        <span>info@fi-khidmatik.com</span>
                        <span>www.khidmatik.com</span>
                    </div>
                    <div class="page-number">صفحة ${pageIndex + 1} من ${totalPagesCount}</div>
                </div>
            </div>`;
        }

        // 2. توليد صفحات الشروط (كما في الأكواد السابقة)
        // ... (كود الشروط هنا) ...

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller, ["zatcaQR"]);
        
        // إخفاء اللودر وإظهار زر التحميل
        document.getElementById('loader').style.display = 'none';

        // وظيفة التحميل بجودة عالية
        window.downloadPDF = () => {
            const element = document.getElementById('print-app');
            const fileName = `فاتورة_${customer.name || 'عميل'}_${order.orderNumber || order.id}.pdf`;
            
            const opt = {
                margin: 0,
                filename: fileName,
                image: { type: 'jpeg', quality: 1 }, // أعلى جودة للصور
                html2canvas: { 
                    scale: 3, // دقة عالية جداً (3x)
                    letterRendering: true,
                    useCORS: true 
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        };

    } catch (e) {
        console.error(e);
    }
};
