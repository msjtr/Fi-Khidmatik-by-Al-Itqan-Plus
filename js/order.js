function checkout(){

let orders = JSON.parse(localStorage.getItem("orders")) || [];

let order = {

order_number: document.getElementById("order_number").value,
date: document.getElementById("order_date").value,
time: document.getElementById("order_time").value,

customer: document.getElementById("name").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,

cart: cart,

payment: document.getElementById("payment").value,
tamara_auth: document.getElementById("tamara_auth").value,
tamara_order: document.getElementById("tamara_order").value,

shipping: document.getElementById("shipping").value

};

orders.push(order);

localStorage.setItem("orders", JSON.stringify(orders));
localStorage.setItem("currentOrder", orders.length - 1);

// 🔥 تحويل للفاتورة
window.location.href = "invoice.html";

}
