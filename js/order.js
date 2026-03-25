function checkout(){

if(!cart || cart.length === 0){
alert("السلة فارغة");
return;
}

let last = localStorage.getItem("lastOrderNumber") || 1375;
let num = parseInt(last)+1;
localStorage.setItem("lastOrderNumber", num);

let orderNumber = "FK-2026-" + String(num).padStart(6,'0');

let t = order_time.value;
let time = "-";

if(t){
let [h,m]=t.split(":");
h=parseInt(h);
time=(h%12||12)+":"+m+(h>=12?"م":"ص");
}

let order = {
order_number: orderNumber,
date: order_date.value,
time: time,

customer: name.value,
phone: phone.value,
email: email.value,

city: city.value,
district: district.value,
street: street.value,
building: building.value,
extra: extra.value,
postal: postal.value,

cart: cart,

payment: payment.value,
tamara_auth: tamara_auth.value,
tamara_order: tamara_order.value,
shipping: shipping.value
};

localStorage.setItem("currentOrder", JSON.stringify(order));
location.href="invoice.html";
}
