import { auth, db } from "./firebase.js";
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.sumarSaldo = async function (cantidad) {

  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);

  await updateDoc(ref, {
    earnings: increment(cantidad),
    today: increment(cantidad)
  });

};
