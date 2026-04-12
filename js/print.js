import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        // جلب البيانات مع التأكد من الحقول
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings;

        // معالجة التاريخ والوقت
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('ar-SA');
        const formattedTime = orderDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }).replace("ص", "صباحاً").replace("م", "مساءً");

        // تقسيم المنتجات
        const items = order.items || [];
        const itemsPerPage = 8;
        const invoicePagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPagesCount = invoicePagesCount + 3; // فاتورة + 3 صفحات شروط

        let html = '';

        // 1. توليد صفحات الفاتورة
        for (let i = 0; i < items.length || (i === 0 && items.length === 0); i += itemsPerPage) {
            const pageIndex = Math.floor(i / itemsPerPage);
            const pageItems = items.slice(i, i + itemsPerPage);
            const isFirstPage = pageIndex === 0;
            const isLastInvoicePage = pageIndex === invoicePagesCount - 1;

            html += `
            <div class="page">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo">
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
                    <span><b>التاريخ:</b> ${formattedDate}</span>
                    <span><b>الوقت:</b> ${formattedTime}</span>
                    <span><b>حالة الطلب:</b> ${order.status || 'تم التنفيذ'}</span>
                </div>

                <div class="dual-columns">
                    <div class="address-card">
                        <div class="card-head">مصدرة من</div>
                        <div class="card-body">
                            <p><b>منصة في خدمتك</b></p>
                            <p>المملكة العربية السعودية - حائل</p>
                            <p>حي النقرة : شارع سعد المشاط</p>
                            <p>مبنى: 3085 | إضافي: 7718 | بريد: 55431</p>
                        </div>
                    </div>
                    <div class="address-card">
                        <div class="card-head">مصدرة إلى</div>
                        <div class="card-body">
                            <p><b>اسم العميل:</b> ${customer.name || '---'}</p>
                            <p><b>المدينة:</b> ${customer.city || '---'} | <b>الحي:</b> ${customer.district || '---'}</p>
                            <p><b>الجوال:</b> ${customer.phone || '---'}</p>
                            <p><b>البريد:</b> ${customer.email || '---'}</p>
                        </div>
                    </div>
                </div>

                <div class="single-row-payment">
                    <div class="p-item"><b>طريقة الدفع:</b> ${window.getPaymentName ? window.getPaymentName(order.paymentMethod) : (order.paymentMethod || '---')}</div>
                    <div class="p-item"><b>رمز الموافقة:</b> ${order.approvalCode || order.paymentId || '---'}</div>
                    <div class="p-item"><b>طريقة الاستلام:</b> ${order.deliveryMethod || 'استلام إلكتروني'}</div>
                </div>
                ` : ''}

                <table class="main-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المنتج</th>
                            <th>الوصف</th>
                            <th>الصورة</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageItems.map((item, idx) => `
                        <tr>
                            <td>${i + idx + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td class="text-small">${item.description || '---'}</td>
                            <td><img src="${item.image || 'images/placeholder.png'}" class="table-img" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='"></td>
                            <td>${item.qty || 1}</td>
                            <td>${(item.price || 0).toLocaleString()} ريال</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                ${isLastInvoicePage ? `
                <div class="financial-section">
                    <div class="summary-box-final">
                        <div class="s-line"><span>المجموع الفرعي:</span> <span>${(order.subtotal || 0).toLocaleString()} ريال</span></div>
                        <div class="s-line"><span>إجمالي الخصم:</span> <span>${(order.discount || 0).toLocaleString()} - ريال</span></div>
                        <div class="s-line"><span>الضريبة (15%):</span> <span>${(order.tax || 0).toLocaleString()} ريال</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${(order.total || 0).toLocaleString()} ريال</span></div>
                    </div>
                </div>
                <div style="display:flex; gap:20px; justify-content:center; margin-top:30px">
                    <div class="barcode-item"><div id="zatcaQR" class="qr-code"></div><p>🔍 هيئة الزكاة</p></div>
                    <div class="barcode-item"><div id="websiteQR" class="qr-code"></div><p>🌐 الموقع الرسمي</p></div>
                    <div class="barcode-item"><div id="downloadQR" class="qr-code"></div><p>📄 تحميل الفاتورة</p></div>
                </div>
                ` : ''}

                <div class="final-footer">
                    <div class="contact-strip">
                        <span>الهاتف: 966534051317+</span>
                        <span>الواتس: 966545312021+</span>
                        <span>info@fi-khidmatik.com</span>
                        <span>www.khidmatik.com</span>
                    </div>
                    <div class="page-number">صفحة ${pageIndex + 1} من ${totalPagesCount}</div>
                </div>
            </div>`;
        }

        // 2. ربط صفحات الشروط والأحكام بالكامل (استدعاء جميع البنود من 1 إلى 57)
        const termsKeys = Object.keys(TERMS_DATA);
        const termsPages = [
            { title: "أولاً إلى ثالثاً", keys: termsKeys.filter(k => k.startsWith('section1') || k.startsWith('section2') || k.startsWith('section3') || k.startsWith('intro')) },
            { title: "رابعاً إلى ثامناً", keys: termsKeys.filter(k => k.startsWith('section4') || k.startsWith('section5') || k.startsWith('section6') || k.startsWith('section7') || k.startsWith('section8')) },
            { title: "تاسعاً إلى ثاني عشر", keys: termsKeys.filter(k => k.startsWith('section9') || k.startsWith('section10') || k.startsWith('section11') || k.startsWith('section12')) }
        ];

        termsPages.forEach((tPage, idx) => {
            const pageNum = invoicePagesCount + idx + 1;
            html += `
            <div class="page">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo">
                        <div class="brand-info"><div class="brand-name">في خدمتك</div></div>
                    </div>
                    <div class="header-center-title"><div class="doc-label">الشروط والأحكام</div></div>
                    <div class="header-left-group">
                        <div>رقم شهادة العمل الحر: FL-765735204</div>
                    </div>
                </div>
                <div class="terms-content">
                    ${tPage.keys.map(key => `<p class="term-text">${TERMS_DATA[key]}</p>`).join('')}
                    
                    ${idx === 2 ? `
                    <div class="legal-acknowledgment">
                        <h4>الإقرار والتوقيع</h4>
                        <p>أقر أنا العميل (${customer.name}) بالموافقة على كافة البنود أعلاه.</p>
                        <div class="signature-box">
                            <div><b>الاسم:</b> ${customer.name}</div>
                            <div><b>التاريخ:</b> ${formattedDate}</div>
                            <div class="sig-line"><b>التوقيع:</b> .......................</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="final-footer">
                    <div class="contact-strip">
                        <span>info@fi-khidmatik.com</span>
                        <span>www.khidmatik.com</span>
                    </div>
                    <div class="page-number">صفحة ${pageNum} من ${totalPagesCount}</div>
                </div>
            </div>`;
        });

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller, ["zatcaQR", "websiteQR", "downloadQR"]);
        document.getElementById('loader').style.display = 'none';

    } catch (e) { console.error("Print Error:", e); }
};
