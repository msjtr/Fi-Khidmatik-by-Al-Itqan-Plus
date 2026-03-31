// image.service.js
// خدمة تحويل الفاتورة إلى صورة PNG بجودة عالية وحجم مناسب

export async function generateImage(element, order) {
    // التحقق من وجود العنصر
    if (!element) {
        console.error('❌ عنصر الفاتورة غير موجود');
        return;
    }

    // تحضير اسم الملف بالعربية والإنجليزية معاً
    const customerName = order.customer?.name || 'عميل';
    const orderNumber = order.orderNumber || order.id || 'فاتورة';
    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('ar-SA').replace(/\//g, '-') : '';
    
    // اسم الملف: فاتورة_اسم العميل_رقم الطلب_التاريخ.png
    const fileName = `فاتورة_${customerName}_${orderNumber}_${orderDate}.png`
        .replace(/[\\/:*?"<>|]/g, '_')  // إزالة الأحرف غير المسموحة
        .replace(/\s+/g, '_');           // استبدال المسافات بشرطة سفلية

    try {
        // إظهار مؤشر تحميل
        showLoading(true);

        // التقاط الصورة بجودة عالية
        const canvas = await html2canvas(element, {
            scale: 2.5,                   // جودة عالية (2.5x للحجم المناسب)
            backgroundColor: '#ffffff',   // خلفية بيضاء
            logging: false,               // تعطيل سجلات التصحيح
            useCORS: true,                // دعم الصور من مصادر خارجية
            allowTaint: false,            // منع الصور غير الآمنة
            windowWidth: element.scrollWidth,   // عرض كامل
            windowHeight: element.scrollHeight, // ارتفاع كامل
            onclone: (clonedDoc, element) => {
                // معالجة إضافية للعناصر المستنسخة إذا لزم الأمر
                console.log('📸 جاري معالجة الصورة...');
            }
        });

        // حساب الجودة المناسبة للحصول على حجم أقل من 200KB
        let quality = 0.85;  // جودة 85% (حجم مناسب وجودة عالية)
        let imageData = canvas.toDataURL('image/png', quality);
        
        // إذا كان الحجم أكبر من 200KB، قم بتقليل الجودة تدريجياً
        let estimatedSize = (imageData.length * 3) / 4; // تقدير حجم الملف بالبايت
        let maxSize = 200 * 1024; // 200KB
        
        if (estimatedSize > maxSize) {
            console.log(`📦 حجم الصورة كبير (${(estimatedSize / 1024).toFixed(0)}KB)، جاري تحسين الضغط...`);
            
            // تجربة جودة أقل للحصول على حجم مناسب
            const qualities = [0.75, 0.65, 0.55, 0.45];
            for (const q of qualities) {
                const testData = canvas.toDataURL('image/png', q);
                const testSize = (testData.length * 3) / 4;
                if (testSize <= maxSize) {
                    quality = q;
                    imageData = testData;
                    console.log(`✅ تم ضبط الجودة إلى ${quality * 100}%، الحجم: ${(testSize / 1024).toFixed(0)}KB`);
                    break;
                }
            }
        }

        // إنشاء رابط التحميل
        const link = document.createElement('a');
        link.download = fileName;
        link.href = imageData;
        link.style.display = 'none';
        
        // إضافة الرابط إلى الصفحة وتنفيذ التحميل
        document.body.appendChild(link);
        link.click();
        
        // تنظيف
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
        
        console.log('✅ تم إنشاء الصورة بنجاح:', fileName);
        console.log(`📊 حجم الملف: ${(imageData.length * 3 / 4 / 1024).toFixed(0)}KB`);

    } catch (error) {
        console.error('❌ خطأ في إنشاء الصورة:', error);
        alert('حدث خطأ في إنشاء الصورة، يرجى المحاولة مرة أخرى');
        
    } finally {
        // إخفاء مؤشر التحميل
        showLoading(false);
    }
}

// دالة مساعدة لتحميل الصورة كـ PNG مع إمكانية التحكم بالجودة
export async function generateImageWithQuality(element, order, quality = 0.85) {
    const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
    });
    
    const fileName = `فاتورة_${order.customer?.name || 'عميل'}_${order.orderNumber || order.id}.png`
        .replace(/[\\/:*?"<>|]/g, '_');
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', quality);
    link.click();
}

// دالة مساعدة لإظهار/إخفاء مؤشر التحميل
function showLoading(show) {
    let loadingOverlay = document.getElementById('imageLoadingOverlay');
    
    if (show) {
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'imageLoadingOverlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                direction: rtl;
            `;
            loadingOverlay.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                    <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p style="font-size: 1rem; color: #333;">جاري إنشاء الصورة...</p>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">يرجى الانتظار</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.style.display = 'flex';
        }
    } else {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}
