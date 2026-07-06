
const productos = [
  {id:1, nombre:"Noir Ambré", marca:"Essence & Co.", categoria:"Amaderado", precio:189, caps:[50,80], stock:12, color:"#3d3226",
   desc:"Un acorde amaderado profundo con fondo de ámbar y vetiver, pensado para quien prefiere una estela discreta y persistente."},
  {id:2, nombre:"Fleur Blanche", marca:"Essence & Co.", categoria:"Floral", precio:149, caps:[50], stock:4, color:"#9c8f6e",
   desc:"Jazmín y flor de azahar sobre una base limpia de almizcle blanco. Fresca en la salida, envolvente al final del día."},
  {id:3, nombre:"Citrus Nova", marca:"Essence & Co.", categoria:"Cítrico", precio:129, caps:[50,80], stock:20, color:"#c9a24a",
   desc:"Bergamota y pomelo rosado con un toque de jengibre. La opción más luminosa del catálogo."},
  {id:4, nombre:"Oud Impérial", marca:"Essence & Co.", categoria:"Oriental", precio:259, caps:[80], stock:0, color:"#241a12",
   desc:"Oud, azafrán y cuero curtido. Una composición intensa reservada para ocasiones que lo ameritan."},
  {id:5, nombre:"Velours Rose", marca:"Essence & Co.", categoria:"Floral", precio:169, caps:[50], stock:8, color:"#a56b6b",
   desc:"Rosa de mayo y peonía sobre una base aterciopelada de sándalo. Elegante sin ser dulce."},
  {id:6, nombre:"Bois Sauvage", marca:"Essence & Co.", categoria:"Amaderado", precio:199, caps:[50,80], stock:3, color:"#5a4630",
   desc:"Cedro, cardamomo y pachulí. Una fragancia de carácter para climas fríos."},
  {id:7, nombre:"Aqua Marine", marca:"Essence & Co.", categoria:"Cítrico", precio:119, caps:[50], stock:15, color:"#7a97a0",
   desc:"Notas acuáticas y cítricas con un fondo ligero de almizcle. Ideal para el uso diario."},
  {id:8, nombre:"Ambre Nuit", marca:"Essence & Co.", categoria:"Oriental", precio:219, caps:[80], stock:10, color:"#6b4a2e",
   desc:"Ámbar, vainilla y especias cálidas. La firma nocturna de la casa."}
];

const categorias = ["Todas", "Floral", "Amaderado", "Cítrico", "Oriental"];
let filtroTexto = "";
let filtroCap = null;
let filtroCat = "Todas";
let cart = []; // {id, cap, cant}

const grid = document.getElementById('grid');
const catRail = document.getElementById('catRail');
const totalCount = document.getElementById('totalCount');

function stockFlag(stock){
  if(stock === 0) return '<span class="stock-flag out">Agotado</span>';
  if(stock <= 4) return '<span class="stock-flag low">Últimas '+stock+'</span>';
  return '<span class="stock-flag ok">En stock</span>';
}

function renderCatRail(){
  catRail.innerHTML = categorias.map(c =>
    `<button class="cat-chip ${c===filtroCat?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');
  catRail.querySelectorAll('.cat-chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{ filtroCat = btn.dataset.cat; renderCatRail(); renderGrid(); });
  });
}

function matches(p){
  const t = filtroTexto.trim().toLowerCase();
  const textOk = !t || p.nombre.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t) || String(p.id).includes(t);
  const capOk = !filtroCap || p.caps.includes(filtroCap);
  const catOk = filtroCat === "Todas" || p.categoria === filtroCat;
  return textOk && capOk && catOk;
}

function renderGrid(){
  const list = productos.filter(matches);
  totalCount.textContent = productos.length;

  if(list.length === 0){
    grid.innerHTML = `
      <div class="empty-state">
        <div class="glyph">&#10061;</div>
        <h3>No se encontraron perfumes</h3>
        <p>No hay fragancias que coincidan con los criterios seleccionados. Prueba con otro nombre, categoría o capacidad.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="card" data-id="${p.id}">
      <div class="card-art" style="background:${p.color}22">
        ${stockFlag(p.stock)}
        <div class="bottle">
          <div class="cap"></div><div class="neck"></div>
          <div class="body" style="background:${p.color}"></div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.categoria}</div>
        <div class="card-name">${p.nombre}</div>
        <div class="card-brand">${p.marca}</div>
        <div class="card-caps">${p.caps.map(c=>`<span class="cap-tag">${c} ml</span>`).join('')}</div>
        <div class="card-foot">
          <span class="card-price mono">S/ ${p.precio}</span>
          <button class="add-btn" data-quick="${p.id}" ${p.stock===0?'disabled':''}>${p.stock===0?'Agotado':'+ Agregar'}</button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('[data-quick]')) return;
      openModal(Number(card.dataset.id));
    });
  });
  grid.querySelectorAll('[data-quick]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const p = productos.find(x=>x.id===Number(btn.dataset.quick));
      addToCart(p.id, p.caps[0], 1);
    });
  });
}

