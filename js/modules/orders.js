import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-file-invoice"></i> نظام إدارة الطلبات</h2>
                <button id="btn-create-new-order" style="background:#2ecc71; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; box-shadow:0 4px 10px rgba(46,204,113,0.3);">
                    <i class="fas fa-plus-circle"></i> إنشاء طلب جديد
                </button>
            </div>

            <div id="orders-list-target" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:20px;">
                <p style="text-align:center; grid-column:1/-1;">جاري جلب بيانات تيرا...</p>
            </div>
        </div>

        <div id="order-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:800px; margin:auto; border-radius:15px; padding:25px; position:relative;">
                <span id="close-order-modal" style="position:absolute; left:20px; top:20px; font-size:25px; cursor:pointer;">&times;</span>
                <h3 id="modal-title" style="color:#3498db; margin-top:0;">إنشاء طلب جديد</h3>
                
                <form id="order-form">
                    <input type="hidden" id="edit-order-id">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div><label>اسم العميل</label><input type="text" id="m-cust-name" required style="width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; border-radius:8px;"></div>
                        <div><label>رقم الجوال</label><input type="text" id="m-cust-phone" required style="width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; border-radius:8px;"></div>
                        <div style="grid-column: span 2;"><label>العنوان الكامل</label><input type="text" id="m-cust-addr" placeholder="حائل - الحي - الشارع" style="width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; border-radius:8px;"></div>
                        <div><label>المبلغ الإجمالي</label><input type="number" id="m-total" required style="width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; border-radius:8px;"></div>
                        <div><label>طريقة الدفع</label>
                            <select id="m-pay-method" style="width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; border-radius:8px;">
                                <option>مدى</option><option>تمارا</option><option>تابي</option><option>تحويل بنكي</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" style="width:100%; background:#3498db; color:white; padding:15px; border:none; border-radius:10px; margin-top:20px; font-weight:bold; cursor:pointer;">حفظ البيانات</button>
                </form>
            </div>
        </div>
    `;

    setupActions();
    await loadOrders();
}

async function loadOrders() {
    const target = document.getElementById('orders-list-target');
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    
    target.innerHTML = snap.docs.map(doc => {
        const o = doc.data();
        return `
            <div class="order-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border-right:6px solid #3498db;">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span style="font-weight:bold; color:#3498db;"># ${o.orderNumber || '---'}</span>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.editOrder('${doc.id}')" style="color:#f39c12; border:none; background:none; cursor:pointer;" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteOrder('${doc.id}')" style="color:#e74c3c; border:none; background:none; cursor:pointer;" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <h4 style="margin:0;">${o.customerName}</h4>
                <p style="font-size:0.85rem; color:#666;"><i class="fas fa-map-marker-alt"></i> ${o.city || ''} ${o.district || ''}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:10px; border-top:1px solid #f1f1f1;">
                    <span style="font-weight:bold; color:#2c3e50;">${o.total} ريال</span>
                    <button onclick="window.printInvoice('${doc.id}')" style="background:#f1f2f6; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">
                        <i class="fas fa-print"></i> طباعة الفاتورة
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function setupActions() {
    const modal = document.getElementById('order-modal');
    
    // فتح نافذة الإنشاء
    document.getElementById('btn-create-new-order').onclick = () => {
        document.getElementById('order-form').reset();
        document.getElementById('edit-order-id').value = '';
        document.getElementById('modal-title').innerText = "إنشاء طلب جديد";
        modal.style.display = 'block';
    };

    // إغلاق النافذة
    document.getElementById('close-order-modal').onclick = () => modal.style.display = 'none';

    // حفظ البيانات (إنشاء أو تعديل)
    document.getElementById('order-form').onsubmit = async (e) => {
        e.preventDefault();
        const orderId = document.getElementById('edit-order-id').value;
        const data = {
            customerName: document.getElementById('m-cust-name').value,
            total: document.getElementById('m-total').value,
            paymentMethod: document.getElementById('m-pay-method').value,
            createdAt: serverTimestamp()
        };

        if (orderId) {
            await updateDoc(doc(db, "orders", orderId), data);
            alert("تم التعديل بنجاح");
        } else {
            data.orderNumber = "TR-" + Math.floor(Math.random()*10000);
            await addDoc(collection(db, "orders"), data);
            alert("تم إنشاء الطلب بنجاح");
        }
        modal.style.display = 'none';
        loadOrders();
    };
}

// الوظائف العالمية
window.deleteOrder = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        await deleteDoc(doc(db, "orders", id));
        location.reload();
    }
};

window.printInvoice = (id) => {
    // هنا نقوم بالطباعة
    window.print();
};
