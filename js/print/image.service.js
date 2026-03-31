// image.service.js
export async function generateImage(element, order) {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true
  });
  
  const link = document.createElement('a');
  link.download = `فاتورة_${order.orderNumber || order.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
