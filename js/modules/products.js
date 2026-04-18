import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let allProducts = [];

export async function initProducts(container) {
    const response = await fetch('./admin/modules/products.html');
    container.innerHTML = await response.text();

    // ننتظر قليلاً لضمان تحميل العناصر في الـ DOM
    setTimeout(() => {
        setupEventListeners();
        fetchProducts();
    }, 100);
}

function setupEventListeners() {
    const btnNew = document.getElementById('new-product-btn');
    const form = document.getElementById('product-form');
    const searchInput = document.getElementById('search-product');
    const catFilter = document.getElementById('category-filter');

    if (btnNew) {
        btnNew.onclick = () => {
            form.reset();
            document.getElementById('p-id').value = "";
            document.getElementById('modal-title').innerText = "إضافة منتج جديد";
            document.getElementById('product-modal').style.display = 'flex';
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('p-id').value;
            const data = {
                name: document.getElementById('p-name').value,
                code: document.getElementById('p-code').value,
                price: Number(document.getElementById('p-price').value),
                stock: Number(document.getElementById('p-stock').value),
                category: document.getElementById('p-category').value,
                mainImage: document.getElementById('p-image').value,
                updatedAt: serverTimestamp()
            };

            try {
                if (id) {
                    await updateDoc(doc(db, "products", id), data);
                } else {
                    data.createdAt = serverTimestamp();
                    await addDoc(collection(db, "products"), data);
                }
                document.getElementById('product-modal').style.display = 'none';
                fetchProducts();
            } catch (err) { console.error("Error saving:", err); }
        };
    }

    if (searchInput) searchInput.oninput = renderFiltered;
    if (catFilter) catFilter.onchange = renderFiltered;
}

async function fetchProducts() {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    allProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFiltered();
}

function renderFiltered() {
    const tbody = document.getElementById('products-list-body');
    if (!tbody) return;

    const searchTerm = (document.getElementById('search-product')?.value || "").toLowerCase();
    const catValue = document.getElementById('category-filter')?.value || "all";

    const filtered = allProducts.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm) || p.code?.toLowerCase().includes(searchTerm);
        const matchesCat = catValue === "all" || p.category === catValue;
        return matchesSearch && matchesCat;
    });

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td style="padding:15px;"><strong>${p.name}</strong><br><small>${p.code}</small></td>
            <td style="padding:15px; font-weight:bold;">${p.price} ريال</td>
            <td style="padding:15px;">${p.stock}</td>
            <td style="padding:15px;">
                <button onclick="editProduct('${p.id}')" style="color:#3498db; background:none; border:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct('${p.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer; margin-right:10px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// الدوال العالمية للوصول إليها من أزرار الجدول
window.editProduct = (id) => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-code').value = p.code;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-category').value = p.category || "cards";
    document.getElementById('p-image').value = p.mainImage || "";
    document.getElementById('modal-title').innerText = "تعديل المنتج";
    document.getElementById('product-modal').style.display = 'flex';
};

window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
    }
};
