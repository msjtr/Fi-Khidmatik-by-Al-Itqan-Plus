// print.service.js
export async function printInvoice(element, options = {}) {
  // التحقق من وجود العنصر
  if (!element) {
    throw new Error('عنصر الفاتورة غير موجود');
  }
  
  const clone = element.cloneNode(true);
  
  // إضافة أنماط إضافية للطباعة
  const printStyles = document.createElement('style');
  printStyles.textContent = `
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .invoice-print {
        margin: 0;
        padding: 0.5cm;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  clone.appendChild(printStyles);
  
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة ${options.title || ''}</title>
      <link rel="stylesheet" href="../../../css/design.css">
      <link rel="stylesheet" href="../../../css/print.css" media="print">
      <style>
        body {
          margin: 0;
          padding: 20px;
          background: white;
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
        }
        .no-print {
          display: none;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 200);
        };
      <\/script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}
