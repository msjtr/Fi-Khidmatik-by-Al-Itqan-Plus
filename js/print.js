import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        // جلب البيانات الأساسية
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings;

        // تنسيق التاريخ والوقت من بيانات الطلب
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('ar-SA');
        const formattedTime = orderDate.toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        }).replace("ص", "صباحاً").replace("م", "مساءً");

        const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // تقسيم المنتجات (8 لكل صفحة)
        const items = order.items || [];
        const itemsPerPage = 8;
        const invoicePagesCount = Math.ceil(items.length / itemsPerPage) || 1;
        const totalPagesCount = invoicePagesCount + 3; // صفحات الفاتورة + 3 صفحات للشروط

        let html = '';

        // ---------------------------------------------------------
        // 1. توليد صفحات الفاتورة (Invoice Pages)
        // ---------------------------------------------------------
        for (let i = 0; i < items.length || (i === 0 && items.length === 0); i += itemsPerPage) {
            const pageIndex = Math.floor(i / itemsPerPage);
            const pageItems = items.slice(i, i + itemsPerPage);
            const isFirstPage = pageIndex === 0;
            const isLastInvoicePage = pageIndex === invoicePagesCount - 1;

            html += `
            <div class="page">
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
                    <div class="p-item"><b>طريقة الدفع:</b> ${order.paymentMethod || 'إلكتروني'}</div>
                    <div class="p-item"><b>رمز الموافقة:</b> ${order.approvalCode || order.paymentId || '---'}</div>
                    <div class="p-item"><b>طريقة الاستلام:</b> ${order.deliveryMethod || 'تفعيل مباشر'}</div>
                </div>
                ` : ''}

                <table class="main-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>اسم المنتج</th>
                            <th>وصف المنتج</th>
                            <th>الصورة</th>
                            <th>الكمية</th>
                            <th>سعر الوحدة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageItems.map((item, idx) => `
                        <tr>
                            <td>${i + idx + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td class="text-small">${item.description || 'حجم مناسب و كبير'}</td>
                            <td><img src="${item.image || fallbackImg}" class="table-img" onerror="this.src='${fallbackImg}'"></td>
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
                        <div class="s-line"><span>ضريبة القيمة المضافة (15%):</span> <span>${(order.tax || 0).toLocaleString()} ريال</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي النهائي:</span> <span>${(order.total || 0).toLocaleString()} ريال</span></div>
                    </div>
                </div>

                <div style="display:flex; gap:20px; justify-content:center; margin-top:30px">
                    <div class="barcode-item"><div id="zatcaQR" class="qr-code"></div><p>🔍 هيئة الزكاة والضريبة</p></div>
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

        // ---------------------------------------------------------
        // 2. توليد صفحات الشروط والأحكام (Terms Pages)
        // ---------------------------------------------------------
        const termsKeys = Object.keys(TERMS_DATA);
        const termsChunks = [
            termsKeys.filter(k => k.startsWith('intro') || k.startsWith('section1') || k.startsWith('section2') || k.startsWith('section3') || k.startsWith('section4')),
            termsKeys.filter(k => k.startsWith('section5') || k.startsWith('section6') || k.startsWith('section7') || k.startsWith('section8') || k.startsWith('section9')),
            termsKeys.filter(k => k.startsWith('section10') || k.startsWith('section11') || k.startsWith('section12'))
        ];

        termsChunks.forEach((chunk, idx) => {
            const pageNum = invoicePagesCount + idx + 1;
            html += `
            <div class="page">
                <div class="header-main">
                    <div class="header-right-group">
                        <img src="images/logo.svg" class="main-logo" onerror="this.src='${fallbackImg}'">
                        <div class="brand-info">
                            <div class="brand-name">في خدمتك</div>
                            <div class="brand-slogan">من الإتقان بلس</div>
                        </div>
                    </div>
                    <div class="header-center-title"><div class="doc-label">الشروط والأحكام</div></div>
                    <div class="header-left-group">
                        <div>رقم شهادة العمل الحر: FL-765735204</div>
                        <div>الرقم الضريبي: 312495447600003</div>
                    </div>
                </div>

                <div class="terms-container-styled">
                    ${chunk.map(key => {
                        if (key.startsWith('intro')) return `<div class="terms-intro-box">${TERMS_DATA[key]}</div>`;
                        return `<div class="term-row">${TERMS_DATA[key]}</div>`;
                    }).join('')}

                    ${idx === 2 ? `
                    <div class="legal-acknowledgment-luxury">
                        <div class="ack-title">إقرار وتعهد العميل</div>
                        <p>أقر أنا العميل الموضح بياناتي أدناه، بأنني اطلعت على كامل الشروط والأحكام وأوافق عليها.</p>
                        <div class="signature-area">
                            <div class="sig-block"><b>الاسم:</b> <span>${customer.name || '---'}</span></div>
                            <div class="sig-block"><b>التاريخ:</b> <span>${formattedDate}</span></div>
                            <div class="sig-block"><b>التوقيع:</b> <span class="sig-line"></span></div>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="final-footer">
                    <div class="contact-strip">
                        <span>الهاتف: 966534051317+</span>
                        <span>الواتس: 966545312021+</span>
                        <span>info@fi-khidmatik.com</span>
                    </div>
                    <div class="page-number">صفحة ${pageNum} من ${totalPagesCount}</div>
                </div>
            </div>`;
        });

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller, ["zatcaQR", "websiteQR", "downloadQR"]);
        document.getElementById('loader').style.display = 'none';

    } catch (e) { 
        console.error("Print Engine Error:", e);
        document.getElementById('loader').innerHTML = "حدث خطأ أثناء تحميل البيانات";
    }
};
