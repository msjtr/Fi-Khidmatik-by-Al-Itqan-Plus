```javascript
// js/print/image.service.js

export async function generateImage(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }

    showLoadingMessage('جاري إنشاء الصورة...');

    try {
        // نسخ العنصر
        const originalElement = element.cloneNode(true);
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        originalElement.style.margin = '0 auto';
        originalElement.style.boxSizing = 'border-box';

        // 🔥 عرض مناسب A4
        originalElement.style.width = '794px';

        // تحويل الصور Base64
        const images = originalElement.querySelectorAll('img');
        for (const img of images) {
            if (img.src) {
                try {
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) img.src = base64;
                } catch (error) {
                    console.warn('فشل الصورة:', img.src);
                    img.src = getFallbackLogo();
                }
            }
        }

        // container مخفي
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '794px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);

        // انتظار تحميل الصور
        await waitForImages(tempContainer);

        const canvas = await html2canvas(tempContainer, {
            scale: 2, // 🔥 أفضل توازن
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            letterRendering: true,
            onclone: (doc, el) => {
                const imgs = el.querySelectorAll('img');
                imgs.forEach(img => {
                    img.style.display = 'block';
                    img.style.maxWidth = '100%';
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
        showSuccessMessage('تم حفظ الصورة بنجاح');

        return true;

    } catch (error) {
        console.error(error);
        hideLoadingMessage();
        showErrorMessage('خطأ أثناء إنشاء الصورة');
    }
}


// ====== أدوات ======

async function convertImageToBase64(url) {
    return new Promise((resolve, reject) => {
        if (url.startsWith('data:')) return resolve(url);

        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');

            let width = img.width;
            let height = img.height;

            const maxSize = 800;

            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = reject;
        img.src = url;
    });
}

function getFallbackLogo() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%233b82f6'/%3E%3Ctext x='50' y='70' text-anchor='middle' fill='white' font-size='40'%3Eف%3C/text%3E%3C/svg%3E";
}

async function waitForImages(container) {
    const images = container.querySelectorAll('img');

    await Promise.all(Array.from(images).map(img => {
        return new Promise(resolve => {
            if (img.complete) return resolve();
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

function showLoadingMessage(msg) { console.log(msg); }
function hideLoadingMessage() {}
function showSuccessMessage(msg) { console.log(msg); }
function showErrorMessage(msg) { console.error(msg); }
```
