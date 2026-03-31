export async function printInvoice(element) {
  if (!element) {
    console.error('❌ عنصر الفاتورة غير موجود');
    return;
  }

  // الحصول على HTML الكامل للعنصر
  const invoiceHTML = element.outerHTML;
  
  // جمع جميع الأنماط من الصفحة مع معالجة المسارات
  let stylesHTML = '';
  const styleNodes = document.querySelectorAll('link[rel="stylesheet"], style');
  
  styleNodes.forEach(style => {
    if (style.tagName === 'LINK' && style.href) {
      // معالجة المسار وتحويله إلى مطلق
      const absolutePath = getAbsolutePath(style.href);
      stylesHTML += `<link rel="stylesheet" href="${absolutePath}" media="print">\n`;
    } else if (style.tagName === 'STYLE') {
      stylesHTML += `<style>${style.innerHTML}</style>\n`;
    }
  });

  // أنماط إضافية لضمان عدم اقتصاص المحتوى
  const extraStyles = `
    <style>
      /* إعادة تعيين الهوامش الأساسية */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* إعدادات صفحة الطباعة */
      @page {
        size: A4;
        margin: 0.3cm;
      }
      
      /* تنسيق الجسم */
      body {
        margin: 0;
        padding: 0.2in;
        background: white;
        direction: rtl;
        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      }
      
      /* حاوية الفاتورة */
      .invoice-wrapper,
      .invoice-container,
      .invoice {
        margin: 0 auto !important;
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        box-shadow: none !important;
        background: white !important;
      }
      
      /* منع كسر الصفحات داخل العناصر المهمة */
      .invoice-header,
      .parties,
      .payment-shipping,
      .date-time-box,
      .invoice-table,
      .totals,
      .contact,
      .thanks,
      .from,
      .to {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      /* منع كسر الصفوف في الجدول */
      .invoice-table tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      /* تنسيق الجدول */
      .invoice-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      
      .invoice-table th,
      .invoice-table td {
        border: 1px solid #ccc;
        padding: 8px 4px;
        text-align: center;
        font-size: 12px;
      }
      
      .invoice-table th {
        background: #f0f0f0 !important;
        color: black !important;
        font-weight: bold;
      }
      
      /* تنسيق الإجماليات */
      .totals {
        background: #f8f8f8 !important;
        padding: 10px 15px;
        border-radius: 8px;
        width: 280px;
        margin-right: auto;
        margin-left: 0;
        border: 1px solid #ddd;
      }
      
      .totals .grand {
        font-weight: bold;
        border-top: 1px solid #ccc;
        margin-top: 5px;
        padding-top: 5px;
      }
      
      /* إخفاء الأزرار */
      .buttons,
      .no-print,
      button {
        display: none !important;
      }
      
      /* منع اقتصاص المحتوى */
      .invoice-content {
        overflow: visible !important;
        width: 100% !important;
      }
      
      /* ضمان ظهور جميع النصوص */
      * {
        overflow: visible !important;
      }
      
      /* الألوان في الطباعة */
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
    </style>
  `;

  // فتح نافذة الطباعة
  const printWindow = window.open('', '_blank', 'width=900,height=700,toolbar=yes,scrollbars=yes,resizable=yes');
  
  if (!printWindow) {
    alert('⚠️ يرجى السماح بفتح النوافذ المنبثقة لتتمكن من الطباعة');
    return;
  }

  // كتابة المحتوى في النافذة الجديدة
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة - طباعة</title>
      ${stylesHTML}
      ${extraStyles}
      <base href="${getBaseUrl()}" target="_blank">
    </head>
    <body>
      <div style="max-width: 1100px; margin: 0 auto; background: white;">
        ${invoiceHTML}
      </div>
      <script>
        // تأكيد تحميل جميع الصور والخطوط قبل الطباعة
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }, 800);
        };
        
        setTimeout(function() {
          if (!window.printed) {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          }
        }, 1500);
      <\/script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
}

/**
 * تحويل المسار النسبي إلى مسار مطلق
 * @param {string} path - المسار النسبي أو المطلق
 * @returns {string} - المسار المطلق
 */
function getAbsolutePath(path) {
  if (!path) return '';
  
  // إذا كان المسار مطلقاً بالفعل
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // إذا كان المسار يبدأ بـ data: أو blob:
  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  
  // الحصول على المسار الأساسي للصفحة الحالية
  const baseUrl = getBaseUrl();
  
  // إزالة ./ من بداية المسار
  let cleanPath = path;
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.substring(2);
  }
  
  // التعامل مع المسارات النسبية المتعددة ../
  let relativePath = cleanPath;
  let basePath = baseUrl;
  
  while (relativePath.startsWith('../')) {
    // إزالة ../ من المسار
    relativePath = relativePath.substring(3);
    // إزالة المجلد الأخير من المسار الأساسي
    const lastSlashIndex = basePath.lastIndexOf('/', basePath.length - 2);
    if (lastSlashIndex > 0) {
      basePath = basePath.substring(0, lastSlashIndex + 1);
    }
  }
  
  // دمج المسار الأساسي مع المسار النظيف
  let absolutePath = basePath + relativePath;
  
  // تنظيف المسار من // المتكررة
  absolutePath = absolutePath.replace(/([^:]\/)\/+/g, '$1');
  
  return absolutePath;
}

/**
 * الحصول على المسار الأساسي للصفحة الحالية
 * @returns {string} - المسار الأساسي (مثل: http://localhost:5500/fi-khidmatik/)
 */
function getBaseUrl() {
  const currentUrl = window.location.href;
  const lastSlashIndex = currentUrl.lastIndexOf('/');
  let baseUrl = currentUrl.substring(0, lastSlashIndex + 1);
  
  // التأكد من أن المسار ينتهي بـ /
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  
  return baseUrl;
}

/**
 * دالة مساعدة للحصول على جميع مسارات CSS المستخدمة في الصفحة
 * يمكن استخدامها للتحقق من صحة المسارات
 */
function getAllCSSPaths() {
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  const paths = [];
  links.forEach(link => {
    if (link.href) {
      paths.push({
        original: link.href,
        absolute: getAbsolutePath(link.href)
      });
    }
  });
  return paths;
}

// تصدير دوال إضافية للاستخدام في التصحيح
export { getAbsolutePath, getBaseUrl, getAllCSSPaths };
