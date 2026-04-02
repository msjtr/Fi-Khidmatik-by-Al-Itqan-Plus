// js/print/pdf.service.js

export async function generatePDF(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    showLoadingMessage('جاري إنشاء ملف PDF...');
    
    try {
        // إنشاء نسخة من العنصر
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        originalElement.style.margin = '0 auto';
        originalElement.style.boxSizing = 'border-box';
        
        // ضمان عرض كامل المحتوى
        originalElement.style.width = '100%';
        originalElement.style.maxWidth = '1100px';
        
        // تحويل جميع الصور إلى Base64 لضمان ظهورها في PDF
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src) {
                try {
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) {
                        img.src = base64;
                    }
                } catch (error) {
                    console.warn('فشل تحويل الصورة إلى Base64:', img.src, error);
                    if (img.src.includes('logo.svg') || img.src.includes('/images/')) {
                        const fallbackLogo = getFallbackLogo();
                        img.src = fallbackLogo;
                        img.style.width = '50px';
                        img.style.height = '50px';
                    }
                }
            }
        }
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '1100px'; // عرض ثابت للحفاظ على التنسيق
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        // انتظار تحميل جميع الصور
        await waitForImages(tempContainer);
        
        // انتظار إضافي لضمان اكتمال التحميل
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // حساب الأبعاد المناسبة للـ canvas
        const containerWidth = tempContainer.offsetWidth;
        const containerHeight = tempContainer.offsetHeight;
        
        const canvas = await html2canvas(tempContainer, {
            scale: 2.5, // دقة عالية مع توازن في الأداء
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false,
            windowWidth: containerWidth,
            windowHeight: containerHeight,
            onclone: (clonedDoc, element) => {
                const clonedImages = element.querySelectorAll('img');
                clonedImages.forEach(img => {
                    if (img.src && img.src.includes('data:image/svg')) {
                        img.style.width = '50px';
                        img.style.height = '50px';
                    }
                });
            }
        });
        
        document.body.removeChild(tempContainer);
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;
        
        // إعداد PDF بحجم A4 مع هوامش مناسبة
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // حساب أبعاد الصورة مع الحفاظ على النسبة
        let imgWidth = pageWidth - 20; // هامش 10mm من كل جانب
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // إذا كانت الصورة أطول من الصفحة، قم بتقسيمها إلى صفحات متعددة
        let position = 10; // هامش علوي 10mm
        let heightLeft = imgHeight;
        
        // إضافة الصفحة الأولى
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20); // طرح ارتفاع الصفحة مع الهوامش
        
        // إضافة صفحات إضافية إذا لزم الأمر
        let pageNumber = 2;
        while (heightLeft > 0) {
            position = heightLeft - imgHeight - 10;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);
            pageNumber++;
        }
        
        // إضافة أرقام الصفحات إذا كان هناك أكثر من صفحة
        if (pageNumber > 2) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`صفحة ${i} من ${totalPages}`, pageWidth - 20, pageHeight - 5, { align: 'center' });
            }
        }
        
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
        hideLoadingMessage();
        showSuccessMessage('تم حفظ PDF بنجاح');
        return true;
        
    } catch (error) {
        console.error('خطأ في PDF:', error);
        hideLoadingMessage();
        showErrorMessage('حدث خطأ أثناء إنشاء PDF');
        throw error;
    }
}

/**
 * تحويل الصورة إلى Base64 مع تحسين للصور الكبيرة
 */
async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        if (url.startsWith('data:')) {
            resolve(url);
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        const timeout = setTimeout(() => {
            reject(new Error('انتهى وقت تحميل الصورة'));
        }, 10000);
        
        img.onload = () => {
            clearTimeout(timeout);
            try {
                // تقليل حجم الصورة إذا كانت كبيرة جداً
                let width = img.width;
                let height = img.height;
                const maxSize = 500;
                
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/png');
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`فشل تحميل الصورة: ${url}`));
        };
        
        img.src = url;
    });
}

/**
 * الحصول على صورة احتياطية للشعار
 */
function getFallbackLogo() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%233b82f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3Eف%3C/text%3E%3C/svg%3E";
}

/**
 * انتظار تحميل جميع الصور مع مهلة زمنية
 */
async function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth !== 0) {
                resolve();
                return;
            }
            
            const timeout = setTimeout(() => {
                console.warn('انتهاء وقت تحميل الصورة:', img.src);
                resolve();
            }, 8000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                console.warn('فشل تحميل الصورة:', img.src);
                resolve();
            };
        });
    });
    
    await Promise.all(promises);
}

/**
 * عرض رسالة التحميل
 */
function showLoadingMessage(message) {
    let loadingDiv = document.getElementById('pdf-loading-message');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'pdf-loading-message';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 16px;
            text-align: center;
            direction: rtl;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            min-width: 250px;
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:10px;"><div class="pdf-spinner"></div></div>`;
    
    // إضافة أنماط الـ spinner إذا لم تكن موجودة
    if (!document.querySelector('#pdf-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'pdf-spinner-style';
        style.textContent = `
            .pdf-spinner {
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                animation: pdf-spin 1s linear infinite;
                margin: 0 auto;
            }
            @keyframes pdf-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    loadingDiv.style.display = 'block';
}

/**
 * إخفاء رسالة التحميل
 */
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('pdf-loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

/**
 * عرض رسالة نجاح مؤقتة
 */
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10001;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-align: center;
        direction: rtl;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideInOut 3s ease-in-out forwards;
    `;
    successDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(successDiv);
    
    // إضافة أنماط الحركة
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInOut {
            0% { opacity: 0; transform: translateX(20px); }
            15% { opacity: 1; transform: translateX(0); }
            85% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(20px); display: none; }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * عرض رسالة خطأ مؤقتة
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10001;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-align: center;
        direction: rtl;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideInOut 3s ease-in-out forwards;
    `;
    errorDiv.innerHTML = `❌ ${message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
