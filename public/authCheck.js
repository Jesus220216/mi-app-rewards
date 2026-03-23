import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc, setDoc, getDoc, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// REGISTRO
window.register = async function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("pass").value;
  const ref = document.getElementById("ref").value;

  const userCred = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = userCred.user.uid;

  // crear usuario
  await setDoc(doc(db, "users", uid), {
    earnings: 0,
    today: 0,
    refBy: ref || null,
    refs: 0
  });

  // 💰 REFERIDO (PAGA)
  if (ref) {
    const refRef = doc(db, "users", ref);
    await updateDoc(refRef, {
      earnings: increment(1),
      refs: increment(1)
    });
  }

  alert("Cuenta creada 🚀");
  location.href = "dashboard.html";
};

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("pass").value;

  await signInWithEmailAndPassword(auth, email, pass);

  location.href = "dashboard.html";
};
