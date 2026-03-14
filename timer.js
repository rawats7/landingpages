let m = 30;
let s = 0;

setInterval(() => {

document.getElementById("min").innerText =
String(m).padStart(2,'0');

document.getElementById("sec").innerText =
String(s).padStart(2,'0');

if(s === 0){

if(m === 0) return;

m--;
s = 59;

}else{

s--;

}

},1000);