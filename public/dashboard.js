import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 🧠 ANTI FRAUDE
let lastClick = 0;

function puedeClick() {
  const now = Date.now();

  if (now - lastClick < 5000) {
    alert("Espera unos segundos...");
    return false;
  }

  lastClick = now;
  return true;
}

let userRef;
let cargado = false;

// 🔐 CONTROL DE SESIÓN
onAuthStateChanged(auth, async (user) => {

  if (cargado) return;
  cargado = true;

  if (!user) {
    setTimeout(() => {
      window.location.href = "index.html";
    }, 300);
    return;
  }

  document.body.style.display = "block";

  try {
    userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      console.error("No existe el usuario en Firestore");
      return;
    }

    const data = snap.data();

    document.getElementById("saldo").textContent = "$" + data.earnings.toFixed(2);
    document.getElementById("today").textContent = "$" + data.today.toFixed(2);
    document.getElementById("refs").textContent = data.refs || 0;
    document.getElementById("myCode").textContent = data.referralCode;

  } catch (err) {
    console.error("Error cargando datos:", err);
  }

});

// 📺 ANUNCIO (SIN ads.js)
window.verAnuncio = async () => {

  if (!puedeClick()) return;

  alert("Anuncio demo ✅");

  await updateDoc(userRef, {
    earnings: increment(0.02),
    today: increment(0.02)
  });

};

// 🎮 MINI JUEGO
window.miniJuego = async () => {

  if (!userRef) {
    alert("Espera, cargando datos...");
    return;
  }

  if (!puedeClick()) return;

  try {
    await updateDoc(userRef, {
      earnings: increment(0.02),
      today: increment(0.02)
    });

    alert("Ganaste $0.02 🎉");

  } catch (err) {
    console.error(err);
    alert("Error en el juego");
  }

};

// 💳 RETIRO (SIN paypal.js)
window.retirar = async () => {

  const email = document.getElementById("paypal").value;

  if (!email) {
    alert("Ingresa PayPal");
    return;
  }

  const snap = await getDoc(userRef);
  const data = snap.data();

  if (data.earnings < 1) {
    alert("Mínimo $1");
    return;
  }

  alert("Retiro simulado 💸");
};

// 📋 COPIAR REFERIDO
window.copyMyRef = () => {
  const code = document.getElementById("myCode").textContent;

  navigator.clipboard.writeText(
    window.location.origin + "?ref=" + code
  );

  alert("Link copiado 🚀");
};

// 🚪 LOGOUT (AHORA SÍ FUNCIONA)
window.logout = async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert("Error al cerrar sesión");
  }
};
import { auth } from "./firebase.js";

auth.onAuthStateChanged((user)=>{
  if(user){
    window.initCPX(user.uid); // 🔥 conecta encuestas
  }
});
