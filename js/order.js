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

    let rows = '';
    let subtotal = 0;
    let discountTotal = 0;

    order.cart.forEach(item => {

        let total = (item.price * item.qty) - item.discount;

        subtotal += item.price * item.qty;
        discountTotal += item.discount;

        rows += `
        <tr>
            <td>${escapeHtml(item.code)}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.qty}</td>
            <td>${item.price}</td>
            <td>${item.discount}</td>
            <td>${total.toFixed(2)}</td>
        </tr>`;
    });

    let tax = (subtotal - discountTotal) * 0.15;
    let finalTotal = subtotal - discountTotal + tax;

    let html = `
    <div class="invoice" id="invoicePDF">

        <div class="header">
            <div class="logo">
                <img src="images/logo.svg">
            </div>
            <div class="title">
                <h2>فاتورة</h2>
                <p>رقم: ${order.orderNumber}</p>
                <p>${order.date}</p>
            </div>
        </div>

        <div class="info">
            <div>
                <h3>من:</h3>
                منصة في خدمتك<br>السعودية
            </div>
            <div>
                <h3>إلى:</h3>
                ${order.customer}<br>
                ${order.phone}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>كود</th>
                    <th>منتج</th>
                    <th>كمية</th>
                    <th>سعر</th>
                    <th>خصم</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div class="total-box">
            <p>المجموع: ${subtotal.toFixed(2)} ريال</p>
            <p>الخصم: ${discountTotal.toFixed(2)} ريال</p>
            <p>الضريبة: ${tax.toFixed(2)} ريال</p>
            <h2>الإجمالي: ${finalTotal.toFixed(2)} ريال</h2>
        </div>

        <div class="footer">
            <span>📞 966597771565+</span>
            <span>✉️ info@fi-khidmatik.com</span>
            <span>🌐 www.khidmatik.com</span>
        </div>

    </div>
    `;

    document.getElementById('invoiceContent').innerHTML = html;
}

function downloadPDF() {

    let element = document.getElementById('invoicePDF');

    let opt = {
        margin: 0.3,
        filename: 'فاتورة-' + Date.now() + '.pdf',
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'in', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}

function newOrder() {
    localStorage.removeItem('currentOrder');
    window.location.href = 'index.html';
}

window.onload = loadInvoice;
