// image.service.js - خدمة تحويل الفاتورة إلى صورة بجودة وحجم مناسبين

export async function generateImage(element, order) {
  if (!element) {
    console.error('العنصر المطلوب غير موجود');
    return;
  }

  // انتظار تحميل العنصر بالكامل
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    // حساب الأبعاد المناسبة للصورة
    const originalWidth = element.scrollWidth;
    const originalHeight = element.scrollHeight;
    
    // تحديد مقياس مناسب (حجم الملف بين 100-300KB)
    let scale = 2.2;
    if (originalWidth > 1200) scale = 2;
    if (originalWidth < 600) scale = 2.5;
    
    const canvas = await html2canvas(element, {
      scale: scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: originalWidth,
      windowHeight: originalHeight,
      onclone: (clonedDoc, element) => {
        // تأكد من تطبيق التنسيقات بشكل صحيح
        const clonedElement = clonedDoc.querySelector('.invoice-wrapper');
        if (clonedElement) {
          clonedElement.style.padding = '20px';
          clonedElement.style.margin = '0';
        }
      }
    });
    
    // تحويل إلى PNG بجودة متوسطة (حجم مناسب)
    const imageData = canvas.toDataURL('image/png', 0.85);
    
    // إنشاء رابط التحميل
    const link = document.createElement('a');
    link.download = generateImageFileName(order);
    link.href = imageData;
    
    // التحقق من حجم الملف (اختياري)
    const fileSize = Math.round((imageData.length - 22) * 3 / 4);
    if (fileSize > 500 * 1024) {
      console.warn(`حجم الصورة كبير نسبياً: ${Math.round(fileSize / 1024)}KB`);
    }
    
    link.click();
    
    return { success: true, fileSize };
    
  } catch (error) {
    console.error('خطأ في إنشاء الصورة:', error);
    throw new Error('فشل في إنشاء الصورة');
  }
}

// دالة لتوليد اسم ملف الصورة مع دعم العربية
function generateImageFileName(order) {
  let customerName = 'عميل';
  if (order.customer) {
    if (typeof order.customer === 'object') {
      customerName = order.customer.name || order.customer.customerName || 'عميل';
    } else if (typeof order.customer === 'string') {
      customerName = order.customer;
    }
  }
  
  customerName = cleanFileName(customerName);
  const orderNumber = order.orderNumber || order.id || 'بدون_رقم';
  const cleanOrderNumber = cleanFileName(orderNumber);
  
  const orderDate = order.orderDate ? formatDateForFileName(order.orderDate) : getCurrentDateForFileName();
  
  return `فاتورة_${customerName}_${cleanOrderNumber}_${orderDate}.png`;
}

function cleanFileName(str) {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9\u0600-\u06FF\-_]/g, '_').substring(0, 50);
}

function formatDateForFileName(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return getCurrentDateForFileName();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return getCurrentDateForFileName();
  }
}

function getCurrentDateForFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
