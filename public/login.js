// 🆕 REGISTRO PRO (ARREGLADO)
async function register() {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const inputRef = document.getElementById("referralCode").value;
  const localRef = localStorage.getItem("referrer_id");

  const ref = inputRef || localRef || null;

  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  mostrarLoader(true);

  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    const uid = user.uid; // ✅ ID REAL

    // 🎯 CPX ID (esto sí lo puedes mantener)
    let cpxId = localStorage.getItem("cpx_user_id");
    if (!cpxId) {
      cpxId = "srv-" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cpx_user_id", cpxId);
    }

    // 🎯 CÓDIGO PROPIO
    const myCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 💾 GUARDAR USUARIO CORRECTO
    await setDoc(doc(db, "users", uid), {
      email,
      uid,
      cpxId, // 🔥 guardas también el de CPX
      referralCode: myCode,
      referrer: ref,
      earnings: 0,
      today: 0,
      refs: 0,
      createdAt: new Date()
    });

    // 🎯 SUMAR REFERIDO (IMPORTANTE)
    if (ref) {
      // buscar por referralCode (no por ID)
      // esto lo optimizamos luego si quieres 🔥
    }

    alert("Cuenta creada PRO ✅");

    localStorage.removeItem("referrer_id");

    window.location.href = "dashboard.html";

  } catch (e) {
    alert(e.message);
  }

  mostrarLoader(false);
}
