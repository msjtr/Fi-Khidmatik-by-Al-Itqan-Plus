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
            
            // جمع جميع الأنماط من الصفحة الحالية
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';
            
            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else if (style.tagName === 'LINK' && style.href) {
                    // التأكد من تحميل CSS الخاص بالشعار
                    stylesHTML += `<link rel="stylesheet" href="${style.href}">`;
                }
            });
            
            // إضافة أنماط إضافية لضمان ظهور الشعار
            const additionalStyles = `
                <style>
                    /* التأكد من ظهور الشعار بشكل صحيح */
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
                    }
                    
                    /* دعم الصور في الطباعة */
                    @media print {
                        img {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        .logo-circle {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                    
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
                        }
                    }
                </style>
            `;
            
            // الحصول على المسار الصحيح للشعار
            const logoPath = './images/logo.svg';
            
            // استنساخ العنصر وتحديث مسار الصور
            const clonedElement = element.cloneNode(true);
            
            // تحديث مسار الشعار في النسخة المستنسخة
            const logoImg = clonedElement.querySelector('.logo-circle img');
            if (logoImg) {
                logoImg.src = logoPath;
                logoImg.setAttribute('crossorigin', 'anonymous');
            }
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>طباعة فاتورة</title>
                    ${stylesHTML}
                    ${additionalStyles}
                    <base href="${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}">
                </head>
                <body>
                    ${clonedElement.outerHTML}
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; cursor: pointer;">🖨️ طباعة</button>
                        <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; cursor: pointer;">❌ إغلاق</button>
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // انتظار تحميل الصور
            printWindow.onload = () => {
                // انتظار إضافي للصور
                setTimeout(() => {
                    // محاولة تحميل أي صور مفقودة
                    const images = printWindow.document.querySelectorAll('img');
                    let loadedCount = 0;
                    const totalImages = images.length;
                    
                    if (totalImages === 0) {
                        printWindow.focus();
                        printWindow.print();
                        resolve(true);
                        return;
                    }
                    
                    images.forEach(img => {
                        if (img.complete) {
                            loadedCount++;
                            if (loadedCount === totalImages) {
                                printWindow.focus();
                                printWindow.print();
                                resolve(true);
                            }
                        } else {
                            img.onload = () => {
                                loadedCount++;
                                if (loadedCount === totalImages) {
                                    printWindow.focus();
                                    printWindow.print();
                                    resolve(true);
                                }
                            };
                            img.onerror = () => {
                                loadedCount++;
                                if (loadedCount === totalImages) {
                                    printWindow.focus();
                                    printWindow.print();
                                    resolve(true);
                                }
                            };
                        }
                    });
                }, 500);
            };
            
        } catch (error) {
            console.error('خطأ في الطباعة:', error);
            reject(error);
        }
    });
}
