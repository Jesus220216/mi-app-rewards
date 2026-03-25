import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const btn = document.getElementById("register");

btn.addEventListener("click", async () => {
  console.log("click funcionando");
});
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // 🔐 Crear usuario
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔥 Guardar en Firestore (AQUÍ VA)
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      balance: 0,
      createdAt: new Date()
    });

    console.log("script conectado");

  } catch (error) {
    console.error(error);
  }
});
