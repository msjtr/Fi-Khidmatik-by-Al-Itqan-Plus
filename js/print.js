// ========================================
// print.js - دوال الطباعة المتقدمة (مع تحسين سرعة الصور)
// ========================================

let printCurrentOrder = null;
let printDb = null;

// دوال مساعدة (بدون تغيير)
window.formatDate = function(dateStr) { /* ... */ };
window.formatTime = function(time24) { /* ... */ };
window.escapeHtml = function(str) { /* ... */ };

const sellerLegal = {
    licenseNumber: "FL-765735204",
    taxNumber: "312495447600003"
};

window.buildHeader = function(title) { /* ... */ };
window.buildFooter = function(pageNum, totalPages) { /* ... */ };

function printShowLoading(msg) { /* ... */ }
function printHideLoading() { /* ... */ }
function printShowToast(msg, isError) { /* ... */ }

function printInvoice() { /* ... */ }

// ========== دالة انتظار الصور مع مهلة ==========
async function waitForImages(element, timeout = 5000) {
    const imgs = Array.from(element.querySelectorAll('img'));
    if (imgs.length === 0) return;
    
    const promises = imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return Promise.race([
            new Promise((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }),
            new Promise((resolve) => setTimeout(resolve, timeout))
        ]);
    });
    await Promise.all(promises);
}

// ========== معاينة الطباعة ==========
function previewPrint() {
    try {
        let pages = document.querySelectorAll('.page');
        if (pages.length === 0) {
            printShowToast('لا توجد صفحات للطباعة!', true);
            return;
        }
        
        // تحويل المسارات النسبية
        pages.forEach(page => {
            let imgs = page.querySelectorAll('img');
            imgs.forEach(img => {
                let src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    if (src.startsWith('/')) {
                        img.src = window.location.origin + src;
                    } else {
                        img.src = window.location.origin + '/fi-khidmatik/' + src;
                    }
                }
            });
        });
        
        let printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,toolbar=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        let pagesContent = '';
        pages.forEach(page => { pagesContent += page.outerHTML; });
        
        let printContent = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>معاينة الفاتورة</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="stylesheet" href="/fi-khidmatik/css/invoice.css">
            <style>/* نفس الأنماط */</style>
        </head><body>${pagesContent}
        <div class="preview-buttons no-print">
            <button class="btn-print" onclick="window.print()">🖨️ طباعة</button>
            <button class="btn-pdf" onclick="window.exportToPDF()">📄 PDF</button>
            <button class="btn-png" onclick="window.exportToPNG()">🖼️ PNG</button>
            <button class="btn-close" onclick="window.close()">✖️ إغلاق</button>
        </div></body></html>`;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printShowToast('تم فتح معاينة الطباعة', false);
    } catch (error) {
        console.error(error);
        printShowToast('حدث خطأ في المعاينة', true);
    }
}

// ========== تصدير PDF ==========
async function exportToPDF() {
    let pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
        printShowToast('المكتبات غير محملة، حاول مرة أخرى', true);
        return;
    }
    
    printShowLoading('جاري تجهيز الصور والفاتورة... (قد يستغرق قليلاً)');
    let buttons = document.querySelector('.action-buttons');
    if (buttons) buttons.style.display = 'none';
    
    let corsErrors = false;
    
    try {
        let { jsPDF } = window.jspdf;
        let pdf = new jsPDF('p', 'mm', 'a4');
        
        for (let i = 0; i < pages.length; i++) {
            try {
                await waitForImages(pages[i], 6000); // مهلة 6 ثوان
                let canvas = await html2canvas(pages[i], { 
                    scale: 2, // خفض الدقة قليلاً لزيادة السرعة
                    useCORS: true,
                    backgroundColor: '#ffffff', 
                    logging: false,
                    allowTaint: false
                });
                if (i !== 0) pdf.addPage();
                let imgData = canvas.toDataURL('image/png');
                let imgWidth = 210;
                let imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } catch(pageError) {
                console.warn('خطأ في معالجة الصفحة:', pageError);
                corsErrors = true;
                if (i !== 0) pdf.addPage();
            }
        }
        
        // استخراج اسم العميل ورقم الطلب (نفس الكود القديم)
        let customerName = 'عميل';
        let orderNumber = 'فاتورة';
        let orderDate = '';
        let nameElem = document.querySelector('.address-card:last-child p:first-child');
        if (nameElem) {
            let match = nameElem.innerText.match(/:(.+)/);
            if (match) customerName = match[1].trim();
        }
        let numElem = document.querySelector('.info-value');
        if (numElem) orderNumber = numElem.innerText.trim();
        let dateElem = document.querySelector('.info-item:nth-child(2) .info-value');
        if (dateElem) orderDate = dateElem.innerText.split(' - ')[0].trim();
        
        customerName = customerName.replace(/[\\/*?:"<>|]/g, '');
        orderNumber = orderNumber.replace(/[\\/*?:"<>|]/g, '');
        orderDate = orderDate.replace(/[\\/*?:"<>|]/g, '');
        let fileName = `${customerName} - ${orderNumber}`;
        if (orderDate) fileName += ` - ${orderDate}`;
        fileName += '.pdf';
        
        pdf.save(fileName);
        if (corsErrors) {
            printShowToast('تم حفظ PDF مع تحذير: بعض الصور لم تظهر بسبب CORS', false);
        } else {
            printShowToast('تم حفظ PDF بنجاح', false);
        }
    } catch(error) {
        console.error(error);
        printShowToast('خطأ في إنشاء PDF: ' + error.message, true);
    } finally {
        if (buttons) buttons.style.display = 'flex';
        printHideLoading();
    }
}

// ========== تصدير PNG ==========
async function exportToPNG() {
    let pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    if (typeof html2canvas === 'undefined') {
        printShowToast('جاري تحميل المكتبات...', true);
        return;
    }
    printShowLoading('جاري تجهيز الصور...');
    let corsErrors = false;
    try {
        for (let i = 0; i < pages.length; i++) {
            try {
                await waitForImages(pages[i], 6000);
                let canvas = await html2canvas(pages[i], { 
                    scale: 2, 
                    useCORS: true, 
                    backgroundColor: '#ffffff' 
                });
                let link = document.createElement('a');
                link.download = `invoice_page_${i+1}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch(pageError) {
                console.warn('خطأ في معالجة الصفحة:', pageError);
                corsErrors = true;
            }
        }
        if (corsErrors) {
            printShowToast('تم حفظ PNG مع تحذير: بعض الصور لم تظهر بسبب CORS', false);
        } else {
            printShowToast('تم حفظ PNG بنجاح', false);
        }
    } catch(error) {
        console.error(error);
        printShowToast('خطأ في إنشاء PNG: ' + error.message, true);
    } finally {
        printHideLoading();
    }
}

function initPrintModule(order, db, customers = []) {
    printCurrentOrder = order;
    printDb = db;
    window.customersList = customers;
    console.log('تم تهيئة وحدة الطباعة بنجاح');
}

window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.exportToPDF = exportToPDF;
window.exportToPNG = exportToPNG;
window.initPrintModule = initPrintModule;
