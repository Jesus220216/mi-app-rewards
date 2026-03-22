import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const lista = document.getElementById("lista");

const querySnapshot = await getDocs(collection(db, "withdrawals"));

querySnapshot.forEach((doc) => {
  const data = doc.data();

  lista.innerHTML += `
    <div>
      ${data.email} - $${data.amount} - ${data.status}
    </div>
  `;
});