
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
const actualBtn = document.getElementById('pImage');

const fileChosen = document.getElementById('file-chosen');

actualBtn.addEventListener('change', function(){
  fileChosen.textContent = this.files[0].name
})