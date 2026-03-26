// order.js - معالجة الطلب والفاتورة

function checkout() {
    // التحقق من السلة
    if (!window.cart || window.cart.length === 0) {
        alert('❌ السلة فارغة! أضف منتجات أولاً.');
        return;
    }

    // التحقق من البيانات الأساسية
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!name || !phone) {
        alert('❌ يرجى إدخال اسم العميل ورقم الجوال');
        return;
    }

    // توليد رقم الطلب
    let lastNum = localStorage.getItem('lastOrderNumber');
    let orderNumber = 1001;
    if (lastNum) {
        orderNumber = parseInt(lastNum) + 1;
    }
    localStorage.setItem('lastOrderNumber', orderNumber);

    // تنسيق الوقت
    let timeVal = document.getElementById('order_time').value;
    let formattedTime = '-';
    if (timeVal) {
        let parts = timeVal.split(':');
        let h = parseInt(parts[0]);
        let m = parts[1];
        let period = h >= 12 ? 'م' : 'ص';
        h = h % 12 || 12;
        formattedTime = `${h}:${m} ${period}`;
    }

    // تجميع البيانات
    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    const order = {
        orderNumber: `INV-${orderNumber.toString().padStart(6, '0')}`,
        date: getVal('order_date') || new Date().toLocaleDateString('ar-SA'),
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
        cart: window.cart.map(item => ({ ...item })), // نسخة عميقة
        payment: getVal('payment'),
        tamaraAuth: getVal('tamara_auth'),
        tamaraOrder: getVal('tamara_order'),
        shipping: getVal('shipping'),
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));

    // الانتقال إلى صفحة الفاتورة
    window.location.href = 'invoice.html';
}

// وظائف الفاتورة (تستخدم في invoice.html)
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

    const invoiceHTML = `
        <div class="invoice" id="invoiceToPrint">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="images/logo.svg" alt="شعار المنصة" style="max-width: 100px;" onerror="this.style.display='none'">
                <h1>فاتورة إلكترونية</h1>
                <p><strong>رقم الفاتورة:</strong> ${order.orderNumber}</p>
                <p><strong>التاريخ:</strong> ${order.date} ${order.time !== '-' ? ' - ' + order.time : ''}</p>
            </div>

            <hr>

            <h3>🏢 منصة في خدمتك</h3>
            <p>المملكة العربية السعودية - حائل - حي النقرة - شارع سعد المشاط<br>هاتف: 0550000000</p>

            <hr>

            <h3>👤 فاتورة إلى</h3>
            <p>
                <strong>${escapeHtml(order.customer)}</strong><br>
                ${order.city ? order.city + ' - ' : ''}${order.district ? 'حي ' + order.district : ''}<br>
                ${order.street ? 'شارع ' + order.street : ''} ${order.building ? ' - مبنى ' + order.building : ''}<br>
                ${order.extra ? 'رقم إضافي: ' + order.extra : ''} ${order.postal ? ' - الرمز البريدي: ' + order.postal : ''}<br>
                هاتف: ${order.phone}<br>
                بريد: ${order.email || 'غير مدخل'}
            </p>

            <hr>

            <h3>📦 تفاصيل الطلب</h3>
            <table>
                <thead>
                    <tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${cartRows}</tbody>
            </table>

            <div style="text-align: left;">
                <p><strong>المجموع الفرعي:</strong> ${subtotal.toFixed(2)} ريال</p>
                <p><strong>الضريبة (15%):</strong> ${tax.toFixed(2)} ريال</p>
                <h2 style="color: #1e3a8a;">الإجمالي النهائي: ${grandTotal.toFixed(2)} ريال</h2>
            </div>

            <hr>

            <p><strong>طريقة الدفع:</strong> ${order.payment}</p>
            ${order.tamaraAuth ? `<p><strong>رمز موافقة تمارا:</strong> ${order.tamaraAuth}</p>` : ''}
            ${order.tamaraOrder ? `<p><strong>رقم طلب تمارا:</strong> ${order.tamaraOrder}</p>` : ''}
            <p><strong>خدمة الشحن:</strong> ${order.shipping}</p>

            <p style="text-align: center; margin-top: 30px;">شكراً لتسوقكم معنا</p>
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

// تشغيل تحميل الفاتورة إذا كنا في invoice.html
if (window.location.pathname.includes('invoice.html')) {
    document.addEventListener('DOMContentLoaded', loadInvoice);
}
