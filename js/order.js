function checkout(){

if(cart.length === 0){
alert("السلة فارغة");
return;
}

// 🔥 رقم طلب متسلسل
let lastNumber = localStorage.getItem("lastOrderNumber") || 1375;
let newNumber = parseInt(lastNumber) + 1;

let orderNumber = "FK-2026-" + String(newNumber).padStart(6, '0');

localStorage.setItem("lastOrderNumber", newNumber);

// 🔥 تنسيق الوقت 12 ساعة (ص / م)
let timeInput = document.getElementById("order_time").value;

let formattedTime = "-";

if(timeInput){

let [hour, minute] = timeInput.split(":");

let h = parseInt(hour);

let period = h >= 12 ? "م" : "ص";

h = h % 12;
if(h === 0) h = 12;

formattedTime = h + ":" + minute + period;

}

// 🔥 إنشاء الطلب
let order = {

order_number: orderNumber,
date: document.getElementById("order_date").value || "-",
time: formattedTime,

customer: document.getElementById("name").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,

// 🔥 العنوان الوطني الكامل
country: document.getElementById("country").value,
region: document.getElementById("region").value,
district: document.getElementById("district").value,
street: document.getElementById("street").value,

building: document.getElementById("building").value,
extra: document.getElementById("extra").value,
postal: document.getElementById("postal").value,

email: document.getElementById("email").value,

cart: cart,

payment: document.getElementById("payment").value,
tamara_auth: document.getElementById("tamara_auth").value,
tamara_order: document.getElementById("tamara_order").value,

shipping: document.getElementById("shipping").value

};

// 🔥 حفظ الطلب
localStorage.setItem("currentOrder", JSON.stringify(order));

// 🔥 الانتقال للفاتورة
window.location.href = "invoice.html";

}
