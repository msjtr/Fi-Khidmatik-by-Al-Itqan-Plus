export async function generatePDF(element, order) {
  if (!element) return;
  await new Promise(r => setTimeout(r, 200));

  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: `فاتورة_${(order.customer?.name || 'عميل').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${(order.orderNumber || order.id).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${order.orderDate || new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, letterRendering: true, useCORS: true, logging: false, backgroundColor: '#ffffff', windowWidth: element.scrollWidth, windowHeight: element.scrollHeight },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  try {
    await html2pdf().set(opt).from(element).save();
  } catch (e) {
    console.error(e);
    throw new Error('فشل في إنشاء PDF');
  }
}
