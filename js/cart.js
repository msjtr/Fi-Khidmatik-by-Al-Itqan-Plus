window.cart = [];

function addToCart(){

let name = product_name.value.trim();
let desc = product_desc.value.trim();
let price = product_price.value.trim();

if(!name || !price) return alert("أدخل اسم المنتج والسعر");
if(isNaN(price)) return alert("السعر رقم فقط");

price = parseFloat(price);

cart.push({name, desc, price, qty:1});
renderCart();

product_name.value = "";
product_desc.value = "";
product_price.value = "";

}

function renderCart(){

let html = "";
let total = 0;

if(cart.length === 0){
html = "السلة فارغة";
} else {

cart.forEach((p,i)=>{

let t = p.price * p.qty;
total += t;

html += `
<div class="cart-item">
<div>${p.name}</div>
<div>${p.price} ريال</div>
<div>
<button onclick="decreaseQty(${i})">-</button>
${p.qty}
<button onclick="increaseQty(${i})">+</button>
</div>
<div>${t.toFixed(2)}</div>
<div><button onclick="removeItem(${i})">حذف</button></div>
</div>`;
});

html += `<h3>المجموع: ${total.toFixed(2)} ريال</h3>`;
}

cart.innerHTML = html;
}

function increaseQty(i){ cart[i].qty++; renderCart(); }
function decreaseQty(i){ if(cart[i].qty>1){ cart[i].qty--; renderCart(); }}
function removeItem(i){ cart.splice(i,1); renderCart(); }
