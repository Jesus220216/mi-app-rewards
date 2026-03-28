import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 LOGIN
window.login = async function () {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Completa los campos");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
};

// 🆕 REGISTRO
window.register = async function () {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const refCode = localStorage.getItem("ref_code");

  if (!email || !password) {
    alert("Completa los campos");
    return;
  }

  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    const myCode = user.uid.substring(0,6).toUpperCase();

    // 💾 GUARDAR USUARIO
    await setDoc(doc(db, "users", user.uid), {
      email,
      referralCode: myCode,
      referrer: refCode || null,
      earnings: 0,
      today: 0,
      refs: 0,
      createdAt: new Date()
    });

    // 🎁 PAGAR REFERIDO
    if (refCode) {
      const q = query(collection(db, "users"), where("referralCode", "==", refCode));
      const snap = await getDocs(q);

      snap.forEach(async (docu) => {
        await updateDoc(docu.ref, {
          refs: increment(1),
          earnings: increment(1)
        });
      });
    }

    localStorage.removeItem("ref_code");

    window.location.href = "dashboard.html";

  } catch (error) {
    alert(error.message);
  }
};
