
//Home Page 
var myNav = document.getElementById('navbar');
window.onscroll = function () { 
    "use strict";
    if (document.body.scrollTop >= 100 || document.documentElement.scrollTop >= 100 ){
        myNav.classList.add("nav-colored");
        myNav.classList.remove("nav-transparent");
    } 
    else {
        myNav.classList.add("nav-transparent");
        myNav.classList.remove("nav-colored");
    }
};

//Buy
document.getElementById('buy').addEventListener('click',()  =>{
    window.location.href="/buy";
});

//Sell
document.getElementById('sell').addEventListener('click',()  =>{
    window.location.href="/sell";
});

//Home
document.getElementById('home-index').addEventListener('click',()  =>{
  window.location.href="/home";
});



//pImage btn
const pImage = document.getElementById('pImage');

const fileChosen = document.getElementById('file-chosen');

pImage.addEventListener('change', function(){
  fileChosen.textContent = this.files[0].name
});