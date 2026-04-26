/**
 * customers-ui.js
 * موديول واجهة المستخدم لقاعدة العملاء - يدعم كافة تفاصيل العنوان والبيانات الإضافية
 */

export function initCustomersUI(container) {
    if (!container) return;

    // بناء الهيكل الرئيسي للموديول
    container.innerHTML = `
        <div class="module-header">
            <div class="header-content">
                <h2><i class="fas fa-users"></i> قاعدة العملاء</h2>
                <p>إدارة بيانات العملاء وتفاصيل العناوين الوطنية</p>
            </div>
            <button class="btn-primary" onclick="window.openAddCustomerModal()">
                <i class="fas fa-user-plus"></i> إضافة عميل جديد
            </button>
        </div>

        <div class="filter-section">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customerSearch" placeholder="بحث باسم العميل، الجوال، أو المدينة...">
            </div>
        </div>

        <div class="table-responsive">
            <table class="customers-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان الوطني</th>
                        <th>الرمز والبريد</th>
                        <th>التصنيف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customersList">
                    </tbody>
            </table>
        </div>
    `;

    // استدعاء البيانات من Firestore (بافتراض وجود دالة جلب البيانات)
    renderCustomers();
}

/**
 * دالة رسم صفوف الجدول بناءً على العناصر الكاملة للمجموعة
 */
function createCustomerRow(customer) {
    // استخراج العناصر لضمان عدم الحذف أو الدمج
    const {
        name = 'غير مسجل',
        email = '',
        phone = '',
        countryCode = '+966',
        city = '',
        district = '',
        street = '',
        buildingNo = '',
        additionalNo = '',
        postalCode = '',
        tag = 'عادي'
    } = customer;

    // تنسيق الصف مع إظهار كافة التفاصيل الإضافية
    return `
        <tr class="customer-row anim-fade-in">
            <td>
                <div class="customer-info">
                    <div class="avatar">${name.charAt(0)}</div>
                    <div class="details">
                        <span class="name">${name}</span>
                        <span class="email">${email}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="phone-wrapper">
                    <span class="code">${countryCode}</span>
                    <span class="number">${phone}</span>
                </div>
            </td>
            <td>
                <div class="address-grid">
                    <span class="main-addr">${city}، حي ${district}</span>
                    <span class="sub-addr">${street} | مبنى: ${buildingNo}</span>
                </div>
            </td>
            <td>
                <div class="postal-grid">
                    <span class="zip">الرمز: ${postalCode}</span>
                    <span class="extra">إضافي: ${additionalNo}</span>
                </div>
            </td>
            <td>
                <span class="tag-badge tag-${tag.toLowerCase()}">${tag.toUpperCase()}</span>
            </td>
            <td>
                <div class="actions">
                    <button title="تعديل" onclick="editCustomer('${customer.id}')" class="action-btn edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button title="حذف" onclick="deleteCustomer('${customer.id}')" class="action-btn delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// دالة تخيلية لجلب البيانات (يجب ربطها بملف firebase.js لديك)
async function renderCustomers() {
    const tbody = document.getElementById('customersList');
    if (!tbody) return;

    try {
        // هنا يتم استدعاء البيانات من المجموعات (Collections)
        // مثال على البيانات التي طلبت إظهارها:
        const sampleData = [
            {
                id: "1",
                name: "محمد صالح جميعان الشمري",
                phone: "597771565",
                city: "حائل",
                district: "النقرة",
                street: "سعد المشاط",
                buildingNo: "88043",
                additionalNo: "7714",
                postalCode: "54745",
                tag: "vip",
                email: "msjt301@gmail.com"
            }
        ];

        tbody.innerHTML = sampleData.map(c => createCustomerRow(c)).join('');
    } catch (error) {
        console.error("Error rendering customers:", error);
    }
}
