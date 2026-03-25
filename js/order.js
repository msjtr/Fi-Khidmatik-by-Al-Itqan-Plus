function checkout(){

if(cart.length === 0){
alert("السلة فارغة");
return;
}

let order = {
// 🔥 رقم طلب متسلسل
let lastNumber = localStorage.getItem("lastOrderNumber") || 1375;
let newNumber = parseInt(lastNumber) + 1;

let orderNumber = "FK-2026-" + String(newNumber).padStart(6, '0');

localStorage.setItem("lastOrderNumber", newNumber);
customer: document.getElementById("name").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,

cart: cart,

payment: document.getElementById("payment").value,
tamara_auth: document.getElementById("tamara_auth").value,
tamara_order: document.getElementById("tamara_order").value,

shipping: document.getElementById("shipping").value

};

localStorage.setItem("currentOrder", JSON.stringify(order));

window.location.href = "invoice.html";

}
