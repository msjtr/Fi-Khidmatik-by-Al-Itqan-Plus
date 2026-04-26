// دالة رسم صف العميل لضمان ظهور كافة التفاصيل المذكورة
function createCustomerRow(customer) {
    // استخراج البيانات مع وضع قيم افتراضية في حال الفقدان
    const name = customer.name || 'غير مسجل';
    const phone = customer.phone || '';
    const countryCode = customer.countryCode || '+966';
    const city = customer.city || '';
    const district = customer.district || '';
    const street = customer.street || '';
    const buildingNo = customer.buildingNo || '';
    const additionalNo = customer.additionalNo || '';
    const postalCode = customer.postalCode || '';
    const tag = customer.tag || 'عادي';

    return `
        <tr class="customer-row">
            <td class="col-name">
                <div class="user-info">
                    <span class="user-name">${name}</span>
                    <small class="user-email">${customer.email || ''}</small>
                </div>
            </td>
            <td class="col-phone">${countryCode} ${phone}</td>
            <td class="col-address">
                <div class="address-details">
                    <span>${city} - ${district}</span>
                    <small class="street-info">${street} | مبنى: ${buildingNo}</small>
                </div>
            </td>
            <td class="col-postal">
                <div class="postal-info">
                    <span>الرمز: ${postalCode}</span>
                    <small>إضافي: ${additionalNo}</small>
                </div>
            </td>
            <td class="col-tag">
                <span class="badge badge-${tag.toLowerCase()}">${tag.toUpperCase()}</span>
            </td>
            <td class="col-actions">
                <button onclick="editCustomer('${customer.id}')" class="btn-icon edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCustomer('${customer.id}')" class="btn-icon delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
}
