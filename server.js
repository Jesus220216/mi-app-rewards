
const crypto = require("crypto");
const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const axios = require("axios");

const app = express();
app.use(express.json());

/* =========================
🌐 FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
🔥 FIREBASE
========================= */
const rawKey = process.env.FIREBASE_KEY;

if (!rawKey) {
  throw new Error("❌ FIREBASE_KEY no está definido en Render");
}

const serviceAccount = JSON.parse(
  rawKey.replace(/\\n/g, '\n')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* =========================
🚫 RATE LIMIT
========================= */
const rateLimit = {};

function limit(key) {
  const now = Date.now();
  if (!rateLimit[key]) rateLimit[key] = [];

  rateLimit[key] = rateLimit[key].filter(t => now - t < 60000);

  if (rateLimit[key].length > 30) return false;

  rateLimit[key].push(now);
  return true;
}

/* =========================
🛡️ ANTI VPN
========================= */
async function isVPN(ip) {
  try {
    const API_KEY = process.env.IPQS_KEY;

    const url = `https://ipqualityscore.com/api/json/ip/${API_KEY}/${ip}`;

    const { data } = await axios.get(url);

    return (
      data.proxy ||
      data.vpn ||
      data.tor ||
      data.fraud_score > 85
    );
  } catch (e) {
    console.error("IP CHECK ERROR", e);
    return false;
  }
}

/* =========================
🤖 EMULATOR CHECK
========================= */
function isEmulator(ua) {
  const patterns = [
    "android sdk",
    "emulator",
    "genymotion",
    "x86",
    "virtual",
    "sdk_gphone",
    "google_sdk"
  ];

  return patterns.some(p => ua.toLowerCase().includes(p));
}

/* =========================
🚀 POSTBACK CPX
========================= */
app.get("/cpx-postback", async (req, res) => {
  try {
    const { ext_user_id, trans_id, reward_value, secure_hash } = req.query;

    if (!ext_user_id || !trans_id || !reward_value || !secure_hash) {
      return res.status(400).send("Datos faltantes");
    }

    const userIp = (
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      ""
    ).split(",")[0].trim();

    const key = userIp + ext_user_id;

    if (!limit(key)) {
      return res.send("Rate limit");
    }

    /* 🔐 IP WHITELIST */
    const allowedIPs = ["IP_DE_CPX_AQUI"];
    if (!allowedIPs.includes(userIp)) {
      return res.status(403).send("No autorizado");
    }

    /* 🛡️ VPN CHECK */
    if (await isVPN(userIp)) {
      return res.send("VPN bloqueada");
    }

    /* 🤖 USER AGENT */
    const ua = req.headers["user-agent"] || "";

    if (
      ua.includes("bot") ||
      ua.includes("curl") ||
      ua.includes("spider") ||
      ua.length < 20 ||
      isEmulator(ua)
    ) {
      return res.send("Dispositivo no permitido");
    }

    /* 💰 VALIDAR REWARD */
    const reward = parseFloat(reward_value);
    if (isNaN(reward) || reward <= 0 || reward > 5) {
      return res.send("Fraude detectado");
    }

    /* 🔐 HASH */
    const API_KEY = process.env.CPX_API_KEY;

    const expectedHash = crypto
      .createHash("md5")
      .update(ext_user_id + trans_id + reward_value + API_KEY)
      .digest("hex");

    if (
      secure_hash.length !== expectedHash.length ||
      !crypto.timingSafeEqual(
        Buffer.from(secure_hash),
        Buffer.from(expectedHash)
      )
    ) {
      return res.status(403).send("Invalid hash");
    }

    /* 🔁 DUPLICADOS */
    const txRef = db.collection("transactions").doc(trans_id);
    if ((await txRef.get()).exists) {
      return res.send("Ya pagado");
    }

    /* 👤 USUARIO */
    const userRef = db.collection("users").doc(ext_user_id);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        earnings: 0,
        today: 0,
        xp: 0,
        level: 0,
        referredBy: null,
        fraudScore: 0,
        pendingWithdrawal: 0
      });
      userDoc = await userRef.get();
    }

    const userData = userDoc.data();

    /* 🔄 RESET DIARIO */
    const todayDate = new Date().toDateString();

    if (userData.lastReset !== todayDate) {
      await userRef.update({
        today: 0,
        lastReset: todayDate
      });
      userData.today = 0;
    }

    if ((userData.today || 0) + reward > 5) {
      return res.send("Límite diario alcanzado");
    }

    /* 🎮 XP + NIVEL */
    const xp = reward * 10;
    const newXP = (userData.xp || 0) + xp;
    const level = Math.floor(newXP / 100);

    let multiplier = 1;
    if (level >= 10) multiplier = 1.5;
    else if (level >= 5) multiplier = 1.2;

    const finalReward = reward * multiplier;

    /* 🌍 CONTROL IP */
    const ipQuery = await db.collection("users")
      .where("ip", "==", userIp)
      .get();

    const uniqueUsers = ipQuery.docs.filter(doc => doc.id !== ext_user_id);

    if (uniqueUsers.length >= 3 && reward > 1) {
      await userRef.update({
        fraudScore: admin.firestore.FieldValue.increment(1)
      });
      return res.send("Fraude detectado");
    }

    if (uniqueUsers.length >= 5) {
      return res.send("Bloqueado por IP");
    }

    /* 💰 TRANSACCIÓN */
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      const data = doc.data();

      t.update(userRef, {
        earnings: (data.earnings || 0) + finalReward,
        today: (data.today || 0) + finalReward,
        xp: (data.xp || 0) + xp,
        level,
        multiplier,
        ip: userIp,
        userAgent: ua
      });
    });

    /* 📱 DEVICE LOG */
    await db.collection("device_logs").add({
      user: ext_user_id,
      ip: userIp,
      ua,
      createdAt: new Date()
    });

    /* 🎯 REFERIDOS */
    if (
      userData.referredBy &&
      userData.referredBy !== ext_user_id &&
      !userData.refPaid
    ) {
      const refRef = db.collection("users").doc(userData.referredBy);

      await refRef.set({
        earnings: admin.firestore.FieldValue.increment(reward * 0.1)
      }, { merge: true });

      await userRef.set({ refPaid: true }, { merge: true });
    }

    /* 📜 LOGS */
    await db.collection("earnings_logs").add({
      user: ext_user_id,
      amount: finalReward,
      createdAt: new Date()
    });

    await txRef.set({
      user: ext_user_id,
      amount: finalReward,
      createdAt: new Date()
    });

    res.send("OK");

  } catch (err) {
    console.error(err);
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
    const doc = await userRef.get();

    if (!doc.exists) return res.send("No existe");

    const data = doc.data();
    const today = new Date().toDateString();

    if (data.lastDailyBonus === today) {
      return res.send("Ya reclamado");
    }

    await userRef.update({
      earnings: admin.firestore.FieldValue.increment(0.25),
      lastDailyBonus: today
    });

    res.send("Bonus OK");

  } catch {
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
    const doc = await userRef.get();

    if (!doc.exists) return res.send("No existe");

    const data = doc.data();

    if (data.pendingWithdrawal) {
      return res.send("Ya tienes un retiro pendiente");
    }

    if ((data.earnings || 0) < 5) {
      return res.send("Mínimo $5");
    }

    const amount = data.earnings;

    await db.collection("withdrawals").add({
      user: user_id,
      amount,
      status: "pending",
      createdAt: new Date()
    });

    await userRef.update({
      earnings: 0,
      pendingWithdrawal: amount
    });

    res.send("Retiro solicitado");

  } catch {
    res.status(500).send("Error");
  }
});

/* =========================
🧾 ADMIN
========================= */
function isAdmin(req) {
  return req.headers["x-admin-key"] === process.env.ADMIN_KEY;
}

app.post("/admin/approve", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).send("No autorizado");

  const { id } = req.body;

  const ref = db.collection("withdrawals").doc(id);
  const doc = await ref.get();

  if (!doc.exists) return res.send("No existe");

  const data = doc.data();

  await ref.update({
    status: "approved",
    processedAt: new Date()
  });

  await db.collection("users").doc(data.user).update({
    pendingWithdrawal: 0
  });

  res.send("Aprobado");
});

app.post("/admin/reject", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).send("No autorizado");

  const { id } = req.body;

  const ref = db.collection("withdrawals").doc(id);
  const doc = await ref.get();

  if (!doc.exists) return res.send("No existe");

  const data = doc.data();

  await ref.update({
    status: "rejected",
    processedAt: new Date()
  });

  await db.collection("users").doc(data.user).update({
    earnings: admin.firestore.FieldValue.increment(data.amount),
    pendingWithdrawal: 0
  });

  res.send("Rechazado");
});

/* =========================
🚀 SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 PRO server listo en puerto " + PORT);
});
