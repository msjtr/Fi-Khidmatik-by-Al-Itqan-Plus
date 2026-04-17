import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div class="orders-container" dir="rtl" style="padding:20px; font-family: 'Tajawal', sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="color:#2c3e50;"><i class="fas fa-file-invoice-dollar"></i> إدارة الفواتير والطلبات</h2>
                <button id="open-order-modal" style="background:#27ae60; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إنشاء طلب جديد
                </button>
            </div>

            <div id="orders-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:20px;">
                </div>
        </div>

        <div id="order-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; overflow-y:auto;">
            <div style="background:white; width:90%; max-width:900px; margin:20px auto; padding:25px; border-radius:15px; position:relative;">
                <span id="close-modal" style="position:absolute; left:20px; top:20px; cursor:pointer; font-size:24px;">&times;</span>
                <h3 style="border-bottom:2px solid #f1f2f6; padding-bottom:10px; color:#3498db;">إنشاء فاتورة جديدة</h3>
                
                <form id="new-order-form">
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-top:20px; background:#f8f9fa; padding:15px; border-radius:10px;">
                        <div><label>رقم الفاتورة</label><input type="text" id="orderNo" style="width:100%; padding:8px;" readonly></div>
                        <div><label>تاريخ الطلب</label><input type="date" id="orderDate" style="width:100%; padding:8px;"></div>
                        <div><label>وقت الطلب</label><input type="time" id="orderTime" style="width:100%; padding:8px;"></div>
                    </div>

                    <div style="margin-top:20px;">
                        <h4 style="color:#2ecc71;">بيانات العميل</h4>
                        <select id="customer-select" style="width:100%; padding:10px; margin-bottom:10px;">
                            <option value="">-- اختر عميل من القائمة أو أضف جديد --</option>
                        </select>
                        <div id="customer-fields" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                            <input type="text" id="c-name" placeholder="الاسم الكامل" required style="padding:8px;">
                            <input type="text" id="c-phone" placeholder="رقم الجوال" required style="padding:8px;">
                            <input type="email" id="c-email" placeholder="البريد الإلكتروني" style="padding:8px;">
                            <input type="text" id="c-city" placeholder="المدينة (مثلاً: حائل)" style="padding:8px;">
                            <input type="text" id="c-district" placeholder="الحي" style="padding:8px;">
                            <input type="text" id="c-street" placeholder="الشارع" style="padding:8px;">
                            <input type="text" id="c-building" placeholder="رقم المبنى" style="padding:8px;">
                            <input type="text" id="c-zip" placeholder="الرمز البريدي" style="padding:8px;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-top:20px;">
                        <div>
                            <label>طريقة الدفع</label>
                            <select id="pay-method" style="width:100%; padding:8px;">
                                <option>مدى</option><option>فيزا / ماستر كارد</option><option>تابي</option><option>تمارا</option><option>تحويل بنكي</option><option>نقداً</option>
                            </select>
                        </div>
                        <div><label>رمز الموافقة</label><input type="text" id="approval-code" placeholder="اختياري" style="width:100%; padding:8px;"></div>
                        <div>
                            <label>طريقة الاستلام</label>
                            <select id="shipping-method" style="width:100%; padding:8px;">
                                <option>استلام من المقر</option><option>شحن سمسا</option><option>شحن أرامكس</option><option>لا يتطلب شحن</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4 style="color:#e67e22;">الخدمات والمنتجات</h4>
                            <button type="button" id="add-item-row" style="background:#3498db; color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer;">+ إضافة منتج</button>
                        </div>
                        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                            <thead>
                                <tr style="background:#f1f2f6; font-size:0.9rem;">
                                    <th style="padding:10px; border:1px solid #ddd;">المنتج</th>
                                    <th style="padding:10px; border:1px solid #ddd;">الكمية</th>
                                    <th style="padding:10px; border:1px solid #ddd;">السعر</th>
                                    <th style="padding:10px; border:1px solid #ddd;">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody id="items-body">
                                </tbody>
                        </table>
                    </div>

                    <div style="margin-top:20px; text-align:left; font-size:1.2rem; font-weight:bold;">
                        الاجمالي شامل الضريبة: <span id="grand-total">0</span> ريال
                    </div>

                    <button type="submit" style="width:100%; background:#27ae60; color:white; padding:15px; margin-top:20px; border:none; border-radius:10px; font-size:1.1rem; cursor:pointer;">حفظ الفاتورة وإصدارها</button>
                </form>
            </div>
        </div>
    `;

    // تفعيل أزرار النافذة
    setupModalEvents();
    await loadOrders();
    await loadCustomerList();
}

// دالة الطباعة الاحترافية للفاتورة فقط
window.printInvoice = function(orderId) {
    const orderDiv = document.getElementById(`print-area-${orderId}`);
    const printWindow = window.open('', '', 'height=800,width=600');
    printWindow.document.write('<html><head><title>فاتورة تيرا</title>');
    printWindow.document.write('<link rel="stylesheet" href="css/admin.css">');
    printWindow.document.write('</head><body dir="rtl">');
    printWindow.document.write(orderDiv.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
};

// وظيفة جلب العملاء للقائمة
async function loadCustomerList() {
    const select = document.getElementById('customer-select');
    const snap = await getDocs(collection(db, "customers"));
    snap.forEach(doc => {
        const c = doc.data();
        const opt = document.createElement('option');
        opt.value = doc.id;
        opt.textContent = `${c.name} - ${c.phone}`;
        opt.dataset.info = JSON.stringify(c);
        select.appendChild(opt);
    });

    select.onchange = (e) => {
        if(!e.target.value) return;
        const info = JSON.parse(e.target.options[e.target.selectedIndex].dataset.info);
        document.getElementById('c-name').value = info.name || '';
        document.getElementById('c-phone').value = info.phone || '';
        document.getElementById('c-email').value = info.email || '';
        document.getElementById('c-city').value = info.city || '';
        document.getElementById('c-district').value = info.district || '';
    };
}

async function loadOrders() {
    const grid = document.getElementById('orders-grid');
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    
    grid.innerHTML = snap.docs.map(doc => {
        const o = doc.data();
        return `
            <div class="order-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                <div id="print-area-${doc.id}">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:#3498db;">${o.orderNumber}</strong>
                        <span>${o.status}</span>
                    </div>
                    <h4>${o.customerName}</h4>
                    <p style="font-size:0.85rem; color:#666;">العنوان: ${o.shippingAddress?.city} - ${o.shippingAddress?.district} - ${o.shippingAddress?.street}</p>
                    <hr>
                    <div style="text-align:left; font-weight:bold;">الإجمالي: ${o.total} ريال</div>
                </div>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button onclick="window.printInvoice('${doc.id}')" style="flex:1; background:#34495e; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;"><i class="fas fa-print"></i> فاتورة</button>
                    <button onclick="deleteOrder('${doc.id}')" style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function setupModalEvents() {
    const modal = document.getElementById('order-modal');
    document.getElementById('open-order-modal').onclick = () => {
        document.getElementById('orderNo').value = "TERA-" + Date.now().toString().slice(-6);
        document.getElementById('orderDate').valueAsDate = new Date();
        modal.style.display = 'block';
    };
    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
    
    document.getElementById('add-item-row').onclick = () => {
        const tbody = document.getElementById('items-body');
        const row = `<tr>
            <td style="padding:5px;"><input type="text" placeholder="اسم المنتج" class="item-name" style="width:100%;"></td>
            <td style="padding:5px;"><input type="number" value="1" class="item-qty" style="width:50px;"></td>
            <td style="padding:5px;"><input type="number" placeholder="السعر" class="item-price" style="width:80px;"></td>
            <td class="item-subtotal" style="padding:5px; text-align:center;">0</td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    };

    document.getElementById('new-order-form').onsubmit = async (e) => {
        e.preventDefault();
        // هنا يتم جمع البيانات وحفظها في Firestore
        alert("جاري حفظ الطلب في قاعدة بيانات تيرا...");
        modal.style.display = 'none';
        location.reload();
    };
}
