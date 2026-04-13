import { loadOrders, db } from './orders-logic.js';

// انتظر تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#orders-table-body'); // تأكد أن هذا الـ ID موجود في الـ HTML
    
    if (!tableBody) return;

    // إظهار رسالة "جاري التحميل"
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">جاري جلب الطلبات...</td></tr>';

    try {
        const orders = await loadOrders();

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا توجد طلبات حالياً.</td></tr>';
            return;
        }

        // مسح محتوى الجدول قبل العرض
        tableBody.innerHTML = '';

        orders.forEach(order => {
            // 1. استخراج أسماء المنتجات والكميات من المصفوفة items
            const productsList = order.items && order.items.length > 0 
                ? order.items.map(item => `${item.name} (${item.quantity})`).join('<br>') 
                : 'بدون منتجات';

            // 2. تنسيق التاريخ (استخدام تاريخ الطلب أو تاريخ الإنشاء)
            const displayDate = order.orderDate || (order.createdAt ? order.createdAt.split('T')[0] : '---');

            // 3. تحديد لون الحالة (تنسيق بسيط)
            let statusColor = '#666';
            if (order.status === 'تم التنفيذ') statusColor = '#28a745';
            if (order.status === 'قيد الانتظار') statusColor = '#ffc107';

            // 4. بناء صف الجدول
            const row = `
                <tr>
                    <td style="font-weight: bold; color: #333;">${order.orderNumber || '---'}</td>
                    <td style="font-size: 0.9em;">${productsList}</td>
                    <td style="text-align: center;">${order.total || 0} ر.س</td>
                    <td style="text-align: center;">
                        <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 4px;">
                            ${order.paymentMethodName || 'غير محدد'}
                        </span>
                    </td>
                    <td style="text-align: center;">
                        <span style="color: white; background: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.85em;">
                            ${order.status || 'مجهول'}
                        </span>
                    </td>
                    <td style="font-family: monospace; font-size: 0.8em; color: #888;">
                        ${order.approvalCode ? order.approvalCode.substring(0, 8) + '...' : '---'}
                    </td>
                    <td style="text-align: center;">${displayDate}</td>
                    <td style="text-align: center;">
                        <button onclick="viewOrderDetails('${order.id}')" class="btn-view">عرض</button>
                    </td>
                </tr>
            `;

            tableBody.insertAdjacentHTML('beforeend', row);
        });

    } catch (error) {
        console.error("خطأ في عرض البيانات:", error);
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">حدث خطأ أثناء عرض البيانات. راجع الكونسول.</td></tr>';
    }
});

// دالة لمشاهدة التفاصيل (يمكنك تطويرها لاحقاً)
window.viewOrderDetails = (orderId) => {
    console.log("فتح تفاصيل الطلب:", orderId);
    alert("معرف الطلب: " + orderId + "\nسيتم فتح نافذة التفاصيل قريباً.");
};
