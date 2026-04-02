// js/print/pdf.service.js

export async function generatePDF(element, order) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }

    showLoadingMessage('جاري إنشاء ملف PDF...');

    try {
        // ===== تجهيز العنصر =====
        const originalElement = element.cloneNode(true);

        Object.assign(originalElement.style, {
            padding: '20px',
            backgroundColor: '#ffffff',
            margin: '0 auto',
            boxSizing: 'border-box',
            width: '794px'
        });

        // ===== تحسين الصور =====
        const images = originalElement.querySelectorAll('img');

        for (const img of images) {
            if (!img.src) continue;

            try {
                const base64 = await convertImageToBase64(img.src);
                if (base64) img.src = base64;
            } catch (error) {
                console.warn('فشل تحويل الصورة:', img.src);
                img.src = getFallbackLogo();
            }
        }

        // ===== عنصر مؤقت =====
        const tempContainer = document.createElement('div');

        Object.assign(tempContainer.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '794px',
            backgroundColor: '#ffffff'
        });

        tempContainer.appendChild(originalElement);
        document.body.appendChild(tempContainer);

        await waitForImages(tempContainer);

        // ===== تحويل Canvas =====
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false
        });

        document.body.removeChild(tempContainer);

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const imgWidth = pageWidth - (margin * 2);

        // ===== تقسيم الصفحات =====
        const pageHeightPx = (canvas.width * pageHeight) / pageWidth;

        let y = 0;
        let page = 1;

        while (y < canvas.height) {

            const pageCanvas = document.createElement('canvas');
            const ctx = pageCanvas.getContext('2d');

            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(pageHeightPx, canvas.height - y);

            ctx.drawImage(
                canvas,
                0, y,
                canvas.width, pageCanvas.height,
                0, 0,
                canvas.width, pageCanvas.height
            );

            const imgData = pageCanvas.toDataURL('image/png');

            if (page > 1) pdf.addPage();

            const imgHeight = (pageCanvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

            y += pageHeightPx;
            page++;
        }

        // ===== ترقيم الصفحات =====
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(120);
            pdf.text(
                `صفحة ${i} من ${totalPages}`,
                pageWidth / 2,
                pageHeight - 5,
                { align: 'center' }
            );
        }

        // ===== اسم الملف =====
        const orderNumber = order?.orderNumber || order?.id || 'invoice';

        const fileName = `invoice_${orderNumber}_${Date.now()}.pdf`;

        pdf.save(fileName);

        hideLoadingMessage();
        showSuccessMessage('تم حفظ PDF بنجاح');

    } catch (error) {
        console.error(error);
        hideLoadingMessage();
        showErrorMessage('خطأ أثناء إنشاء PDF');
    }
}
