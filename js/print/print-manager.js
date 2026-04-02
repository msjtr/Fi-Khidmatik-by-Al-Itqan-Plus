```javascript
// js/print/print-manager.js

import { buildInvoiceHTML } from './template.js';
import { printInvoice } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

/* حماية النص */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* إنشاء عنصر مؤقت */
function createTempElement(order, cartRows, totals) {
    const container = document.createElement('div');

    container.innerHTML = buildInvoiceHTML(order, cartRows, totals);

    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';

    document.body.appendChild(container);

    return {
        container,
        element: container.firstElementChild
    };
}

/* تجهيز البيانات */
function prepareData(order) {

    if (!order.items || !Array.isArray(order.items)) {
        order.items = [];
    }

    const cartRows = order.items.map(item => `
        <tr>
            <td>${escapeHtml(item.name || '-')}</td>
            <td>${escapeHtml(item.barcode || '-')}</td>
            <td>${escapeHtml(item.description || '-')}</td>
            <td>${item.quantity || 0}</td>
            <td>${(item.price || 0).toFixed(2)}</td>
            <td>0</td>
            <td><strong>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</strong></td>
        </tr>
    `).join('');

    const subtotal = order.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

    let discountValue = order.discount || 0;

    if (order.discountType === 'percent' && discountValue > 0) {
        discountValue = (subtotal * discountValue) / 100;
    }

    const afterDiscount = subtotal - discountValue;
    const tax = afterDiscount * 0.15;
    const total = afterDiscount + tax;

    return {
        cartRows,
        totals: {
            subtotal: subtotal.toFixed(2) + ' ريال',
            discount: discountValue.toFixed(2) + ' ريال',
            tax: tax.toFixed(2) + ' ريال',
            total: total.toFixed(2) + ' ريال'
        }
    };
}

/* تحقق */
function validateOrder(order) {
    if (!order) throw new Error('الطلب غير موجود');
    return true;
}

/* تنظيف آمن */
function cleanup(container) {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}

/* طباعة */
export async function printInvoiceHandler(order) {
    let temp;

    try {
        validateOrder(order);

        const { cartRows, totals } = prepareData(order);
        temp = createTempElement(order, cartRows, totals);

        await printInvoice(temp.element);

    } catch (error) {
        console.error(error);
        alert('خطأ في الطباعة');
    } finally {
        cleanup(temp?.container);
    }
}

/* PDF */
export async function exportAsPDF(order) {
    let temp;

    try {
        validateOrder(order);

        const { cartRows, totals } = prepareData(order);
        temp = createTempElement(order, cartRows, totals);

        await generatePDF(temp.element, order);

    } catch (error) {
        console.error(error);
        alert('خطأ في PDF');
    } finally {
        cleanup(temp?.container);
    }
}

/* صورة */
export async function exportAsImage(order) {
    let temp;

    try {
        validateOrder(order);

        const { cartRows, totals } = prepareData(order);
        temp = createTempElement(order, cartRows, totals);

        await generateImage(temp.element, order);

    } catch (error) {
        console.error(error);
        alert('خطأ في الصورة');
    } finally {
        cleanup(temp?.container);
    }
}
```
