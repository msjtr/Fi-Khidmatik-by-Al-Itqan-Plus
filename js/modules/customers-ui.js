/**
 * Tera Gateway 12.12.6 - Customers UI Module
 * معالجة عرض البيانات وحل أخطاء التكرار السحابي
 */

export async function loadCustomers(db, query, collection, getDocs, orderBy) {
    const list = document.getElementById('customersList');
    if (!list) return;

    try {
        const customerRef = collection(db, "customers");
        const q = query(customerRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        list.innerHTML = '';
        let count = 0;

        // الحل الجذري للخطأ: التحقق من صحة كل وثيقة قبل معالجتها
        snapshot.forEach((docSnap) => {
            const c = docSnap.data();
            if (!c || !c.name) return; // تخطي السجلات التالفة

            count++;
            const id = docSnap.id;
            
            const row = `
                <tr class="tera-row">
                    <td>${count}</td>
                    <td>
                        <div class="user-cell">
                            <img src="${c.photoURL || 'admin/images/default-avatar.png'}" class="table-img-circle">
                            <div class="user-info">
                                <span class="user-name">${c.name}</span>
                                <span class="user-id">#${id.substring(0,6)}</span>
                            </div>
                        </div>
                    </td>
                    <td dir="ltr" class="amount">${c.phone || '-'}</td>
                    <td>${c.district || 'حائل'}</td>
                    <td><span class="tag-${c.tag || 'regular'}">${c.tag === 'vip' ? 'مميز ✨' : 'عادي'}</span></td>
                    <td>
                        <div class="table-actions">
                            <button onclick="editCustomer('${id}')" class="btn-action edit"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteCustomer('${id}')" class="btn-action delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            list.insertAdjacentHTML('beforeend', row);
        });

        if(count === 0) {
            list.innerHTML = '<tr><td colspan="6" class="text-center p-5">لا يوجد عملاء مسجلين حالياً</td></tr>';
        }

    } catch (error) {
        console.error("Tera UI Error:", error);
        list.innerHTML = '<tr><td colspan="6" class="text-center text-danger">خطأ في مزامنة البيانات السحابية</td></tr>';
    }
}
