import { buildInvoiceHTML } from './template.js';
import { printInvoice } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

function createTempElement(order, cartRows, totals) {
  const div = document.createElement('div');
  div.innerHTML = buildInvoiceHTML(order, cartRows, totals);
  div.style.position = 'fixed';
  div.style.top = '-9999px';
  div.style.left = '-9999px';
  document.body.appendChild(div);
  return div.firstElementChild;
}

function prepareData(order) {
  const cartRows = order.items.map(item => `
    <tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.barcode || '-')}</td><td>${escapeHtml(item.description || '-')}</td>
    <td>${item.quantity}</td><td>${item.price.toFixed(2)}</td><td>0</td><td>${(item.price * item.quantity).toFixed(2)}</td></tr>
  `).join('');
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = order.discount || 0;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.15;
  const total = afterDiscount + tax;
  const totals = {
    subtotal: subtotal.toFixed(2) + ' ريال',
    discount: discount.toFixed(2) + ' ريال',
    tax: tax.toFixed(2) + ' ريال',
    total: total.toFixed(2) + ' ريال'
  };
  return { cartRows, totals };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

export async function printInvoiceHandler(order) {
  const { cartRows, totals } = prepareData(order);
  const el = createTempElement(order, cartRows, totals);
  await printInvoice(el);
  el.parentElement.remove();
}

export async function exportAsPDF(order) {
  const { cartRows, totals } = prepareData(order);
  const el = createTempElement(order, cartRows, totals);
  await generatePDF(el, order);
  el.parentElement.remove();
}

export async function exportAsImage(order) {
  const { cartRows, totals } = prepareData(order);
  const el = createTempElement(order, cartRows, totals);
  await generateImage(el, order);
  el.parentElement.remove();
}
