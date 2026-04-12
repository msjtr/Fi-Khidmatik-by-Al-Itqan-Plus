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
        // 1. جلب البيانات من Firebase
        const order = await window.getDocument("orders", orderId);
        if (!order || !order.success) throw new Error("Order not found");

        const customer = await window.getDocument("customers", order.customerId);
        const seller = window.invoiceSettings;

        // 2. التحقق من وجود البيانات
        const customerName = customer && customer.name ? customer.name : "عميل كرام";
        const customerPhone = customer && customer.phone ? customer.phone : "---";

        // 3. بناء الواجهة - انتبه لعلامة ` في البداية والنهاية
        let html = `
        <div class="page">
            <div class="header">
                <div class="logo">
                    <img src="images/logo.svg" onerror="this.src='https://via.placeholder.com/150'">
                    <div style="font-weight:800; color:#1e3a5f; margin-top:5px;">
                        ${seller.name} <br>
                        <small>${seller.slogan || ''}</small>
                    </div>
                </div>
                <div class="doc-label">فاتورة إلكترونية</div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-h">بيانات مصدر الفاتورة</div>
                    <div class="card-b">
                        ${seller.address} <br>
                        التواصل: ${seller.phone}
                    </div>
                </div>
                <div class="card">
                    <div class="card-h">بيانات العميل</div>
                    <div class="card-b">
                        <b>${customerName}</b> <br>
                        الجوال: ${customerPhone}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map(item => `
                        <tr>
                            <td style="text-align:right;">${item.name}</td>
                            <td>${item.qty || 1}</td>
                            <td>${item.price} ر.س</td>
                            <td>${(parseFloat(item.price) * parseInt(item.qty || 1)).toFixed(2)} ر.س</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-box">
                الإجمالي النهائي: ${order.total} ريال
            </div>

            <div class="barcodes" style="display:flex; justify-content:space-around; margin-top:auto; padding:20px 0; border-top:1px solid #eee;">
                <div style="text-align:center;"><div id="zatcaQR"></div><small>هيئة الزكاة</small></div>
                <div style="text-align:center;"><div id="websiteQR"></div><small>موقعنا</small></div>
                <div style="text-align:center;"><div id="downloadQR"></div><small>تحميل الفاتورة</small></div>
            </div>
            
            <div class="footer">
                <span>${seller.website}</span>
                <span>صفحة 1 من 4</span>
            </div>
        </div>`;

        // 4. إضافة صفحات الشروط (57 بنداً)
        const chunks = [TERMS_DATA.slice(0, 20), TERMS_DATA.slice(20, 40), TERMS_DATA.slice(40, 57)];
        
        chunks.forEach((chunk, index) => {
            html += `
            <div class="page">
                <div class="header">
                    <div class="logo"><img src="images/logo.svg" style="height:40px;"></div>
                    <div class="doc-label" style="font-size:12px;">الشروط والأحكام (${index + 1}/3)</div>
                </div>
                <div class="terms-section">
                    ${chunk.map(c => `
                        <div class="clause">
                            <span class="c-num">${c.id}.</span>
                            <div><b>${c.t}:</b> ${c.c}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="footer">
                    <span>${seller.email}</span>
                    <span>صفحة ${index + 2} من 4</span>
                </div>
            </div>`;
        });

        // 5. حقن الكود النهائي وتوليد الباركود
        document.getElementById('print-app').innerHTML = html;
        
        // استدعاء دالة الباركود من zatca.js
        if (typeof generateAllInvoiceQRs === "function") {
            generateAllInvoiceQRs(order, seller);
        }

        // إخفاء شاشة التحميل
        document.getElementById('loader').style.display = 'none';

    } catch (error) {
        console.error("Print Error:", error);
        document.getElementById('loader').innerHTML = "<h1>حدث خطأ أثناء تحميل الصفحة</h1>";
    }
};
