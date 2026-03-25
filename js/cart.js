let cart = [];

function addToCart(){

let product = {
name: document.getElementById("product_name").value,
price: document.getElementById("product_price").value,
id: document.getElementById("product_id").value,
code: document.getElementById("product_code").value
};

cart.push(product);
renderCart();

}

function renderCart(){

let html = "";

cart.forEach((p,i)=>{

html += `
<div>
${p.name} - ${p.price}
<button onclick="removeItem(${i})">حذف</button>
</div>
`;

});

document.getElementById("cart").innerHTML = html;

}

function removeItem(i){
cart.splice(i,1);
renderCart();
}
