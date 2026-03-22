import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

async function logout() {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

window.logout = logout;
