import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* USER ID */
function getUserId(){
  let id = localStorage.getItem("user_id");
  if(!id){
    id = "user_" + Math.random().toString(36).substring(2,10);
    localStorage.setItem("user_id", id);
  }
  return id;
}

const userId = getUserId();
const userRef = doc(db, "users", userId);

/* INIT USER */
async function initUser(){
  const snap = await getDoc(userRef);

  if(!snap.exists()){
    await setDoc(userRef, {
      earnings: 0,
      today: 0,
      lastReset: new Date().toDateString()
    });
  }

  onSnapshot(userRef, (docSnap)=>{
    const data = docSnap.data();

    document.getElementById("saldo").textContent = "$"+data.earnings.toFixed(2);
    document.getElementById("balance").textContent = "$"+data.earnings.toFixed(2);
    document.getElementById("today").textContent = "$"+data.today.toFixed(2);
    document.getElementById("today2").textContent = "$"+data.today.toFixed(2);
  });

  checkDailyReset();
}

/* 🔁 RESET DIARIO AUTOMÁTICO */
async function checkDailyReset(){
  const snap = await getDoc(userRef);
  const data = snap.data();

  const today = new Date().toDateString();

  if(data.lastReset !== today){
    await updateDoc(userRef, {
      today: 0,
      lastReset: today
    });

    localStorage.setItem("earned_today", 0);
  }
}

/* 🎥 VIDEOS */
const videoRewards = {
  video1: 0.25,
  video2: 0.50,
  video3: 0.35,
  video4: 0.75,
  video5: 1.00,
  video6: 2.00
};

window.watchVideo = function(id){
  localStorage.setItem("video_active", id);
  document.getElementById("videoModal").style.display = "block";
};

window.completeVideo = async function(){
  const id = localStorage.getItem("video_active");

  if(!id) return alert("Error");

  const reward = videoRewards[id];

  let todayEarned = parseFloat(localStorage.getItem("earned_today") || 0);

  if(todayEarned + reward > 5){
    return alert("🚫 Límite diario $5");
  }

  todayEarned += reward;
  localStorage.setItem("earned_today", todayEarned);

  await updateDoc(userRef, {
    earnings: increment(reward),
    today: increment(reward)
  });

  alert("Ganaste $" + reward);

  document.getElementById("videoModal").style.display = "none";
};

/* 🎮 JUEGOS */
const gameRewards = {
  snake: 0.50,
  memory: 1.00,
  flappy: 0.75,
  "2048": 1.50,
  dice: 2.00,
  trivia: 1.25
};

window.playGame = async function(game){
  const reward = gameRewards[game];

  let todayEarned = parseFloat(localStorage.getItem("earned_today") || 0);

  if(todayEarned + reward > 5){
    return alert("🚫 Límite diario");
  }

  todayEarned += reward;
  localStorage.setItem("earned_today", todayEarned);

  await updateDoc(userRef, {
    earnings: increment(reward),
    today: increment(reward)
  });

  alert("Ganaste $" + reward);
};

/* 🔗 REFERIDOS */
window.copiarRef = function(){
  const link = window.location.origin + "?ref=" + userId;
  navigator.clipboard.writeText(link);
  alert("Copiado");
};

/* 💳 RETIRO */
window.retirar = function(){
  fetch("/withdraw", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ user_id: userId })
  })
  .then(()=> alert("Solicitud enviada"));
};

/* 🚪 LOGOUT */
window.logout = function(){
  localStorage.clear();
  location.reload();
};

initUser();
