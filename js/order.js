function loadInvoice() {
    const orderJSON = localStorage.getItem('currentOrder');
    if (!orderJSON) {
        document.getElementById('invoiceContent').innerHTML = '<div class="container"><div class="empty-cart">⚠️ لا توجد فاتورة لعرضها. يرجى إنشاء طلب أولاً.</div></div>';
        return;
    }

    const order = JSON.parse(orderJSON);
    let cartRows = '';
    let subtotal = 0;

    order.cart.forEach(item => {
        const total = item.price * item.qty;
        subtotal += total;
        cartRows += `
            <tr>
                <td>${escapeHtml(item.name)}${item.desc ? '<br><small>' + escapeHtml(item.desc) + '</small>' : ''}</td>
                <td>${item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
            </tr>
        `;
    });

    const tax = subtotal * 0.15;
    const grandTotal = subtotal + tax;

    // تنسيق التاريخ المعروض (من yyyy-mm-dd إلى dd-mm-yyyy)
    let displayDate = order.date;
    if (order.date && order.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = order.date.split('-');
        displayDate = `${day}-${month}-${year}`;
    }

    // بناء الفاتورة بالشكل الجديد
    const invoiceHTML = `
        <div class="invoice" id="invoiceToPrint">
            <!-- رأس الفاتورة -->
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="images/logo.svg" alt="شعار المنصة" style="max-width: 100px;" onerror="this.style.display='none'">
                <h1>فاتورة إلكترونية</h1>
                <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
                <p><strong>التاريخ:</strong> ${displayDate} ${order.time !== '-' ? ' - ' + order.time : ''}</p>
            </div>

            <hr>

            <!-- قسم: مصدرة من -->
            <div style="margin-bottom: 20px;">
                <h3>📌 مصدرة من:</h3>
                <p>
                    <strong>منصة في خدمتك</strong><br>
                    المملكة العربية السعودية<br>
                    المنطقة: حائل<br>
                    الحي: النقرة - الشارع: سعد المشاط - رقم المبنى: 3085<br>
                    الرقم الإضافي: 7718 - الرمز البريدي: 55431<br>
                    رقم الهاتف: +966597771565<br>
                    البريد الإلكتروني: info@fi-khidmatik.com<br>
                    الموقع الإلكتروني: www.khidmatik.com<br>
                    رقم شهادة العمل الحر: FL-765735204<br>
                    الرقم الضريبي: 312495447600003
                </p>
            </div>

            <hr>

            <!-- قسم: مصدرة إلى -->
            <div style="margin-bottom: 20px;">
                <h3>📌 مصدرة إلى:</h3>
                <p>
                    <strong>${escapeHtml(order.customer)}</strong><br>
                    المملكة العربية السعودية<br>
                    ${order.city} - حي ${order.district || ''} - شارع ${order.street || ''} - مبنى ${order.building || ''} - ${order.extra || ''} - ${order.postal || ''}<br>
                    هاتف: ${order.phone}<br>
                    بريد: ${order.email || 'غير مدخل'}
                </p>
            </div>

            <hr>

            <!-- طريقة الدفع والشحن في سطر واحد أعلى الجدول -->
            <div style="display: flex; justify-content: space-between; margin: 20px 0; background: #f9fafb; padding: 12px; border-radius: 8px;">
                <span><strong>💳 طريقة الدفع:</strong> ${order.payment}</span>
                <span><strong>🚚 خدمة الشحن:</strong> ${order.shipping}</span>
            </div>

            <!-- جدول المنتجات -->
            <h3>📦 تفاصيل الطلب</h3>
            <table border="1" width="100%" cellpadding="8" cellspacing="0">
                <thead>
                    <tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${cartRows}</tbody>
            </table>

            <div style="text-align: left; margin-top: 20px;">
                <p><strong>المجموع الفرعي:</strong> ${subtotal.toFixed(2)} ريال</p>
                <p><strong>الضريبة (15%):</strong> ${tax.toFixed(2)} ريال</p>
                <h2 style="color: #1e3a8a;">الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2>
            </div>

            <!-- معلومات إضافية إن وجدت -->
            ${order.tamaraAuth ? `<p><strong>رمز موافقة تمارا:</strong> ${order.tamaraAuth}</p>` : ''}
            ${order.tamaraOrder ? `<p><strong>رقم طلب تمارا:</strong> ${order.tamaraOrder}</p>` : ''}

            <p style="text-align: center; margin-top: 30px;">شكراً لتسوقكم معنا</p>
        </div>
    `;

    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
}
