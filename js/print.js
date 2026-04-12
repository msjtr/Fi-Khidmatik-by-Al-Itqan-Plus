import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings;

        // معالجة التاريخ والوقت تلقائياً من الطلب
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('ar-SA');
        const formattedTime = orderDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }).replace("ص", "صباحاً").replace("م", "مساءً");

        const fallbackImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // منطق تقسيم المنتجات للفاتورة
        const items = order.items || [];
        const itemsPerPage = 8;
        const invoicePages = [];
        for (let i = 0; i < items.length; i += itemsPerPage) {
            invoicePages.push(items.slice(i, i + itemsPerPage));
        }

        let html = '';

        // 1. توليد صفحات الفاتورة الإلكترونية
        invoicePages.forEach((pageItems, index) => {
            const isFirstPage = index === 0;
            const isLastPage = index === invoicePages.length - 1;

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
                ` : ''}

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
                        ${pageItems.map((item, i) => `
                        <tr>
                            <td>${(index * itemsPerPage) + i + 1}</td>
                            <td><b>${item.name || '---'}</b></td>
                            <td class="text-small">${item.description || 'حجم مناسب و كبير'}</td>
                            <td><img src="${item.image || fallbackImg}" class="table-img" onerror="this.src='${fallbackImg}'"></td>
                            <td>${item.qty || 1}</td>
                            <td>${(item.price || 0).toLocaleString()} ريال</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                ${isLastPage ? `
                <div class="financial-section">
                    <div class="summary-box-final">
                        <div class="s-line"><span>المجموع الفرعي:</span> <span>${(order.subtotal || 0).toLocaleString()} ريال</span></div>
                        <div class="s-line"><span>إجمالي الخصم:</span> <span>${(order.discount || 0).toLocaleString()} - ريال</span></div>
                        <div class="s-line"><span>ضريبة القيمة المضافة (15%):</span> <span>${(order.tax || 0).toLocaleString()} ريال</span></div>
                        <div class="s-line grand-total-line"><span>الإجمالي النهائي شامل الضريبة:</span> <span>${(order.total || 0).toLocaleString()} ريال</span></div>
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
                        <span>الواتس اب: 966545312021+</span>
                        <span>info@fi-khidmatik.com</span>
                    </div>
                    <div class="legal-stamp">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
                </div>
            </div>`;
        });

        // 2. توليد صفحات الشروط والأحكام بالكامل من ملف TERMS_DATA [cite: 9, 10, 11, 12]
        html += `
        <div class="page">
            <div class="header-main">
                <div class="header-right-group">
                    <img src="images/logo.svg" class="main-logo">
                    <div class="brand-info"><div class="brand-name">في خدمتك</div></div>
                </div>
                <div class="header-center-title"><div class="doc-label">الشروط والأحكام</div></div>
            </div>
            <div class="terms-content">
                <div class="terms-intro"><p>${TERMS_DATA.intro_responsibility}</p></div>
                <div class="terms-section">
                    <h3>أولاً: صلاحية العرض والتنفيذ</h3>
                    <p>1. ${TERMS_DATA.section1_1}</p>
                    <p>2. ${TERMS_DATA.section1_2}</p>
                </div>
                <div class="legal-acknowledgment">
                    <h4>الإقرار</h4>
                    <p>أقر أنا العميل بالاطلاع على جميع الشروط والأحكام أعلاه وأوافق عليها بالكامل.</p>
                    <div class="signature-box">
                        <div><b>الاسم:</b> ${customer.name}</div>
                        <div><b>التاريخ:</b> ${formattedDate}</div>
                        <div class="sig-line"><b>التوقيع:</b></div>
                    </div>
                </div>
            </div>
        </div>`;

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller, ["zatcaQR", "websiteQR", "downloadQR"]);
        document.getElementById('loader').style.display = 'none';

    } catch (e) { console.error(e); }
};
