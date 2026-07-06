
const productos = [
  {id:1, nombre:"Noir Ambré", categoria:"Amaderado", precio:189, stock:12, color:"#3d3226"},
  {id:2, nombre:"Fleur Blanche", categoria:"Floral", precio:149, stock:4, color:"#9c8f6e"},
  {id:3, nombre:"Citrus Nova", categoria:"Cítrico", precio:129, stock:20, color:"#c9a24a"},
  {id:5, nombre:"Velours Rose", categoria:"Floral", precio:169, stock:8, color:"#a56b6b"},
  {id:6, nombre:"Bois Sauvage", categoria:"Amaderado", precio:199, stock:0, color:"#5a4630"},
  {id:7, nombre:"Aqua Marine", categoria:"Cítrico", precio:119, stock:15, color:"#7a97a0"},
  {id:8, nombre:"Ambre Nuit", categoria:"Oriental", precio:219, stock:10, color:"#6b4a2e"}
];
const clientesDB = [
  {dni:"45678912", nombre:"María López", telefono:"987654321"},
  {dni:"41234567", nombre:"Jorge Díaz", telefono:"956123478"}
];

let cliente = null;
let clienteBusqueda = "";
let ticket = [];
let metodoPago = 'efectivo';
let ventaRegistrada = null;

const clientBlock = document.getElementById('clientBlock');
const prodGrid = document.getElementById('prodGrid');
const ticketEl = document.getElementById('ticket');

function renderClient(){
  if(cliente){
    clientBlock.innerHTML = `
      <div class="client-search">
        <input type="text" placeholder="Buscar por DNI o nombre" disabled>
        <button class="btn-ghost" id="changeClient">Cambiar cliente</button>
      </div>
      <div class="client-found">
        <div class="client-info"><b>${cliente.nombre}</b><span>DNI ${cliente.dni} · ${cliente.telefono}</span></div>
        <span style="font-size:0.72rem; color:var(--sage); font-family:'IBM Plex Mono',monospace;">Cliente seleccionado</span>
      </div>`;
    document.getElementById('changeClient').addEventListener('click', ()=>{ cliente=null; renderClient(); });
    return;
  }

  clientBlock.innerHTML = `
    <div class="client-search">
      <input type="text" id="clientInput" placeholder="Buscar por DNI o nombre" value="${clienteBusqueda}">
      <button class="btn-primary" id="searchClientBtn">Buscar</button>
    </div>
    <div id="clientResult"></div>
  `;
  document.getElementById('searchClientBtn').addEventListener('click', ()=>{
    const val = document.getElementById('clientInput').value.trim();
    clienteBusqueda = val;
    const found = clientesDB.find(c=>c.dni===val || c.nombre.toLowerCase().includes(val.toLowerCase()));
    const resultEl = document.getElementById('clientResult');
    if(found){
      cliente = found;
      renderClient();
    } else if(val) {
      resultEl.innerHTML = `
        <div class="client-notfound">
          <b>Cliente no encontrado.</b> Regístralo para continuar con la venta.
          <div class="quick-register">
            <input type="text" id="qNombre" placeholder="Nombre completo">
            <input type="text" id="qDni" placeholder="DNI" maxlength="8">
            <input type="text" id="qTel" placeholder="Teléfono">
            <button class="btn-primary" id="qRegisterBtn">Registrar</button>
          </div>
        </div>`;
      document.getElementById('qRegisterBtn').addEventListener('click', ()=>{
        const nombre = document.getElementById('qNombre').value.trim();
        const dni = document.getElementById('qDni').value.trim();
        const tel = document.getElementById('qTel').value.trim();
        if(!nombre || !/^\d{8}$/.test(dni)) return;
        const nuevo = {dni, nombre, telefono:tel||'—'};
        clientesDB.push(nuevo);
        cliente = nuevo;
        renderClient();
      });
    }
  });
}

function renderProducts(filter=""){
  const f = filter.toLowerCase();
  const list = productos.filter(p=> !f || p.nombre.toLowerCase().includes(f) || p.categoria.toLowerCase().includes(f));
  prodGrid.innerHTML = list.map(p=>`
    <div class="prod-tile ${p.stock===0?'out':''}" data-id="${p.id}">
      <div class="prod-swatch" style="background:${p.color}"></div>
      <div class="p-cat">${p.categoria}</div>
      <div class="p-name">${p.nombre}</div>
      <div class="p-foot">
        <span class="p-price">S/ ${p.precio}</span>
        <span class="p-stock ${p.stock<=4?'low':''}">${p.stock===0?'Agotado':p.stock+' un.'}</span>
      </div>
    </div>
  `).join('');
  prodGrid.querySelectorAll('.prod-tile').forEach(tile=>{
    tile.addEventListener('click', ()=>{
      if(tile.classList.contains('out')) return;
      addToTicket(Number(tile.dataset.id));
    });
  });
}
document.getElementById('prodSearch').addEventListener('input', (e)=>renderProducts(e.target.value));

