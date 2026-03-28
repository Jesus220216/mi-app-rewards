import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// LOGIN
window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) return alert("Completa los campos");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

// REGISTER
window.register = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) return alert("Completa los campos");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      email,
      earnings: 0,
      today: 0,
      createdAt: new Date()
    });

    window.location.href = "dashboard.html";

  } catch (e) {
    alert(e.message);
  }
};

// 🔥 CONECTAR BOTONES
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnLogin")?.addEventListener("click", login);
  document.getElementById("btnRegister")?.addEventListener("click", register);
});
  localStorage.setItem("bonus_date", today);

  alert("Bonus recibido +$0.5 💰");
});
