/**
 * نظام Tera V12 - محرك إنشاء ملفات PDF
 * مؤسسة الإتقان بلس - حائل
 */

const PDFGenerator = {
    /**
     * دالة إنشاء عقد أو تقرير عميل
     * @param {Object} data - بيانات العميل المستخرجة من Firestore
     */
    generateCustomerReport(data) {
        // 1. إنشاء نسخة جديدة من مستند PDF (مقاس A4)
        const doc = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        // 2. ضبط الخطوط ودعم اللغة العربية
        // ملاحظة: يفضل إضافة خط يدعم العربية مثل 'Amiri' لضمان ظهور النصوص بشكل صحيح
        doc.setFontSize(22);
        doc.text("مؤسسة الإتقان بلس للتجارة", 105, 20, { align: "center" });
        
        doc.setFontSize(16);
        doc.text("تقرير بيانات عميل - نظام Tera", 105, 30, { align: "center" });
        
        // رسم خط فاصل
        doc.line(20, 35, 190, 35);

        // 3. إضافة بيانات العميل
        doc.setFontSize(12);
        let yPos = 50;
        const spacing = 10;

        const fields = [
            `اسم العميل: ${data.fullName || 'غير مسجل'}`,
            `رقم الهوية: ${data.nationalId || 'غير مسجل'}`,
            `رقم الجوال: ${data.phone || 'غير مسجل'}`,
            `مبلغ القسط: ${data.installmentAmount || 0} ريال`,
            `حالة العميل: ${data.status || 'نشط'}`,
            `تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-SA')}`
        ];

        fields.forEach(field => {
            doc.text(field, 180, yPos, { align: "right" });
            yPos += spacing;
        });

        // 4. تذييل الصفحة (Footer)
        doc.setFontSize(10);
        doc.text("صدر هذا التقرير آلياً بواسطة أبا صالح الشمري - فرع حائل", 105, 280, { align: "center" });

        // 5. حفظ الملف باسم العميل
        const fileName = `Tera_Report_${data.nationalId || 'Customer'}.pdf`;
        doc.save(fileName);

        // تسجيل العملية في السجلات
        if (window.LogTracker) {
            LogTracker.logAction("إصدار PDF", `تم استخراج تقرير للعميل: ${data.fullName}`);
        }
    }
};

// جعل المحرك متاحاً عالمياً
window.PDFGenerator = PDFGenerator;
