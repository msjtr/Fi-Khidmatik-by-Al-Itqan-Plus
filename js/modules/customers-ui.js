/**
 * customers-ui.js - Tera Gateway 
 * نسخة مطابقة تماماً لهيكلية قاعدة بيانات أستاذ محمد الشمري
 */

import * as Core from './customers-core.js';

export async function initCustomersUI(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif;">
            <div class="action-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h3 style="margin:0; color:#1e293b;">👥 إدارة العملاء</h3>
                <button class="btn-tera" onclick="showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إضافة عميل جديد
                </button>
            </div>
            
            <div class="table-responsive" style="background:white; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;">
                <table class="tera-table" style="width:100%; border-collapse:collapse; text-align:right;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                            <th style="padding:15px;">العميل</th>
                            <th style="padding:15px;">الاتصال</th>
                            <th style="padding:15px;">العنوان الوطني (حائل)</th>
                            <th style="padding:15px; text-align:center;">التصنيف</th>
                            <th style="padding:15px; text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align:center; padding:40px; color:#64748b;">جاري جلب بيانات "تيرا" من السحابة...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadAndRender();
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;

            // الربط المباشر مع مسميات الحقول الخاصة بك (حروف صغيرة وكبيرة بدقة)
            const name = d.name || "غير مسجل";
            const email = d.email || "-";
            const fullPhone = (d.countryCode || "") + " " + (d.phone || "");
            const tag = d.tag || "عام";
            
            // تنسيق العنوان الوطني حسب بياناتك (النقرة، سعد المشاط...)
            const address = `
                <b>${d.city || 'حائل'} - ${d.district || '-'}</b><br>
                <small>${d.street || '-'} | مبنى: ${d.buildingNo || '-'} | إضافي: ${d.additionalNo || '-'}</small><br>
                <small style="color:#2563eb;">الرمز البريدي: ${d.postalCode || '-'}</small>
            `;

            list.innerHTML += `
                <tr class="cust-row" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:15px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:40px; height:40px; background:#eff6ff; color:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                                ${name.charAt(0)}
                            </div>
                            <div>
                                <div style="font-weight:bold; color:#1e293b;">${name}</div>
                                <div style="font-size:0.8rem; color:#64748b;">${email}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding:15px;" dir="ltr">
                        <span style="font-size:0.9rem; color:#334155;">${fullPhone}</span>
                    </td>
                    <td style="padding:15px; font-size:0.85rem; line-height:1.4;">
                        ${address}
                    </td>
                    <td style="padding:15px; text-align:center;">
                        <span style="background:${tag === 'vip' ? '#fef3c7' : '#f1f5f9'}; color:${tag === 'vip' ? '#92400e' : '#475569'}; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">
                            ${tag}
                        </span>
                    </td>
                    <td style="padding:15px; text-align:center;">
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button onclick="handleEdit('${id}')" style="background:none; border:none; color:#64748b; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="handleDelete('${id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });

    } catch (error) {
        console.error("خطأ في العرض:", error);
        list.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center; padding:20px;">خطأ: ${error.message}</td></tr>`;
    }
}
