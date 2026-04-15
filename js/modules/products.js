import { db } from '../core/firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { showModal } from '../utils/helpers.js';

export async function initProducts(container) {
    container.innerHTML = await fetch('admin/modules/products.html').then(r => r.text());
    await renderProductsTable();
    document.getElementById('new-product-btn').onclick = () => showProductModal();
}

async function renderProductsTable() {
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const html = `<table class="data-table"><thead><tr><th>الاسم</th><th>السعر</th><th>الباركود</th><th></th></tr></thead><tbody>
        ${products.map(p => `<tr><td>${p.name}</td><td>${p.price}</td><td>${p.barcode || ''}</td>
        <td><button onclick="editProduct('${p.id}','${p.name}',${p.price},'${p.barcode}')"><i class="fas fa-edit"></i></button>
        <button onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button></td></tr>`).join('')}
    </tbody></table>`;
    document.getElementById('products-table-container').innerHTML = html;
}

window.deleteProduct = async (id) => { if(confirm('حذف؟')) await deleteDoc(doc(db,"products",id)); renderProductsTable(); };
window.editProduct = (id,name,price,barcode) => showProductModal(id,name,price,barcode);
async function showProductModal(id=null,name='',price=0,barcode=''){
    showModal('المنتج', `<input id="prod-name" value="${name}" placeholder="الاسم"><input id="prod-price" value="${price}" placeholder="السعر"><input id="prod-barcode" value="${barcode}" placeholder="الباركود"><button id="save-prod">حفظ</button>`);
    document.getElementById('save-prod').onclick = async()=>{
        const data={name:document.getElementById('prod-name').value, price:Number(document.getElementById('prod-price').value), barcode:document.getElementById('prod-barcode').value};
        if(id) await updateDoc(doc(db,"products",id),data);
        else await addDoc(collection(db,"products"),data);
        renderProductsTable(); document.getElementById('genericModal').style.display='none';
    };
}
