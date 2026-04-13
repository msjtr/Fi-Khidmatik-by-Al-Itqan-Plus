/**
 * fi-khidmatik/js/orders-logic.js
 * المنطق البرمجي لإدارة العمليات والحسابات - النسخة المعتمدة
 */

let currentOrderItems = [];

// --- 1. حسابات الفاتورة (مع معالجة الكسور) ---
export const calculateFinance = (discount = 0) => {
    // حساب المجموع الفرعي مع التقريب لضمان الدقة
    const subtotal = currentOrderItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    const taxRate = 0.15; // ضريبة القيمة المضافة 15%
    
    // الخصم لا يمكن أن يتجاوز قيمة المجموع الفرعي
    const validDiscount = Math.min(discount, subtotal);
    const taxableAmount = Math.max(0, subtotal - validDiscount);
    
    // حساب الضريبة والإجمالي
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        discount: validDiscount.toFixed(2)
    };
};

// --- 2. إدارة قائمة المنتجات (UI) ---
export const renderProductList = (containerId, updateCallback) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (currentOrderItems.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 opacity-50">
                <i class="fas fa-box-open text-3xl mb-2 block"></i>
                <p class="text-sm">السلة فارغة، ابدأ بإضافة المنتجات</p>
            </div>`;
        
        // تحديث المبالغ لتصبح أصفاراً
        if (typeof window.updateTotalDisplay === 'function') window.updateTotalDisplay();
        return;
    }

    container.innerHTML = currentOrderItems.map((item, index) => `
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm animate-fade-in group hover:border-blue-200 transition-all">
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h4 class="font-bold text-slate-700 text-sm">${item.name}</h4>
                </div>
                <p class="text-[11px] text-blue-600 font-bold mt-1">${item.price.toFixed(2)} ريال</p>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button type="button" onclick="window.changeQty(${index}, -1)" class="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all">-</button>
                    <span class="px-3 text-xs font-black text-slate-700 w-8 text-center">${item.quantity}</span>
                    <button type="button" onclick="window.changeQty(${index}, 1)" class="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all">+</button>
                </div>
                <button type="button" onclick="window.removeItem(${index})" class="w-8 h-8 text-slate-300 hover:text-red-500 transition-colors">
                    <i class="fas fa-trash-alt text-sm"></i>
                </button>
            </div>
        </div>
    `).join('');

    // تحديث المجموع تلقائياً
    if (typeof window.updateTotalDisplay === 'function') {
        window.updateTotalDisplay();
    }
};

// --- 3. وظائف التعديل (Global) ---
window.changeQty = (index, delta) => {
    if (currentOrderItems[index]) {
        const newQty = currentOrderItems[index].quantity + delta;
        if (newQty > 0) {
            currentOrderItems[index].quantity = newQty;
            renderProductList('productsContainer');
        } else {
            // إذا وصلت الكمية لصفر، نقوم بالحذف بعد التأكيد أو مباشرة
            window.removeItem(index);
        }
    }
};

window.removeItem = (index) => {
    currentOrderItems.splice(index, 1);
    renderProductList('productsContainer');
};

// --- 4. أدوات مساعدة ---
export const resetLogic = () => {
    currentOrderItems = [];
};

export const addItem = (product) => {
    // التحقق من صحة البيانات قبل الإضافة
    const price = parseFloat(product.price) || 0;
    const name = product.name || "منتج غير مسمى";
    const id = product.id || Date.now();

    const existing = currentOrderItems.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        currentOrderItems.push({ id, name, price, quantity: 1 });
    }
    renderProductList('productsContainer');
};

export const getCurrentItems = () => currentOrderItems;

export const setCurrentItems = (items) => { 
    currentOrderItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
    })) : []; 
};
