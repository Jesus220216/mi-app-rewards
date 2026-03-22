const express = require("express");
const admin = require("firebase-admin");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// 🔥 FIREBASE DESDE VARIABLES
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔐 SECRET CPX
const CPX_SECRET = "Rg9JpjEO4PNU1CYZRx6owtZkypREstSS";

// 🚀 TEST
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

// 🚀 POSTBACK
app.get("/cpx-postback", async (req, res) => {
  try {
    const { ext_user_id, trans_id, reward_value, hash } = req.query;

    const check = crypto
      .createHash("md5")
      .update(trans_id + CPX_SECRET)
      .digest("hex");

    if (check !== hash) {
      return res.status(403).send("Fraude ❌");
    }

    const txRef = db.collection("transactions").doc(trans_id);
    const tx = await txRef.get();

    if (tx.exists) return res.send("Ya pagado");

    const userRef = db.collection("users").doc(ext_user_id);

    await userRef.update({
      earnings: admin.firestore.FieldValue.increment(Number(reward_value)),
      today: admin.firestore.FieldValue.increment(Number(reward_value))
    });

    await txRef.set({
      user: ext_user_id,
      amount: reward_value,
      date: new Date()
    });

    res.send("OK ✅");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error ❌");
  }
});

// 🔥 IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor activo en puerto " + PORT);
});

// 🚀 SERVIDOR
app.listen(3000, () => {
  console.log("Servidor activo 🚀");
});
