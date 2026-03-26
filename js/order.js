// order.js
function checkout() {
    if (window.cart.length === 0) {
        alert('❌ السلة فارغة');
        return;
    }

    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    if (!name || !phone) {
        alert('❌ يرجى إدخال اسم العميل ورقم الجوال');
        return;
    }

    let orderNumber = document.getElementById('order_number_manual').value;
    if (!orderNumber) orderNumber = 'FK-0000';

    let timeVal = document.getElementById('order_time').value;
    let formattedTime = '-';
    if (timeVal) {
        let parts = timeVal.split(':');
        let h = parseInt(parts[0]);
        let m = parts[1];
        let period = h >= 12 ? 'م' : 'ص';
        h = h % 12 || 12;
        formattedTime = h + ':' + m + ' ' + period;
    }

    function getVal(id) {
        let el = document.getElementById(id);
        return el ? el.value : '';
    }

    let order = {
        orderNumber: orderNumber,
        date: getVal('order_date') || new Date().toISOString().split('T')[0],
        time: formattedTime,
        customer: name,
        phone: phone,
        email: getVal('email'),
        city: getVal('city'),
        district: getVal('district'),
        street: getVal('street'),
        building: getVal('building'),
        extra: getVal('extra'),
        postal: getVal('postal'),
        cart: window.cart.map(item => ({ ...item })),
        payment: getVal('payment'),
        tamaraAuth: getVal('payment') === 'تمارا' ? getVal('tamara_auth') : '',
        shipping: getVal('shipping')
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));
    window.location.href = 'invoice.html';
}

function loadInvoice() {
    let orderJSON = localStorage.getItem('currentOrder');
    if (!orderJSON) {
        document.getElementById('invoiceContent').innerHTML = '<div class="container"><div class="empty-cart">⚠️ لا توجد فاتورة</div></div>';
        return;
    }

    let order = JSON.parse(orderJSON);
    let cartRows = '';
    let subtotal = 0;
    let totalDiscount = 0;

    for (let i = 0; i < order.cart.length; i++) {
        let item = order.cart[i];
        let itemSubtotal = item.price * item.qty;
        let itemDiscount = item.discount || 0;
        let itemTotal = itemSubtotal - itemDiscount;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;

        cartRows += `<tr>
            <td><img src="${item.image}" width="50" height="50" style="object-fit:cover;" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.desc || '-'}</td>
            <td>${item.qty}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${itemDiscount.toFixed(2)}</td>
            <td>${itemTotal.toFixed(2)}</td>
        </tr>`;
    }

    let tax = (subtotal - totalDiscount) * 0.15;
    let grandTotal = subtotal - totalDiscount + tax;

    let displayDate = order.date;
    if (displayDate && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let parts = displayDate.split('-');
        displayDate = parts[2] + '-' + parts[1] + '-' + parts[0];
    }

    let paymentLine = `<span>💳 طريقة الدفع: ${order.payment}</span>`;
    if (order.payment === 'تمارا' && order.tamaraAuth) {
        paymentLine += `<span>🔑 رمز الموافقة: ${order.tamaraAuth}</span>`;
    }

    let html = `<div class="invoice" id="invoiceToPrint">
        <div class="top-margin">
            <div>رقم شهادة العمل الحر: FL-765735204</div>
            <div>الرقم الضريبي: 312495447600003</div>
        </div>
        <div class="logo-center">
            <img src="images/logo.svg" onerror="this.src='https://via.placeholder.com/100'">
        </div>
        <div class="invoice-header">
            <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
            <p><strong>التاريخ:</strong> ${displayDate} ${order.time !== '-' ? ' - ' + order.time : ''}</p>
        </div>
        <div class="invoice-parties">
            <div class="invoice-from">
                <h3>📌 مصدرة من:</h3>
                <p><strong>منصة في خدمتك</strong><br>المملكة العربية السعودية<br>حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>الرقم الإضافي: 7718 - الرمز البريدي: 55431</p>
            </div>
            <div class="invoice-to">
                <h3>📌 مصدرة إلى:</h3>
                <p><strong>${order.customer}</strong><br>المملكة العربية السعودية<br>${order.city} - ${order.district} - ${order.street} - ${order.building} - ${order.extra} - ${order.postal}<br>هاتف: ${order.phone}<br>بريد: ${order.email || 'غير مدخل'}</p>
            </div>
        </div>
        <div class="payment-shipping">${paymentLine}<span>🚚 خدمة الشحن: ${order.shipping}</span></div>
        <h3>📦 تفاصيل الطلب</h3>
        <table class="products-table">
            <thead><tr><th>صورة</th><th>كود</th><th>المنتج</th><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الخصم</th><th>الإجمالي</th></tr></thead>
            <tbody>${cartRows}</tbody>
        </table>
        <div class="totals-wrapper">
            <div class="totals-labels"><p>المجموع الفرعي</p><p>الخصم الكلي</p><p>الضريبة (15%)</p></div>
            <div class="totals-values"><p>${subtotal.toFixed(2)} ريال</p><p>${totalDiscount.toFixed(2)} ريال</p><p>${tax.toFixed(2)} ريال</p></div>
            <div class="grand-total"><h2>الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2></div>
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
    let element = document.getElementById('invoiceToPrint');
    if (!element) {
        alert('لا يوجد فاتورة');
        return;
    }
    html2pdf().from(element).set({
        margin: [10, 10, 10, 10],
        filename: 'فاتورة.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
}

function newOrder() {
    localStorage.removeItem('currentOrder');
    window.location.href = 'index.html';
}

if (window.location.pathname.includes('invoice.html')) {
    document.addEventListener('DOMContentLoaded', loadInvoice);
}
