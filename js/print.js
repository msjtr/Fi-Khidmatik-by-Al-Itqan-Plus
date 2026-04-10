// =====================================================
// print.js - دوال الطباعة والتصدير (PDF/PNG) للفاتورة
// =====================================================

// دوال مساعدة عامة
window.formatDate = function(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

window.formatTime = function(time24) {
    if (!time24) return '';
    let [h, m] = time24.split(':');
    let hour = parseInt(h);
    let ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
};

window.escapeHtml = function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
};

function cleanText(text) {
    if (!text) return '';
    return String(text).replace(/[^\u0600-\u06FF\s0-9a-zA-Z\.\-\_\,]/g, ' ').trim();
}

function getStatusText(status) {
    const map = { 'جديد':'جديد', 'تحت التنفيذ':'قيد التنفيذ', 'تم التنفيذ':'مكتمل', 'ملغي':'ملغي', 'مسترجع':'مسترجع', 'تحت المراجعة':'تحت المراجعة' };
    return map[status] || status || 'مكتمل';
}

function getShippingText(method) {
    if (method === 'delivery') return 'شحن منزلي';
    if (method === 'noship') return 'لا يتطلب شحن';
    return 'استلام من المقر';
}

function getPaymentName(method) {
    const names = { 'mada':'مدى', 'mastercard':'ماستركارد', 'visa':'فيزا', 'stcpay':'STCPay', 'tamara':'تمارا', 'tabby':'تابي', 'other':'أخرى' };
    return names[method] || method || 'مدى';
}

// دوال بناء أجزاء الفاتورة
function buildInvoiceHeader(title, sellerData) {
    return `
        <div class="page-header">
            <div class="header-right">
                <div class="logo-area">
                    <img src="/fi-khidmatik/images/logo.svg" class="logo-img" onerror="this.style.display='none'">
                    <div class="logo-text">
                        <div class="platform-name">في خدمتك</div>
                        <div class="platform-slogan">من الإتقان بلس</div>
                    </div>
                </div>
            </div>
            <div class="header-center"><div class="page-title">${title}</div></div>
            <div class="header-left">
                <div class="legal-numbers">
                    <div><span>شهادة العمل الحر:</span> <span>${sellerData.licenseNumber}</span></div>
                    <div><span>الرقم الضريبي:</span> <span>${sellerData.taxNumber}</span></div>
                </div>
            </div>
        </div>
    `;
}

