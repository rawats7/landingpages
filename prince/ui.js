document.addEventListener("contextmenu", e => e.preventDefault());

document.onkeydown = function(e){
if(e.keyCode==123) return false;
if(e.ctrlKey && e.shiftKey && e.keyCode==73) return false;
};