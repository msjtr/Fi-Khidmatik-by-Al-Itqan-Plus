function checkout(){

// تأكد أن السلة موجودة
if(!window.cart || window.cart.length === 0){
alert("السلة فارغة");
return;
}

// رقم الطلب
let last = localStorage.getItem("num") || 1375;
let n = parseInt(last) + 1;
localStorage.setItem("num", n);

let orderNumber = "FK-2026-" + String(n).padStart(6,'0');

// الوقت
let timeInput = document.getElementById("order_time");
let time = "-";

if(timeInput && timeInput.value){
let parts = timeInput.value.split(":");
let h = parseInt(parts[0]);
let m = parts[1];

let period = h >= 12 ? "م" : "ص";
h = h % 12 || 12;

time = h + ":" + m + period;
}

// دالة مساعدة تجيب القيمة بأمان
function getVal(id){
let el = document.getElementById(id);
return el ? el.value : "";
}

// إنشاء الطلب
let order = {

order_number: orderNumber,
date: getVal("order_date"),
time: time,

customer: getVal("name"),
phone: getVal("phone"),
email: getVal("email"),

city: getVal("city"),
district: getVal("district"),
street: getVal("street"),
building: getVal("building"),
extra: getVal("extra"),
postal: getVal("postal"),

cart: window.cart,

payment: getVal("payment"),
tamara_auth: getVal("tamara_auth"),
tamara_order: getVal("tamara_order"),

shipping: getVal("shipping")
};

// حفظ
localStorage.setItem("order", JSON.stringify(order));

// تأكد من الحفظ
if(!localStorage.getItem("order")){
alert("خطأ في حفظ الطلب");
return;
}

// انتقال
window.location.href = "invoice.html";

}
