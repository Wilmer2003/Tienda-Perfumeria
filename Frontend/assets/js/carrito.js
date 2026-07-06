
const productos = {
  1:{nombre:"Noir Ambré", categoria:"Amaderado", precio:189, stock:12, color:"#3d3226"},
  2:{nombre:"Fleur Blanche", categoria:"Floral", precio:149, stock:4, color:"#9c8f6e"},
  3:{nombre:"Citrus Nova", categoria:"Cítrico", precio:129, stock:20, color:"#c9a24a"},
  5:{nombre:"Velours Rose", categoria:"Floral", precio:169, stock:8, color:"#a56b6b"},
  6:{nombre:"Bois Sauvage", categoria:"Amaderado", precio:199, stock:3, color:"#5a4630"},
  8:{nombre:"Ambre Nuit", categoria:"Oriental", precio:219, stock:10, color:"#6b4a2e"}
};

let cart = [
  {id:1, cap:50, cant:2},
  {id:3, cap:80, cant:1},
  {id:6, cap:50, cant:2}
];

const mainArea = document.getElementById('mainArea');
const pageSubtitle = document.getElementById('pageSubtitle');

function showToast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 2600);
}

function render(){
  if(cart.length === 0){
    pageSubtitle.textContent = "Aún no has agregado ninguna fragancia.";
    mainArea.innerHTML = `
      <div class="empty-page">
        <div class="glyph">&#127796;</div>
        <h2>Tu carrito de compras está vacío</h2>
        <p>Visita nuestro catálogo para agregar perfumes y arma tu selección antes de confirmar el pedido.</p>
        <a href="index.html" class="cta">Ir al catálogo</a>
      </div>`;
    return;
  }

  pageSubtitle.textContent = "Revisa las cantidades antes de continuar con tu pedido.";
  let total = 0;

  const rows = cart.map(item=>{
    const p = productos[item.id];
    const subtotal = p.precio * item.cant;
    total += subtotal;
    const atMax = item.cant >= p.stock;
    return `
      <div class="cart-row" data-key="${item.id}-${item.cap}">
        <div class="row-art">
          <div class="bottle">
            <div class="cap"></div><div class="neck"></div>
            <div class="body" style="background:${p.color}"></div>
          </div>
        </div>
        <div class="row-info">
          <div class="row-cat">${p.categoria}</div>
          <div class="row-name">${p.nombre}</div>
          <div class="row-cap">Presentación ${item.cap} ml · <span class="unit-price">S/ ${p.precio} c/u</span></div>
          <div class="row-controls">
            <div class="stepper">
              <button data-act="dec" data-id="${item.id}" data-cap="${item.cap}">−</button>
              <span>${item.cant}</span>
              <button data-act="inc" data-id="${item.id}" data-cap="${item.cap}" ${atMax?'disabled':''}>+</button>
            </div>
          </div>
          ${atMax ? `<div class="stock-warn">Lo sentimos, solo contamos con ${p.stock} unidades disponibles de este perfume.</div>` : ``}
        </div>
        <div class="row-right">
          <button class="remove-btn" data-remove-id="${item.id}" data-remove-cap="${item.cap}" title="Eliminar del carrito">&times;</button>
          <span class="row-subtotal">S/ ${subtotal}</span>
        </div>
      </div>`;
  }).join('');

  mainArea.innerHTML = `
    <div class="items-panel">
      <div class="items-count">${cart.length} producto${cart.length>1?'s':''} en tu carrito</div>
      ${rows}
    </div>
    <div class="summary">
      <h2>Resumen del pedido</h2>
      <div class="sum-row"><span>Subtotal</span><span class="mono">S/ ${total}</span></div>
      <div class="sum-row"><span>Envío</span><span class="mono">Se calcula después</span></div>
      <div class="sum-row total"><span>Total</span><span>S/ ${total}</span></div>
      <button class="confirm-btn" id="confirmBtn">Confirmar pedido</button>
      <div class="summary-note">Se te pedirá iniciar sesión para completar tu pedido. El catálogo y el carrito no requieren cuenta.</div>
    </div>
  `;

  mainArea.querySelectorAll('[data-act]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const delta = btn.dataset.act === 'inc' ? 1 : -1;
      changeQty(Number(btn.dataset.id), Number(btn.dataset.cap), delta);
    });
  });
  mainArea.querySelectorAll('[data-remove-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = productos[Number(btn.dataset.removeId)];
      removeItem(Number(btn.dataset.removeId), Number(btn.dataset.removeCap));
      showToast(p.nombre + ' se eliminó del carrito');
    });
  });
  document.getElementById('confirmBtn').addEventListener('click', ()=>{
    showToast('A continuación se te pedirá iniciar sesión para confirmar tu pedido');
  });
}

function changeQty(id, cap, delta){
  const p = productos[id];
  const item = cart.find(i=>i.id===id && i.cap===cap);
  if(!item) return;
  const nueva = item.cant + delta;
  if(nueva <= 0){
    removeItem(id, cap);
    showToast(p.nombre + ' se eliminó del carrito');
    return;
  }
  if(nueva > p.stock){
    showToast('Solo contamos con ' + p.stock + ' unidades disponibles de este perfume.');
    return;
  }
  item.cant = nueva;
  render();
}

function removeItem(id, cap){
  cart = cart.filter(i=>!(i.id===id && i.cap===cap));
  render();
}

render();
