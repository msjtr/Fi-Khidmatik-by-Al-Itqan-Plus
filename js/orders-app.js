import * as logic from './orders-logic.js';

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('editor')) {
        quill = new Quill('#editor', { theme: 'snow' });
    }
    await renderFullDashboard();
});

async function renderFullDashboard() {
    // 1. تجهيز رقم الطلب الجديد
    const meta = logic.generateOrderMeta();
    document.getElementById('orderNo').value = meta.orderNumber;
    document.getElementById('orderDate').value = meta.date;

    // 2. عرض السجل الكامل (الربط الثلاثي)
    const orders = await logic.fetchFullOrdersHistory();
    const table = document.getElementById('ordersTableBody');
    if (table) {
        table.innerHTML = orders.map(o => `
            <tr class="border-b hover:bg-gray-50 text-sm transition">
                <td class="p-4 font-bold text-blue-700">${o.orderNo}</td>
                <td class="p-4 font-bold text-gray-800">${o.customerName}</td>
                <td class="p-4 text-gray-500 text-xs max-w-xs truncate">${o.products}</td>
                <td class="p-4 text-gray-500">${o.date}</td>
                <td class="p-4 font-black text-green-600">${parseFloat(o.total).toFixed(2)} ر.س</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-[10px] bg-blue-100 text-blue-600 font-bold">${o.status}</span>
                </td>
                <td class="p-4 text-center">
                    <button class="text-gray-400 hover:text-blue-600"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

window.submitFullOrder = async () => {
    const data = {
        orderNumber: document.getElementById('orderNo').value,
        customerName: document.getElementById('cName').value,
        orderDate: document.getElementById('orderDate').value,
        total: parseFloat(document.getElementById('finalTotal').value || 0),
        description: quill ? quill.root.innerHTML : '',
        status: "جديد"
    };
    await logic.saveToDB("orders", data);
    alert("تم الحفظ بنجاح!");
    location.reload();
};