function addToTicket(id){
  const p = productos.find(x=>x.id===id);
  const item = ticket.find(i=>i.id===id);
  const cantActual = item ? item.cant : 0;
  if(cantActual + 1 > p.stock){
    showStockToast('No hay suficiente stock de ' + p.nombre + '. Disponible: ' + p.stock + ' unidades.');
    return;
  }
  if(item) item.cant += 1;
  else ticket.push({id, cant:1});
  renderTicket();
}

function changeTicketQty(id, delta){
  const p = productos.find(x=>x.id===id);
  const item = ticket.find(i=>i.id===id);
  if(!item) return;
  const nueva = item.cant + delta;
  if(nueva <= 0){ ticket = ticket.filter(i=>i.id!==id); renderTicket(); return; }
  if(nueva > p.stock){ showStockToast('No hay suficiente stock de ' + p.nombre + '. Disponible: ' + p.stock + ' unidades.'); return; }
  item.cant = nueva;
  renderTicket();
}

let toastTimer;
function showStockToast(msg){
  const t = document.getElementById('stockToast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3000);
}

function renderTicket(){
  if(ventaRegistrada){
    ticketEl.innerHTML = `
      <div class="success-view">
        <div class="glyph">&#10003;</div>
        <h3>Venta registrada</h3>
        <p>${ventaRegistrada.cliente}</p>
        <div class="doc">${ventaRegistrada.doc}</div>
        <p style="font-family:'IBM Plex Mono',monospace; color:var(--gold); font-size:1.1rem; margin-bottom:22px;">S/ ${ventaRegistrada.total}</p>
        <button class="btn-primary" id="newSaleBtn" style="width:100%;">Nueva venta</button>
      </div>`;
    document.getElementById('newSaleBtn').addEventListener('click', ()=>{
      ventaRegistrada = null; cliente = null; ticket = []; clienteBusqueda='';
      renderClient(); renderTicket();
    });
    return;
  }

  const total = ticket.reduce((s,i)=>{
    const p = productos.find(x=>x.id===i.id);
    return s + p.precio*i.cant;
  },0);

  ticketEl.innerHTML = `
    <div class="ticket-head">
      <h2>Ticket de venta</h2>
      <span>${new Date().toLocaleDateString('es-PE')} · Mostrador</span>
    </div>
    <div id="stockToast" class="stock-toast"></div>
    <div class="ticket-items">
      ${ticket.length===0 ? `<div class="t-empty">Agrega productos desde el catálogo para iniciar la venta.</div>` :
        ticket.map(item=>{
          const p = productos.find(x=>x.id===item.id);
          const atMax = item.cant >= p.stock;
          return `
            <div class="t-item">
              <div class="t-item-info">
                <div class="t-name">${p.nombre}</div>
                <div class="t-meta">S/ ${p.precio} c/u</div>
                <div class="t-stepper">
                  <button data-dec="${item.id}">−</button>
                  <span>${item.cant}</span>
                  <button data-inc="${item.id}" ${atMax?'disabled':''}>+</button>
                </div>
              </div>
              <div class="t-item-right">
                <button class="t-remove" data-rm="${item.id}">&times;</button>
                <span class="t-sub">S/ ${p.precio*item.cant}</span>
              </div>
            </div>`;
        }).join('')
      }
    </div>
    <div class="pay-select">
      <div class="pay-opt ${metodoPago==='efectivo'?'active':''}" data-pay="efectivo">Efectivo</div>
      <div class="pay-opt ${metodoPago==='tarjeta'?'active':''}" data-pay="tarjeta">Tarjeta</div>
    </div>
    <div class="total-row"><span>Total</span><span>S/ ${total}</span></div>
    <button class="btn-primary" id="registrarBtn" style="width:100%; padding:14px;" ${(!cliente || ticket.length===0)?'disabled':''}>Registrar venta</button>
  `;

  ticketEl.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click',()=>changeTicketQty(Number(b.dataset.inc),1)));
  ticketEl.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>changeTicketQty(Number(b.dataset.dec),-1)));
  ticketEl.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click',()=>{ ticket = ticket.filter(i=>i.id!==Number(b.dataset.rm)); renderTicket(); }));
  ticketEl.querySelectorAll('[data-pay]').forEach(b=>b.addEventListener('click',()=>{ metodoPago=b.dataset.pay; renderTicket(); }));

  const registrarBtn = document.getElementById('registrarBtn');
  if(registrarBtn) registrarBtn.addEventListener('click', ()=>{
    ticket.forEach(item=>{
      const p = productos.find(x=>x.id===item.id);
      p.stock -= item.cant;
    });
    ventaRegistrada = {
      cliente: cliente.nombre,
      doc: 'B001-' + Math.floor(1000+Math.random()*8999),
      total
    };
    renderProducts(document.getElementById('prodSearch').value);
    renderTicket();
  });
}

renderClient();
renderProducts();
renderTicket();
