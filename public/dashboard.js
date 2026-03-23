import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  onSnapshot,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// USUARIO LOGEADO
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  // REFERIDO LINK
  document.getElementById("refLink").value =
    `${window.location.origin}?ref=${user.uid}`;

  // REALTIME
  onSnapshot(userRef, (snap) => {
    const data = snap.data();

    document.getElementById("saldo").innerText =
      "$" + (data.earnings || 0).toFixed(2);

    document.getElementById("today").innerText =
      "$" + (data.today || 0).toFixed(2);

    document.getElementById("total").innerText =
      "$" + (data.earnings || 0);

    document.getElementById("today2").innerText =
      "$" + (data.today || 0);

    showToast("+ dinero 💰");
  });

  // 🎁 BONO DIARIO
  const today = new Date().toDateString();
  const last = localStorage.getItem("bonus_" + user.uid);

  if (last !== today) {
    updateDoc(userRef, {
      earnings: increment(0.50),
      today: increment(0.50)
    });

    localStorage.setItem("bonus_" + user.uid, today);
  }
});

// FUNCIONES GLOBAL
window.copiarRef = () => {
  navigator.clipboard.writeText(document.getElementById("refLink").value);
  alert("Copiado 🚀");
};

window.logout = () => {
  auth.signOut();
  location.href = "index.html";
};

// TOAST
function showToast(msg) {
  let t = document.getElementById("toast");

  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }

  t.innerText = msg;
  t.style.position = "fixed";
  t.style.bottom = "20px";
  t.style.right = "20px";
  t.style.background = "#4caf50";
  t.style.padding = "10px";
  t.style.borderRadius = "10px";

  setTimeout(() => t.remove(), 3000);
}
