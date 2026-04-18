// js/modules/products.js

/**
 * دالة تشغيل وحدة المنتجات - Tera Gateway
 * أضفنا export لكي يراها ملف main.js
 */
export async function initProducts(container) {
    console.log("بدء تحميل واجهة المنتجات...");

    // حقن هيكل الصفحة
    container.innerHTML = `
        <div class="products-wrapper" style="animation: fadeIn 0.5s ease;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="font-weight:800; color:#1a202c; font-size:1.6rem;">إدارة المنتجات</h2>
                <button class="add-btn" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:10px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:10px; box-shadow: 0 4px 12px rgba(230,126,34,0.2);">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div class="editor-container" style="background:white; padding:25px; border-radius:15px; border:1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                <label style="display:block; margin-bottom:15px; font-weight:800; color:#4a5568;">وصف المنتج التفصيلي:</label>
                <textarea id="product-editor-target"></textarea>
            </div>
        </div>
    `;

    // استدعاء المحرر بعد التأكد من وجود العنصر في الـ DOM
    setTimeout(() => {
        initFullEditor('product-editor-target');
    }, 150);
}

/**
 * دالة تهيئة المحرر (تدعم الإصدار 4 و 5)
 */
async function initFullEditor(elementId) {
    try {
        const editorElement = document.getElementById(elementId);
        if (!editorElement) return;

        // 1. التحقق من وجود ClassicEditor (الإصدار الخامس)
        if (typeof ClassicEditor !== 'undefined') {
            await ClassicEditor.create(editorElement, {
                language: 'ar',
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo'],
                direction: 'rtl'
            });
            console.log("✅ تم تشغيل CKEditor 5 بنجاح");
        } 
        // 2. التحقق من وجود CKEDITOR (الإصدار الرابع)
        else if (typeof CKEDITOR !== 'undefined') {
            CKEDITOR.replace(elementId, {
                contentsLangDirection: 'rtl',
                language: 'ar'
            });
            console.log("✅ تم تشغيل CKEditor 4 بنجاح");
        } 
        else {
            console.error("❌ خطأ: لم يتم العثور على مكتبة CKEditor. تأكد من وجود الرابط في ملف admin.html");
        }
    } catch (error) {
        console.error("⚠️ خطأ في تشغيل المحرر:", error);
    }
}
