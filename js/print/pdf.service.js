// pdf.service.js
export async function generatePDF(element, order) {
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `فاتورة_${order.orderNumber || order.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  
  await html2pdf().set(opt).from(element).save();
}
