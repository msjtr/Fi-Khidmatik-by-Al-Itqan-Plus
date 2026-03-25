function checkout(){

if(cart.length === 0){
alert("السلة فارغة");
return;
}

let order = {

order_number: document.getElementById("order_number").value || "-",
date: document.getElementById("order_date").value || "-",
time: document.getElementById("order_time").value || "-",

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
