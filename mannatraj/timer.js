let totalSeconds = 30 * 60;

function updateTimer(){

let minutes = Math.floor(totalSeconds / 60);
let seconds = totalSeconds % 60;

document.getElementById("timer").innerHTML =
"00:00:" +
String(minutes).padStart(2,'0') + ":" +
String(seconds).padStart(2,'0');

if(totalSeconds <= 0){
totalSeconds = 30 * 60;
}
else{
totalSeconds--;
}

}

setInterval(updateTimer,1000);