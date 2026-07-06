
let productos = [
  {id:2, nombre:"Fleur Blanche", categoria:"Floral", stockActual:4, stockMinimo:6, sugerido:20, pendiente:false},
  {id:6, nombre:"Bois Sauvage", categoria:"Amaderado", stockActual:3, stockMinimo:5, sugerido:25, pendiente:false},
  {id:9, nombre:"Santal Privé", categoria:"Amaderado", stockActual:1, stockMinimo:5, sugerido:15, pendiente:false},
];
let orders = [];
let orderSeq = 1042;
let selected = {};

const stockBody = document.getElementById('stockBody');
const alertArea = document.getElementById('alertArea');
const selCount = document.getElementById('selCount');
const genOrderBtn = document.getElementById('genOrderBtn');
const ordersArea = document.getElementById('ordersArea');
const overlay = document.getElementById('overlay');
const modalItems = document.getElementById('modalItems');

function renderAlert(){
  const bajos = productos.filter(p=>p.stockActual < p.stockMinimo && !p.pendiente);
  if(bajos.length === 0 && productos.every(p=>p.pendiente || p.stockActual >= p.stockMinimo)){
    alertArea.innerHTML = `<div class="empty-alert"><span>&#10003;</span> No hay productos con stock bajo pendientes de reabastecer en este momento.</div>`;
  } else {
    alertArea.innerHTML = `
      <div class="alert-banner">
        <div class="a-icon">&#9888;</div>
        <div><b>Se detectaron ${bajos.length} producto${bajos.length===1?'':'s'} con stock bajo</b>
        <span>El sistema los identificó automáticamente al llegar a su nivel mínimo. Revisa y genera una orden de compra.</span></div>
      </div>`;
  }
}

function renderStockTable(){
  stockBody.innerHTML = productos.map(p=>{
    const bajo = p.stockActual < p.stockMinimo;
    if(!bajo && !p.pendiente) return '';
    return `
      <tr class="${p.pendiente?'sent':''}">
        <td>${p.pendiente ? '' : `<input type="checkbox" data-id="${p.id}" ${selected[p.id]?'checked':''}>`}</td>
        <td><div class="prod-name">${p.nombre}</div><div class="prod-cat">${p.categoria}</div></td>
        <td class="stock-bad">${p.stockActual} un.</td>
        <td class="stock-min">${p.stockMinimo} un.</td>
        <td>${p.pendiente ? '—' : `<input type="number" class="qty-input" data-qty="${p.id}" value="${selected[p.id]?.cant ?? p.sugerido}" min="1">`}</td>
        <td>${p.pendiente ? '<span class="sent-tag">Pedido enviado</span>' : ''}</td>
      </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--ivory-dim); padding:30px;">No hay productos con stock bajo.</td></tr>`;

  stockBody.querySelectorAll('input[type=checkbox]').forEach(chk=>{
    chk.addEventListener('change', ()=>{
      const id = Number(chk.dataset.id);
      if(chk.checked){
        const p = productos.find(x=>x.id===id);
        selected[id] = {cant:p.sugerido};
      } else {
        delete selected[id];
      }
      renderStockTable(); updateSelCount();
    });
  });
  stockBody.querySelectorAll('input[data-qty]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const id = Number(inp.dataset.qty);
      if(selected[id]) selected[id].cant = Number(inp.value);
    });
  });
}

function updateSelCount(){
  const n = Object.keys(selected).length;
  selCount.innerHTML = n === 0 ? 'Ningún producto seleccionado' : `<b>${n}</b> producto${n>1?'s':''} seleccionado${n>1?'s':''}`;
  genOrderBtn.disabled = n === 0;
}

genOrderBtn.addEventListener('click', ()=>{
  modalItems.innerHTML = Object.entries(selected).map(([id,data])=>{
    const p = productos.find(x=>x.id===Number(id));
    return `<div class="m-item"><span>${p.nombre}</span><span>${data.cant} un.</span></div>`;
  }).join('');
  overlay.classList.add('show');
});
document.getElementById('cancelModal').addEventListener('click', ()=>overlay.classList.remove('show'));

document.getElementById('confirmOrder').addEventListener('click', ()=>{
  const proveedor = document.getElementById('proveedorSelect').value;
  const items = Object.entries(selected).map(([id,data])=>({id:Number(id), cant:data.cant}));
  items.forEach(it=>{
    const p = productos.find(x=>x.id===it.id);
    p.pendiente = true;
  });
  orders.unshift({
    id: 'OC-' + (orderSeq++),
    proveedor, items,
    fecha: new Date().toLocaleDateString('es-PE'),
    estado: 'enviada'
  });
  selected = {};
  overlay.classList.remove('show');
  renderAll();
});

function renderOrders(){
  if(orders.length === 0){
    ordersArea.innerHTML = `<div class="panel" style="padding:30px; text-align:center; color:var(--ivory-dim); font-size:0.85rem;">Aún no se han generado órdenes de compra.</div>`;
    return;
  }
  ordersArea.innerHTML = orders.map((o,idx)=>`
    <div class="order-card">
      <div class="order-head">
        <div>
          <div class="order-id">${o.id}</div>
          <div class="order-meta">Proveedor: ${o.proveedor} · Enviada el ${o.fecha}</div>
        </div>
        <span class="status-badge ${o.estado}">${o.estado === 'enviada' ? 'Enviada · esperando proveedor' : o.estado === 'atendida' ? 'Atendida' : 'Rechazada'}</span>
      </div>
      <div class="order-items">${o.items.map(it=>{
        const p = productos.find(x=>x.id===it.id);
        return (p ? p.nombre : 'Producto') + ' — ' + it.cant + ' un.';
      }).join(' · ')}</div>
      ${o.estado === 'enviada' ? `
        <div class="order-actions">
          <button class="btn-primary" data-invoice="${idx}">Registrar factura del proveedor</button>
          <button class="btn-danger-ghost" data-reject="${idx}">Marcar como rechazada</button>
        </div>
        <div id="invoiceForm-${idx}"></div>
      ` : o.estado === 'rechazada' ? `<div class="reject-note">El proveedor rechazó la orden. Corrige las cantidades y genera una nueva.</div>` : `<div class="reject-note" style="color:var(--sage);">Factura N° ${o.factura} registrada. Inventario actualizado.</div>`}
    </div>
  `).join('');

  ordersArea.querySelectorAll('[data-invoice]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.invoice);
      document.getElementById('invoiceForm-'+idx).innerHTML = `
        <div class="invoice-form">
          <div class="field"><label>N° de factura del proveedor</label><input type="text" id="invNum-${idx}" placeholder="F002-00458"></div>
          <button class="btn-primary" data-confirm-invoice="${idx}">Confirmar</button>
        </div>`;
      document.querySelector(`[data-confirm-invoice="${idx}"]`).addEventListener('click', ()=>{
        const num = document.getElementById('invNum-'+idx).value.trim();
        if(!num) return;
        const order = orders[idx];
        order.estado = 'atendida';
        order.factura = num;
        order.items.forEach(it=>{
          const p = productos.find(x=>x.id===it.id);
          if(p){ p.stockActual += it.cant; p.pendiente = false; }
        });
        renderAll();
      });
    });
  });
  ordersArea.querySelectorAll('[data-reject]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.reject);
      const order = orders[idx];
      order.estado = 'rechazada';
      order.items.forEach(it=>{
        const p = productos.find(x=>x.id===it.id);
        if(p) p.pendiente = false;
      });
      renderAll();
    });
  });
}

function renderAll(){
  renderAlert();
  renderStockTable();
  updateSelCount();
  renderOrders();
}
renderAll();
