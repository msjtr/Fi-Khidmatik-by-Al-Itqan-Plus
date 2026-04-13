import { db } from './orders-firebase-db.js';
import { getOrders, deleteOrder, toast } from './orders-logic.js';

const container = document.getElementById('ordersContainer');

// دالة المعاينة والطباعة (نفس منطق كودك القديم)
window.openPreview = function(order) {
    const area = document.getElementById('printArea');
    area.innerHTML = `
        <div style="direction: rtl; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #2563eb; text-align: center;">فاتورة طلب رقم: ${order.orderNumber || order.id}</h2>
            <hr style="margin: 20px 0;">
            <p><strong>العميل:</strong> ${order.customerName || 'غير مسجل'}</p>
            <p><strong>المنتج:</strong> ${order.packageName || order.product || 'باقة خدمات'}</p>
            <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            <p><strong>طريقة الدفع:</strong> ${order.paymentMethod || 'مدى'}</p>
            <div style="margin-top: 30px; font-size: 1.2rem; font-bold; text-align: center; background: #f8fafc; padding: 10px;">
                الإجمالي: ${order.price || 0} ريال
            </div>
        </div>
    `;
    document.getElementById('previewModal').classList.remove('hidden');
    document.getElementById('previewModal').classList.add('flex');
};

async function render() {
    container.innerHTML = '<p class="col-span-full text-center py-10">جاري تحميل الطلبات...</p>';
    const orders = await getOrders();
    container.innerHTML = '';

    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = "order-card p-6 rounded-2xl shadow-sm border border-gray-100 relative";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="status-badge status-new">جديد</span>
                <button class="text-red-300 hover:text-red-500 del-btn"><i class="fas fa-trash"></i></button>
            </div>
            <h3 class="font-bold text-xl mb-1">${order.customerName || 'عميل تيرا'}</h3>
            <p class="text-gray-500 text-sm mb-4">${order.packageName || 'طلب باقة سawa'}</p>
            <div class="flex justify-between items-center border-t pt-4">
                <span class="text-blue-600 font-bold text-lg">${order.price} ريال</span>
                <button class="view-btn bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition">معاينة والطباعة</button>
            </div>
        `;
        
        card.querySelector('.view-btn').onclick = () => openPreview(order);
        card.querySelector('.del-btn').onclick = async () => {
            if(await deleteOrder(order.id)) {
                toast("تم حذف الطلب بنجاح");
                render();
            }
        };
        container.appendChild(card);
    });
}

// أزرار المودال
document.getElementById('closePreviewBtn').onclick = () => document.getElementById('previewModal').classList.add('hidden');
document.getElementById('newOrderBtn').onclick = () => alert("سيتم تفعيل مودال الإضافة في التحديث القادم");

window.addEventListener('DOMContentLoaded', render);
