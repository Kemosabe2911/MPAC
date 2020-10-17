/*Toogle Menu*/
$(function() {
    $(".toggle").on("click",function(){
        $(".items").toggleClass("show");
    });
});

/*Toggle Close*/
$(document).ready(function(){
    $('.toggle').click(function(){
        $('.toggle').toggleClass('close');
    });
});