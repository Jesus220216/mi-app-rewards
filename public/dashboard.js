// 🔥 FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG
const app = initializeApp({
  apiKey: "AIzaSyD1w_66STxqf5iMVneB8DgLnpFwS8RGy3g",
  authDomain: "rutarizador-v12.firebaseapp.com",
  projectId: "rutarizador-v12"
});

const db = getFirestore(app);

// 🔥 CPX
const CPX_APP_ID = "32070";
const CPX_API_KEY = "Rg9JpjEO4PNU1CYZRx6owtZkypREstSS";

// USER ID
function getUserId() {
  let id = localStorage.getItem("cpx_user_id");
  if (!id) {
    id = "srv-" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("cpx_user_id", id);
  }
  return id;
}

const userId = getUserId();
const userRef = doc(db, "users", userId);

// 🔥 CREAR USUARIO SI NO EXISTE
const snap = await getDoc(userRef);

if (!snap.exists()) {
  await setDoc(userRef, {
    earnings: 0,
    today: 0,
    refs: 0,
    createdAt: new Date()
  });
}

// 🔗 REFERIDO
document.getElementById("refLink").value =
  `${window.location.origin}?ref=${userId}`;

// 🔥 ENCUESTAS
window.abrirEncuestas = function () {
  const hash = CryptoJS.MD5(userId + CPX_API_KEY).toString();

  document.body.innerHTML = `
    <button onclick="location.reload()">⬅ Volver</button>
    <iframe src="https://offers.cpx-research.com/index.php?app_id=${CPX_APP_ID}&ext_user_id=${userId}&secure_hash=${hash}" style="width:100%;height:100vh;border:none;"></iframe>
  `;
};

// 🔥 OFERTAS
window.abrirOfertas = function () {
  document.body.innerHTML = `
    <button onclick="location.reload()">⬅ Volver</button>
    <iframe src="https://wall.adgate.com/?user_id=${userId}" style="width:100%;height:100vh;border:none;"></iframe>
  `;
};

// 🎮 JUEGOS
window.abrirJuego = function (nombre) {
  window.location.href = "game-" + nombre + ".html";
};

// 📋 COPIAR
window.copiarRef = function () {
  navigator.clipboard.writeText(document.getElementById("refLink").value);
  alert("Copiado 🚀");
};

// 💳 RETIRO
window.retirar = function () {
  alert("Solicitud enviada 💰");
};

// 🚪 LOGOUT
window.logout = function () {
  localStorage.removeItem("cpx_user_id");
  window.location.href = "index.html";
};

// 🔥 REALTIME
let lastEarnings = 0;

onSnapshot(userRef, (snap) => {
  if (!snap.exists()) return;

  const data = snap.data();

  const earnings = data.earnings || 0;
  const today = data.today || 0;

  document.getElementById("saldo").innerText = "$" + earnings.toFixed(2);
  document.getElementById("today").innerText = "$" + today.toFixed(2);
  document.getElementById("today2").innerText = "$" + today;
  document.getElementById("total").innerText = "$" + earnings;

  // 💰 SOLO CUANDO SUBE
  if (earnings > lastEarnings) {
    showToast("+$0.50 💰");
  }

  lastEarnings = earnings;
});

// 🎁 BONUS DIARIO (SIN ERROR)
const todayDate = new Date().toDateString();
const last = localStorage.getItem("daily_bonus");

if (last !== todayDate) {
  await updateDoc(userRef, {
    earnings: increment(0.50),
    today: increment(0.50)
  });

  localStorage.setItem("daily_bonus", todayDate);
  alert("🎁 Bono diario recibido");
}

// 💰 TOAST
function showToast(msg) {
  let t = document.getElementById("toast");

  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.position = "fixed";
    t.style.bottom = "20px";
    t.style.right = "20px";
    t.style.background = "#00ff88";
    t.style.padding = "10px";
    t.style.borderRadius = "10px";
    t.style.color = "black";
    document.body.appendChild(t);
  }

  t.innerText = msg;
  t.style.opacity = "1";

  setTimeout(() => (t.style.opacity = "0"), 3000);
}
