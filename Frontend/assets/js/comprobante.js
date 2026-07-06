
const wrap = document.getElementById('wrap');
let tipo = 'boleta';
let forceError = false;

const orden = {
  items:[
    {nombre:"Noir Ambré 50 ml × 2", monto:378},
    {nombre:"Citrus Nova 80 ml × 1", monto:129},
    {nombre:"Bois Sauvage 50 ml × 2", monto:398}
  ],
  envio:12,
  total:917
};

document.getElementById('demoToggle').addEventListener('click', function(){
  forceError = !forceError;
  this.textContent = 'Modo sustentación: forzar error al generar (' + (forceError?'ON':'OFF') + ')';
});

function renderForm(){
  wrap.innerHTML = `
    <div class="type-select">
      <div class="type-card ${tipo==='boleta'?'active':''}" data-tipo="boleta">
        <div class="t-name">Boleta</div>
        <div class="t-sub">Para personas naturales · requiere DNI</div>
      </div>
      <div class="type-card ${tipo==='factura'?'active':''}" data-tipo="factura">
        <div class="t-name">Factura</div>
        <div class="t-sub">Para empresas · requiere RUC</div>
      </div>
    </div>
    <div class="form-block" id="formBlock"></div>
  `;
  document.querySelectorAll('.type-card').forEach(c=>{
    c.addEventListener('click', ()=>{ tipo = c.dataset.tipo; renderForm(); });
  });
  renderFields();
}

function renderFields(){
  const formBlock = document.getElementById('formBlock');
  if(tipo === 'boleta'){
    formBlock.innerHTML = `
      <div class="field" id="fDoc">
        <label>DNI</label>
        <input type="text" id="docInput" placeholder="12345678" maxlength="8">
        <div class="field-error">Ingresa un DNI válido de 8 dígitos.</div>
      </div>
      <div class="field" id="fNombre">
        <label>Nombre completo</label>
        <input type="text" id="nombreInput" placeholder="Nombre y apellido">
        <div class="field-error">Ingresa el nombre del cliente.</div>
      </div>
      <button class="btn-primary" id="genBtn" style="margin-top:8px;">Generar boleta</button>
    `;
  } else {
    formBlock.innerHTML = `
      <div class="field" id="fDoc">
        <label>RUC</label>
        <input type="text" id="docInput" placeholder="20123456789" maxlength="11">
        <div class="field-error">Ingresa un RUC válido de 11 dígitos.</div>
      </div>
      <div class="field" id="fNombre">
        <label>Razón social</label>
        <input type="text" id="nombreInput" placeholder="Nombre de la empresa">
        <div class="field-error">Ingresa la razón social.</div>
      </div>
      <button class="btn-primary" id="genBtn" style="margin-top:8px;">Generar factura</button>
    `;
  }
  document.getElementById('genBtn').addEventListener('click', validar);
}

function validar(){
  const doc = document.getElementById('docInput').value.trim();
  const nombre = document.getElementById('nombreInput').value.trim();
  const docOk = tipo === 'boleta' ? /^\d{8}$/.test(doc) : /^\d{11}$/.test(doc);
  const nombreOk = nombre.length >= 3;

  document.getElementById('fDoc').classList.toggle('invalid', !docOk);
  document.getElementById('fNombre').classList.toggle('invalid', !nombreOk);
  if(!docOk || !nombreOk) return;

  if(forceError){ renderErrorGenerando(doc, nombre); return; }
  renderReceipt(doc, nombre);
}

function renderErrorGenerando(doc, nombre){
  wrap.innerHTML = `
    <div class="error-block">
      <span>&#9888;</span>
      <div><b>No se pudo generar el comprobante</b>Ocurrió un error inesperado. El incidente fue registrado y notificado al administrador para su revisión manual.</div>
    </div>
    <button class="btn-primary" id="retryBtn">Reintentar</button>
    <button class="btn-ghost" id="backBtn">Volver a editar datos</button>
  `;
  document.getElementById('retryBtn').addEventListener('click', ()=>renderReceipt(doc, nombre));
  document.getElementById('backBtn').addEventListener('click', renderForm);
}

function renderReceipt(doc, nombre){
  const opGravada = (orden.total / 1.18);
  const igv = orden.total - opGravada;
  const serie = tipo === 'boleta' ? 'B001' : 'F001';
  const correlativo = String(Math.floor(1000 + Math.random()*8999));
  const fecha = new Date().toLocaleDateString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric'});
  const hora = new Date().toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'});

  wrap.innerHTML = `
    <div class="receipt">
      <div class="receipt-top">
        <div class="rbrand">Essence & Co.</div>
        <div class="rmeta">RUC 20601234567 · Av. Fragancia 245, Trujillo<br>${fecha} · ${hora}</div>
      </div>
      <div class="receipt-doc">
        <div class="doc-type">${tipo === 'boleta' ? 'Boleta de venta electrónica' : 'Factura electrónica'}</div>
        <div class="doc-num">${serie}-${correlativo}</div>
      </div>
      <div class="receipt-client">
        ${tipo === 'boleta' ? 'DNI' : 'RUC'}: <b>${doc}</b><br>
        ${tipo === 'boleta' ? 'Cliente' : 'Razón social'}: <b>${nombre}</b>
      </div>
      <div class="receipt-items">
        ${orden.items.map(i=>`<div class="r-item"><span class="r-name">${i.nombre}</span><span>S/ ${i.monto.toFixed(2)}</span></div>`).join('')}
        <div class="r-item"><span class="r-name">Envío</span><span>S/ ${orden.envio.toFixed(2)}</span></div>
      </div>
      <div class="receipt-totals">
        <div class="r-total-row"><span>Op. gravada</span><span>S/ ${opGravada.toFixed(2)}</span></div>
        <div class="r-total-row"><span>IGV (18%)</span><span>S/ ${igv.toFixed(2)}</span></div>
        <div class="r-total-row final"><span>Total</span><span>S/ ${orden.total.toFixed(2)}</span></div>
      </div>
      <div class="receipt-foot">Representación impresa del comprobante electrónico · Gracias por tu compra</div>
    </div>
    <div class="actions-row">
      <button class="btn-primary" id="downloadBtn">Descargar PDF</button>
      <button class="btn-ghost" id="homeBtn">Ir al inicio</button>
    </div>
  `;
  document.getElementById('downloadBtn').addEventListener('click', ()=>{
    alert('Descarga simulada: ' + serie + '-' + correlativo + '.pdf');
  });
  document.getElementById('homeBtn').addEventListener('click', ()=>{ window.location.href = 'index.html'; });
}

renderForm();
