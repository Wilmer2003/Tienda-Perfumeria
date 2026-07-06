
let role = 'vendedor';
const roleBtns = document.querySelectorAll('.role-btn');
const submitBtn = document.getElementById('submitBtn');
const userLabel = document.getElementById('userLabel');
const userInput = document.querySelector('#fUser input');

roleBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    role = btn.dataset.role;
    roleBtns.forEach(b=>b.classList.toggle('active', b===btn));
    submitBtn.textContent = 'Ingresar como ' + (role==='vendedor' ? 'Vendedor' : 'Administrador');
    userInput.placeholder = role==='vendedor' ? 'usuario.vendedor' : 'usuario.admin';
  });
});

document.getElementById('goRecover').addEventListener('click', ()=>{
  alert('Se enviará un enlace de recuperación al correo registrado por el administrador general (simulado).');
});

submitBtn.addEventListener('click', ()=>{
  const user = document.querySelector('#fUser input');
  const pass = document.querySelector('#fPass input');
  let ok = true;
  if(!user.value){ document.getElementById('fUser').classList.add('invalid'); ok=false; }
  else document.getElementById('fUser').classList.remove('invalid');
  if(!pass.value){ document.getElementById('fPass').classList.add('invalid'); ok=false; }
  else document.getElementById('fPass').classList.remove('invalid');
  if(ok) alert('Sesión iniciada como ' + role + ' (simulado). Aquí se redirige al panel correspondiente.');
});

// demo: muestra el aviso de sesión cerrada por inactividad si viene ?timeout=1 en la URL
if(new URLSearchParams(window.location.search).get('timeout')){
  document.getElementById('lockoutNote').classList.add('show');
}
