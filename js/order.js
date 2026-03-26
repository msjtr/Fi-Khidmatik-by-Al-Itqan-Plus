// order.js
function checkout() {
    if (!Array.isArray(window.cart) || window.cart.length === 0) {
        alert('❌ السلة فارغة! أضف منتجات أولاً.');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!name || !phone) {
        alert('❌ يرجى إدخال اسم العميل ورقم الجوال');
        return;
    }

    // رقم الطلب يدوي
    let manualOrderNumber = document.getElementById('order_number_manual').value.trim();
    if (!manualOrderNumber) manualOrderNumber = 'FK-0000';

    let timeVal = document.getElementById('order_time').value;
    let formattedTime = '-';
    if (timeVal) {
        let [h, m] = timeVal.split(':');
        let period = h >= 12 ? 'م' : 'ص';
        h = h % 12 || 12;
        formattedTime = `${h}:${m} ${period}`;
    }

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    const order = {
        orderNumber: manualOrderNumber,
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
        shipping: getVal('shipping'),
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));
    window.location.href = 'invoice.html';
}

function loadInvoice() {
    const orderJSON = localStorage.getItem('currentOrder');
    if (!orderJSON) {
        document.getElementById('invoiceContent').innerHTML = '<div class="container"><div class="empty-cart">⚠️ لا توجد فاتورة لعرضها. يرجى إنشاء طلب أولاً.</div></div>';
        return;
    }

    const order = JSON.parse(orderJSON);
    let cartRows = '';
    let subtotal = 0;
    let totalDiscount = 0;

    order.cart.forEach(item => {
        const itemSubtotal = item.price * item.qty;
        const itemDiscount = item.discount || 0;
        const itemTotal = itemSubtotal - itemDiscount;
        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;

        cartRows += `
            <tr>
                <td class="product-image"><img src="${item.image}" alt="صورة المنتج" onerror="this.src='https://via.placeholder.com/50?text=No+Img'"></td>
                <td>${escapeHtml(item.code)}</td>
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td>${escapeHtml(item.desc) || '—'}</td>
                <td>${item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td class="discount-cell">${itemDiscount.toFixed(2)}</td>
                <td class="total-cell">${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    const taxableAmount = subtotal - totalDiscount;
    const tax = taxableAmount * 0.15;
    const grandTotal = taxableAmount + tax;

    // تنسيق التاريخ
    let displayDate = order.date;
    if (order.date && order.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = order.date.split('-');
        displayDate = `${day}-${month}-${year}`;
    }

    // سطر الدفع مع رمز تمارا
    let paymentLine = `<span><strong>💳 طريقة الدفع:</strong> ${order.payment}</span>`;
    if (order.payment === 'تمارا' && order.tamaraAuth) {
        paymentLine += `<span class="tamara-code"><strong>🔑 رمز الموافقة:</strong> ${order.tamaraAuth}</span>`;
    }

    const invoiceHTML = `
        <div class="invoice" id="invoiceToPrint">
            <!-- الهامش العلوي: رقم العمل الحر والرقم الضريبي -->
            <div class="top-margin">
                <div class="certificate">رقم شهادة العمل الحر: FL-765735204</div>
                <div class="tax-id">الرقم الضريبي: 312495447600003</div>
            </div>

            <!-- الشعار واسم المنصة -->
            <div class="logo-area">
                <img src="images/logo.svg" alt="شعار المنصة" onerror="this.src='https://via.placeholder.com/80?text=Logo'">
                <div class="brand-name">منصة في خدمتك<br><span>FI KHIDMATIK</span></div>
            </div>

            <!-- رقم الفاتورة والتاريخ -->
            <div class="invoice-header">
                <div class="invoice-number-date">
                    <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
                    <p><strong>التاريخ:</strong> ${displayDate} ${order.time !== '-' ? ' - ' + order.time : ''}</p>
                </div>
            </div>

            <!-- المصدر والمستلم -->
            <div class="parties">
                <div class="from">
                    <h3>📌 مصدرة من</h3>
                    <p>
                        منصة في خدمتك<br>
                        المملكة العربية السعودية<br>
                        حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>
                        الرقم الإضافي: 7718 - الرمز البريدي: 55431
                    </p>
                </div>
                <div class="to">
                    <h3>📌 مصدرة إلى</h3>
                    <p>
                        <strong>${escapeHtml(order.customer)}</strong><br>
                        المملكة العربية السعودية<br>
                        ${order.city} - حي ${order.district || ''} - شارع ${order.street || ''} - مبنى ${order.building || ''} - ${order.extra || ''} - ${order.postal || ''}<br>
                        هاتف: ${order.phone}<br>
                        بريد: ${order.email || 'غير مدخل'}
                    </p>
                </div>
            </div>

            <!-- طريقة الدفع والشحن -->
            <div class="payment-shipping">
                ${paymentLine}
                <span><strong>🚚 خدمة الشحن:</strong> ${order.shipping}</span>
            </div>

            <!-- جدول المنتجات -->
            <h3>📦 تفاصيل الطلب</h3>
            <div class="table-responsive">
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>صورة</th>
                            <th>كود المنتج</th>
                            <th>اسم المنتج</th>
                            <th>الوصف</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الخصم</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartRows}
                    </tbody>
                </table>
            </div>

            <!-- ملخص الحساب -->
            <div class="totals">
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
                    الإجمالي النهائي: <strong>${grandTotal.toFixed(2)} ريال</strong>
                </div>
            </div>

            <!-- شريط الاتصال -->
            <div class="contact-info">
                <span>📞 +966597771565</span>
                <span>✉️ info@fi-khidmatik.com</span>
                <span>🌐 www.khidmatik.com</span>
            </div>

            <div class="thanks">شكراً لتسوقكم معنا</div>
        </div>
    `;

    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
}

function downloadPDF() {
    const element = document.getElementById('invoiceToPrint');
    if (!element) {
        alert('لا يوجد فاتورة للتحميل');
        return;
    }
    html2pdf()
        .from(element)
        .set({
            margin: [10, 10, 10, 10],
            filename: `فاتورة_${new Date().toLocaleDateString('ar-SA')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .save();
}

function newOrder() {
    localStorage.removeItem('currentOrder');
    window.location.href = 'index.html';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

if (window.location.pathname.includes('invoice.html')) {
    document.addEventListener('DOMContentLoaded', loadInvoice);
}
