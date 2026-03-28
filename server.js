const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* FAKE DB (luego puedes usar MongoDB) */
let users = {};
let withdrawals = [];

/* 🧠 ANTI SPAM */
const requests = {};

function isSpam(ip){
  const now = Date.now();
  if(!requests[ip]) requests[ip] = [];

  requests[ip] = requests[ip].filter(t => now - t < 60000);
  requests[ip].push(now);

  return requests[ip].length > 20; // 20 requests/min
}

/* 💳 RETIRO */
app.post("/withdraw", (req, res)=>{
  const ip = req.ip;

  if(isSpam(ip)){
    return res.status(429).send("Too many requests");
  }

  const { user_id } = req.body;

  if(!user_id){
    return res.status(400).send("Missing user");
  }

  withdrawals.push({
    user_id,
    status: "pending",
    date: new Date(),
    ip
  });

  console.log("💸 Retiro solicitado:", user_id);

  res.send({ success:true });
});

/* 📊 ADMIN */
app.get("/admin/users", (req,res)=>{
  res.json(users);
});

app.get("/admin/withdrawals", (req,res)=>{
  res.json(withdrawals);
});

app.listen(3000, ()=>{
  console.log("🚀 Server running on http://localhost:3000");
});
