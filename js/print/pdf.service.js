// pdf.service.js
export async function generatePDF(element, order) {
  // تحسين الجودة ودعم العربية
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `فاتورة_${order.customer?.name || 'عميل'}_${order.orderNumber || order.id}_${order.orderDate || ''}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 3, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  await html2pdf().set(opt).from(element).save();
}
