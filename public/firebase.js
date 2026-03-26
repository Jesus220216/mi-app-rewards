import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp({
  apiKey: "TU_API_KEY_REAL",
  authDomain: "mi-app-rewards-rd.firebaseapp.com",
  projectId: "mi-app-rewards-rd"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
