// print-manager.js
import { buildInvoiceHTML } from './template.js';
import { printInvoice } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

// دالة مساعدة لإنشاء عنصر الفاتورة مؤقتاً (في حالة عدم وجود عنصر جاهز)
export function createInvoiceElement(order, cartRows, totals) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildInvoiceHTML(order, cartRows, totals);
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-9999px';
    document.body.appendChild(wrapper);// print-manager.js
// مدير الطباعة المركزي - يدير جميع عمليات الطباعة والتصدير مع تحسين التنسيق

import { buildInvoiceHTML } from './template.js';
import { printInvoice as printService } from './print.service.js';
import { generatePDF as pdfService } from './pdf.service.js';
import { generateImage as imageService } from './image.service.js';

// ============================================
// إعدادات الفاتورة العامة
// ============================================
const INVOICE_CONFIG = {
  // إعدادات الطباعة
  print: {
    paperSize: 'A4',
    orientation: 'portrait',
    margin: '10mm',
    scale: 1
  },
  // إعدادات PDF
  pdf: {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: 'فاتورة',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  },
  // إعدادات الصورة
  image: {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true
  }
};

// ============================================
// دالة لاستخراج بيانات الفاتورة من الطلب
// ============================================
export function extractInvoiceData(order) {
  if (!order) return null;

  // بناء صفوف المنتجات
  const cartRows = (order.items || []).map(item => `
    <tr>
      <td>${escapeHtml(item.name || '-')}</td>
      <td>${escapeHtml(item.barcode || '-')}</td>
      <td>${escapeHtml(item.description || '-')}</td>
      <td>${item.quantity || 0}</td>
      <td>${(item.price || 0).toFixed(2)}</td>
      <td>${(item.discount || 0).toFixed(2)}</td>
      <td>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  // حساب الإجماليات
  const subtotal = (order.items || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const discountValue = order.discount || 0;
  const discountType = order.discountType || 'fixed';
  
  let discount = discountValue;
  if (discountType === 'percent') {
    discount = (subtotal * discountValue) / 100;
  }
  
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.15; // 15% ضريبة
  const total = afterDiscount + tax;

  const totals = {
    subtotal: subtotal.toFixed(2) + ' ريال',
    discount: discount.toFixed(2) + ' ريال',
    tax: tax.toFixed(2) + ' ريال',
    total: total.toFixed(2) + ' ريال'
  };

  return { cartRows, totals };
}

// ============================================
// دالة مساعدة لتنظيف النص من الـ HTML
// ============================================
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================
// دالة إنشاء عنصر الفاتورة (مخفي)
// ============================================
export function createInvoiceElement(order, customStyles = null) {
  if (!order || !order.items) {
    console.error('بيانات الطلب غير مكتملة');
    return null;
  }

  const { cartRows, totals } = extractInvoiceData(order);
  const invoiceHTML = buildInvoiceHTML(order, cartRows, totals);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = invoiceHTML;
  
  // تطبيق أنماط إضافية إذا وجدت
  if (customStyles) {
    const style = document.createElement('style');
    style.textContent = customStyles;
    wrapper.appendChild(style);
  }
  
  // إخفاء العنصر في الصفحة
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.opacity = '0';
  wrapper.style.pointerEvents = 'none';
  
  document.body.appendChild(wrapper);
  
  // إرجاع العنصر الرئيسي للفاتورة
  return wrapper.firstElementChild;
}

// ============================================
// دالة إزالة عنصر الفاتورة
// ============================================
export function removeInvoiceElement(element) {
  if (element && element.parentElement) {
    element.parentElement.remove();
  }
}

// ============================================
// دالة تحسين الفاتورة للطباعة
// ============================================
export function optimizeForPrinting(element) {
  if (!element) return;
  
  // إضافة كلاسات خاصة للطباعة
  element.classList.add('printing-mode');
  
  // إضافة أنماط تحسين الطباعة بشكل ديناميكي
  const printStyles = `
    .printing-mode {
      margin: 0 !important;
      padding: 0.5cm !important;
      background: white !important;
    }
    .printing-mode .products-table {
      page-break-inside: avoid !important;
    }
    .printing-mode .products-table tr {
      page-break-inside: avoid !important;
      page-break-after: auto !important;
    }
    .printing-mode .invoice-parties,
    .printing-mode .payment-shipping,
    .printing-mode .totals-wrapper {
      page-break-inside: avoid !important;
    }
    @media print {
      .printing-mode {
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0.5cm !important;
      }
      .printing-mode .company-logo {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }
      .printing-mode .invoice-from,
      .printing-mode .invoice-to,
      .printing-mode .payment-shipping,
      .printing-mode .totals-wrapper {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }
    }
  `;
  
  const styleTag = document.createElement('style');
  styleTag.textContent = printStyles;
  element.appendChild(styleTag);
}

// ============================================
// دالة معاينة الفاتورة قبل الطباعة
// ============================================
export function previewInvoice(order, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('الحاوية المحددة غير موجودة');
    return null;
  }
  
  const { cartRows, totals } = extractInvoiceData(order);
  const invoiceHTML = buildInvoiceHTML(order, cartRows, totals);
  
  container.innerHTML = invoiceHTML;
  container.classList.add('invoice-preview-mode');
  
  // إضافة أزرار تحكم في المعاينة
  const controls = document.createElement('div');
  controls.className = 'preview-controls no-print';
  controls.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; justify-content: center;';
  controls.innerHTML = `
    <button onclick="window.printInvoiceFromPreview('${order.id}')" class="btn-print" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
      🖨️ طباعة
    </button>
    <button onclick="window.exportPDFFromPreview('${order.id}')" class="btn-pdf" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">
      📄 PDF
    </button>
    <button onclick="window.exportImageFromPreview('${order.id}')" class="btn-png" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;">
      🖼️ صورة
    </button>
  `;
  container.appendChild(controls);
  
  return container;
}

// ============================================
// دالة طباعة مباشرة مع تحسين التنسيق
// ============================================
export async function printInvoice(order, options = {}) {
  if (!order || !order.items) {
    console.error('بيانات الطلب غير مكتملة للطباعة');
    return false;
  }
  
  try {
    // إظهار مؤشر التحميل
    showLoadingIndicator('جاري تجهيز الفاتورة للطباعة...');
    
    // إنشاء عنصر الفاتورة
    const element = createInvoiceElement(order);
    if (!element) throw new Error('فشل في إنشاء الفاتورة');
    
    // تحسين الفاتورة للطباعة
    optimizeForPrinting(element);
    
    // انتظار تحميل الصور
    await waitForImages(element);
    
    // طباعة باستخدام الخدمة
    await printService(element);
    
    // إزالة العنصر بعد الطباعة
    removeInvoiceElement(element);
    
    // إخفاء مؤشر التحميل
    hideLoadingIndicator();
    
    return true;
  } catch (error) {
    console.error('خطأ في الطباعة:', error);
    hideLoadingIndicator();
    showToast('حدث خطأ أثناء الطباعة', 'error');
    return false;
  }
}

// ============================================
// دالة تصدير PDF مع تحسين التنسيق
// ============================================
export async function exportPDF(order, customConfig = null) {
  if (!order || !order.items) {
    console.error('بيانات الطلب غير مكتملة للتصدير');
    return false;
  }
  
  try {
    showLoadingIndicator('جاري تحويل الفاتورة إلى PDF...');
    
    const element = createInvoiceElement(order);
    if (!element) throw new Error('فشل في إنشاء الفاتورة');
    
    // انتظار تحميل الصور
    await waitForImages(element);
    
    // دمج الإعدادات المخصصة مع الإعدادات الافتراضية
    const config = { ...INVOICE_CONFIG.pdf, ...customConfig };
    config.filename = `فاتورة_${order.orderNumber || order.id}.pdf`;
    
    await pdfService(element, config);
    
    removeInvoiceElement(element);
    hideLoadingIndicator();
    
    showToast('تم تصدير PDF بنجاح', 'success');
    return true;
  } catch (error) {
    console.error('خطأ في تصدير PDF:', error);
    hideLoadingIndicator();
    showToast('حدث خطأ أثناء تصدير PDF', 'error');
    return false;
  }
}

// ============================================
// دالة تصدير صورة مع تحسين التنسيق
// ============================================
export async function exportImage(order, customConfig = null) {
  if (!order || !order.items) {
    console.error('بيانات الطلب غير مكتملة للتصدير');
    return false;
  }
  
  try {
    showLoadingIndicator('جاري تحويل الفاتورة إلى صورة...');
    
    const element = createInvoiceElement(order);
    if (!element) throw new Error('فشل في إنشاء الفاتورة');
    
    // انتظار تحميل الصور
    await waitForImages(element);
    
    // دمج الإعدادات المخصصة مع الإعدادات الافتراضية
    const config = { ...INVOICE_CONFIG.image, ...customConfig };
    
    await imageService(element, order, config);
    
    removeInvoiceElement(element);
    hideLoadingIndicator();
    
    showToast('تم تصدير الصورة بنجاح', 'success');
    return true;
  } catch (error) {
    console.error('خطأ في تصدير الصورة:', error);
    hideLoadingIndicator();
    showToast('حدث خطأ أثناء تصدير الصورة', 'error');
    return false;
  }
}

// ============================================
// دالة تصدير جميع الصيغ (طباعة، PDF، صورة)
// ============================================
export async function exportAllFormats(order) {
  const results = {
    print: false,
    pdf: false,
    image: false
  };
  
  results.print = await printInvoice(order);
  results.pdf = await exportPDF(order);
  results.image = await exportImage(order);
  
  return results;
}

// ============================================
// دالة انتظار تحميل الصور
// ============================================
function waitForImages(element) {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  return Promise.all(promises);
}

// ============================================
// دالة إظهار مؤشر التحميل
// ============================================
function showLoadingIndicator(message = 'جاري المعالجة...') {
  let overlay = document.getElementById('invoiceLoadingOverlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'invoiceLoadingOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      direction: rtl;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 20px;
      text-align: center;
      min-width: 250px;
    `;
    
    content.innerHTML = `
      <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
      <p id="loadingMessage" style="margin: 0; color: #333;">${message}</p>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = 'flex';
    const msgElement = overlay.querySelector('#loadingMessage');
    if (msgElement) msgElement.textContent = message;
  }
}

// ============================================
// دالة إخفاء مؤشر التحميل
// ============================================
function hideLoadingIndicator() {
  const overlay = document.getElementById('invoiceLoadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// ============================================
// دالة إظهار رسالة للمستخدم
// ============================================
function showToast(message, type = 'success') {
  let toast = document.getElementById('invoiceToast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'invoiceToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 12px 24px;
      border-radius: 9999px;
      z-index: 100000;
      display: none;
      direction: rtl;
      font-size: 14px;
    `;
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ============================================
// تصدير الدوال الرئيسية للاستخدام الخارجي
// ============================================
export default {
  extractInvoiceData,
  createInvoiceElement,
  removeInvoiceElement,
  optimizeForPrinting,
  previewInvoice,
  printInvoice,
  exportPDF,
  exportImage,
  exportAllFormats,
  INVOICE_CONFIG
};
    return wrapper.firstElementChild;
}

// دوال رئيسية للاستخدام في الصفحات
export async function handlePrint(order, cartRows, totals) {
    const el = createInvoiceElement(order, cartRows, totals);
    await printInvoice(el);
    el.parentElement.remove();
}

export async function handlePDF(order, cartRows, totals) {
    const el = createInvoiceElement(order, cartRows, totals);
    await generatePDF(el, order);
    el.parentElement.remove();
}

export async function handleImage(order, cartRows, totals) {
    const el = createInvoiceElement(order, cartRows, totals);
    await generateImage(el, order);
    el.parentElement.remove();
}
