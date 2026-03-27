// order.js
// نظام الفواتير الإلكتروني - منصة في خدمتك

/**
 * دالة تحويل النصوص الخاصة لمنع هجمات XSS
 * @param {string} str - النص المراد تنظيفه
 * @returns {string} النص الآمن
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    }[m]));
}

/**
 * تحميل وعرض بيانات الفاتورة من localStorage
 */
function loadInvoice() {
    // جلب بيانات الطلب من التخزين المحلي
    let orderData = localStorage.getItem('currentOrder');
    
    // التحقق من وجود الطلب
    if (!orderData) {
        document.getElementById('invoiceContent').innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 50px;">
                ❌ لا يوجد طلب لعرضه
            </div>`;
        return;
    }

    // تحويل البيانات إلى كائن JavaScript
    let order = JSON.parse(orderData);
    
    // الحصول على عناصر السلة (مرونة لاختلاف أسماء المفاتيح)
    let items = order.cart || order.items || [];

    // التحقق من وجود منتجات في السلة
    if (!items.length) {
        document.getElementById('invoiceContent').innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 50px;">
                ❌ السلة فارغة
            </div>`;
        return;
    }

    // متغيرات لحساب الإجماليات
    let cartRows = '';
    let subtotal = 0;
    let totalDiscount = 0;

    // بناء صفوف جدول المنتجات
    items.forEach(item => {
        // استخراج القيم مع قيم افتراضية آمنة
        let price = parseFloat(item.price) || 0;
        let qty = parseInt(item.qty) || 1;
        let discount = parseFloat(item.discount) || 0;

        // حساب إجمالي المنتج بعد الخصم
        let itemTotal = (price * qty) - discount;

        // تحديث الإجماليات
        subtotal += price * qty;
        totalDiscount += discount;

        // إضافة صف المنتج إلى الجدول
        cartRows += `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.code)}</td>
                <td>${escapeHtml(item.desc || '')}</td>
                <td>${qty}</td>
                <td>${price.toFixed(2)}</td>
                <td>${discount.toFixed(2)}</td>
                <td>${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    // حساب الضريبة والإجمالي النهائي
    let taxableAmount = subtotal - totalDiscount;
    let tax = taxableAmount * 0.15;
    let grandTotal = taxableAmount + tax;

    // تنسيق التاريخ للعرض
    let displayDate = order.date || '-';

    // بناء هيكل الفاتورة الكامل
    let invoiceHTML = `
        <div class="invoice" id="invoiceToPrint" style="direction: rtl; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
            <!-- الهوامش العلوية (الشهادة والرقم الضريبي) -->
            <div class="top-margin">
                <div>رقم شهادة العمل الحر: FL-765735204</div>
                <div>الرقم الضريبي: 312495447600003</div>
            </div>

            <!-- الشعار -->
            <div class="logo-center">
                <img src="images/logo.svg" onerror="this.style.display='none'" alt="شعار المنصة">
            </div>

            <!-- رأس الفاتورة -->
            <div class="invoice-header">
                <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || 'FK-0000'}</p>
                <p><strong>التاريخ:</strong> ${displayDate} ${order.time && order.time !== '-' ? ' - ' + order.time : ''}</p>
            </div>

            <!-- معلومات المصدر والمستلم -->
            <div class="invoice-parties">
                <div class="invoice-from">
                    <h3>📌 مصدرة من:</h3>
                    <p>
                        <strong>منصة في خدمتك</strong><br>
                        المملكة العربية السعودية<br>
                        حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>
                        الرقم الإضافي: 7718 - الرمز البريدي: 55431
                    </p>
                </div>
                <div class="invoice-to">
                    <h3>📌 مصدرة إلى:</h3>
                    <p>
                        <strong>${escapeHtml(order.customer) || '-'}</strong><br>
                        المملكة العربية السعودية<br>
                        ${order.city || ''} ${order.district ? '- ' + order.district : ''} ${order.street ? '- ' + order.street : ''} ${order.building ? '- ' + order.building : ''} ${order.extra ? '- ' + order.extra : ''} ${order.postal ? '- ' + order.postal : ''}<br>
                        هاتف: ${order.phone || '-'}<br>
                        بريد: ${order.email || 'غير مدخل'}
                    </p>
                </div>
            </div>

            <!-- معلومات الدفع والشحن -->
            <div class="payment-shipping">
                <span>💳 طريقة الدفع: ${order.payment || '-'}</span>
                ${order.payment === 'تمارا' && order.tamaraAuth ? `<span>🔑 رمز الموافقة على الطلب في تمارا: ${order.tamaraAuth}</span>` : ''} 
                <span>🚚 خدمة الشحن: ${order.shipping || '-'}</span>
            </div>

            <!-- جدول تفاصيل الطلب -->
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

            <!-- ملخص الحساب -->
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

            <!-- شريط الاتصال والتواصل -->
            <div class="contact-bar">
                <span>📞 +966597771565</span>
                <span>✉️ info@fi-khidmatik.com</span>
                <span>🌐 www.khidmatik.com</span>
            </div>

            <!-- تذييل الفاتورة -->
            <p class="thanks">شكراً لتسوقكم معنا</p>
        </div>
    `;

    // عرض الفاتورة في الصفحة
    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
}

/**
 * تحميل الفاتورة كملف PDF
 */
function downloadPDF() {
    const element = document.getElementById('invoiceToPrint');
    if (!element) {
        alert('لا يوجد فاتورة للتحميل');
        return;
    }
    
    html2pdf()
        .from(element)
        .set({
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'فاتورة.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .save();
}

/**
 * إنشاء طلب جديد (العودة إلى الصفحة الرئيسية)
 */
function newOrder() {
    window.location.href = "index.html";
}

// تحميل الفاتورة عند اكتمال تحميل الصفحة
window.onload = loadInvoice;
