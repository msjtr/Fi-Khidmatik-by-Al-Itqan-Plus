import { 
    db, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    query, 
    orderBy, 
    limit,
    where
} from './firebase.js';

// ========== دوال مساعدة ==========
function sanitizeOrderData(orderData) {
    const items = (orderData.items || orderData.cart || []).map(item => ({
        productId: item.productId || null,
        name: item.name || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        barcode: item.barcode || '',
        image: item.image || '',
        description: item.description || '',
        productDetails: item.productDetails || null
    }));
    
    return {
        customer: orderData.customer || '',
        customerId: orderData.customerId || null,
        phone: orderData.phone || '',
        cart: items,
        items: items,
        total: orderData.total || 0,
        payment: orderData.payment || '',
        paymentMethod: orderData.paymentMethod || orderData.payment || '',
        paymentMethodName: orderData.paymentMethodName || '',
        shipping: orderData.shipping || '',
        shippingMethod: orderData.shippingMethod || orderData.shipping || 'pickup',
        shippingAddress: orderData.shippingAddress || null,
        extraEmail: orderData.extraEmail || null,
        approvalCode: orderData.approvalCode || null,
        otherPaymentText: orderData.otherPaymentText || null,
        subtotal: orderData.subtotal || 0,
        discount: orderData.discount || 0,
        discountType: orderData.discountType || 'fixed',
        tax: orderData.tax || 0,
        notes: orderData.notes || '',
        status: orderData.status || 'جديد'
    };
}

// ========== حفظ طلب جديد ==========
export async function saveOrderToFirebase(orderData) {
    try {
        const ordersRef = collection(db, 'orders');
        const safeData = sanitizeOrderData(orderData);
        
        const timestamp = Date.now();
        const orderNumber = orderData.orderNumber || `KF-${timestamp.toString().slice(-8)}`;
        
        const docRef = await addDoc(ordersRef, {
            ...safeData,
            orderNumber: orderNumber,
            orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
            orderTime: orderData.orderTime || new Date().toLocaleTimeString('en-US', { hour12: false }),
            createdAt: new Date().toISOString(),
            timestamp: timestamp,
            updatedAt: new Date().toISOString(),
            status: safeData.status
        });

        console.log('✅ تم حفظ الطلب:', docRef.id, 'رقم الطلب:', orderNumber);
        return { id: docRef.id, orderNumber: orderNumber };

    } catch (error) {
        console.error('❌ خطأ في الحفظ:', error);
        throw new Error('فشل حفظ الطلب: ' + error.message);
    }
}

// ========== جلب طلب بواسطة ID ==========
export async function getOrderFromFirebase(orderId) {
    try {
        if (!orderId) throw new Error('معرّف الطلب مطلوب');
        
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('✅ تم جلب الطلب:', orderId);
            return {
                id: docSnap.id,
                ...data,
                items: (data.items || data.cart || []).map(item => ({
                    ...item,
                    image: item.image || ''
                })),
                cart: (data.cart || data.items || []).map(item => ({
                    ...item,
                    image: item.image || ''
                }))
            };
        }

        console.warn('⚠️ الطلب غير موجود:', orderId);
        return null;

    } catch (error) {
        console.error('❌ خطأ في جلب الطلب:', error);
        throw error;
    }
}

