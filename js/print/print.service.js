// js/print/print.service.js

export async function printInvoice(element) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    return new Promise((resolve, reject) => {
        try {
            // حفظ المحتوى الأصلي
            const originalTitle = document.title;
            document.title = 'طباعة فاتورة';
            
            // فتح نافذة الطباعة
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('لا يمكن فتح نافذة الطباعة');
            }
            
            // نسخ محتوى الفاتورة مع التنسيقات
            const invoiceHTML = element.outerHTML;
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else if (style.tagName === 'LINK') {
                    stylesHTML += `<link rel="stylesheet" href="${style.href}">`;
                }
            });
            
            // كتابة محتوى نافذة الطباعة
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>فاتورة</title>
                    ${stylesHTML}
                    <style>
                        body {
                            padding: 20px;
                            margin: 0;
                            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                        }
                        .buttons, .no-print {
                            display: none !important;
                        }
                        @media print {
                            body {
                                padding: 0;
                                margin: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${invoiceHTML}
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; margin: 10px;">طباعة</button>
                        <button onclick="window.close()" style="padding: 10px 20px; margin: 10px;">إغلاق</button>
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // انتظار تحميل المحتوى ثم فتح الطباعة
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    resolve(true);
                }, 500);
            };
            
            // استعادة العنوان
            document.title = originalTitle;
            
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            reject(error);
        }
    });
}
