// pdf.service.js
export async function generatePDF(element, config) {
  if (!element) {
    throw new Error('عنصر الفاتورة غير موجود');
  }
  
  // التحقق من وجود المكتبة
  if (typeof html2pdf === 'undefined') {
    throw new Error('مكتبة html2pdf غير محملة');
  }
  
  const defaultConfig = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: 'فاتورة.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  await html2pdf().set(finalConfig).from(element).save();
}
