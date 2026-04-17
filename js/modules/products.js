import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-boxes" style="color:#e67e22; margin-left:10px;"></i> إدارة المنتجات</h2>
                <button id="btn-add-product" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>
            <div id="products-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;"></div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:950px; margin:10px auto; border-radius:15px; padding:30px;">
                <h3 id="modal-title" style="color:#e67e22; border-bottom:1px solid #eee; padding-bottom:15px;">إضافة/تعديل منتج</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
                        <input type="text" id="p-name" placeholder="اسم المنتج" required style="grid-column: span 2; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="text" id="p-code" placeholder="SKU" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-price" placeholder="السعر" step="0.01" required style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-stock" placeholder="الكمية" required style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="url" id="p-main-image" placeholder="رابط الصورة" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        
                        <div style="grid-column: span 2; margin-top:10px;">
                            <label style="font-weight:bold; display:block; margin-bottom:10px;">وصف المنتج (نظام Word المتكامل):</label>
                            <textarea id="p-desc-editor"></textarea>
                        </div>
                    </div>

                    <div style="margin-top:25px; display:flex; gap:15px;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">حفظ المنتج</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; border-radius:10px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // تهيئة محرر TinyMCE بخصائص الوورد
    initTinyMCE();
    setupProductLogic();
    await loadProducts();
}

function initTinyMCE() {
    tinymce.init({
        selector: '#p-desc-editor',
        height: 350,
        directionality: 'rtl',
        language: 'ar',
        plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
        toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | removeformat | help',
        content_style: 'body { font-family:Tajawal,Arial,sans-serif; font-size:14px }',
        branding: false,
        promotion: false
    });
}

async function loadProducts() {
    const grid = document.getElementById('products-grid');
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    const defaultImg = "https://placehold.jp/24/3498db/ffffff/300x180.png?text=TERA+GATEWAY";

    grid.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        return `
            <div style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05); border:1px solid #eee;">
                <div style="height:160px; background:url('${p.mainImage || defaultImg}') center/cover;"></div>
                <div style="padding:15px;">
                    <h4 style="margin:0;">${p.name}</h4>
                    <div style="color:#e67e22; font-weight:bold; margin-top:5px;">${parseFloat(p.price).toFixed(2)} ريال</div>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <button onclick="window.editProduct('${doc.id}')" style="flex:1; background:#f1f2f6; border:none; padding:8px; border-radius:5px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteProduct('${doc.id}')" style="flex:1; background:#fff5f5; border:none; color:#e74c3c; padding:8px; border-radius:5px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function setupProductLogic() {
    const modal = document.getElementById('product-modal');
    
    document.getElementById('btn-add-product').onclick = () => {
        document.getElementById('product-form').reset();
        tinymce.get('p-desc-editor').setContent('');
        document.getElementById('edit-id').value = '';
        modal.style.display = 'block';
    };

    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('product-form').onsubmit = async (e) => {
        e.preventDefault();
        
        // استخراج المحتوى من المحرر
        const descriptionHtml = tinymce.get('p-desc-editor').getContent();

        const data = {
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            mainImage: document.getElementById('p-main-image').value,
            description: descriptionHtml,
            updatedAt: serverTimestamp()
        };

        const id = document.getElementById('edit-id').value;
        if (id) {
            await updateDoc(doc(db, "products", id), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), data);
        }
        
        modal.style.display = 'none';
        loadProducts();
    };
}

window.editProduct = async (id) => {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
        const p = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-code').value = p.code || '';
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-main-image').value = p.mainImage || '';
        
        // وضع المحتوى داخل المحرر عند التعديل
        if (tinymce.get('p-desc-editor')) {
            tinymce.get('p-desc-editor').setContent(p.description || '');
        }
        
        document.getElementById('product-modal').style.display = 'block';
    }
};

window.deleteProduct = async (id) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
        await deleteDoc(doc(db, "products", id));
        loadProducts();
    }
};
