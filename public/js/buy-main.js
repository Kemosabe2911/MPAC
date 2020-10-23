//Function display
function display(p){
    p.style.display='flex';
    /*p.style.alignItems='center';*/
}


//Books
document.getElementById('books').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    var elmnt = document.getElementById("books-sell");
    display(elmnt);
  elmnt.scrollIntoView();
  });

//Tools
document.getElementById('tools').addEventListener('click',()  =>{
    window.location.href="/sell-tools";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
 });


//Calculators
document.getElementById('calcs').addEventListener('click',()  =>{
    window.location.href="/sell-calcs";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
 });

//Extras
document.getElementById('extras').addEventListener('click',()  =>{
    window.location.href="/sell-exts";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
 }); 

//Year1
document.getElementById('year1').addEventListener('click',()  =>{
    window.location.href="/sell-y1-books";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
 });

  //Year2 CS
  document.getElementById('cs-2').addEventListener('click',()  =>{
    window.location.href="/sell-y2-cs";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

   //Year2 CE
   document.getElementById('ce-2').addEventListener('click',()  =>{
    window.location.href="/sell-y2-ce";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

   //Year2 ME
   document.getElementById('me-2').addEventListener('click',()  =>{
    window.location.href="/sell-y2-me";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

  //Year2 EE
  document.getElementById('ee-2').addEventListener('click',()  =>{
    window.location.href="/sell-y2-ee";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

  //Year2 EC
  document.getElementById('ec-2').addEventListener('click',()  =>{
    window.location.href="/sell-y2-ec";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });


  //Year3 CS
  document.getElementById('cs-3').addEventListener('click',()  =>{
    window.location.href="/sell-y3-cs";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

   //Year3 CE
   document.getElementById('ce-3').addEventListener('click',()  =>{
    window.location.href="/sell-y3-ce";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

   //Year3 ME
   document.getElementById('me-3').addEventListener('click',()  =>{
    window.location.href="/sell-y3-me";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

  //Year3 EE
  document.getElementById('ee-3').addEventListener('click',()  =>{
    window.location.href="/sell-y3-ee";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

  //Year3 EC
  document.getElementById('ec-3').addEventListener('click',()  =>{
    window.location.href="/sell-y3-ec";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });


  //Year4 CS
  document.getElementById('cs-4').addEventListener('click',()  =>{
    window.location.href="/sell-y4-cs";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

   //Year4 CE
   document.getElementById('ce-4').addEventListener('click',()  =>{
    window.location.href="/sell-y4-ce";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

   //Year4 ME
   document.getElementById('me-4').addEventListener('click',()  =>{
    window.location.href="/sell-y4-me";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

  //Year4 EE
  document.getElementById('ee-4').addEventListener('click',()  =>{
    window.location.href="/sell-y4-ee";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

  //Year4 EC
  document.getElementById('ec-4').addEventListener('click',()  =>{
    window.location.href="/sell-y4-ec";
    //var elmnt = document.getElementById("year-section");
    //display(elmnt);
  //elmnt.scrollIntoView();
  });

//Year2
document.getElementById('year2').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    //document.getElementById("year-section").style.display='none';
    var elmnt = document.getElementById("year1-section");
    display(elmnt);
  elmnt.scrollIntoView();
  });

//Year3
document.getElementById('year3').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    //document.getElementById("year-section").style.display='none';
    document.getElementById("year1-section").style.display='none';
    var elmnt = document.getElementById("year2-section");
    display(elmnt);
  elmnt.scrollIntoView();
  });

//Year4
document.getElementById('year4').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    //document.getElementById("year-section").style.display='none';
    document.getElementById("year1-section").style.display='none';
    document.getElementById("year2-section").style.display='none';
    var elmnt = document.getElementById("year3-section");
    display(elmnt);
  elmnt.scrollIntoView();
  });
/*
//Form1
document.getElementById('year1').addEventListener('click',()  =>{
  //window.location.href="#tiles.sell";
  //document.getElementById("year-section").style.display='none';
  document.getElementById("year1-section").style.display='none';
  document.getElementById("year2-section").style.display='none';
  document.getElementById("year3-section").style.display='none';
  var elmnt = document.getElementById("form-1");
  display(elmnt);
elmnt.scrollIntoView();
});
*/




//Home Buttons

//home0
document.getElementById('home-btn0').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    var elmnt = document.getElementById("top");
  elmnt.scrollIntoView();
  });

  document.getElementById('home-btn1').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    document.getElementById("books-sell").style.display='none';
    var elmnt = document.getElementById("top");
  elmnt.scrollIntoView();
  });
 
document.getElementById('home-btn2').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    document.getElementById("books-sell").style.display='none';
    var elmnt = document.getElementById("top");
  elmnt.scrollIntoView();
  });
 
  document.getElementById('home-btn3').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    document.getElementById("books-sell").style.display='none';
    var elmnt = document.getElementById("top");
  elmnt.scrollIntoView();
  });
 
  document.getElementById('home-btn4').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    document.getElementById("books-sell").style.display='none';
    var elmnt = document.getElementById("top");
  elmnt.scrollIntoView();
  });

 /* document.getElementById('top-1').addEventListener('click',()  =>{
    //window.location.href="#tiles.sell";
    document.getElementById("books-sell").style.display='none';
    var elmnt = document.getElementById("top");
  elmnt.scrollIntoView();
  });*/


