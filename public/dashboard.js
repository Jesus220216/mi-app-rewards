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

// 🔥 FIREBASE CONFIG
const app = initializeApp({
  apiKey: "AIzaSyD1w_66STxqf5iMVneB8DgLnpFwS8RGy3g",
  authDomain: "rutarizador-v12.firebaseapp.com",
  projectId: "rutarizador-v12"
});

const db = getFirestore(app);

// 👤 USER ID
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

// 🔥 INIT USER (async seguro)
async function initUser() {
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      earnings: 0,
      today: 0,
      createdAt: new Date()
    });
  }
}

await initUser();

// 🔗 REFERIDO
document.getElementById("refLink").value =
  `${window.location.origin}?ref=${userId}`;

// ============================
// 🚀 FUNCIONES GLOBALES
// ============================

window.abrirEncuestas = function () {
  const hash = CryptoJS.MD5(userId + "Rg9JpjEO4PNU1CYZRx6owtZkypREstSS").toString();

  const url = `https://offers.cpx-research.com/index.php?app_id=32070&ext_user_id=${userId}&secure_hash=${hash}`;

  document.body.innerHTML = `
    <button onclick="location.reload()">⬅ Volver</button>
    <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
  `;
};

window.abrirOfertas = function () {
  document.body.innerHTML = `
    <button onclick="location.reload()">⬅ Volver</button>
    <iframe src="https://wall.adgate.com/?user_id=${userId}" style="width:100%;height:100vh;border:none;"></iframe>
  `;
};

window.abrirJuego = function (nombre) {
  window.location.href = "game-" + nombre + ".html";
};

window.copiarRef = function () {
  navigator.clipboard.writeText(document.getElementById("refLink").value);
  showToast("Copiado 🚀");
};

window.retirar = function () {
  showToast("Solicitud enviada 💰");
};

window.logout = function () {
  localStorage.removeItem("cpx_user_id");
  window.location.href = "index.html";
};

// ============================
// 🔄 REALTIME FIREBASE
// ============================

onSnapshot(userRef, (snap) => {
  if (snap.exists()) {
    const data = snap.data();

    const earnings = (data.earnings || 0).toFixed(2);
    const today = (data.today || 0).toFixed(2);

    document.getElementById("saldo").innerText = "$" + earnings;
    document.getElementById("today").innerText = "$" + today;
    document.getElementById("today2").innerText = "$" + today;
    document.getElementById("total").innerText = "$" + earnings;

    showToast("+" + today + " 💰");
  }
});

// ============================
// 🎁 BONUS DIARIO
// ============================

const todayDate = new Date().toDateString();
const last = localStorage.getItem("daily_bonus");

if (last !== todayDate) {
  await updateDoc(userRef, {
    earnings: increment(0.50),
    today: increment(0.50)
  });

  localStorage.setItem("daily_bonus", todayDate);
}

// ============================
// 🔔 TOAST NOTIFICACIÓN
// ============================

function showToast(msg) {
  let t = document.getElementById("toast");

  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.position = "fixed";
    t.style.bottom = "20px";
    t.style.right = "20px";
    t.style.background = "#00ff88";
    t.style.color = "#000";
    t.style.padding = "12px 18px";
    t.style.borderRadius = "12px";
    t.style.boxShadow = "0 0 15px rgba(0,255,136,0.5)";
    t.style.opacity = "0";
    t.style.transition = "0.3s";
    document.body.appendChild(t);
  }

  t.innerText = msg;
  t.style.opacity = "1";

  setTimeout(() => {
    t.style.opacity = "0";
  }, 2500);
}
