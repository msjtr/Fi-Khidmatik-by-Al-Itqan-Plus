// ========== دوال الطباعة والتصدير ==========

/**
 * طباعة الفاتورة مباشرة
 */
export function printInvoice() {
    window.print();
}

/**
 * تحميل الفاتورة كملف PDF
 */
export async function downloadPDF(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء ملف PDF...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
        showSuccess('تم حفظ PDF بنجاح');
    } catch (error) {
        console.error('PDF Error:', error);
        showError('حدث خطأ في إنشاء PDF');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل الفاتورة كصورة PNG
 */
export async function downloadPNG(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء صورة PNG...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showSuccess('تم حفظ PNG بنجاح');
    } catch (error) {
        console.error('PNG Error:', error);
        showError('حدث خطأ في إنشاء PNG');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل الفاتورة كملف ZIP مضغوط (PDF + PNG)
 */
export async function downloadZIP(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        return;
    }
    
    showLoading('جاري إنشاء الملف المضغوط...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const zip = new JSZip();
        
        // إضافة PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        zip.file(`${filename}.pdf`, pdf.output('blob'));
        
        // إضافة PNG
        zip.file(`${filename}.png`, canvas.toDataURL('image/png').split(',')[1], { base64: true });
        
        // إنشاء ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        showSuccess('تم حفظ الملف المضغوط بنجاح');
    } catch (error) {
        console.error('ZIP Error:', error);
        showError('حدث خطأ في إنشاء الملف المضغوط');
    } finally {
        hideLoading();
    }
}

/**
 * إنشاء باركود هيئة الزكاة والضريبة (ZATCA)
 */
export function generateZATCAQRCode(containerId, orderData) {
    const sellerName = 'منصة في خدمتك';
    const vatNumber = '312495447600003';
    const timestamp = new Date().toISOString();
    const totalWithVAT = orderData.total || 0;
    const vatAmount = orderData.tax || 0;
    
    // تشفير TLV لهيئة الزكاة
    function encodeTLV(tag, value) {
        const tagHex = tag.toString(16).padStart(2, '0');
        const lengthHex = value.length.toString(16).padStart(2, '0');
        let valueHex = '';
        for (let i = 0; i < value.length; i++) {
            valueHex += value.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return tagHex + lengthHex + valueHex;
    }
    
    let tlvData = '';
    tlvData += encodeTLV(1, sellerName);
    tlvData += encodeTLV(2, vatNumber);
    tlvData += encodeTLV(3, timestamp);
    tlvData += encodeTLV(4, totalWithVAT.toFixed(2));
    tlvData += encodeTLV(5, vatAmount.toFixed(2));
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        new QRCode(container, {
            text: tlvData,
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// ========== دوال مساعدة للتحميل ==========
let loadingOverlay = null;

function showLoading(message) {
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999; flex-direction: column;
        `;
        loadingOverlay.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div class="loading-spinner" style="border: 3px solid #f3f3f3; border-top: 3px solid #1e40af; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                <p id="loadingMessage">جاري التحميل...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
        
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
    document.getElementById('loadingMessage').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '✅ ' + message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #10b981; color: white; padding: 10px 20px;
        border-radius: 8px; z-index: 10000; font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '❌ ' + message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #ef4444; color: white; padding: 10px 20px;
        border-radius: 8px; z-index: 10000; font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
