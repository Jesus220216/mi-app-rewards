const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// 🌐 SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 FIREBASE DESDE VARIABLES
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔐 SECRET CPX
const CPX_SECRET = "Rg9JpjEO4PNU1CYZRx6owtZkypREstSS";

// 🚀 POSTBACK CPX (CORREGIDO)
app.get("/cpx-postback", async (req, res) => {
  try {
    const { ext_user_id, trans_id, reward_value, secure_hash } = req.query;

    // ⚠️ VALIDAR DATOS
    if (!ext_user_id || !trans_id || !reward_value || !secure_hash) {
      return res.status(400).send("Datos faltantes ❌");
    }

    // 🔐 VALIDAR HASH (CORRECTO)
   const expectedHash = crypto
  .createHash("md5")
  .update(trans_id + reward_value + CPX_SECRET)
  .digest("hex");

if (expectedHash !== secure_hash) {
  return res.status(403).send("Fraude ❌");
}

    // 🔁 EVITAR DUPLICADOS
    const txRef = db.collection("transactions").doc(trans_id);
    const txDoc = await txRef.get();

    if (txDoc.exists) {
      console.log("Transacción duplicada:", trans_id);
      return res.send("Ya pagado");
    }

    // 👤 USUARIO
    const userRef = db.collection("users").doc(ext_user_id);

    // 💰 SUMAR GANANCIA
    await userRef.set({
      earnings: admin.firestore.FieldValue.increment(Number(reward_value)),
      today: admin.firestore.FieldValue.increment(Number(reward_value))
    }, { merge: true });

    // 🧾 GUARDAR TRANSACCIÓN
    await txRef.set({
      user: ext_user_id,
      amount: Number(reward_value),
      createdAt: new Date()
    });

    console.log("Pago exitoso:", ext_user_id, reward_value);

    res.send("OK ✅");

  } catch (err) {
    console.error("Error postback:", err);
    res.status(500).send("Error ❌");
  }
});

// 🚀 SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor activo en puerto " + PORT);
});
