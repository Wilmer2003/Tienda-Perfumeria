const formCard = document.getElementById('formCard');
let view = 'login'; // login | registro | recover-1 | recover-2 | recover-3 | recover-done

function render(){
  if(view === 'login') return renderLogin();
  if(view === 'registro') return renderRegistro();
  if(view === 'recover-1') return renderRecover1();
  if(view === 'recover-2') return renderRecover2();
  if(view === 'recover-3') return renderRecover3();
  if(view === 'recover-done') return renderRecoverDone();
}

function renderLogin(){
  formCard.innerHTML = `
    <div class="tabs">
      <button class="tab active" data-tab="login">Iniciar sesión</button>
      <button class="tab" data-tab="registro">Crear cuenta</button>
    </div>
    <div class="field" id="fEmail">
      <label>Correo electrónico</label>
      <input type="email" placeholder="tu@correo.com">
      <div class="field-error">Ingresa un correo con formato válido.</div>
    </div>
    <div class="field" id="fPass">
      <label>Contraseña</label>
      <input type="password" placeholder="••••••••">
      <div class="field-error">La contraseña es obligatoria.</div>
    </div>
    <div class="row-between">
      <span></span>
      <button class="link-muted" id="goRecover">¿Olvidaste tu contraseña?</button>
    </div>
    <button class="btn-primary" id="submitLogin">Iniciar sesión</button>
    <div class="switch-note">¿No tienes cuenta? <button id="goRegistro">Crear una</button></div>
  `;
  bindTabs();
  document.getElementById('goRecover').addEventListener('click', ()=>{ view='recover-1'; render(); });
  document.getElementById('goRegistro').addEventListener('click', ()=>{ view='registro'; render(); });
  document.getElementById('submitLogin').addEventListener('click', ()=>{
    const email = formCard.querySelector('#fEmail input');
    const pass = formCard.querySelector('#fPass input');
    let ok = true;
    if(!email.value.includes('@')){ document.getElementById('fEmail').classList.add('invalid'); ok=false; }
    else document.getElementById('fEmail').classList.remove('invalid');
    if(!pass.value){ document.getElementById('fPass').classList.add('invalid'); ok=false; }
    else document.getElementById('fPass').classList.remove('invalid');
    if(ok) alert('Sesión iniciada (simulado). Aquí se redirige al catálogo o al checkout.');
  });
}

function renderRegistro(){
  formCard.innerHTML = `
    <div class="tabs">
      <button class="tab" data-tab="login">Iniciar sesión</button>
      <button class="tab active" data-tab="registro">Crear cuenta</button>
    </div>
    <div class="field"><label>Nombre completo</label><input type="text" placeholder="Nombre y apellido"></div>
    <div class="field"><label>Correo electrónico</label><input type="email" placeholder="tu@correo.com"></div>
    <div class="field"><label>Contraseña</label><input type="password" placeholder="Mínimo 8 caracteres"></div>
    <div class="field"><label>Confirmar contraseña</label><input type="password" placeholder="Repite tu contraseña"></div>
    <button class="btn-primary" id="submitRegistro">Crear cuenta</button>
    <div class="switch-note">¿Ya tienes cuenta? <button id="goLogin">Iniciar sesión</button></div>
  `;
  bindTabs();
  document.getElementById('goLogin').addEventListener('click', ()=>{ view='login'; render(); });
  document.getElementById('submitRegistro').addEventListener('click', ()=>{
    alert('Cuenta creada (simulado). Ahora puedes iniciar sesión.');
    view='login'; render();
  });
}

function bindTabs(){
  formCard.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click', ()=>{ view = t.dataset.tab; render(); });
  });
}

function stepIndicator(current){
  const steps = [1,2,3];
  return `<div class="recover-steps">
    ${steps.map((s,i)=>`
      ${i>0 ? `<div class="r-line ${current>s-0.5? 'done':''}"></div>` : ''}
      <div class="r-step ${current>s?'done':current===s?'current':''}">${current>s?'&#10003;':s}</div>
    `).join('')}
  </div>`;
}

