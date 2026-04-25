/**
 * js/dashboard-core.js
 * موديول الإحصائيات - Tera Gateway
 * المسار الحالي: fi-khidmatik/js/
 */

// التصحيح النهائي للمسار: الدخول لمجلد core المجاور
import { db } from './core/firebase.js'; 

import { 
    collection, 
    getDocs, 
    query, 
    limit, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initDashboard(container) {
    console.log("🚀 جاري تشغيل لوحة الإحصائيات...");

    // --- 1. تعريف العناصر من الواجهة ---
    const totalCustomersEl = container.querySelector('#stat-total-customers');
    const totalOrdersEl = container.querySelector('#stat-total-orders');
    const recentActivityList = container.querySelector('#recent-activity-list');

    // --- 2. جلب الإحصائيات السريعة ---
    async function fetchStats() {
        try {
            // جلب إجمالي العملاء من مجموعة customers
            const customersSnap = await getDocs(collection(db, "customers"));
            if (totalCustomersEl) totalCustomersEl.innerText = customersSnap.size;

            // جلب إجمالي الطلبات من مجموعة orders
            const ordersSnap = await getDocs(collection(db, "orders"));
            if (totalOrdersEl) totalOrdersEl.innerText = ordersSnap.size;

        } catch (error) {
            console.error("❌ خطأ في جلب الأرقام:", error);
        }
    }

    // --- 3. جلب آخر النشاطات (آخر 5 عملاء مضافين) ---
    async function fetchRecentActivity() {
        if (!recentActivityList) return;

        recentActivityList.innerHTML = '<li style="padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin"></i> جاري تحديث النشاطات...</li>';

        try {
            const q = query(collection(db, "customers"), orderBy("createdAt", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
            
            recentActivityList.innerHTML = '';

            if (querySnapshot.empty) {
                recentActivityList.innerHTML = '<li style="padding:15px; color:#64748b; text-align:center;">لا يوجد عملاء جدد حالياً</li>';
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
                    transition: 0.2s;
                `;
                
                li.innerHTML = `
                    <div style="background: #eff6ff; color: #3b82f6; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-plus" style="font-size: 0.9rem;"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.85rem; font-weight: 700; color: #1e293b;">إضافة عميل جديد: ${data.name}</div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">
                            <i class="fas fa-map-marker-alt" style="font-size:0.7rem;"></i> ${data.city || 'حائل'} - ${data.district || ''}
                        </div>
                    </div>
                `;
                recentActivityList.appendChild(li);
            });
        } catch (error) {
            console.error("❌ فشل تحميل النشاطات:", error);
            recentActivityList.innerHTML = '<li style="padding:15px; color:#ef4444; text-align:center;">تعذر جلب البيانات</li>';
        }
    }

    // تشغيل العمليات
    fetchStats();
    fetchRecentActivity();
}
