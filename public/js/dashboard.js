//Dashboard
document.getElementById('arrow').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    var elmnt = document.getElementById("dash-info");
    display(elmnt);
  elmnt.scrollIntoView();
  });

//My Products
document.getElementById('my-prod').addEventListener('click',()  =>{
    window.location.href="/my-prod";
});

//My Request
document.getElementById('my-req').addEventListener('click',()  =>{
    window.location.href="/my-req";
});


//My Cart
document.getElementById('my-cart').addEventListener('click',()  =>{
    window.location.href="/my-cart";
});