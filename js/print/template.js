// بدلاً من الاستيرادات، أضف هذا الكود مباشرة

// ========== دالة escapeHtml ==========
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ========== دالة buildInvoiceHTML ==========
function buildInvoiceHTML(order, cartRows, totals) {
    // تنسيق التاريخ
    let displayDate = order.orderDate || '-';
    if (displayDate && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        let parts = displayDate.split('-');
        displayDate = parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    
    // تنسيق الوقت
    let displayTime = order.orderTime || '-';
    if (displayTime && displayTime.includes(':')) {
        let [h, m] = displayTime.split(':');
        let hour = parseInt(h);
        let ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
        hour = hour % 12 || 12;
        displayTime = `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
    }
    
    const safeTotals = {
        subtotal: totals?.subtotal || '0 ريال',
        discount: totals?.discount || '0 ريال',
        tax: totals?.tax || '0 ريال',
        total: totals?.total || '0 ريال'
    };
    
    const logoPath = '/images/logo.svg';
    const fallbackLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%233b82f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3Eف%3C/text%3E%3C/svg%3E";
    
    return `
        <div class="invoice-header">
            <div class="logo">
                <div class="logo-circle">
                    <img 
                        src="${logoPath}" 
                        alt="شعار منصة في خدمتك" 
                        style="width: 50px; height: 50px; object-fit: contain;"
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer"
                        onerror="this.onerror=null; this.src='${fallbackLogo}';"
                    />
                </div>
                <h1 class="company-name">منصة في خدمتك</h1>
                <p class="company-sub">FI-KHIDMATIK</p>
                <div class="divider"></div>
            </div>
        </div>
        
        <div class="tax-badge">
            <div>رقم شهادة العمل الحر: FL-765735204</div>
            <div>الرقم الضريبي: 312495447600003</div>
        </div>
        
        <div class="invoice-info">
            <div class="invoice-number">
                رقم الفاتورة: <span>${escapeHtml(order.orderNumber)}</span>
            </div>
            <div class="invoice-date">
                التاريخ: ${displayDate} | ${displayTime}
            </div>
        </div>
        
        <div class="parties">
            <div class="from-box">
                <h3>📌 مصدرة من</h3>
                <p>
                    <strong>منصة في خدمتك</strong><br>
                    المملكة العربية السعودية<br>
                    حائل - حي النقرة - شارع سعد المشاط - مبنى 3085<br>
                    الرقم الإضافي: 7718 - الرمز البريدي: 55431
                </p>
            </div>
            <div class="to-box">
                <h3>📌 مصدرة إلى</h3>
                <p>
                    <strong>${escapeHtml(order.customer?.name || '-')}</strong><br>
                    المملكة العربية السعودية<br>
                    هاتف: ${escapeHtml(order.customer?.phone) || '-'}<br>
                    بريد: ${escapeHtml(order.customer?.email) || 'غير مدخل'}<br>
                    ${escapeHtml(order.customer?.address || '')}
                </p>
            </div>
        </div>
        
        <div class="payment-info">
            <span class="payment-badge">💳 طريقة الدفع: ${escapeHtml(order.paymentMethodName || order.paymentMethod || '-')}</span>
            ${order.approvalCode ? `<span class="payment-badge">🔑 رمز الموافقة: ${escapeHtml(order.approvalCode)}</span>` : ''}
            ${order.shippingService ? `<span class="payment-badge">🚚 خدمة الشحن: ${escapeHtml(order.shippingService)}</span>` : ''}
        </div>
        
        <h3 class="products-title">📦 تفاصيل الطلب</h3>
        <table class="products-table">
            <thead>
                <tr>
                    <th>اسم المنتج</th>
                    <th>الكود</th>
                    <th>الوصف</th>
                    <th>الكمية</th>
                    <th>السعر (ريال)</th>
                    <th>الخصم (ريال)</th>
                    <th>الإجمالي (ريال)</th>
                </tr>
            </thead>
            <tbody>
                ${cartRows || ''}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="totals-left">
                <p><strong>المجموع الفرعي:</strong> ${safeTotals.subtotal}</p>
                <p><strong>الخصم الكلي:</strong> ${safeTotals.discount}</p>
                <p><strong>الضريبة (15%):</strong> ${safeTotals.tax}</p>
            </div>
            <div class="totals-center">
                <h2>الإجمالي النهائي: ${safeTotals.total}</h2>
            </div>
        </div>
        
        <div class="contact-bar">
            <span>📞 +966597771565</span>
            <span>✉️ info@fi-khidmatik.com</span>
            <span>🌐 www.khidmatik.com</span>
        </div>
        
        <div class="thanks">
            شكراً لتسوقكم معنا
        </div>
    `;
}

// ========== دوال الطباعة والتصدير ==========
async function printInvoice(element) {
    if (!element) throw new Error('عنصر الفاتورة غير موجود');
    
    return new Promise((resolve, reject) => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) throw new Error('لا يمكن فتح نافذة الطباعة');
            
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else if (style.tagName === 'LINK' && style.href) {
                    let href = style.href;
                    if (!href.startsWith('http') && !href.startsWith('//')) {
                        href = window.location.origin + (href.startsWith('/') ? href : '/' + href);
                    }
                    stylesHTML += `<link rel="stylesheet" href="${href}">`;
                }
            });
            
            const additionalStyles = `
                <style>
                    .logo-circle {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                        border-radius: 50%;
                        margin: 0 auto 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    .logo-circle img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        display: block;
                    }
                    body {
                        padding: 20px;
                        margin: 0;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                    }
                    .buttons, .no-print {
                        display: none !important;
                    }
                    @media print {
                        body { padding: 0; }
                        .logo-circle {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                </style>
            `;
            
            let invoiceHTML = element.outerHTML;
            invoiceHTML = invoiceHTML.replace(/src="\/([^"]+)"/g, (match, path) => {
                return `src="${window.location.origin}/${path}"`;
            });
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>طباعة فاتورة</title>
                    <base href="${window.location.origin}/">
                    ${stylesHTML}
                    ${additionalStyles}
                </head>
                <body>
                    ${invoiceHTML}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    resolve(true);
                }, 500);
            };
        } catch (error) {
            reject(error);
        }
    });
}

async function generatePDF(element, order) {
    if (!element) throw new Error('عنصر الفاتورة غير موجود');
    showLoading('جاري إنشاء ملف PDF...');
    
    try {
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        });
        
        document.body.removeChild(tempContainer);
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
        hideLoading();
        return true;
    } catch (error) {
        console.error('خطأ في PDF:', error);
        hideLoading();
        throw error;
    }
}

async function generateImage(element, order) {
    if (!element) throw new Error('عنصر الفاتورة غير موجود');
    showLoading('جاري إنشاء الصورة...');
    
    try {
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        });
        
        document.body.removeChild(tempContainer);
        
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        hideLoading();
        return true;
    } catch (error) {
        console.error('خطأ في الصورة:', error);
        hideLoading();
        throw error;
    }
}
