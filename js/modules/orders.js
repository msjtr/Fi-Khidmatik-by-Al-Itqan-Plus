import { db } from '../core/firebase.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div class="orders-system" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#2c3e50;"><i class="fas fa-file-invoice"></i> نظام إدارة المبيعات - تيرا</h2>
            </div>
            <div id="orders-list" style="display:grid; gap:15px;">
                <p style="text-align:center;">جاري جلب الطلبات وربط البيانات...</p>
            </div>
        </div>

        <div id="invoice-print-container" style="display:none;"></div>
    `;
    await renderOrders();
}

async function renderOrders() {
    const list = document.getElementById('orders-list');
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    
    if (snap.empty) {
        list.innerHTML = "لا توجد طلبات.";
        return;
    }

    list.innerHTML = '';
    for (const d of snap.docs) {
        const order = d.data();
        let customerData = order.shippingAddress || {}; // Fallback الأول

        // الربط الذكي: جلب بيانات العميل إذا كان مسجلاً
        if (order.customerId) {
            const cDoc = await getDoc(doc(db, "customers", order.customerId));
            if (cDoc.exists()) {
                customerData = { ...cDoc.data(), ...order.shippingAddress }; // دمج البيانات لضمان الاكتمال
            }
        }

        const orderEl = createOrderCard(d.id, order, customerData);
        list.appendChild(orderEl);
    }
}

function createOrderCard(id, order, customer) {
    const div = document.createElement('div');
    div.className = 'order-card';
    div.style = "background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); border-right:5px solid #3498db; margin-bottom:15px;";
    
    // تجميع العنوان الكامل
    const fullAddress = `${customer.city || ''}، ${customer.district || ''}، ${customer.street || ''}، ${customer.buildingNo || ''}`.replace(/،+/g, '،').trim();

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start;">
            <div>
                <span style="font-weight:bold; color:#3498db;"># ${order.orderNumber}</span>
                <h4 style="margin:5px 0;">${customer.name || 'عميل غير مسجل'}</h4>
                <div style="font-size:0.85rem; color:#666;">
                    <i class="fas fa-phone"></i> ${customer.phone || '---'} | 
                    <i class="fas fa-map-marker-alt"></i> ${fullAddress}
                </div>
            </div>
            <div style="text-align:left;">
                <div style="font-size:1.2rem; font-weight:bold;">${order.total} ريال</div>
                <button onclick="window.prepareAndPrint('${id}')" style="margin-top:10px; background:#2c3e50; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">
                    <i class="fas fa-print"></i> طباعة الفاتورة
                </button>
            </div>
        </div>
    `;
    
    // تخزين بيانات الفاتورة في الذاكرة للطباعة
    div.dataset.invoice = JSON.stringify({ ...order, customer });
    return div;
}

// حل مشكلة الطباعة (صفحة مستقلة افتراضية)
window.prepareAndPrint = function(orderId) {
    const card = document.querySelector(`[onclick="window.prepareAndPrint('${orderId}')"]`).closest('.order-card');
    const data = JSON.parse(card.dataset.invoice);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة رقم ${data.orderNumber}</title>
            <style>
                body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th, td { border: 1px solid #eee; padding: 12px; text-align: right; }
                th { background: #f9f9f9; }
                .totals { margin-top: 20px; text-align: left; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h2>تيرا جيتواي (Tera Gateway)</h2>
                    <p>رقم الفاتورة: ${data.orderNumber}</p>
                    <p>التاريخ: ${data.orderDate} - ${data.orderTime}</p>
                </div>
                <div style="text-align:left;">
                    <h3>بيانات العميل</h3>
                    <p>${data.customer.name}</p>
                    <p>${data.customer.phone}</p>
                    <p>${data.customer.city} - ${data.customer.district}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price}</td>
                            <td>${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p>السعر الفرعي: ${data.subtotal} ريال</p>
                <p>الضريبة (15%): ${data.tax} ريال</p>
                <p><strong>الإجمالي النهائي: ${data.total} ريال</strong></p>
                <p>طريقة الدفع: ${data.paymentMethodName || data.paymentMethod} ${data.approvalCode ? `(رمز: ${data.approvalCode})` : ''}</p>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
