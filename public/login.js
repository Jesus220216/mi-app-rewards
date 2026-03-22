import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  // 🔘 BOTONES
  loginBtn.onclick = login;
  registerBtn.onclick = register;

});

// 👁 PASSWORD
window.togglePass = () => {
  const input = document.getElementById("loginPassword");
  input.type = input.type === "password" ? "text" : "password";
};

// 📋 PEGAR REFERIDO
window.copyRef = async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("referralCode").value = text;
  } catch {
    alert("No se pudo pegar");
  }
};

// 🔐 LOGIN
async function login() {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  mostrarLoader(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (e) {
    alert(e.message);
  }

  mostrarLoader(false);
}

// 🆕 REGISTRO
async function register() {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const ref = document.getElementById("referralCode").value;

  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  mostrarLoader(true);

  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    const code = Math.random().toString(36).substring(2,8).toUpperCase();

    await setDoc(doc(db, "users", user.uid), {
      email,
      referralCode: code,
      referredBy: ref || null,
      earnings: 0,
      today: 0,
      refs: 0,
      createdAt: new Date()
    });

    alert("Cuenta creada ✅");

  } catch (e) {
    alert(e.message);
  }

  mostrarLoader(false);
}

// 🔄 LOADER
function mostrarLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
}
