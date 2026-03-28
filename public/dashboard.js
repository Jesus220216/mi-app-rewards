import { db, auth } from "./firebase.js";

import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔐 USUARIO REAL
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  // 🔥 CREAR SI NO EXISTE
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      earnings: 0,
      today: 0,
      createdAt: new Date()
    });
  }

  // 🔗 REFERIDO
  const refInput = document.getElementById("refLink");
  if (refInput) {
    refInput.value = `${window.location.origin}?ref=${user.uid}`;
  }

  // 🔄 REALTIME
  onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    const earnings = (data.earnings || 0).toFixed(2);
    const today = (data.today || 0).toFixed(2);

    document.getElementById("saldo")?.innerText = "$" + earnings;
    document.getElementById("today")?.innerText = "$" + today;
    document.getElementById("today2")?.innerText = "$" + today;
    document.getElementById("total")?.innerText = "$" + earnings;
  });

  // 🎁 BONUS DIARIO
  const todayDate = new Date().toDateString();
  const last = localStorage.getItem("daily_bonus");

  if (last !== todayDate) {
    await updateDoc(userRef, {
      earnings: increment(0.5),
      today: increment(0.5)
    });

    localStorage.setItem("daily_bonus", todayDate);
  }

});

// 🚪 LOGOUT
window.logout = function () {
  auth.signOut();
  window.location.href = "index.html";
};
