// js/print/image.service.js

export async function generateImage(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    showLoadingMessage('جاري إنشاء الصورة...');
    
    try {
        // إنشاء نسخة من العنصر
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        
        // تحويل جميع الصور إلى Base64 لضمان ظهورها في الصورة
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src) {
                try {
                    // محاولة تحويل الصورة إلى Base64
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) {
                        img.src = base64;
                    }
                } catch (error) {
                    console.warn('فشل تحويل الصورة إلى Base64:', img.src, error);
                    // في حالة فشل تحميل الشعار، استخدم الصورة الاحتياطية
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
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        await waitForImages(tempContainer);
        
        const canvas = await html2canvas(tempContainer, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false,
            onclone: (clonedDoc, element) => {
                // إصلاح أي مشاكل في SVG في النسخة المستنسخة
                const clonedImages = element.querySelectorAll('img');
                clonedImages.forEach(img => {
                    if (img.src && img.src.includes('data:image/svg')) {
                        img.style.width = '50px';
                        img.style.height = '50px';
                        img.style.display = 'block';
                    }
                });
            }
        });
        
        document.body.removeChild(tempContainer);
        
        // حفظ الصورة
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        hideLoadingMessage();
        
        // عرض رسالة نجاح
        showSuccessMessage('تم حفظ الصورة بنجاح');
        
        return true;
        
    } catch (error) {
        console.error('خطأ في الصورة:', error);
        hideLoadingMessage();
        showErrorMessage('حدث خطأ أثناء إنشاء الصورة');
        throw error;
    }
}

/**
 * تحويل الصورة إلى Base64
 */
async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        // إذا كانت الصورة بالفعل Base64
        if (url.startsWith('data:')) {
            resolve(url);
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const base64 = canvas.toDataURL('image/png');
                resolve(base64);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => {
            reject(new Error(`فشل تحميل الصورة: ${url}`));
        };
        
        img.src = url;
    });
}

/**
 * الحصول على صورة احتياطية (fallback) على شكل SVG
 */
function getFallbackLogo() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%233b82f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='white' font-size='40' font-weight='bold'%3Eف%3C/text%3E%3C/svg%3E";
}

/**
 * انتظار تحميل جميع الصور بشكل صحيح
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
            }, 5000);
            
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
    let loadingDiv = document.getElementById('image-loading-message');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'image-loading-message';
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
            min-width: 200px;
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:10px; font-size: 24px;">🖼️</div>`;
    loadingDiv.style.display = 'block';
}

/**
 * إخفاء رسالة التحميل
 */
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('image-loading-message');
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
        animation: fadeInOut 3s ease-in-out;
    `;
    successDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(successDiv);
    
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
        animation: fadeInOut 3s ease-in-out;
    `;
    errorDiv.innerHTML = `❌ ${message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// إضافة أنماط CSS للرسائل المنبثقة
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(20px); }
        15% { opacity: 1; transform: translateY(0); }
        85% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);
