import express from "express";
import admin from "firebase-admin";
import crypto from "crypto";

const app = express();
app.use(express.json());

// 🔥 FIREBASE ADMIN
import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔐 TU SECRET (LO CONFIGURAS EN CPX)
const CPX_SECRET = "Rg9JpjEO4PNU1CYZRx6owtZkypREstSS";

// 🚀 POSTBACK DE CPX
app.get("/cpx-postback", async (req, res) => {

  try {
    const {
      ext_user_id,
      trans_id,
      reward_value,
      hash
    } = req.query;

    // 🔒 VALIDAR HASH (ANTIFRAUDE)
    const check = crypto
      .createHash("md5")
      .update(trans_id + CPX_SECRET)
      .digest("hex");

    if (check !== hash) {
      return res.status(403).send("Fraude detectado");
    }

    // 🔁 EVITAR DOBLE PAGO
    const txRef = db.collection("transactions").doc(trans_id);
    const tx = await txRef.get();

    if (tx.exists) {
      return res.send("Ya pagado");
    }

    // 💰 SUMAR DINERO
    const userRef = db.collection("users").doc(ext_user_id);

    await userRef.update({
      earnings: admin.firestore.FieldValue.increment(Number(reward_value)),
      today: admin.firestore.FieldValue.increment(Number(reward_value))
    });

    // 🧾 GUARDAR TRANSACCIÓN
    await txRef.set({
      user: ext_user_id,
      amount: reward_value,
      date: new Date()
    });

    res.send("OK");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }

});

// 🚀 SERVIDOR
app.listen(3000, () => {
  console.log("Servidor activo 🚀");
});