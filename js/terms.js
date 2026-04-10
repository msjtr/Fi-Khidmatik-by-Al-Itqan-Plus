// ========================================
// terms.js - صفحات الشروط والأحكام المبسطة
// ========================================

function buildTermsPage1(pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام')}
            <div class="terms-container">
                <div class="legal-notice">
                    <strong>إقرار مسؤولية البيانات والمعلومات:</strong><br>
                    <span>يقر العميل ويوافق على أن جميع المعلومات والبيانات المقدمة صحيحة ودقيقة، ويتحمل كامل المسؤولية عنها.</span>
                </div>
                <div class="terms-section terms-section-1">
                    <div class="terms-section-header"><span class="terms-section-icon">📋</span><h4>أولاً: صلاحية العرض والتنفيذ</h4></div>
                    <div class="terms-section-content">
                        <p><strong>1. مدة صلاحية العرض:</strong> يكون عرض السعر صالحًا لمدة ثلاثة أيام عمل من تاريخ إصداره.</p>
                        <p><strong>2. بدء التنفيذ:</strong> تبدأ أعمال التنفيذ بعد استلام الدفعة المقدمة.</p>
                    </div>
                </div>
                <div class="terms-section terms-section-2">
                    <div class="terms-section-header"><span class="terms-section-icon">💰</span><h4>ثانياً: التكاليف والمسؤوليات المالية</h4></div>
                    <div class="terms-section-content">
                        <p><strong>6. الرسوم الخارجية:</strong> لا تشمل الفاتورة رسوم السيرفرات أو النطاقات أو التراخيص.</p>
                        <p><strong>10. الضريبة:</strong> جميع الأسعار لا تشمل ضريبة القيمة المضافة.</p>
                    </div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
}

function buildTermsPage2(pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام (تابع)')}
            <div class="terms-container">
                <div class="terms-section terms-section-5">
                    <div class="terms-section-header"><span class="terms-section-icon">🛡️</span><h4>خامساً: الضمان</h4></div>
                    <div class="terms-section-content">
                        <p><strong>23. الضمان:</strong> يتم تحديد الضمان وفق الخطة التشغيلية للمشروع.</p>
                        <p><strong>24. نطاق الضمان:</strong> يقتصر على الأخطاء الفنية الناتجة عن مقدم الخدمة فقط.</p>
                    </div>
                </div>
                <div class="terms-section terms-section-6">
                    <div class="terms-section-header"><span class="terms-section-icon">🔚</span><h4>سادساً: انتهاء العلاقة</h4></div>
                    <div class="terms-section-content">
                        <p><strong>26. انتهاء العلاقة:</strong> تنتهي العلاقة بعد تسليم المشروع.</p>
                        <p><strong>27. المسؤولية بعد التسليم:</strong> لا يتحمل مقدم الخدمة مسؤولية لاحقة.</p>
                    </div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
}

function buildTermsPage3(order, pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الإقرار والتوقيع')}
            <div class="terms-container">
                <div class="declaration">
                    <p>أقر أنا العميل بالاطلاع على جميع الشروط والأحكام وأوافق عليها.</p>
                </div>
                <div class="signature-area">
                    <div class="signature-row"><span>اسم العميل:</span> <span>${window.escapeHtml(order.customerName)}</span></div>
                    <div class="signature-row"><span>التاريخ:</span> <span>${window.formatDate(order.orderDate)} - ${window.formatTime(order.orderTime)}</span></div>
                    <div class="signature-row"><span>التوقيع:</span> <span class="signature-placeholder"></span></div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
}

window.buildTermsPage1 = buildTermsPage1;
window.buildTermsPage2 = buildTermsPage2;
window.buildTermsPage3 = buildTermsPage3;
