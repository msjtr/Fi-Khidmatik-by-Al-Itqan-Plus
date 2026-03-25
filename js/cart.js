let cart = [];

function addToCart(){

let product = {
name: document.getElementById("product_name").value,
desc: document.getElementById("product_desc").value,
price: document.getElementById("product_price").value
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
