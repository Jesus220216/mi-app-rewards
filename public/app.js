import { db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 USER ID
function getUserId() {
  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("userId", userId);
  }

  return userId;
}

// 🚀 INIT
function initDashboard() {
  const userId = getUserId();

  const saldo = document.getElementById("saldo");
  const balance = document.getElementById("balance");
  const today = document.getElementById("today");
  const today2 = document.getElementById("today2");

  if (!saldo || !balance) return; // evita errores

  const userRef = doc(db, "users", userId);

  // 🔥 REALTIME
  onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();

      saldo.textContent = "$" + (data.earnings || 0);
      balance.textContent = "$" + (data.earnings || 0);
      today.textContent = "$" + (data.today || 0);
      today2.textContent = "$" + (data.today || 0);
    }
  });
}

// 🚀 RUN
document.addEventListener("DOMContentLoaded", initDashboard);
