function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }[m]));
}

function loadInvoice() {

    let order = JSON.parse(localStorage.getItem('currentOrder'));

    if (!order) {
        document.getElementById('invoiceContent').innerHTML = '❌ لا يوجد طلب';
        return;
    }

    // 🔥 حل المشكلة (forEach)
    let items = order.cart || order.items || [];

    if (!items.length) {
        document.getElementById('invoiceContent').innerHTML = '❌ السلة فارغة';
        return;
    }

    let cartRows = '';
    let subtotal = 0;
    let totalDiscount = 0;

    items.forEach(item => {

        let price = parseFloat(item.price) || 0;
        let qty = parseInt(item.qty) || 1;
        let discount = parseFloat(item.discount) || 0;

        let itemTotal = (price * qty) - discount;

        subtotal += price * qty;
        totalDiscount += discount;

        cartRows += `
        <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.code)}</td>
            <td>${escapeHtml(item.desc || '')}</td>
            <td>${qty}</td>
            <td>${price.toFixed(2)}</td>
            <td>${discount.toFixed(2)}</td>
            <td>${itemTotal.toFixed(2)}</td>
        </tr>`;
    });

    let tax = (subtotal - totalDiscount) * 0.15;
    let grandTotal = subtotal - totalDiscount + tax;

    let displayDate = order.date || '-';

    // ✅ نفس كودك 100% بدون تغيير (فقط إصلاح header)
    let html = `<div class="invoice" id="invoiceToPrint" style="direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
        <div class="top-margin">
            <div>رقم شهادة العمل الحر: FL-765735204</div>
            <div>الرقم الضريبي: 312495447600003</div>
        </div>
        <div class="logo-center">
            <img src="images/logo.svg" onerror="this.style.display='none'" alt="شعار المنصة">
        </div>
        <div class="invoice-header">
            <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || 'FK-0000'}</p>
            <p><strong>التاريخ:</strong> ${displayDate} ${order.time && order.time !== '-' ? ' - ' + order.time : ''}</p>
        </div>
        <div class="invoice-parties">
            <div class="invoice-from">
                <h3>📌 مصدرة من:</h3>
                <p><strong>منصة في خدمتك</strong><br>المملكة العربية السعودية<br>حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>الرقم الإضافي: 7718 - الرمز البريدي: 55431</p>
            </div>
            <div class="invoice-to">
                <h3>📌 مصدرة إلى:</h3>
                <p><strong>${escapeHtml(order.customer) || '-'}</strong><br>المملكة العربية السعودية<br>${order.city || ''} ${order.district ? '- ' + order.district : ''} ${order.street ? '- ' + order.street : ''} ${order.building ? '- ' + order.building : ''} ${order.extra ? '- ' + order.extra : ''} ${order.postal ? '- ' + order.postal : ''}<br>هاتف: ${order.phone || '-'}<br>بريد: ${order.email || 'غير مدخل'}</p>
            </div>
        </div>
        <div class="payment-shipping">
            <span>💳 طريقة الدفع: ${order.payment || '-'}</span>
            ${order.payment === 'تمارا' && order.tamaraAuth ? `<span>🔑 رمز الموافقة على الطلب في تمارا: ${order.tamaraAuth}</span>` : ''} 
            <span>🚚 خدمة الشحن: ${order.shipping || '-'}</span>
        </div>
        <h3>📦 تفاصيل الطلب</h3>
        <table class="products-table">
            <thead>
                <tr>
                    <th>اسم المنتج</th>
                    <th>كود المنتج</th>
                    <th>الوصف</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>الخصم</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>${cartRows}</tbody>
        </table>
        <div class="totals-wrapper">
            <div class="totals-labels">
                <p>المجموع الفرعي</p>
                <p>الخصم الكلي</p>
                <p>الضريبة (15%)</p>
            </div>
            <div class="totals-values">
                <p>${subtotal.toFixed(2)} ريال</p>
                <p>${totalDiscount.toFixed(2)} ريال</p>
                <p>${tax.toFixed(2)} ريال</p>
            </div>
            <div class="grand-total">
                <h2>الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2>
            </div>
        </div>
        <div class="contact-bar">
            <span>📞 +966597771565</span>
            <span>✉️ info@fi-khidmatik.com</span>
            <span>🌐 www.khidmatik.com</span>
        </div>
        <p class="thanks">شكراً لتسوقكم معنا</p>
    </div>`;

    document.getElementById('invoiceContent').innerHTML = html;
}

function downloadPDF() {
    const element = document.getElementById('invoiceToPrint');
    html2pdf().from(element).save();
}

function newOrder() {
    window.location.href = "index.html";
}

window.onload = loadInvoice;