// ========== جلب جميع الطلبات (نسخة محسّنة - بدون تكرار) ==========
export async function getAllOrdersFromFirebase(limitCount = 500) {
    try {
        console.log('🔄 جاري جلب الطلبات من Firebase...');
        
        const ordersRef = collection(db, 'orders');
        
        // استخدام orderBy مع createdAt مع التعامل مع الحقول المفقودة
        // استخدام orderBy مع '__name__' كبديل آمن
        let q;
        try {
            q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
        } catch (error) {
            console.warn('⚠️ لا يمكن الترتيب بـ createdAt، استخدام الترتيب الافتراضي');
            q = query(ordersRef, limit(limitCount));
        }
        
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const items = (data.items || data.cart || []).map(item => ({
                ...item,
                image: item.image || ''
            }));
            
            orders.push({ 
                id: doc.id, 
                ...data,
                items: items,
                cart: items
            });
        });

        console.log(`✅ تم جلب ${orders.length} طلب بنجاح`);
        
        // عرض أول 5 طلبات في الكونسول للتحقق
        if (orders.length > 0) {
            console.log('📋 أول 5 طلبات:', orders.slice(0, 5).map(o => ({
                id: o.id,
                orderNumber: o.orderNumber,
                customer: o.customer || o.customerId,
                date: o.orderDate
            })));
        }
        
        return orders;

    } catch (error) {
        console.error('❌ خطأ في جلب الطلبات:', error);
        console.error('تفاصيل الخطأ:', error.message);
        // إعادة محاولة جلب بدون ترتيب
        try {
            console.log('🔄 محاولة جلب الطلبات بدون ترتيب...');
            const ordersRef = collection(db, 'orders');
            const simpleQuery = query(ordersRef, limit(limitCount));
            const simpleSnapshot = await getDocs(simpleQuery);
            const orders = [];
            simpleSnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            console.log(`✅ تم جلب ${orders.length} طلب (بدون ترتيب)`);
            return orders;
        } catch (fallbackError) {
            console.error('❌ فشلت المحاولة الثانية:', fallbackError);
            throw error;
        }
    }
}

// ========== جلب الطلبات مع الفلترة (محسّن) ==========
export async function getFilteredOrders(filters = {}) {
    try {
        console.log('🔄 جاري جلب الطلبات المفلترة...', filters);
        
        let ordersRef = collection(db, 'orders');
        let constraints = [];
        
        // إضافة شروط الفلترة
        if (filters.status && filters.status !== '') {
            constraints.push(where('status', '==', filters.status));
        }
        if (filters.customerId) {
            constraints.push(where('customerId', '==', filters.customerId));
        }
        if (filters.shippingMethod && filters.shippingMethod !== '') {
            constraints.push(where('shippingMethod', '==', filters.shippingMethod));
        }
        if (filters.startDate) {
            constraints.push(where('orderDate', '>=', filters.startDate));
        }
        if (filters.endDate) {
            constraints.push(where('orderDate', '<=', filters.endDate));
        }
        
        // إضافة الترتيب (مع التعامل مع الأخطاء)
        try {
            constraints.push(orderBy('createdAt', 'desc'));
        } catch (error) {
            console.warn('⚠️ لا يمكن الترتيب بـ createdAt');
        }
        
        // إضافة الحد
        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }
        
        const q = query(ordersRef, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const items = (data.items || data.cart || []).map(item => ({
                ...item,
                image: item.image || ''
            }));
            orders.push({ id: doc.id, ...data, items: items });
        });
        
        console.log(`✅ تم جلب ${orders.length} طلب مفلتر`);
        return orders;
        
    } catch (error) {
        console.error('❌ خطأ في جلب الطلبات المفلترة:', error);
        throw error;
    }
}

// ========== تحديث حالة الطلب ==========
export async function updateOrderStatusInFirebase(orderId, newStatus) {
    try {
        if (!orderId || !newStatus) throw new Error('معرّف الطلب والحالة الجديدة مطلوبان');
        
        const validStatuses = ['جديد', 'تحت التنفيذ', 'تم التنفيذ', 'تحت المراجعة', 'مسترجع', 'ملغي'];
        if (!validStatuses.includes(newStatus)) throw new Error('حالة غير صالحة: ' + newStatus);
        
        const docRef = doc(db, 'orders', orderId);
        await updateDoc(docRef, { status: newStatus, updatedAt: new Date().toISOString() });

        console.log('✅ تم تحديث حالة الطلب:', orderId, '->', newStatus);
        return true;

    } catch (error) {
        console.error('❌ خطأ في تحديث الحالة:', error);
        throw error;
    }
}

// ========== تحديث بيانات الطلب كاملة ==========
export async function updateOrderInFirebase(orderId, orderData) {
    try {
        const docRef = doc(db, 'orders', orderId);
        const safeData = sanitizeOrderData(orderData);
        
        await updateDoc(docRef, {
            ...safeData,
            orderDate: orderData.orderDate,
            orderTime: orderData.orderTime,
            updatedAt: new Date().toISOString()
        });
        
        console.log('✅ تم تحديث الطلب:', orderId);
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحديث الطلب:', error);
        throw error;
    }
}

