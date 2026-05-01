/**
 * نظام Tera V12 - محرك الإحصائيات (Stats Engine)
 * مؤسسة الإتقان بلس - حائل
 */

const StatsEngine = {
    // دالة جلب ملخص عام لبيانات المنصة
    async getGeneralSummary() {
        try {
            const snapshot = await db.collection("customers").get();
            let totalInstallments = 0;
            let activeCustomers = 0;
            let archivedCustomers = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                
                // حساب إجمالي مبالغ الأقساط الشهرية
                if (data.installmentAmount) {
                    totalInstallments += parseFloat(data.installmentAmount);
                }

                // تصنيف العملاء حسب الحالة
                if (data.status === "نشط") {
                    activeCustomers++;
                } else if (data.status === "مؤرشف") {
                    archivedCustomers++;
                }
            });

            return {
                totalCustomers: snapshot.size,
                totalInstallments: totalInstallments,
                activeCustomers: activeCustomers,
                archivedCustomers: archivedCustomers,
                lastUpdate: new Date().toLocaleTimeString('ar-SA')
            };
        } catch (error) {
            console.error("خطأ في محرك الإحصائيات:", error);
            if (window.LogTracker) {
                LogTracker.logError("Stats Engine", "فشل جلب ملخص الإحصائيات");
            }
            return null;
        }
    },

    // دالة لتحديث واجهة الإحصائيات (UI Update)
    async updateStatsUI() {
        const stats = await this.getGeneralSummary();
        if (!stats) return;

        // تحديث العناصر في صفحة customers-stats.html
        // تأكد من وجود هذه المعرفات (IDs) في ملف HTML الخاص بك
        const elements = {
            'total-cust': stats.totalCustomers,
            'active-cust': stats.activeCustomers,
            'total-money': stats.totalInstallments.toLocaleString('ar-SA') + " ر.س",
            'last-refresh': stats.lastUpdate
        };

        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = value;
                // إضافة تأثير بصري بسيط عند التحديث
                el.style.animation = "fadeIn 0.5s";
            }
        }
    }
};

// تشغيل التحديث التلقائي عند تحميل الصفحة إذا كنا في صفحة الإحصائيات
document.addEventListener('DOMContentLoaded', () => {
    // فحص ما إذا كانت الصفحة الحالية هي صفحة الإحصائيات
    if (document.getElementById('total-cust')) {
        StatsEngine.updateStatsUI();
        
        // تحديث تلقائي كل 5 دقائق لضمان دقة البيانات في مكتب حائل
        setInterval(() => StatsEngine.updateStatsUI(), 300000);
    }
});

// إتاحة المحرك عالمياً
window.StatsEngine = StatsEngine;
