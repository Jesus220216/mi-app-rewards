onSnapshot(userRef,(docSnap)=>{
  const data = docSnap.data();

  const saldo = document.getElementById("saldo");
  const balance = document.getElementById("balance");
  const today = document.getElementById("today");
  const today2 = document.getElementById("today2");

  if(saldo) saldo.textContent = "$"+data.earnings.toFixed(2);
  if(balance) balance.textContent = "$"+data.earnings.toFixed(2);
  if(today) today.textContent = "$"+data.today.toFixed(2);
  if(today2) today2.textContent = "$"+data.today.toFixed(2);
});
