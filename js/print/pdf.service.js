// js/print/pdf.service.js
import jsPDF from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
import html2canvas from 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

/**
 * تحويل عنصر HTML إلى PDF
 * @param {string|HTMLElement} element - العنصر المراد تحويله (id أو عنصر DOM)
 * @param {string} filename - اسم ملف PDF
 * @returns {Promise<void>}
 */
export async function generatePDF(element, filename = 'document.pdf') {
    try {
        // الحصول على العنصر
        const targetElement = typeof element === 'string' 
            ? document.getElementById(element) 
            : element;
        
        if (!targetElement) {
            throw new Error('العنصر المطلوب غير موجود');
        }

        // انتظار تحميل الصور والخطوط
        await waitForImagesAndFonts(targetElement);
        
        // إضافة كلاس خاص للطباعة مؤقتاً
        targetElement.classList.add('pdf-printing');
        
        // إنشاء صورة من العنصر
        const canvas = await html2canvas(targetElement, {
            scale: 3,                    // دقة عالية
            useCORS: true,               // دعم الصور من مصادر خارجية
            logging: false,
            windowWidth: targetElement.scrollWidth,
            windowHeight: targetElement.scrollHeight,
            backgroundColor: '#ffffff'
        });
        
        // إزالة كلاس الطباعة المؤقت
        targetElement.classList.remove('pdf-printing');
        
        // إعدادات PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageNumber = 1;
        
        // إضافة الصفحة الأولى
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // إضافة صفحات إضافية إذا كان المحتوى أطول من صفحة واحدة
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
            pageNumber++;
        }
        
        // حفظ الملف
        pdf.save(filename);
        
        return { success: true, pages: pageNumber };
        
    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        throw error;
    }
}

/**
 * انتظار تحميل جميع الصور والخطوط
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
function waitForImagesAndFonts(element) {
    const images = Array.from(element.querySelectorAll('img'));
    const promises = images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    
    // انتظار تحميل الخطوط (إذا كانت مخصصة)
    if (document.fonts && document.fonts.ready) {
        promises.push(document.fonts.ready);
    }
    
    return Promise.all(promises);
}

/**
 * طباعة عنصر مباشرة
 * @param {string|HTMLElement} element 
 */
export async function printElement(element) {
    const targetElement = typeof element === 'string' 
        ? document.getElementById(element) 
        : element;
    
    if (!targetElement) {
        throw new Error('العنصر المطلوب غير موجود');
    }
    
    const originalTitle = document.title;
    document.title = 'طباعة';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>طباعة</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            ${targetElement.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    
    document.title = originalTitle;
}

// تصدير افتراضي للاستخدام البديل
export default {
    generatePDF,
    printElement
};
