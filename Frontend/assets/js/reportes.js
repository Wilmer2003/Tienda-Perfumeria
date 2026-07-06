
const ventas = [
  {id:'B001-1032', fecha:'2026-07-01', vendedor:'Carlos Ruiz', cliente:'María López', producto:'Noir Ambré', monto:189, tipo:'Boleta'},
  {id:'B001-1033', fecha:'2026-07-01', vendedor:'Ana Torres', cliente:'Jorge Díaz', producto:'Citrus Nova', monto:129, tipo:'Boleta'},
  {id:'F001-0087', fecha:'2026-07-02', vendedor:'Carlos Ruiz', cliente:'Corporación Aroma SAC', producto:'Ambre Nuit', monto:219, tipo:'Factura'},
  {id:'B001-1034', fecha:'2026-07-02', vendedor:'Miguel Sánchez', cliente:'Sofía Reyes', producto:'Velours Rose', monto:169, tipo:'Boleta'},
  {id:'B001-1035', fecha:'2026-07-03', vendedor:'Ana Torres', cliente:'Luis Fernández', producto:'Bois Sauvage', monto:398, tipo:'Boleta'},
  {id:'B001-1036', fecha:'2026-07-03', vendedor:'Carlos Ruiz', cliente:'Valeria Cruz', producto:'Aqua Marine', monto:119, tipo:'Boleta'},
  {id:'F001-0088', fecha:'2026-07-04', vendedor:'Miguel Sánchez', cliente:'Distribuciones Rex EIRL', producto:'Noir Ambré', monto:378, tipo:'Factura'},
  {id:'B001-1037', fecha:'2026-07-04', vendedor:'Ana Torres', cliente:'Patricia Gómez', producto:'Fleur Blanche', monto:149, tipo:'Boleta'},
  {id:'B001-1038', fecha:'2026-07-05', vendedor:'Carlos Ruiz', cliente:'Diego Ramos', producto:'Citrus Nova', monto:258, tipo:'Boleta'},
  {id:'B001-1039', fecha:'2026-07-05', vendedor:'Miguel Sánchez', cliente:'Camila Ortiz', producto:'Ambre Nuit', monto:219, tipo:'Boleta'},
  {id:'B001-1040', fecha:'2026-07-06', vendedor:'Ana Torres', cliente:'Rodrigo Vera', producto:'Velours Rose', monto:169, tipo:'Boleta'},
  {id:'F001-0089', fecha:'2026-07-06', vendedor:'Carlos Ruiz', cliente:'Import Aromas SAC', producto:'Bois Sauvage', monto:597, tipo:'Factura'},
];

let forceExportError = false;
document.getElementById('demoToggle').addEventListener('click', function(){
  forceExportError = !forceExportError;
  this.textContent = 'Modo sustentación: forzar error al exportar (' + (forceExportError?'ON':'OFF') + ')';
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  document.getElementById('fDesde').value = '';
  document.getElementById('fHasta').value = '';
  document.getElementById('fVendedor').value = '';
  document.getElementById('fProducto').value = '';
});

document.getElementById('genBtn').addEventListener('click', generarReporte);

function generarReporte(){
  const desde = document.getElementById('fDesde').value;
  const hasta = document.getElementById('fHasta').value;
  const vendedor = document.getElementById('fVendedor').value;
  const producto = document.getElementById('fProducto').value.trim().toLowerCase();

  const filtradas = ventas.filter(v=>{
    if(desde && v.fecha < desde) return false;
    if(hasta && v.fecha > hasta) return false;
    if(vendedor && v.vendedor !== vendedor) return false;
    if(producto && !v.producto.toLowerCase().includes(producto)) return false;
    return true;
  });

  renderReport(filtradas, {desde, hasta, vendedor, producto});
}

