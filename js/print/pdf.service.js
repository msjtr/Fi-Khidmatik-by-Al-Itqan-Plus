// js/print/pdf.service.js

export async function generatePDF(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }
    
    // إظهار رسالة انتظار
    showLoadingMessage('جاري إنشاء ملف PDF...');
    
    try {
        // إنشاء نسخة مؤقتة من العنصر للحفاظ على التنسيق
        const originalElement = element.cloneNode(true);
        
        // إضافة تنسيقات إضافية
        originalElement.style.padding = '20px';
        originalElement.style.backgroundColor = '#ffffff';
        originalElement.style.width = '100%';
        
        // إنشاء حاوية مؤقتة
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);
        
        // انتظار تحميل الصور
        await waitForImages(tempContainer);
        
        // استخدام html2canvas لتحويل العنصر إلى صورة
        const canvas = await html2canvas(tempContainer, {
            scale: 3,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            windowWidth: originalElement.scrollWidth,
            windowHeight: originalElement.scrollHeight
        });
        
        // إزالة الحاوية المؤقتة
        document.body.removeChild(tempContainer);
        
        // تحويل الصورة إلى PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const { jsPDF } = window.jspdf;
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
        
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // إضافة صفحات إضافية إذا كان المحتوى أطول
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        // حفظ الملف
        const fileName = `فاتورة_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
        hideLoadingMessage();
        return true;
        
    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        hideLoadingMessage();
        throw error;
    }
}

function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    return Promise.all(promises);
}

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
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `${message}<br><div style="margin-top:10px;">⏳</div>`;
    loadingDiv.style.display = 'block';
}

function hideLoadingMessage() {
    const loadingDiv = document.getElementById('pdf-loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}
