// js/print/pdf.service.js

// تحميل المكتبات مباشرة
const script1 = document.createElement('script');
script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
document.head.appendChild(script2);

// انتظار تحميل المكتبات
function waitForLibraries() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (window.html2canvas && window.jspdf) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

/**
 * إنشاء PDF من عنصر HTML
 */
export async function generatePDF(elementId, filename = 'document.pdf') {
    try {
        // انتظار تحميل المكتبات
        await waitForLibraries();
        
        // الحصول على العنصر
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error('العنصر غير موجود: ' + elementId);
        }
        
        // إظهار رسالة للمستخدم
        showLoadingMessage('جاري إنشاء PDF...');
        
        // تحويل العنصر إلى صورة
        const canvas = await window.html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });
        
        // تحويل الصورة إلى PDF
        const imgData = canvas.toDataURL('image/png');
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
        
        // إضافة الصورة إلى PDF
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // إضافة صفحات إضافية إذا لزم الأمر
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        // حفظ الملف
        pdf.save(filename);
        
        // إخفاء رسالة التحميل
        hideLoadingMessage();
        
        return true;
        
    } catch (error) {
        console.error('خطأ في إنشاء PDF:', error);
        hideLoadingMessage();
        alert('حدث خطأ: ' + error.message);
        throw error;
    }
}

// دالة لإظهار رسالة التحميل
function showLoadingMessage(message) {
    let loadingDiv = document.getElementById('pdf-loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'pdf-loading';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            text-align: center;
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = message + '<br><div style="margin-top:10px;">⏳</div>';
    loadingDiv.style.display = 'block';
}

// دالة لإخفاء رسالة التحميل
function hideLoadingMessage() {
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

export default { generatePDF };
