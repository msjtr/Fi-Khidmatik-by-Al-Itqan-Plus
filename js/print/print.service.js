// print.service.js
export async function printInvoice(element) {
  const clone = element.cloneNode(true);
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>طباعة الفاتورة</title>
      <link rel="stylesheet" href="../../../css/design.css">
      <link rel="stylesheet" href="../../../css/print.css" media="print">
      <style>
        body { margin: 0; padding: 20px; background: white; }
        .no-print { display: none; }
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none; }
          .company-logo {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
      <script>
        window.onload = () => {
          window.print();
          window.onafterprint = () => window.close();
        };
      <\/script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}
