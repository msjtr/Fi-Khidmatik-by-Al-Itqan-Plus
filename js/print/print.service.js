// print.service.js
export async function printInvoice(element) {
  // نسخ العنصر لتجنب التأثير على الصفحة
  const clone = element.cloneNode(true);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة</title>
      <link rel="stylesheet" href="../../css/design.css">
      <link rel="stylesheet" href="../../css/print.css" media="print">
      <style>
        body { margin: 0; padding: 0; background: white; }
        .invoice-container { max-width: 100%; margin: 0; padding: 0; }
        .invoice { padding: 0.5cm; }
        .buttons { display: none; }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.onafterprint = () => printWindow.close();
}
