// ========================================
// صفحات الشروط والأحكام
// ========================================

function buildTermsPage1(pageNum, totalPages) {
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container">' +
            '<div class="terms-title">الشروط والأحكام والتعليمات</div>' +
            '<div class="legal-notice">' +
                '<strong>إقرار ملزم قانونياً:</strong> يُعد هذا المستند اتفاقًا ملزمًا قانونيًا بين الطرفين.' +
            '</div>' +
            '<div class="terms-grid">' +
                '<div>' +
                    '<div class="terms-card"><h4>أولاً: صلاحية العرض والتنفيذ</h4>' +
                        '<p><strong>1.</strong> مدة صلاحية العرض: ثلاثة أيام عمل.</p>' +
                        '<p><strong>2.</strong> بدء التنفيذ: بعد استلام الدفعة المقدمة.</p>' +
                        '<p><strong>3.</strong> مدة التنفيذ: تُحتسب من تاريخ اكتمال المتطلبات.</p>' +
                        '<p><strong>4.</strong> التأخير: لا مسؤولية على مقدم الخدمة.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>ثالثاً: التسليم والملكية</h4>' +
                        '<p><strong>11.</strong> نطاق التسليم: حسب النطاق المحدد.</p>' +
                        '<p><strong>12.</strong> المنتج النهائي: يقتصر على المنتج الجاهز.</p>' +
                        '<p><strong>13.</strong> الكود المصدري: ملك حصري لمقدم الخدمة.</p>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="terms-card"><h4>ثانياً: التكاليف والمسؤوليات المالية</h4>' +
                        '<p><strong>6.</strong> الرسوم الخارجية: لا تشمل رسوم الجهات الخارجية.</p>' +
                        '<p><strong>7.</strong> خدمات الطرف الثالث: تخضع لسياساتها.</p>' +
                        '<p><strong>8.</strong> المدفوعات الخارجية: غير قابلة للاسترجاع.</p>' +
                        '<p><strong>9.</strong> الضريبة: تشمل ضريبة القيمة المضافة.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>رابعاً: الدفعات والاسترجاع</h4>' +
                        '<p><strong>17.</strong> نظام الدفع: حسب الآلية المتفق عليها.</p>' +
                        '<p><strong>18.</strong> تأخر السداد: يحق إيقاف العمل فوراً.</p>' +
                        '<p><strong>19.</strong> عدم الاسترجاع: لا يحق استرجاع أي مبلغ بعد البدء.</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

function buildTermsPage2(pageNum, totalPages) {
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container">' +
            '<div class="terms-grid">' +
                '<div>' +
                    '<div class="terms-card"><h4>خامساً: الضمان</h4>' +
                        '<p><strong>23.</strong> الضمان: حسب الخطة التشغيلية.</p>' +
                        '<p><strong>24.</strong> نطاق الضمان: يقتصر على الأخطاء الفنية.</p>' +
                        '<p><strong>25.</strong> الاستثناءات: لا يشمل سوء الاستخدام.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>سادساً: انتهاء العلاقة</h4>' +
                        '<p><strong>26.</strong> انتهاء العلاقة: بعد تسليم المشروع.</p>' +
                        '<p><strong>27.</strong> المسؤولية بعد التسليم: لا توجد.</p>' +
                        '<p><strong>28.</strong> التشغيل: مسؤولية العميل.</p>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="terms-card"><h4>سابعاً: التواصل</h4>' +
                        '<p><strong>31.</strong> وسائل التواصل: المعتمدة فقط.</p>' +
                        '<p><strong>32.</strong> التفويض: يلزم إشعار رسمي.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>ثامناً: النزاعات</h4>' +
                        '<p><strong>39.</strong> حل النزاعات: وديًا أولاً.</p>' +
                        '<p><strong>40.</strong> الجهة المختصة: القوانين السعودية.</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

function buildTermsPage3(order, pageNum, totalPages) {
    var dateStr = (order.orderDate ? window.formatDate(order.orderDate) : '') + ' - ' + (order.orderTime ? window.formatTime(order.orderTime) : '');
    
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container">' +
            '<div class="terms-grid">' +
                '<div>' +
                    '<div class="terms-card"><h4>الحماية القانونية</h4>' +
                        '<p><strong>51.</strong> التنازل عن المطالبات: بما يتجاوز قيمة الفاتورة.</p>' +
                        '<p><strong>52.</strong> حدود المسؤولية: إجمالي المبلغ المدفوع.</p>' +
                        '<p><strong>53.</strong> الملكية الفكرية: محفوظة لمقدم الخدمة.</p>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="terms-card"><h4>بنود عامة</h4>' +
                        '<p><strong>54.</strong> تحديث الشروط: يحق لمقدم الخدمة.</p>' +
                        '<p><strong>55.</strong> استقلالية البنود: كل بند مستقل.</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="declaration">' +
                '<p><strong>إقرار وتعهد</strong></p>' +
                '<p>أقر أنا العميل <strong>' + window.escapeHtml(order.customerName) + '</strong></p>' +
                '<p>بأنني اطلعت على جميع الشروط والأحكام الواردة في هذا المستند<br>وأوافق عليها بالكامل وأتعهد بالالتزام بها.</p>' +
            '</div>' +
            '<div class="signature-area">' +
                '<div><strong>العميل:</strong> ' + window.escapeHtml(order.customerName) + '</div>' +
                '<div><strong>التاريخ:</strong> ' + dateStr + '</div>' +
            '</div>' +
            '<div style="margin-top:20px;"><strong>التوقيع:</strong> _________________</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

// تصدير الدوال
window.buildTermsPage1 = buildTermsPage1;
window.buildTermsPage2 = buildTermsPage2;
window.buildTermsPage3 = buildTermsPage3;
