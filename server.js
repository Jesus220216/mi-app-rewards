const express = require("express");
const path = require("path");
app.use(express.static("public"));

const app = express();
app.use(express.json());

// 🔥 SERVIR FRONTEND (ARREGLA EL ERROR 404)
app.use(express.static(path.join(__dirname, "public")));

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
