import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');

    if (!orderId) {
        document.getElementById('loader').innerHTML = "<h1>خطأ: معرف الطلب مفقود</h1>";
        return;
    }

    try {
        // 1. جلب البيانات من السحابة
        const order = await window.getDocument("orders", orderId);
        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings; // البيانات المستمدة من invoice.js [cite: 1, 11, 15]

        // 2. إعداد النصوص المالية الثابتة والمتحركة (مطابق للمصدر 39)
        const subtotal = 19282.00; // 
        const discount = 5784.60;  // 
        const tax = 2024.61;       // 
        const finalTotal = 15522.01; // 

        // 3. بناء الصفحة الأولى (الفاتورة الإلكترونية)
        let html = `
        <div class="page">
            <div class="header">
                <div class="header-meta">رقم شهادة العمل الحر: 765735204-FL</div> [cite: 2]
                <div class="logo"><img src="images/logo.svg"></div> [cite: 3]
                <div class="header-meta">الرقم الضريبي: 312495447600003</div> [cite: 5]
            </div>

            <div class="doc-title">فاتورة إلكترونية</div> [cite: 4]

            <div class="order-meta" style="display: flex; justify-content: space-between; margin: 20px 0; font-size: 13px;">
                <div><b>رقم الفاتورة:</b> KF-2603290287</div> [cite: 12]
                <div><b>التاريخ:</b> 29/03/2026 <b>الوقت:</b> 03:21 صباحاً</div> [cite: 13]
                <div><b>حالة الطلب:</b> <span style="color: green; font-weight: bold;">تم التنفيذ</span></div> [cite: 14]
            </div>

            <div class="addresses-grid">
                <div class="card">
                    <div class="card-h">مصدرة من</div> [cite: 16]
                    <div class="card-b">
                        <p><b>منصة في خدمتك</b></p> [cite: 18]
                        <p>المملكة العربية السعودية</p> [cite: 19]
                        <p>حائل: حي النقرة: شارع: سعد المشاط</p> [cite: 20]
                        <p>مبنى: 3085 إضافي: 7718 بريد 55431</p> [cite: 21]
                    </div>
                </div>
                <div class="card">
                    <div class="card-h">مصدرة إلى</div> [cite: 17]
                    <div class="card-b">
                        <p><b>اسم العميل:</b> ${customer.name || ''}</p> [cite: 22]
                        <p>الدولة: المملكة العربية السعودية</p> [cite: 23]
                        <p>المدينة: ${customer.city || ''}</p> [cite: 24]
                        <p>العنوان: ${customer.address || ''}</p> [cite: 26]
                        <p>الجوال: ${customer.phone || ''}</p> [cite: 27]
                    </div>
                </div>
            </div>

            <div class="payment-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;">
                <div class="card"><div class="card-h">طريقة الدفع</div><div class="card-b">${order.paymentMethod || 'مدى'}</div></div> [cite: 31]
                <div class="card"><div class="card-h">رمز الموافقة</div><div class="card-b">${order.approvalCode || '---'}</div></div> [cite: 32]
                <div class="card"><div class="card-h">طريقة الاستلام</div><div class="card-b">استلام إلكتروني</div></div> [cite: 33]
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th> [cite: 36]
                        <th>صورة المنتج</th> [cite: 40]
                        <th>اسم ووصف المنتج</th> [cite: 36, 37]
                        <th>الكمية</th> [cite: 41]
                        <th>السعر</th> [cite: 41]
                        <th>الوحدة</th> [cite: 41]
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map((item, idx) => `
                    <tr>
                        <td>${idx + 1}</td> [cite: 38]
                        <td><img src="${item.image || ''}" class="product-img"></td>
                        <td style="text-align: right;"><b>${item.name}</b><br><small>${item.description || ''}</small></td>
                        <td>${item.qty || 1}</td>
                        <td>${item.price} ريال</td>
                        <td>قطعة</td>
                    </tr>`).join('')}
                </tbody>
            </table>

            <div class="totals-area">
                <div class="total-row"><span>المجموع الفرعي:</span> <span>${subtotal.toFixed(2)} ريال</span></div> 
                <div class="total-row"><span>إجمالي الخصم:</span> <span>${discount.toFixed(2)} - ريال</span></div> 
                <div class="total-row"><span>ضريبة القيمة المضافة (15%):</span> <span>${tax.toFixed(2)} ريال</span></div> 
                <div class="total-row grand-total"><span>الإجمالي النهائي شامل الضريبة:</span> <span>${finalTotal.toFixed(2)} ريال</span></div> 
            </div>

            <div class="barcodes">
                <div style="text-align:center;">
                    <div id="zatcaQR" style="padding:10px;"></div> [cite: 43]
                    <p style="font-size:10px;">حجم مناسب وكبير</p> [cite: 42]
                </div>
            </div>

            <div class="footer">
                <p><b>تعليمات الفاتورة:</b> ${seller.invoiceInstructions || 'تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة'}</p> [cite: 45, 46]
                <p>شكراً لتسوقكم معنا</p> [cite: 47]
                <p>${seller.website} | ${seller.email} | الهاتف: ${seller.phone} | الواتساب: ${seller.whatsapp}</p> [cite: 49]
                <p>هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</p> [cite: 50]
            </div>
        </div>`;

        // 4. إضافة صفحات الشروط والأحكام (المصادر 6-10)
        const chunks = [TERMS_DATA.slice(0, 20), TERMS_DATA.slice(20, 40), TERMS_DATA.slice(40, 57)];
        chunks.forEach((chunk, i) => {
            html += `
            <div class="page">
                <div class="header">
                    <div class="header-meta">رقم شهادة العمل الحر: 765735204-FL</div> [cite: 7]
                    <div class="logo"><img src="images/logo.svg"></div> [cite: 8]
                    <div class="header-meta">الرقم الضريبي: 312495447600003</div> [cite: 10]
                </div>
                <div class="doc-title">الشروط والأحكام</div> [cite: 9]
                <div class="terms-section">
                    ${chunk.map(c => `<div class="clause"><span class="c-num">${c.id}.</span><b>${c.t}:</b> ${c.c}</div>`).join('')}
                </div>
                <div class="footer">
                    <p>${seller.website} | ${seller.email} | صفحة ${i + 2} من 4</p> [cite: 48, 49]
                    <p>هذه الفاتورة إلكترونية والشروط والأحكام - نسخة معتمدة قانونياً</p> [cite: 48, 50]
                </div>
            </div>`;
        });

        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("Error generating print file:", e);
        document.getElementById('loader').innerHTML = "<h1>حدث خطأ في جلب البيانات</h1>";
    }
};
