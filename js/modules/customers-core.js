/**
 * js/modules/customers-core.js
 * إدارة عرض بيانات العملاء وتفاصيل العنوان الوطني
 * @version 2.1.0
 */

import { db } from '../core/config.js';

/**
 * تهيئة القسم الخاص بالعملاء
 * @param {HTMLElement} container - الحاوية الرئيسية في الـ HTML
 */
export async function initCustomers(container) {
    if (!container) return;

    // بيانات تجريبية بناءً على المدخلات (محمد صالح الشمري)
    // في النظام الحقيقي، سيتم جلب هذه البيانات من Firestore
    const customerData = {
        name: "محمد صالح جميعان الشمري",
        email: "msjt301@gmail.com",
        phone: "966597771565",
        city: "حائل",
        district: "النقرة",
        street: "سعد المشاط",
        buildingNo: "88043",
        additionalNo: "7714",
        postalCode: "55421", // الرمز البريدي لحائل - النقرة
        poBox: "54745",
        country: "المملكة العربية السعودية",
        createdAt: "2026-03-28T23:20:05.574Z"
    };

    renderCustomerDashboard(container, customerData);
}

/**
 * رسم واجهة تفاصيل العميل
 */
function renderCustomerDashboard(container, data) {
    container.innerHTML = `
        <div class="customer-profile">
            <div class="profile-top-card">
                <div class="user-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="user-main-meta">
                    <h2>${data.name}</h2>
                    <div class="tags">
                        <span class="tag-status">حساب نشط</span>
                        <span class="tag-region"><i class="fas fa-map-marker-alt"></i> منطقة حائل</span>
                    </div>
                </div>
            </div>

            <div class="details-grid">
                <div class="data-card">
                    <div class="card-header">
                        <i class="fas fa-id-card"></i>
                        <span>المعلومات الشخصية</span>
                    </div>
                    <div class="card-body">
                        <div class="data-row">
                            <label>الاسم الكامل</label>
                            <div class="value">${data.name}</div>
                        </div>
                        <div class="data-row">
                            <label>رقم التواصل</label>
                            <div class="value" dir="ltr">${data.phone}</div>
                        </div>
                        <div class="data-row">
                            <label>البريد الإلكتروني</label>
                            <div class="value">${data.email}</div>
                        </div>
                    </div>
                </div>

                <div class="data-card highlight">
                    <div class="card-header">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>تفاصيل العنوان الوطني</span>
                    </div>
                    <div class="card-body">
                        <div class="address-sub-grid">
                            <div class="data-row">
                                <label>المدينة</label>
                                <div class="value">${data.city}</div>
                            </div>
                            <div class="data-row">
                                <label>الحي</label>
                                <div class="value">${data.district}</div>
                            </div>
                            <div class="data-row">
                                <label>اسم الشارع</label>
                                <div class="value">${data.street}</div>
                            </div>
                            <div class="data-row">
                                <label>رقم المبنى</label>
                                <div class="value-box">${data.buildingNo}</div>
                            </div>
                            <div class="data-row">
                                <label>الرقم الإضافي</label>
                                <div class="value-box secondary">${data.additionalNo}</div>
                            </div>
                            <div class="data-row">
                                <label>الرمز البريدي</label>
                                <div class="value-box accent">${data.postalCode}</div>
                            </div>
                            <div class="data-row">
                                <label>صندوق البريد</label>
                                <div class="value">${data.poBox}</div>
                            </div>
                            <div class="data-row">
                                <label>الدولة</label>
                                <div class="value">${data.country}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="data-card full-width">
                    <div class="card-header">
                        <i class="fas fa-file-invoice"></i>
                        <span>سجل طلبات التقسيط المرتبطة</span>
                    </div>
                    <div class="card-body">
                        <div class="orders-placeholder">
                            <i class="fas fa-layer-group"></i>
                            <p>يتم الآن جلب الطلبات المرتبطة برقم: ${data.phone} ...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .customer-profile { padding: 20px; animation: slideIn 0.4s ease-out; }
            
            /* كرت الهيدر */
            .profile-top-card { 
                background: linear-gradient(135deg, #2c3e50, #34495e); 
                padding: 30px; border-radius: 16px; display: flex; align-items: center; gap: 25px; color: white; margin-bottom: 25px;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            .user-avatar { width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
            .user-main-meta h2 { margin: 0; font-size: 1.6rem; }
            .tags { display: flex; gap: 10px; margin-top: 10px; }
            .tag-status { background: #27ae60; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; }
            .tag-region { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; }

            /* الجريد والكروت */
            .details-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
            .data-card { background: white; border-radius: 12px; border: 1px solid #eee; overflow: hidden; }
            .data-card.highlight { border-top: 5px solid #e67e22; }
            .data-card.full-width { grid-column: span 2; }
            
            .card-header { background: #f8fafc; padding: 15px 20px; font-weight: bold; color: #444; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }
            .card-header i { color: #e67e22; }
            
            .card-body { padding: 20px; }
            .data-row { margin-bottom: 15px; }
            .data-row label { display: block; font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px; }
            .data-row .value { font-weight: 700; color: #2c3e50; font-size: 1.05rem; }
            
            /* ستايل صناديق أرقام العنوان */
            .address-sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .value-box { background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #334155; text-align: center; border: 1px solid #e2e8f0; }
            .value-box.secondary { background: #fff7ed; color: #c2410c; border-color: #ffedd5; }
            .value-box.accent { background: #f0f9ff; color: #0369a1; border-color: #e0f2fe; }

            .orders-placeholder { text-align: center; padding: 40px; color: #94a3b8; }
            .orders-placeholder i { font-size: 3rem; margin-bottom: 15px; display: block; opacity: 0.3; }

            @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 992px) { .details-grid { grid-template-columns: 1fr; } .data-card.full-width { grid-column: span 1; } }
        </style>
    `;
}
