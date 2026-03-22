import { updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function ruleta(userRef) {

  const premios = [0, 0.01, 0.02, 0.05, 0];
  const premio = premios[Math.floor(Math.random() * premios.length)];

  alert("Girando ruleta... 🎡");

  setTimeout(async () => {

    if (premio > 0) {
      await updateDoc(userRef, {
        earnings: increment(premio),
        today: increment(premio)
      });

      alert("Ganaste $" + premio + " 🎉");
    } else {
      alert("Suerte la próxima 😢");
    }

  }, 2000);
}

export async function scratch(userRef) {

  const premio = Math.random() > 0.7 ? 0.03 : 0;

  alert("Rascando... 🪙");

  setTimeout(async () => {

    if (premio > 0) {
      await updateDoc(userRef, {
        earnings: increment(premio),
        today: increment(premio)
      });

      alert("Ganaste $" + premio + " 🎉");
    } else {
      alert("Nada esta vez 😢");
    }

  }, 1500);
}