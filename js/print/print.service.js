// js/print/print.service.js

export async function printInvoice(element) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    return new Promise((resolve, reject) => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('لا يمكن فتح نافذة الطباعة');
            }
            
            // جمع جميع الأنماط من الصفحة الرئيسية
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else if (style.tagName === 'LINK' && style.href) {
                    // تحويل المسارات النسبية إلى مطلقة
                    let href = style.href;
                    if (!href.startsWith('http') && !href.startsWith('//')) {
                        href = window.location.origin + (href.startsWith('/') ? href : '/' + href);
                    }
                    stylesHTML += `<link rel="stylesheet" href="${href}">`;
                }
            });
            
            // أنماط إضافية محسنة للطباعة والشعار
            const additionalStyles = `
                <style>
                    /* تنسيق الشعار */
                    .logo-circle {
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, #1e3a8a, #3b82f6);
                        border-radius: 50%;
                        margin: 0 auto 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    .logo-circle img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        display: block;
                    }
                    
                    /* إصلاح المسارات النسبية للصور */
                    img[src^="/"] {
                        src: attr(src url);
                    }
                    
                    /* تنسيق عام */
                    body {
                        padding: 20px;
                        margin: 0;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                        background: white;
                    }
                    
                    /* تنسيق الفاتورة */
                    .invoice {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 20px;
                    }
                    
                    /* إخفاء أزرار الطباعة */
                    .buttons, .no-print {
                        display: none !important;
                    }
                    
                    /* إعدادات الطباعة */
                    @media print {
                        body {
                            padding: 0;
                            margin: 0;
                        }
                        .invoice {
                            margin: 0;
                            padding: 15px;
                        }
                        .logo-circle {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        .logo-circle img {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                </style>
            `;
            
            // الحصول على HTML الفاتورة مع إصلاح المسارات
            let invoiceHTML = element.outerHTML;
            
            // إصلاح مسارات الصور النسبية لتصبح مطلقة
            invoiceHTML = invoiceHTML.replace(/src="\/([^"]+)"/g, (match, path) => {
                return `src="${window.location.origin}/${path}"`;
            });
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>طباعة فاتورة</title>
                    <base href="${window.location.origin}/">
                    ${stylesHTML}
                    ${additionalStyles}
                </head>
                <body>
                    ${invoiceHTML}
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px;">🖨️ طباعة</button>
                        <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; cursor: pointer; background: #ef4444; color: white; border: none; border-radius: 5px;">❌ إغلاق</button>
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // انتظار تحميل جميع الموارد
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    resolve(true);
                }, 800);
            };
            
            // معالجة الأخطاء
            printWindow.onerror = (error) => {
                console.error('خطأ في نافذة الطباعة:', error);
                reject(new Error('حدث خطأ أثناء تحميل نافذة الطباعة'));
            };
            
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            reject(error);
        }
    });
}
