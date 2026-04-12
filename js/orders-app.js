// orders-app.js
import * as Logic from './orders-logic.js';

document.addEventListener('DOMContentLoaded', async () => {
    // تحميل الطلبات عند البدء
    const orders = await Logic.loadAllOrders();
    console.log("الطلبات المحملة:", orders);

    // زر إضافة طلب جديد
    document.getElementById('newOrderBtn').addEventListener('click', () => {
        Logic.toggleModal('orderModal', true);
    });

    // زر إغلاق المودال
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        Logic.toggleModal('orderModal', false);
    });

    // تبديل طرق الدفع
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});
