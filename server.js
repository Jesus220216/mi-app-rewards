const crypto = require("crypto");
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
🚀 POSTBACK CPX (IMPERIO)
========================= */
app.get("/cpx-postback", async (req, res) => {
  try {
  const { ext_user_id, trans_id, reward_value, secure_hash } = req.query;
    
  if (!ext_user_id || !trans_id || !reward_value || !secure_hash) {
  return res.status(400).send("Datos faltantes ❌");
}

    const reward = parseFloat(reward_value);
if (isNaN(reward)) {
  return res.status(400).send("Reward inválido");
}

if (reward > 5 || reward <= 0) {
  console.log("🚨 Reward sospechoso:", reward);
  return res.send("Fraude detectado");
}

  const API_KEY = "Rg9JpjEO4PNU1CYZRx6owtZkypREstSS";

    const expectedHash = crypto
      .createHash("md5")
      .update(ext_user_id + API_KEY)
      .digest("hex");

    if (secure_hash !== expectedHash) {
      console.log("❌ Hash inválido - posible fraude");
      return res.status(403).send("Invalid hash");
    }

const ua = req.headers["user-agent"] || "";

if (
  ua.includes("bot") ||
  ua.includes("curl") ||
  ua.includes("spider") ||
  ua.length < 20
) {
  console.log("🤖 Bot detectado:", ua);
  return res.send("Bot bloqueado");
}

    console.log("📥 POSTBACK:", ext_user_id, reward);

    /* 🔁 EVITAR DUPLICADOS */
    const txRef = db.collection("transactions").doc(trans_id);
    const txDoc = await txRef.get();

    if (txDoc.exists) {
      return res.send("Ya pagado");
    }

    /* 👤 USUARIO */
    const userRef = db.collection("users").doc(ext_user_id);
    const userDoc = await userRef.get();

if (!userDoc.exists) {
  await userRef.set({
    earnings: 0,
    today: 0,
    xp: 0,
    level: 0,
    referredBy: null // 👈 importante para evitar errores
  });
}

  const updatedDoc = await userRef.get();
const userData = updatedDoc.data();

if ((userData.today || 0) >= 5) {
  console.log("⚠️ Límite diario alcanzado");
  return res.send("Límite diario alcanzado");
}

    /* 🎮 XP + NIVEL */
    const xp = reward * 10;
    const newXP = (userData.xp || 0) + xp;
    const level = Math.floor(newXP / 100);

    /* 🚀 MULTIPLICADOR */
    let multiplier = 1;
    if (level >= 10) multiplier = 1.5;
    else if (level >= 5) multiplier = 1.2;

    const finalReward = reward * multiplier;

const userIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)
  .split(",")[0]
  .trim();

const ipQuery = await db.collection("users")
  .where("ip", "==", userIp)
  .get();

const uniqueUsers = ipQuery.docs.filter(doc => doc.id !== ext_user_id);

if (uniqueUsers.length >= 3 && reward > 1) {
  console.log("🚨 IP sospechosa + reward alto:", userIp);
  return res.send("Fraude detectado");
}

if (uniqueUsers.length >= 5) {
  console.log("🚫 Muchas cuentas desde esta IP:", userIp);
  return res.send("Bloqueado por IP");
}

/* ✅ AQUÍ VA */
await db.collection("ip_logs").add({
  ip: userIp,
  user: ext_user_id,
  reward: reward,
  ua: ua,
  createdAt: new Date()
});

     /* 💰 SUMAR GANANCIAS */
    await userRef.set({
      earnings: admin.firestore.FieldValue.increment(finalReward),
      today: admin.firestore.FieldValue.increment(finalReward),
      xp: admin.firestore.FieldValue.increment(xp),
      level: level,
      multiplier: multiplier,
      ip: userIp,
      userAgent: req.headers["user-agent"]
    }, { merge: true });

    /* 🎯 REFERIDOS (10%) */
  if (
  userData.referredBy &&
  userData.referredBy !== ext_user_id &&
  !userData.refPaid // 👈 NUEVO
) {
  const referrerRef = db.collection("users").doc(userData.referredBy);

  const bonus = reward * 0.10;

  await referrerRef.set({
    earnings: admin.firestore.FieldValue.increment(bonus)
  }, { merge: true });

  await userRef.set({
    refPaid: true // 👈 SOLO paga una vez
  }, { merge: true });

  console.log("🎯 Bono referido:", bonus);
}

    /* 🏆 RANKING */
    await db.collection("ranking").doc(ext_user_id).set({
      earnings: (userData.earnings || 0) + finalReward,
      updatedAt: new Date()
    });

    /* 📜 LOG */
    await db.collection("earnings_logs").add({
      user: ext_user_id,
      amount: finalReward,
      type: "cpx",
      createdAt: new Date()
    });

    /* 🧾 TRANSACCIÓN */
    await txRef.set({
      user: ext_user_id,
      amount: finalReward,
      createdAt: new Date()
    });

    console.log("✅ Pago + XP + Nivel OK");

    res.send("OK");

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Error");
  }
});

/* =========================
🎁 BONUS DIARIO
========================= */
app.post("/daily-bonus", async (req, res) => {
  try {
    const { user_id } = req.body;

    const userRef = db.collection("users").doc(user_id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.send("Usuario no existe");

    const data = userDoc.data();
    const today = new Date().toDateString();

    if (data.lastDailyBonus === today) {
      return res.send("Ya reclamado hoy");
    }

    const bonus = 0.25;

    await userRef.update({
      earnings: admin.firestore.FieldValue.increment(bonus),
      lastDailyBonus: today
    });

    res.send("Bonus recibido");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* =========================
💳 RETIROS
========================= */
app.post("/withdraw", async (req, res) => {
  try {
    const { user_id } = req.body;

    const userRef = db.collection("users").doc(user_id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.send("No existe");

    const data = userDoc.data();

    if ((data.earnings || 0) < 5) {
      return res.send("Mínimo $5");
    }

    await db.collection("withdrawals").add({
      user: user_id,
      amount: data.earnings,
      status: "pending",
      createdAt: new Date()
    });

    await userRef.update({ earnings: 0 });

    res.send("Retiro solicitado");

  } catch (err) {
    res.status(500).send("Error");
  }
});

/* =========================
🧪 TEST
========================= */
app.get("/test", (req, res) => {
  res.send("OK 🚀");
});

/* =========================
🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Servidor PRO en puerto " + PORT);
});