document.getElementById('searchInput').addEventListener('input', (e)=>{
  filtroTexto = e.target.value; renderGrid();
});
document.querySelectorAll('.cap-pills .pill').forEach(pill=>{
  pill.addEventListener('click', ()=>{
    const val = Number(pill.dataset.cap);
    filtroCap = filtroCap === val ? null : val;
    document.querySelectorAll('.cap-pills .pill').forEach(p=>p.classList.toggle('active', Number(p.dataset.cap)===filtroCap));
    renderGrid();
  });
});

/* ---------- MODAL ---------- */
const overlay = document.getElementById('overlay');
const modalArt = document.getElementById('modalArt');
const modalInfo = document.getElementById('modalInfo');
let modalState = {};

function openModal(id){
  const p = productos.find(x=>x.id===id);
  modalState = {id:p.id, cap:p.caps[0], cant:1};
  modalArt.style.background = p.color+"22";
  modalArt.innerHTML = `<button class="modal-close" id="closeModal">&times;</button>
    <div class="bottle" style="transform:scale(1.6)">
      <div class="cap"></div><div class="neck"></div>
      <div class="body" style="background:${p.color}"></div>
    </div>`;
  renderModalInfo(p);
  overlay.classList.add('show');
  document.getElementById('closeModal').addEventListener('click', closeModal);
}
function renderModalInfo(p){
  modalInfo.innerHTML = `
    <div class="modal-cat">${p.categoria}</div>
    <h3 class="modal-name">${p.nombre}</h3>
    <div class="modal-brand">${p.marca}</div>
    <p class="modal-desc">${p.desc}</p>
    <div class="modal-row">
      <span style="font-size:0.8rem;color:var(--ivory-dim)">Presentación</span>
      <div class="cap-select">${p.caps.map(c=>`<div class="cap-opt ${c===modalState.cap?'active':''}" data-cap="${c}">${c} ml</div>`).join('')}</div>
    </div>
    <div class="modal-stock" style="color:${p.stock===0?'var(--danger)':p.stock<=4?'var(--gold)':'var(--sage)'}">
      ${p.stock===0?'Sin stock disponible':p.stock<=4?'Últimas '+p.stock+' unidades disponibles':p.stock+' unidades en stock'}
    </div>
    <div class="modal-price">S/ ${p.precio}</div>
    <button class="modal-add" id="modalAddBtn" ${p.stock===0?'disabled':''}>${p.stock===0?'Sin stock':'Agregar al carrito'}</button>
  `;
  modalInfo.querySelectorAll('.cap-opt').forEach(opt=>{
    opt.addEventListener('click', ()=>{ modalState.cap = Number(opt.dataset.cap); renderModalInfo(p); });
  });
  const addBtn = document.getElementById('modalAddBtn');
  if(addBtn) addBtn.addEventListener('click', ()=>{
    addToCart(p.id, modalState.cap, 1);
    closeModal();
  });
}
function closeModal(){ overlay.classList.remove('show'); }
overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeModal(); });

