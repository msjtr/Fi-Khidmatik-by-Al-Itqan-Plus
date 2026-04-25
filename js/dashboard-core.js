/**
 * js/dashboard-core.js
 * موديول الإحصائيات - Tera Gateway
 */

// التصحيح: الدخول لمجلد core المجاور للملف الحالي
import { db } from './core/firebase.js'; 

import { 
    collection, 
    getDocs, 
    query, 
    limit, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initDashboard(container) {
    console.log("Dashboard Initialized...");

    // --- 1. تعريف العناصر من الواجهة ---
    const totalCustomersEl = container.querySelector('#stat-total-customers');
    const totalOrdersEl = container.querySelector('#stat-total-orders');
    const recentActivityList = container.querySelector('#recent-activity-list');

    // --- 2. جلب الإحصائيات السريعة ---
    async function fetchStats() {
        try {
            // جلب إجمالي العملاء
            const customersSnap = await getDocs(collection(db, "customers"));
            if (totalCustomersEl) totalCustomersEl.innerText = customersSnap.size;

            // جلب إجمالي الطلبات
            const ordersSnap = await getDocs(collection(db, "orders"));
            if (totalOrdersEl) totalOrdersEl.innerText = ordersSnap.size;

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    }

    // --- 3. جلب آخر النشاطات (آخر 5 عملاء مضافين) ---
    async function fetchRecentActivity() {
        if (!recentActivityList) return;

        recentActivityList.innerHTML = '<li style="padding:10px; text-align:center;">جاري تحميل النشاطات...</li>';

        try {
            const q = query(collection(db, "customers"), orderBy("createdAt", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
            
            recentActivityList.innerHTML = '';

            if (querySnapshot.empty) {
                recentActivityList.innerHTML = '<li style="padding:10px; color:#64748b;">لا يوجد نشاط مؤخراً</li>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const li = document.createElement('li');
                li.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-bottom: 1px solid #f1f5f9;
                `;
                
                li.innerHTML = `
                    <div style="background: #fff7ed; color: #e67e22; width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-plus" style="font-size: 0.9rem;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.85rem; font-weight: 700; color: #1e293b;">إضافة عميل جديد: ${data.name}</div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">${data.city || 'حائل'}</div>
                    </div>
                `;
                recentActivityList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching recent activity:", error);
            recentActivityList.innerHTML = '<li style="padding:10px; color:red;">فشل تحميل النشاطات</li>';
        }
    }

    // تشغيل الدوال
    fetchStats();
    fetchRecentActivity();
}
