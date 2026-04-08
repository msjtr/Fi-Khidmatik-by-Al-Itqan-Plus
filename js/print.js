// ========================================
// print.js - دوال الطباعة المتقدمة
// ========================================

let printCurrentOrder = null;
let printDb = null;

function printShowLoading(msg) {
    var ov = document.getElementById('loadingOverlay');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'loadingOverlay';
        ov.className = 'loading-overlay';
        ov.innerHTML = '<div class="loading-box"><div class="loading-spinner"></div><p id="loadingMsg"></p></div>';
        document.body.appendChild(ov);
    }
    document.getElementById('loadingMsg').textContent = msg;
    ov.style.display = 'flex';
}

function printHideLoading() {
    var ov = document.getElementById('loadingOverlay');
    if (ov) ov.style.display = 'none';
}

function printShowToast(msg, isError) {
    var t = document.createElement('div');
    t.className = 'toast-message';
    t.style.background = isError ? '#ef4444' : '#10b981';
    t.innerHTML = (isError ? '❌ ' : '✅ ') + msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

function printInvoice() {
    try {
        window.print();
        printShowToast('تم إرسال الفاتورة إلى الطابعة', false);
    } catch (error) {
        console.error('Print Error:', error);
        printShowToast('حدث خطأ أثناء الطباعة', true);
    }
}

function previewPrint() {
    try {
        var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        if (!printWindow) {
            printShowToast('الرجاء السماح بالنوافذ المنبثقة', true);
            return;
        }
        
        var pages = document.querySelectorAll('.page');
        var printContent = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>معاينة الفاتورة</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"><link rel="stylesheet" href="css/invoice.css"><style>body{background:white;padding:20px;}@media print{body{padding:0;}}</style></head><body>';
        
        pages.forEach(function(page) {
            printContent += page.outerHTML;
        });
        
        printContent += '<div class="no-print" style="text-align:center;padding:20px;position:fixed;bottom:0;left:0;right:0;background:white;"><button onclick="window.print()" style="padding:10px 20px;margin:5px;background:#1e3a5f;color:white;border:none;border-radius:5px;">🖨️ طباعة</button><button onclick="window.close()" style="padding:10px 20px;margin:5px;background:#ef4444;color:white;border:none;border-radius:5px;">✖️ إغلاق</button></div></body></html>';
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    } catch (error) {
        console.error('Preview Error:', error);
        printShowToast('حدث خطأ في المعاينة', true);
    }
}

async function exportToPDF() {
    var pages = document.querySelectorAll('.page');
    if (!pages.length) {
        printShowToast('لا توجد فاتورة للتصدير', true);
        return;
    }
    
    printShowLoading('جاري إنشاء PDF...');
    
    var buttons = document.querySelector('.action-buttons');
    if (buttons) {
        buttons.style.display = 'none';
    }
    
    try {
        var { jsPDF } = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');
        
        for (var i = 0; i < pages.length; i++) {
            var canvas = await html2canvas(pages[i], { 
                scale: 2, 
                useCORS: false,
                backgroundColor: '#ffffff', 
                logging: false,
                allowTaint: true
            });
            
            if (i !== 0) pdf.addPage();
            var imgData = canvas.toDataURL('image/png');
            var imgWidth = 210;
            var imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        pdf.save('فاتورة_' + (printCurrentOrder?.orderNumber || 'invoice') + '.pdf');
        printShowToast('تم حفظ PDF بنجاح', false);
        
    } catch(error) {
        console.error('PDF Export Error:', error);
        printShowToast('خطأ في إنشاء PDF', true);
    } finally {
        if (buttons) {
            buttons.style.display = 'flex';
        }
        printHideLoading();
    }
}

function initPrintModule(order, db) {
    printCurrentOrder = order;
    printDb = db;
    console.log('تم تهيئة وحدة الطباعة بنجاح');
}

window.printInvoice = printInvoice;
window.previewPrint = previewPrint;
window.exportToPDF = exportToPDF;
window.initPrintModule = initPrintModule;
