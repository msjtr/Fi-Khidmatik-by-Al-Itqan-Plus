export async function generateImage(element, order) {
  if (!element) return;
  await new Promise(r => setTimeout(r, 200));

  let scale = 2.2;
  if (element.scrollWidth > 1000) scale = 2;
  if (element.scrollWidth < 600) scale = 2.5;

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    const link = document.createElement('a');
    link.download = `فاتورة_${(order.customer?.name || 'عميل').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${(order.orderNumber || order.id).replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${order.orderDate || new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL('image/png', 0.85);
    link.click();
  } catch (e) {
    console.error(e);
    throw new Error('فشل في إنشاء الصورة');
  }
}
