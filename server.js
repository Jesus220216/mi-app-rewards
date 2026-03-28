const express = require("express");
const path = require("path");

const app = express(); // ⚠️ PRIMERO se declara

app.use(express.json());

// 🔥 SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// 🔥 RUTA PRINCIPAL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 DASHBOARD
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// 💳 RETIRO
app.post("/withdraw", (req, res) => {
  const { user_id } = req.body;

  console.log("💰 Retiro solicitado:", user_id);

  res.json({ success: true });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
