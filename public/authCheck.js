import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// LOGIN
window.login = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (e) {
    alert(e.message);
  }
};

// REGISTRO
window.register = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const ref = document.getElementById("ref").value;

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

    alert("Cuenta creada");

  } catch (e) {
    alert(e.message);
  }
};
