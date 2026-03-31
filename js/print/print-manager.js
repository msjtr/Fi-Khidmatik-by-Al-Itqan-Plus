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
    document.body.appendChild(wrapper);
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
