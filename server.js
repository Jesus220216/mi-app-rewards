const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

/* =========================
🌐 SERVIR FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
🔥 FIREBASE
========================= */
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* =========================
🚀 POSTBACK CPX (PRO)
========================= */
app.get("/cpx-postback", async (req, res) => {
  try {
    const { ext_user_id, trans_id, reward_value, secure_hash } = req.query;

    // ⚠️ VALIDACIÓN
    if (!ext_user_id || !trans_id || !reward_value) {
      return res.status(400).send("Datos faltantes ❌");
    }

    console.log("📥 POSTBACK CPX");
    console.log("👤 Usuario:", ext_user_id);
    console.log("💳 Transacción:", trans_id);
    console.log("💰 Monto:", reward_value);

    // 🔁 EVITAR DUPLICADOS
    const txRef = db.collection("transactions").doc(trans_id);
    const txDoc = await txRef.get();

    if (txDoc.exists) {
      console.log("⚠️ Transacción duplicada:", trans_id);
      return res.send("Ya pagado");
    }

       // 👤 USUARIO
    const userRef = db.collection("users").doc(ext_user_id);
    const userDoc = await userRef.get();

    // 💰 SUMAR AL USUARIO
    await userRef.set({
      earnings: admin.firestore.FieldValue.increment(Number(reward_value)),
      today: admin.firestore.FieldValue.increment(Number(reward_value))
    }, { merge: true });

    // 🎯 BONO REFERIDO (10%)
    const userData = userDoc.exists ? userDoc.data() : null;

    if (userData && userData.referrer) {
      const referrerRef = db.collection("users").doc(userData.referrer);

      const bonus = Number(reward_value) * 0.10;

      await referrerRef.set({
        earnings: admin.firestore.FieldValue.increment(bonus)
      }, { merge: true });

      console.log("🎯 Bono referido pagado:", bonus);
    }

    // 🧾 GUARDAR TRANSACCIÓN
    await txRef.set({
      user: ext_user_id,
      amount: Number(reward_value),
      createdAt: new Date()
    });

    console.log("✅ Pago agregado correctamente");

    res.send("OK");

  } catch (err) {
    console.error("❌ Error en postback:", err);
    res.status(500).send("Error");
  }
});

/* =========================
💳 RETIROS (PRO)
========================= */
app.post("/withdraw", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).send("Falta user_id");
    }

    const userRef = db.collection("users").doc(user_id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send("Usuario no encontrado");
    }

    const data = userDoc.data();

    // 💰 VALIDAR MONTO MÍNIMO
    if ((data.earnings || 0) < 5) {
      return res.send("Mínimo $5 para retirar");
    }

    // 🧾 CREAR SOLICITUD
    await db.collection("withdrawals").add({
      user: user_id,
      amount: data.earnings,
      status: "pending",
      createdAt: new Date()
    });

    // 🔄 RESETEAR BALANCE
    await userRef.update({
      earnings: 0
    });

    console.log("💸 Retiro solicitado:", user_id);

    res.send("Retiro solicitado");

  } catch (err) {
    console.error("❌ Error en retiro:", err);
    res.status(500).send("Error");
  }
});

/* =========================
🧪 TEST ENDPOINT
========================= */
app.get("/test", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

/* =========================
🚀 INICIAR SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Servidor activo en puerto " + PORT);
});
