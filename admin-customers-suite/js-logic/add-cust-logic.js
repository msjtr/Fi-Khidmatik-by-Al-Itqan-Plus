/**
 * نظام Tera V12 - محرك إضافة العملاء
 * مؤسسة الإتقان بلس - حائل
 */

// 1. استيراد الدوال اللازمة من Firebase (تأكد من استيرادها في firebase.js)
// يتم الوصول لـ db المعرف عالمياً في ملف firebase.js

document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addCustomerForm');
    const saveBtn = document.getElementById('btnSave');

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // 2. جمع البيانات من الحقول (تأكد من مطابقة الـ IDs في HTML)
            const customerData = {
                fullName: document.getElementById('custName').value.trim(),
                nationalId: document.getElementById('custId').value.trim(),
                phone: document.getElementById('custPhone').value.trim(),
                installmentAmount: parseFloat(document.getElementById('amount').value),
                createdAt: new Date(), // تاريخ التسجيل
                status: "نشط", // حالة العميل الافتراضية
                addedBy: "أبا صالح الشمري" // الموظف المسؤول
            };

            // 3. التحقق من صحة البيانات قبل الإرسال
            if (!customerData.fullName || !customerData.nationalId || isNaN(customerData.installmentAmount)) {
                alert("يا أبا صالح، يرجى التأكد من تعبئة جميع الحقول الأساسية.");
                return;
            }

            try {
                // 4. تعطيل الزر لمنع التكرار أثناء الحفظ
                saveBtn.disabled = true;
                saveBtn.innerText = "جاري الحفظ في Tera...";

                // 5. حفظ البيانات في مجموعة "customers" داخل Firestore
                // ملاحظة: db معرف في ملف firebase.js
                await db.collection("customers").add(customerData);

                // 6. نجاح العملية
                alert("تم إضافة العميل بنجاح إلى قاعدة بيانات الإتقان بلس.");
                addForm.reset(); // تفريغ الحقول

            } catch (error) {
                console.error("خطأ أثناء الحفظ:", error);
                alert("حدث خطأ في الاتصال، يرجى التحقق من إعدادات Firebase.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = "حفظ في Tera";
            }
        });
    }
});

/**
 * دالة إضافية لتنسيق الأرقام (اختياري)
 */
function formatCurrency(num) {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num);
}
