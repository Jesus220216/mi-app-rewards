import { db } from "./firebase.js";
import { doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ruleta, scratch } from "./game.js";

// ID del usuario (puede ser fijo por ahora)
const userId = "usuario1";

// Referencia al usuario en Firestore
const userRef = doc(db, "users", userId);

// Botón ruleta
document.getElementById("ruletaBtn").onclick = () => {
  ruleta(userRef);
};

// Botón raspar
document.getElementById("scratchBtn").onclick = () => {
  scratch(userRef);
};