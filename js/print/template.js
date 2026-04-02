// js/print/print-manager.js

import { buildInvoiceHTML } from './template.js';
import { printInvoice } from './print.service.js';
import { generatePDF } from './pdf.service.js';
import { generateImage } from './image.service.js';

/**
 * دالة لتأمين النصوص ومنع تنفيذ الأكواد الخبيثة
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * إنشاء عنصر مؤقت للفاتورة (مخفي في الصفحة)
 */
function createTempElement(order, cartRows, totals) {
    const div = document.createElement('div');
    div.innerHTML = buildInvoiceHTML(order, cartRows, totals);
    div.style.position = 'fixed';
    div.style.top = '-9999px';
    div.style.left = '-9999px';
    div.style.opacity = '0';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '-9999';
    document.body.appendChild(div);
    return div.firstElementChild;
}

/**
 * تجهيز بيانات الفاتورة (صفوف المنتجات والإجماليات)
 * مع التحقق من صحة البيانات
 */
function prepareData(order) {
    // التحقق من وجود المنتجات
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        console.warn('لا توجد منتجات في الطلب');
        order.items = [];
    }
    
    // بناء صفوف المنتجات مع التحقق من وجود الصور
    const cartRows = order.items.map(item => {
        const itemName = escapeHtml(item.name || '-');
        const itemBarcode = escapeHtml(item.barcode || '-');
        const itemQuantity = item.quantity || 0;
        const itemPrice = (item.price || 0).toFixed(2);
        const itemTotal = ((item.price || 0) * (item.quantity || 0)).toFixed(2);
        
        // معالجة الصورة - التحقق من صحة الرابط
        let imageHtml = '<span style="color:#999;">-</span>';
        if (item.image && item.image.trim() !== '') {
            imageHtml = `<img src="${escapeHtml(item.image)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:#999;\\'>-</span>';">`;
        }
        
        return `
            <tr>
                <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: right;">${itemName}</td>
                <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: center;">${imageHtml}</td>
                <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: center;">${itemBarcode}</td>
                <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: center;">${itemQuantity}</td>
                <td style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left;">${itemPrice} ريال</td>
            </tr>
        `;
    }).join('');
    
    // حساب الإجماليات مع التحقق من الأرقام
    const subtotal = order.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
    const discount = order.discount || 0;
    let discountValue = discount;
    
    if (order.discountType === 'percent' && discount > 0) {
        discountValue = (subtotal * discount) / 100;
    }
    
    const afterDiscount = Math.max(0, subtotal - discountValue);
    const tax = afterDiscount * 0.15;
    const total = afterDiscount + tax;
    
    const totals = {
        subtotal: subtotal.toFixed(2) + ' ريال',
        discount: discountValue.toFixed(2) + ' ريال',
        tax: tax.toFixed(2) + ' ريال',
        total: total.toFixed(2) + ' ريال'
    };
    
    return { cartRows, totals };
}

/**
 * عرض رسالة خطأ للمستخدم
 */
function showErrorToast(message) {
    // محاولة استخدام toast إذا كان موجوداً في الصفحة
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-full shadow-lg text-white z-50 bg-red-500';
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    } else {
        // استخدام alert كحل احتياطي
        alert(message);
    }
}

/**
 * طباعة الفاتورة
 */
export async function printInvoiceHandler(order) {
    if (!order) {
        console.error('الطلب غير موجود');
        showErrorToast('الطلب غير موجود');
        return;
    }
    
    try {
        const { cartRows, totals } = prepareData(order);
        const el = createTempElement(order, cartRows, totals);
        await printInvoice(el);
        el.parentElement?.remove();
    } catch (error) {
        console.error('خطأ في الطباعة:', error);
        showErrorToast('حدث خطأ أثناء الطباعة: ' + (error.message || 'خطأ غير معروف'));
    }
}

/**
 * تصدير الفاتورة كـ PDF
 */
export async function exportAsPDF(order) {
    if (!order) {
        console.error('الطلب غير موجود');
        showErrorToast('الطلب غير موجود');
        return;
    }
    
    try {
        const { cartRows, totals } = prepareData(order);
        const el = createTempElement(order, cartRows, totals);
        await generatePDF(el, order);
        el.parentElement?.remove();
    } catch (error) {
        console.error('خطأ في تصدير PDF:', error);
        showErrorToast('حدث خطأ أثناء تصدير PDF: ' + (error.message || 'خطأ غير معروف'));
    }
}

/**
 * تصدير الفاتورة كصورة PNG
 */
export async function exportAsImage(order) {
    if (!order) {
        console.error('الطلب غير موجود');
        showErrorToast('الطلب غير موجود');
        return;
    }
    
    try {
        const { cartRows, totals } = prepareData(order);
        const el = createTempElement(order, cartRows, totals);
        await generateImage(el, order);
        el.parentElement?.remove();
    } catch (error) {
        console.error('خطأ في تصدير الصورة:', error);
        showErrorToast('حدث خطأ أثناء تصدير الصورة: ' + (error.message || 'خطأ غير معروف'));
    }
}

// تصدير الدوال المساعدة إذا لزم الأمر
export { escapeHtml };
