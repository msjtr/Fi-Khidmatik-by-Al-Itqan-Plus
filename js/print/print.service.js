// print.service.js - خدمة الطباعة المباشرة

export async function printInvoice(element) {
  if (!element) {
    console.error('العنصر المطلوب غير موجود');
    return;
  }

  // نسخ العنصر لتجنب التأثير على الصفحة الأصلية
  const originalElement = element;
  const clone = originalElement.cloneNode(true);
  
  // الحصول على جميع الأنماط من الصفحة الأصلية
  const styles = document.querySelectorAll('link[rel="stylesheet"], style');
  let stylesHTML = '';
  styles.forEach(style => {
    if (style.tagName === 'LINK') {
      stylesHTML += `<link rel="stylesheet" href="${style.href}" media="print">`;
    } else if (style.tagName === 'STYLE') {
      stylesHTML += `<style>${style.innerHTML}</style>`;
    }
  });
  
  // إضافة أنماط إضافية لضمان عدم القص في الطباعة
  const extraStyles = `
    <style>
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        .invoice-wrapper {
          margin: 0 !important;
          padding: 0.3in !important;
          width: 100% !important;
          max-width: 100% !important;
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        .invoice-table {
          page-break-inside: avoid !important;
        }
        .buttons, .no-print {
          display: none !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  `;
  
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة - ${order?.orderNumber || 'طباعة'}</title>
      ${stylesHTML}
      ${extraStyles}
    </head>
    <body style="margin:0; padding:0; background:white;">
      <div style="max-width: 1100px; margin: 0 auto; background: white;">
        ${clone.outerHTML}
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
}