function renderRecover1(){
  formCard.innerHTML = `
    <button class="back-mini" id="backLogin">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Volver a iniciar sesión
    </button>
    ${stepIndicator(1)}
    <h2 class="recover-title">Recuperar contraseña</h2>
    <p class="recover-sub">Ingresa el correo asociado a tu cuenta. Te enviaremos un código de verificación de 6 dígitos.</p>
    <div class="field" id="rEmail">
      <label>Correo electrónico</label>
      <input type="email" placeholder="tu@correo.com">
      <div class="field-error">Ingresa un correo con formato válido.</div>
    </div>
    <button class="btn-primary" id="sendCode">Enviar código</button>
  `;
  document.getElementById('backLogin').addEventListener('click', ()=>{ view='login'; render(); });
  document.getElementById('sendCode').addEventListener('click', ()=>{
    const email = formCard.querySelector('#rEmail input');
    if(!email.value.includes('@')){ document.getElementById('rEmail').classList.add('invalid'); return; }
    window._recoverEmail = email.value;
    view='recover-2'; render();
  });
}

function renderRecover2(){
  formCard.innerHTML = `
    <button class="back-mini" id="backStep1">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Cambiar correo
    </button>
    ${stepIndicator(2)}
    <h2 class="recover-title">Ingresa el código</h2>
    <p class="recover-sub">Enviamos un código de 6 dígitos a <b>${window._recoverEmail || 'tu correo'}</b>. Revisa tu bandeja de entrada o spam.</p>
    <div class="code-inputs">
      ${Array.from({length:6}).map(()=>`<input maxlength="1" inputmode="numeric">`).join('')}
    </div>
    <div class="resend-note">¿No llegó el código? <button id="resend">Reenviar</button></div>
    <button class="btn-primary" id="verifyCode">Verificar código</button>
  `;
  document.getElementById('backStep1').addEventListener('click', ()=>{ view='recover-1'; render(); });
  document.getElementById('resend').addEventListener('click', ()=>alert('Código reenviado (simulado).'));

  const inputs = formCard.querySelectorAll('.code-inputs input');
  inputs.forEach((inp,i)=>{
    inp.addEventListener('input', ()=>{
      if(inp.value && inputs[i+1]) inputs[i+1].focus();
    });
  });
  document.getElementById('verifyCode').addEventListener('click', ()=>{ view='recover-3'; render(); });
}

function renderRecover3(){
  formCard.innerHTML = `
    ${stepIndicator(3)}
    <h2 class="recover-title">Crea una nueva contraseña</h2>
    <p class="recover-sub">Elige una contraseña segura que no hayas usado antes en Essence & Co.</p>
    <div class="field">
      <label>Nueva contraseña</label>
      <input type="password" id="newPass" placeholder="Mínimo 8 caracteres">
      <div class="strength-bar"><div id="s1"></div><div id="s2"></div><div id="s3"></div></div>
    </div>
    <div class="field" id="fConfirm">
      <label>Confirmar contraseña</label>
      <input type="password" placeholder="Repite tu nueva contraseña">
      <div class="field-error">Las contraseñas no coinciden.</div>
    </div>
    <button class="btn-primary" id="savePass">Guardar contraseña</button>
  `;
  const newPass = document.getElementById('newPass');
  newPass.addEventListener('input', ()=>{
    const len = newPass.value.length;
    document.getElementById('s1').classList.toggle('on', len>=1);
    document.getElementById('s2').classList.toggle('on', len>=6);
    document.getElementById('s3').classList.toggle('on', len>=10);
  });
  document.getElementById('savePass').addEventListener('click', ()=>{
    const p1 = newPass.value;
    const p2 = formCard.querySelector('#fConfirm input').value;
    if(p1 !== p2 || !p1){ document.getElementById('fConfirm').classList.add('invalid'); return; }
    view='recover-done'; render();
  });
}

function renderRecoverDone(){
  formCard.innerHTML = `
    <div class="success-box">
      <div class="glyph">&#10003;</div>
      <h2 class="recover-title">Contraseña actualizada</h2>
      <p class="recover-sub">Ya puedes iniciar sesión con tu nueva contraseña.</p>
      <button class="btn-primary" id="toLogin">Ir a iniciar sesión</button>
    </div>
  `;
  document.getElementById('toLogin').addEventListener('click', ()=>{ view='login'; render(); });
}

render();
