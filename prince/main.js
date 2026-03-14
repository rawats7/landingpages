function loadScript(src){
let s=document.createElement("script");
s.src=src;
document.body.appendChild(s);
}

loadScript("js/timer.js");
loadScript("js/ui.js");