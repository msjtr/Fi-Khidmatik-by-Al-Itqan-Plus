// image.service.js
export async function generateImage(element, order) {
  const canvas = await html2canvas(element, {
    scale: 2.5,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });
  
  const fileName = `فاتورة_${order.customer?.name || 'عميل'}_${order.orderNumber || order.id}_${order.orderDate || ''}.png`
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\-_\.]/g, '_');
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png', 0.85);
  link.click();
}