// ========== حذف طلب ==========
export async function deleteOrderFromFirebase(orderId) {
    try {
        if (!orderId) throw new Error('معرّف الطلب مطلوب');
        const docRef = doc(db, 'orders', orderId);
        await deleteDoc(docRef);
        console.log('✅ تم حذف الطلب:', orderId);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف الطلب:', error);
        throw error;
    }
}

// ========== إحصائيات الطلبات ==========
export async function getOrdersStatistics() {
    try {
        const orders = await getAllOrdersFromFirebase(1000);
        
        const stats = {
            total: orders.length,
            totalRevenue: 0,
            byStatus: {},
            last30Days: 0,
            today: 0
        };
        
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        orders.forEach(order => {
            stats.totalRevenue += order.total || 0;
            const status = order.status || 'غير محدد';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            if (order.timestamp && order.timestamp >= thirtyDaysAgo) stats.last30Days++;
            if (order.createdAt && order.createdAt.split('T')[0] === today) stats.today++;
        });
        
        return stats;
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        throw error;
    }
}

// ========== البحث في الطلبات ==========
export async function searchOrders(searchTerm) {
    try {
        const orders = await getAllOrdersFromFirebase();
        const term = searchTerm.toLowerCase();
        const filtered = orders.filter(order => {
            return (
                order.orderNumber?.toLowerCase().includes(term) ||
                order.customer?.toLowerCase().includes(term) ||
                order.phone?.includes(term) ||
                order.items?.some(item => item.name?.toLowerCase().includes(term))
            );
        });
        return filtered;
    } catch (error) {
        console.error('❌ خطأ في البحث:', error);
        throw error;
    }
}

// ========== تصدير CSV ==========
export async function exportOrdersToCSV(orders) {
    try {
        const headers = ['رقم الطلب', 'التاريخ', 'العميل', 'الجوال', 'المنتجات', 'الإجمالي', 'الحالة', 'طريقة الدفع'];
        const rows = orders.map(order => {
            const productsList = (order.items || []).map(item => 
                `${item.name} (${item.quantity} × ${item.price})`
            ).join(' | ');
            
            return [
                order.orderNumber,
                order.orderDate,
                order.customer || 'غير معروف',
                order.phone || '—',
                productsList,
                order.total || 0,
                order.status || 'جديد',
                order.paymentMethodName || order.paymentMethod || '—'
            ];
        });
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('❌ خطأ في التصدير:', error);
        throw error;
    }
}

// ========== جلب طلبات العميل ==========
export async function getCustomerOrders(customerId) {
    try {
        if (!customerId) throw new Error('معرّف العميل مطلوب');
        
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ تم جلب ${orders.length} طلب للعميل ${customerId}`);
        return orders;
    } catch (error) {
        console.error('❌ خطأ في جلب طلبات العميل:', error);
        throw error;
    }
}

// ========== دالة اختبار للتحقق من الاتصال بقاعدة البيانات ==========
export async function testFirebaseConnection() {
    try {
        console.log('🔄 اختبار الاتصال بقاعدة البيانات...');
        
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);
        
        console.log(`✅ الاتصال ناجح! عدد الطلبات في قاعدة البيانات: ${snapshot.size}`);
        
        if (snapshot.size > 0) {
            console.log('📋 أول 3 طلبات في قاعدة البيانات:');
            snapshot.docs.forEach((doc, index) => {
                if (index < 3) {
                    const data = doc.data();
                    console.log(`  ${index + 1}. ID: ${doc.id}`);
                    console.log(`     رقم الطلب: ${data.orderNumber || 'غير محدد'}`);
                    console.log(`     العميل: ${data.customer || data.customerId || 'غير محدد'}`);
                    console.log(`     التاريخ: ${data.orderDate || 'غير محدد'}`);
                    console.log(`     الإجمالي: ${data.total || 0} ريال`);
                    console.log('     ---');
                }
            });
        } else {
            console.log('⚠️ لا توجد طلبات في قاعدة البيانات');
            console.log('💡 يمكنك إضافة طلب تجريبي باستخدام:');
            console.log('   await addOrder({ orderNumber: "TEST-001", customer: "عميل تجريبي", total: 100 });');
        }
        
        return { success: true, count: snapshot.size };
    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
        return { success: false, error: error.message };
    }
}
