
//Home Page 

//Buy
document.getElementById('buy').addEventListener('click',()  =>{
    window.location.href="/buy";
});

//Sell
document.getElementById('sell').addEventListener('click',()  =>{
    window.location.href="/sell";
});


//pImage btn
const pImage = document.getElementById('pImage');

const fileChosen = document.getElementById('file-chosen');

pImage.addEventListener('change', function(){
  fileChosen.textContent = this.files[0].name
})


//Dashboard

//My Products
document.getElementById('my-prod').addEventListener('click',()  =>{
    window.location.href="/my-prod";
});

//My Cart
document.getElementById('my-cart').addEventListener('click',()  =>{
    window.location.href="/my-cart";
});