function renderReport(list, filtrosActivos){
  const reportArea = document.getElementById('reportArea');
  const hayFiltros = filtrosActivos.desde || filtrosActivos.hasta || filtrosActivos.vendedor || filtrosActivos.producto;

  if(list.length === 0){
    reportArea.innerHTML = `
      <div class="empty-report">
        <div class="glyph">&#10061;</div>
        <h3>No se encontraron registros</h3>
        <p>No hay ventas que coincidan con los filtros seleccionados. Intenta ampliar el rango de fechas o cambiar el vendedor/producto.</p>
      </div>`;
    return;
  }

  const total = list.reduce((s,v)=>s+v.monto,0);
  const promedio = total/list.length;
  const porVendedor = {};
  list.forEach(v=>{ porVendedor[v.vendedor] = (porVendedor[v.vendedor]||0) + v.monto; });
  const topVendedorEntry = Object.entries(porVendedor).sort((a,b)=>b[1]-a[1])[0];
  const maxVendedor = Math.max(...Object.values(porVendedor));

  reportArea.innerHTML = `
    ${!hayFiltros ? `<div class="error-block" style="background:rgba(180,145,79,0.08); border-color:rgba(180,145,79,0.3);"><b style="color:var(--gold);">Sin filtros aplicados</b>Mostrando todas las ventas disponibles en el sistema.</div>` : ''}

    <div class="stats-row">
      <div class="stat-card"><div class="s-label">Total de ventas</div><div class="s-value">${list.length}</div></div>
      <div class="stat-card"><div class="s-label">Monto total</div><div class="s-value">S/ ${total.toLocaleString('es-PE')}</div></div>
      <div class="stat-card"><div class="s-label">Ticket promedio</div><div class="s-value">S/ ${promedio.toFixed(0)}</div></div>
      <div class="stat-card"><div class="s-label">Mejor vendedor</div><div class="s-value small">${topVendedorEntry ? topVendedorEntry[0] : '—'}</div></div>
    </div>

    <div class="panel">
      <h3>Ventas por vendedor</h3>
      ${Object.entries(porVendedor).sort((a,b)=>b[1]-a[1]).map(([nombre, monto])=>`
        <div class="chart-row">
          <div class="c-label">${nombre}</div>
          <div class="chart-track"><div class="chart-fill" style="width:${(monto/maxVendedor*100).toFixed(0)}%"></div></div>
          <div class="c-value">S/ ${monto}</div>
        </div>
      `).join('')}
    </div>

    <div class="export-row">
      <button class="export-btn" id="exportPdf">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
        Exportar PDF
      </button>
      <button class="export-btn" id="exportExcel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>
        Exportar Excel
      </button>
    </div>
    <div id="exportError"></div>

    <div class="panel" style="padding:0;">
      <table>
        <thead><tr><th>Comprobante</th><th>Fecha</th><th>Vendedor</th><th>Cliente</th><th>Producto</th><th>Monto</th></tr></thead>
        <tbody>
          ${list.map(v=>`
            <tr>
              <td><span class="doc-tag">${v.id}</span></td>
              <td>${v.fecha}</td>
              <td>${v.vendedor}</td>
              <td>${v.cliente}</td>
              <td>${v.producto}</td>
              <td class="amount">S/ ${v.monto}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('exportPdf').addEventListener('click', ()=>tryExport('PDF'));
  document.getElementById('exportExcel').addEventListener('click', ()=>tryExport('Excel'));
}

function tryExport(formato){
  const exportError = document.getElementById('exportError');
  if(forceExportError){
    exportError.innerHTML = `
      <div class="error-block">
        <b>No se pudo exportar el reporte</b>
        Ocurrió un error al generar el archivo en formato ${formato}.
        <div><button class="btn-primary" id="retryExport">Intentar nuevamente</button></div>
      </div>`;
    document.getElementById('retryExport').addEventListener('click', ()=>{ exportError.innerHTML=''; alert('Reporte_ventas.'+(formato==='PDF'?'pdf':'xlsx')+' descargado (simulado).'); });
    return;
  }
  exportError.innerHTML = '';
  alert('Descarga simulada: Reporte_ventas.' + (formato === 'PDF' ? 'pdf' : 'xlsx'));
}

generarReporte();
