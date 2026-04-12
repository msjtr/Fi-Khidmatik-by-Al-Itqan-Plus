// داخل ملف js/print.js وتحديداً داخل دالة window.onload

// ... (بعد جلب order و customer و seller)

// التصحيح هنا: استخدمنا seller.name بدلاً من seller.sellerName
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
        <div class="header-meta">
            الرقم الضريبي: ${seller.taxNumber} <br>
            العمل الحر: ${seller.licenseNumber}
        </div>
    </div>

    <div class="grid-2">
        <div class="card">
            <div class="card-h">بيانات المتجر (المصدر)</div>
            <div class="card-b">
                ${seller.address} <br>
                التواصل: ${seller.phone}
            </div>
        </div>
        <div class="card">
            <div class="card-h">بيانات العميل (المستلم)</div>
            <div class="card-b">
                <b>${customer.name || 'عميل كرام'}</b> <br>
                الجوال: ${customer.phone || '---'}
            </div>
        </div>
    </div>
    
    `;