function buildInvoiceFooter(pageNum, totalPages, sellerData) {
    return `
        <div class="page-footer">
            <div class="contact-info">
                <span><i class="fas fa-phone-alt"></i> ${sellerData.phone}</span>
                <span><i class="fab fa-whatsapp"></i> ${sellerData.whatsapp}</span>
                <span><i class="fas fa-envelope"></i> ${sellerData.email}</span>
                <span><i class="fas fa-globe"></i> ${sellerData.website}</span>
            </div>
            <div class="legal-footer">فاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
}

// الدالة الرئيسية لبناء الفاتورة الكاملة (متوقعة من print.html)
window.buildFullInvoice = function(order, config) {
    const sellerData = config.sellerData;
    const PLACEHOLDER_RAW = config.placeholderRaw;
    const formatDate = window.formatDate;
    const formatTime = window.formatTime;
    const escape = window.escapeHtml;
    
    const items = order.items || [];
    let subtotal = order.subtotal || 0;
    if (!order.subtotal) {
        subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
    }
    const discount = order.discount || 0;
    const tax = order.tax || ((subtotal - discount) * 0.15);
    const total = order.total || (subtotal - discount + tax);
    
    let itemsHtml = '';
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const imageUrl = item.image || PLACEHOLDER_RAW;
        // استخدام encodeURIComponent لتجنب مشاكل onerror
        const encodedPlaceholder = encodeURIComponent(PLACEHOLDER_RAW);
        itemsHtml += `
            <tr>
                <td style="text-align:center">${i+1}</td>
                <td style="text-align:center"><img src="${imageUrl.replace(/"/g, '&quot;')}" class="product-img" style="width:45px;height:45px;object-fit:cover;" crossorigin="anonymous" data-placeholder="${encodedPlaceholder}" onerror="this.src = decodeURIComponent(this.getAttribute('data-placeholder')); this.removeAttribute('data-placeholder');"></td>
                <td style="text-align:right"><strong>${escape(cleanText(item.name))}</strong><br><small>${escape(cleanText(item.description))}</small></td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:center;direction:ltr">${(item.price || 0).toFixed(2)} ريال</td>
                <td style="text-align:center;direction:ltr">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ريال</td>
            </tr>
        `;
    }
    
    let fullAddress = order.customerStreet || '';
    if (order.customerAdditionalNo) fullAddress += ' - ' + order.customerAdditionalNo;
    if (order.customerCity) fullAddress += '، ' + order.customerCity;
    if (order.customerPoBox) fullAddress += '، ص.ب: ' + order.customerPoBox;
    if (!fullAddress && order.customerAddress) fullAddress = order.customerAddress;
    
    const customerAddressHtml = `<p><i class="fas fa-user"></i> ${escape(order.customerName)}</p><p><i class="fas fa-map-marker-alt"></i> ${escape(fullAddress)}</p><p><i class="fas fa-phone-alt"></i> ${escape(order.customerPhone)}</p><p><i class="fas fa-envelope"></i> ${escape(order.customerEmail)}</p>`;
    const sellerAddressHtml = `<p><i class="fas fa-store"></i> ${sellerData.name}</p><p><i class="fas fa-location-dot"></i> المملكة العربية السعودية</p><p><i class="fas fa-location-dot"></i> ${sellerData.address}</p><p><i class="fas fa-phone-alt"></i> ${sellerData.phone}</p>`;
    
    const discountRow = discount > 0 ? `<div class="totals-row"><span>الخصم</span><span>- ${discount.toFixed(2)} ريال</span></div>` : '';
    
    return `
        <div class="page invoice-page">
            ${buildInvoiceHeader('فاتورة إلكترونية', sellerData)}
            <div class="info-grid">
                <div class="info-item"><div class="info-label">رقم الفاتورة</div><div class="info-value">${escape(order.orderNumber)}</div></div>
                <div class="info-item"><div class="info-label">التاريخ</div><div class="info-value">${formatDate(order.orderDate)} - ${formatTime(order.orderTime)}</div></div>
                <div class="info-item"><div class="info-label">الحالة</div><div class="status-badge">${getStatusText(order.status)}</div></div>
            </div>
            <div class="addresses">
                <div class="address-card"><strong><i class="fas fa-building"></i> مصدرة من</strong>${sellerAddressHtml}</div>
                <div class="address-card"><strong><i class="fas fa-user-check"></i> مصدرة إلى</strong>${customerAddressHtml}</div>
            </div>
            <div class="payment-grid">
                <div class="payment-card"><i class="fas fa-credit-card"></i> <strong>طريقة الدفع</strong><br>${getPaymentName(order.paymentMethod)}</div>
                <div class="payment-card"><i class="fas fa-check-circle"></i> <strong>رمز الموافقة</strong><br>${order.approvalCode || 'غير مطلوب'}</div>
                <div class="payment-card"><i class="fas fa-truck"></i> <strong>طريقة الاستلام</strong><br>${getShippingText(order.shippingMethod)}</div>
            </div>
            <table class="products-table">
                <thead>
                    <tr><th>#</th><th>الصورة</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="totals-box">
                <div class="totals-row"><span>المجموع الفرعي</span><span>${subtotal.toFixed(2)} ريال</span></div>
                ${discountRow}
                <div class="totals-row"><span>ضريبة القيمة المضافة 15%</span><span>${tax.toFixed(2)} ريال</span></div>
                <div class="totals-row grand-total"><span>الإجمالي النهائي</span><span>${total.toFixed(2)} ريال</span></div>
            </div>
            <div class="barcodes">
                <div class="barcode-item"><div id="zatcaQR" class="qr-code"></div><p>باركود هيئة الزكاة والضريبة</p></div>
                <div class="barcode-item"><div id="websiteQR" class="qr-code"></div><p>للوصول السريع إلى موقعنا الإلكتروني</p></div>
                <div class="barcode-item"><div id="downloadQR" class="qr-code"></div><p>باركود تحميل الفاتورة</p></div>
            </div>
            ${buildInvoiceFooter(1, 4, sellerData)}
        </div>
        <div class="page">${buildInvoiceHeader('الشروط والأحكام', sellerData)}<p style="padding:20px">شروط وأحكام الخدمة متاحة على الموقع.</p>${buildInvoiceFooter(2, 4, sellerData)}</div>
        <div class="page">${buildInvoiceHeader('الشروط والأحكام (تابع)', sellerData)}<p style="padding:20px">البنود المالية والقانونية.</p>${buildInvoiceFooter(3, 4, sellerData)}</div>
        <div class="page">${buildInvoiceHeader('الإقرار والتوقيع', sellerData)}<p style="padding:20px">أقر أنا العميل بصحة البيانات.</p>${buildInvoiceFooter(4, 4, sellerData)}</div>
    `;
};

// دوال الطباعة والتصدير (PDF/PNG)
async function waitForImages(element, timeout = 8000) {
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return Promise.race([
            new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }),
            new Promise(resolve => setTimeout(resolve, timeout))
        ]);
    }));
}

window.printInvoice = function() {
    window.print();
};

window.exportToPDF = async function() {
    const pages = document.querySelectorAll('.page');
    if (!pages.length) return alert("لا توجد صفحات للتصدير");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    for (let i = 0; i < pages.length; i++) {
        await waitForImages(pages[i]);
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' });
        if (i !== 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    }
    pdf.save("invoice.pdf");
};

window.exportToPNG = async function() {
    const pages = document.querySelectorAll('.page');
    for (let i = 0; i < pages.length; i++) {
        await waitForImages(pages[i]);
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' });
        const link = document.createElement('a');
        link.download = `page_${i+1}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
};
