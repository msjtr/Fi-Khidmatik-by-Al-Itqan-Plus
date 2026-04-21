/**
 * js/modules/customers-ui.js
 * نسخة بسيطة ونظيفة - خالية من الأخطاء
 */

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    
    if (!container) {
        console.error('container غير موجود');
        return;
    }
    
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="customersData">جاري التحميل...</div></div>';
    
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        const customers = [];
        snapshot.forEach(function(doc) {
            customers.push(doc.data());
        });
        
        var div = document.getElementById('customersData');
        
        if (customers.length === 0) {
            div.innerHTML = '<p>لا يوجد عملاء</p>';
            return;
        }
        
        var html = '<table border="1" style="border-collapse:collapse;width:100%">';
        html += '<tr><th>#</th><th>الاسم</th><th>الجوال</th><th>المدينة</th></tr>';
        
        for (var i = 0; i < customers.length; i++) {
            var c = customers[i];
            html += '<tr>';
            html += '<td>' + (i + 1) + '</td>';
            html += '<td>' + (c.name || '') + '</td>';
            html += '<td>' + (c.phone || '') + '</td>';
            html += '<td>' + (c.city || '') + '</td>';
            html += '</tr>';
        }
        
        html += '</table>';
        div.innerHTML = html;
        
    } catch (error) {
        console.error('خطأ:', error);
        document.getElementById('customersData').innerHTML = '<p style="color:red">خطأ في التحميل</p>';
    }
}