/* ---------- CARRITO ---------- */
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerItems = document.getElementById('drawerItems');
const drawerFoot = document.getElementById('drawerFoot');
const cartCount = document.getElementById('cartCount');

function addToCart(id, cap, cant){
  const p = productos.find(x=>x.id===id);
  const existing = cart.find(i=>i.id===id && i.cap===cap);
  const cantidadActual = existing ? existing.cant : 0;
  if(cantidadActual + cant > p.stock){
    alert('Lo sentimos, solo contamos con '+p.stock+' unidades disponibles de este perfume.');
    return;
  }
  if(existing) existing.cant += cant;
  else cart.push({id, cap, cant});
  renderCart();
  openDrawer();
}

function changeQty(id, cap, delta){
  const p = productos.find(x=>x.id===id);
  const item = cart.find(i=>i.id===id && i.cap===cap);
  if(!item) return;
  const nueva = item.cant + delta;
  if(nueva <= 0){ cart = cart.filter(i=>!(i.id===id && i.cap===cap)); renderCart(); return; }
  if(nueva > p.stock){
    alert('Lo sentimos, solo contamos con '+p.stock+' unidades disponibles de este perfume.');
    return;
  }
  item.cant = nueva;
  renderCart();
}

function removeItem(id, cap){
  cart = cart.filter(i=>!(i.id===id && i.cap===cap));
  renderCart();
}

function renderCart(){
  const count = cart.reduce((s,i)=>s+i.cant,0);
  cartCount.textContent = count;

  if(cart.length === 0){
    drawerItems.innerHTML = `
      <div class="drawer-empty">
        <div class="glyph">&#127796;</div>
        <p>Tu carrito de compras está vacío.<br>Visita nuestro catálogo para agregar perfumes.</p>
      </div>`;
    drawerFoot.innerHTML = `<button class="checkout-btn" disabled>Continuar con el pedido</button>`;
    return;
  }

  let total = 0;
  drawerItems.innerHTML = cart.map(item=>{
    const p = productos.find(x=>x.id===item.id);
    const subtotal = p.precio * item.cant;
    total += subtotal;
    const nearLimit = item.cant >= p.stock;
    return `
      <div class="cart-item">
        <div class="cart-thumb" style="background:${p.color}"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.nombre}</div>
          <div class="cart-item-cap">${item.cap} ml</div>
          <div class="cart-item-row">
            <div class="stepper">
              <button data-act="dec" data-id="${item.id}" data-cap="${item.cap}">−</button>
              <span>${item.cant}</span>
              <button data-act="inc" data-id="${item.id}" data-cap="${item.cap}">+</button>
            </div>
            <span class="cart-item-price">S/ ${subtotal}</span>
          </div>
          ${nearLimit ? `<div class="stock-warn">Máximo disponible alcanzado</div>` : ``}
        </div>
        <button class="remove-btn" data-remove-id="${item.id}" data-remove-cap="${item.cap}">&times;</button>
      </div>`;
  }).join('');

  drawerFoot.innerHTML = `
    <div class="total-row"><span>Total</span><span>S/ ${total}</span></div>
    <button class="checkout-btn">Continuar con el pedido</button>
    <div class="checkout-note">Se solicitará iniciar sesión para confirmar tu pedido</div>
  `;

  drawerItems.querySelectorAll('[data-act]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const delta = btn.dataset.act === 'inc' ? 1 : -1;
      changeQty(Number(btn.dataset.id), Number(btn.dataset.cap), delta);
    });
  });
  drawerItems.querySelectorAll('[data-remove-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      removeItem(Number(btn.dataset.removeId), Number(btn.dataset.removeCap));
    });
  });
}

function openDrawer(){ drawer.classList.add('show'); drawerOverlay.classList.add('show'); }
function closeDrawerFn(){ drawer.classList.remove('show'); drawerOverlay.classList.remove('show'); }
document.getElementById('openCart').addEventListener('click', openDrawer);
document.getElementById('closeDrawer').addEventListener('click', closeDrawerFn);
drawerOverlay.addEventListener('click', closeDrawerFn);

/* init */
renderCatRail();
renderGrid();
renderCart();
