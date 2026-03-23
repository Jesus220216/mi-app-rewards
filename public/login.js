import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

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

// 🆕 REGISTRO PRO CON REFERIDOS
async function register() {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // 🔥 REFERIDO (AUTOMÁTICO + INPUT)
  const inputRef = document.getElementById("referralCode").value;
  const localRef = localStorage.getItem("referrer_id");

  const ref = inputRef || localRef || null;

  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  mostrarLoader(true);

  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // 🎯 USER ID PARA CPX
    let cpxId = localStorage.getItem("cpx_user_id");
    if (!cpxId) {
      cpxId = "srv-" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cpx_user_id", cpxId);
    }

    // 🎯 CÓDIGO PROPIO
    const myCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 💾 GUARDAR USUARIO
    await setDoc(doc(db, "users", cpxId), {
      email,
      referralCode: myCode,
      referrer: ref,
      earnings: 0,
      today: 0,
      refs: 0,
      createdAt: new Date()
    });

    // 🎯 SUMAR REFERIDO AL PADRE
    if (ref) {
      const refDoc = doc(db, "users", ref);
      const refSnap = await getDoc(refDoc);

      if (refSnap.exists()) {
        await updateDoc(refDoc, {
          refs: increment(1)
        });
      }
    }

    alert("Cuenta creada ✅");

    // 🔄 limpiar referido
    localStorage.removeItem("referrer_id");

    window.location.href = "dashboard.html";

  } catch (e) {
    alert(e.message);
  }

  mostrarLoader(false);
}

// 🔄 LOADER
function mostrarLoader(show) {
  document.getElementById("loader").style.display = show ? "flex" : "none";
}
