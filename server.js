const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let withdrawals = [];
const requests = {};

/* ANTI SPAM */
function isSpam(ip){
  const now = Date.now();

  if(!requests[ip]) requests[ip] = [];

  requests[ip] = requests[ip].filter(t => now - t < 60000);
  requests[ip].push(now);

  return requests[ip].length > 15;
}

/* RETIRO */
app.post("/withdraw", (req, res)=>{
  const ip = req.ip;

  if(isSpam(ip)){
    return res.status(429).send("🚫 Demasiadas solicitudes");
  }

  const { user_id } = req.body;

  if(!user_id){
    return res.status(400).send("Falta user_id");
  }

  withdrawals.push({
    user_id,
    status: "pending",
    ip,
    date: new Date()
  });

  console.log("💸 Retiro:", user_id);

  res.json({ success: true });
});

/* ADMIN */
app.get("/admin/withdrawals", (req,res)=>{
  res.json(withdrawals);
});

app.listen(3000, ()=>{
  console.log("🔥 Server activo en http://localhost:3000");
});
