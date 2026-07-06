
let method = 'yape';
let forceFail = false;
const formArea = document.getElementById('formArea');
const overlay = document.getElementById('overlay');
const resultCard = document.getElementById('resultCard');

document.querySelectorAll('.method-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    method = card.dataset.method;
    document.querySelectorAll('.method-card').forEach(c=>c.classList.toggle('active', c===card));
    renderForm();
  });
});

document.getElementById('demoToggle').addEventListener('click', function(){
  forceFail = !forceFail;
  this.textContent = 'Modo sustentación: forzar pago rechazado (' + (forceFail?'ON':'OFF') + ')';
});

function renderForm(){
  if(method === 'yape'){
    formArea.innerHTML = `
      <div class="form-block">
        <h3>Pagar con Yape</h3>
        <div class="yape-qr">
          <div class="qr-box"></div>
          <p>Escanea el código con tu app Yape y paga <b>S/ 917</b>. Luego ingresa el número de operación que te aparece en el comprobante.</p>
        </div>
        <div class="field-row">
          <div class="field" id="fCel">
            <label>Número de celular Yape</label>
            <input type="text" placeholder="9XXXXXXXX" maxlength="9">
            <div class="field-error">Ingresa un número de celular válido (9 dígitos).</div>
          </div>
          <div class="field" id="fOp">
            <label>Número de operación</label>
            <input type="text" placeholder="000-123456">
            <div class="field-error">Ingresa el número de operación de tu comprobante Yape.</div>
          </div>
        </div>
        <button class="pay-btn" id="payBtn">Confirmar pago de S/ 917</button>
        <div class="secure-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="9" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          Pago simulado con fines académicos
        </div>
      </div>`;
    document.getElementById('payBtn').addEventListener('click', ()=>validateYape());
  } else {
    formArea.innerHTML = `
      <div class="form-block">
        <h3>Pagar con tarjeta</h3>
        <div class="card-preview">
          <div class="chip"></div>
          <div class="num" id="cardPreviewNum">•••• •••• •••• ••••</div>
          <div class="meta"><span id="cardPreviewName">NOMBRE DEL TITULAR</span><span id="cardPreviewExp">MM/AA</span></div>
        </div>
        <div class="field" id="fNum">
          <label>Número de tarjeta</label>
          <input type="text" id="cardNum" placeholder="0000 0000 0000 0000" maxlength="19">
          <div class="field-error">Ingresa un número de tarjeta válido (16 dígitos).</div>
        </div>
        <div class="field" id="fName">
          <label>Nombre del titular</label>
          <input type="text" id="cardName" placeholder="Como aparece en la tarjeta">
          <div class="field-error">Ingresa el nombre del titular.</div>
        </div>
        <div class="field-row">
          <div class="field" id="fExp">
            <label>Fecha de vencimiento</label>
            <input type="text" id="cardExp" placeholder="MM/AA" maxlength="5">
            <div class="field-error">Formato inválido (MM/AA).</div>
          </div>
          <div class="field" id="fCvv">
            <label>CVV</label>
            <input type="text" placeholder="•••" maxlength="3">
            <div class="field-error">Ingresa un CVV de 3 dígitos.</div>
          </div>
        </div>
        <button class="pay-btn" id="payBtn">Confirmar pago de S/ 917</button>
        <div class="secure-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="9" rx="1"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          Pago simulado con fines académicos
        </div>
      </div>`;
    const numInput = document.getElementById('cardNum');
    numInput.addEventListener('input', ()=>{
      document.getElementById('cardPreviewNum').textContent = numInput.value || '•••• •••• •••• ••••';
    });
    document.getElementById('cardName').addEventListener('input', (e)=>{
      document.getElementById('cardPreviewName').textContent = e.target.value.toUpperCase() || 'NOMBRE DEL TITULAR';
    });
    document.getElementById('cardExp').addEventListener('input', (e)=>{
      document.getElementById('cardPreviewExp').textContent = e.target.value || 'MM/AA';
    });
    document.getElementById('payBtn').addEventListener('click', ()=>validateTarjeta());
  }
}

function markInvalid(id, invalid){
  document.getElementById(id).classList.toggle('invalid', invalid);
}

function validateYape(){
  let ok = true;
  const cel = document.querySelector('#fCel input').value;
  const op = document.querySelector('#fOp input').value;
  const celOk = /^9\d{8}$/.test(cel);
  const opOk = op.trim().length >= 6;
  markInvalid('fCel', !celOk); if(!celOk) ok=false;
  markInvalid('fOp', !opOk); if(!opOk) ok=false;
  if(ok) processPayment();
}

function validateTarjeta(){
  let ok = true;
  const num = document.getElementById('cardNum').value.replace(/\s/g,'');
  const name = document.getElementById('cardName').value;
  const exp = document.getElementById('cardExp').value;
  const cvv = document.querySelector('#fCvv input').value;
  const numOk = /^\d{16}$/.test(num);
  const nameOk = name.trim().length >= 3;
  const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
  const cvvOk = /^\d{3}$/.test(cvv);
  markInvalid('fNum', !numOk); if(!numOk) ok=false;
  markInvalid('fName', !nameOk); if(!nameOk) ok=false;
  markInvalid('fExp', !expOk); if(!expOk) ok=false;
  markInvalid('fCvv', !cvvOk); if(!cvvOk) ok=false;
  if(ok) processPayment();
}

function processPayment(){
  overlay.classList.add('show');
  resultCard.innerHTML = `<div class="spinner"></div><h3>Procesando tu pago</h3><p>Estamos confirmando la transacción con ${method === 'yape' ? 'Yape' : 'tu banco'}. Esto puede tardar unos segundos.</p>`;
  setTimeout(()=>{
    if(forceFail) renderFail();
    else renderSuccess();
  }, 1800);
}

function renderSuccess(){
  const txId = 'TX-' + Math.floor(100000 + Math.random()*900000);
  resultCard.innerHTML = `
    <div class="result-glyph ok">&#10003;</div>
    <h3>Pago aprobado</h3>
    <p>Tu pago de <b>S/ 917</b> fue procesado correctamente. A continuación generaremos tu comprobante y confirmaremos tu pedido.</p>
    <div class="tx-id">N° de operación: ${txId}</div>
    <div class="result-actions">
      <button class="btn-primary" id="continueBtn">Continuar</button>
    </div>`;
  document.getElementById('continueBtn').addEventListener('click', ()=>{
    alert('Aquí se continúa con Generar Comprobante y Enviar Notificación (CU relacionados).');
  });
}

function renderFail(){
  resultCard.innerHTML = `
    <div class="result-glyph fail">&#33;</div>
    <h3>No se pudo procesar el pago</h3>
    <p>Ocurrió un problema al procesar tu pago. Puedes intentarlo nuevamente o elegir otro método de pago.</p>
    <div class="result-actions">
      <button class="btn-primary" id="retryBtn">Intentar nuevamente</button>
      <button class="btn-ghost" id="changeMethodBtn">Cambiar método de pago</button>
    </div>`;
  document.getElementById('retryBtn').addEventListener('click', ()=>overlay.classList.remove('show'));
  document.getElementById('changeMethodBtn').addEventListener('click', ()=>{
    overlay.classList.remove('show');
    document.querySelector('[data-method="' + (method==='yape'?'tarjeta':'yape') + '"]').click();
  });
}

renderForm();
