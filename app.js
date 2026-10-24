function obtenerRol() {
    const raw = (
        localStorage.getItem('usuario_rol') ||
        localStorage.getItem('rol_usuario') ||
        localStorage.getItem('rol') ||
        'admin'
    ).trim().toLowerCase();

    if (raw === 'administrador' || raw === 'admin') return 'admin';
    if (raw === 'vendedor' || raw === 'vendedor2') return 'vendedor';
    return raw;
}

const rol = obtenerRol();
let montoInicialCaja = (rol === 'vendedor') ? parseFloat(localStorage.getItem('caja_inicial') || '50.00') : 0.00;

function mostrarEl(id, visible, displayValue) {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? (displayValue || '') : 'none';
}

function aplicarMenuPorRol() {
    const rolActual = obtenerRol();
    const esVendedor = rolActual === 'vendedor';

    document.body.classList.toggle('rol-vendedor', esVendedor);
    document.body.setAttribute('data-rol', esVendedor ? 'vendedor' : 'admin');

    const elUsuarioRol = document.getElementById('usuario-rol');
    if (elUsuarioRol) elUsuarioRol.textContent = esVendedor ? 'vendedor' : 'administrador';

    const elMontoInicial = document.getElementById('monto-inicial');
    if (elMontoInicial) elMontoInicial.textContent = montoInicialCaja.toFixed(2);

    // Administrador: ventas, inventario, caja, kárdex, reportes, cierre/arqueo
    // Vendedor: ventas, compras directas, inventario, caja, kárdex, registro ventas, cierre/arqueo
    mostrarEl('btn-tab-ventas', true, 'inline-block');
    mostrarEl('btn-tab-inventario', true, 'inline-block');
    mostrarEl('btn-tab-caja', true, 'inline-block');
    mostrarEl('btn-tab-kardex', true, 'inline-block');
    mostrarEl('btn-tab-compras', esVendedor, 'inline-block');
    mostrarEl('btn-tab-reportes', !esVendedor, 'inline-block');
    mostrarEl('btn-registro-ventas', esVendedor, 'inline-block');
    mostrarEl('seccion-historial-diario-admin', !esVendedor, 'block');
    mostrarEl('btn-mis-comandas-vendedor', esVendedor, 'inline-block');
    mostrarEl('col-header-acciones', !esVendedor, 'table-cell');

    const pCategoria = document.getElementById('p-categoria');
    const inputNombre = document.getElementById('p-nombre');
    const inputCodigo = document.getElementById('p-codigo');
    if (pCategoria) pCategoria.disabled = false;
    if (inputNombre) inputNombre.readOnly = false;
    if (inputCodigo) inputCodigo.readOnly = false;

    const btnGuardar = document.querySelector('#form-producto button[type="submit"]');
    if (btnGuardar) {
        btnGuardar.style.display = 'inline-block';
        btnGuardar.disabled = false;
    }

    for (let i = 1; i <= 4; i++) {
        const inputPrecio = document.getElementById(`p-precio-${i}`);
        const inputStock = document.getElementById(`p-stock-${i}`);
        if (inputPrecio) inputPrecio.disabled = false;
        if (inputStock) inputStock.disabled = false;
    }

    if (esVendedor) {
        for (let i = 1; i <= 4; i++) {
            const inputCosto = document.getElementById(`p-costo-${i}`);
            const lblCosto = document.getElementById(`lbl-costo-${i}`);
            if (inputCosto) {
                const grupo = inputCosto.closest('.form-group');
                if (grupo) grupo.style.display = 'none';
            }
            if (lblCosto) lblCosto.style.display = 'none';
        }
    } else {
        document.querySelectorAll('#form-producto input, #form-producto select, #form-producto button').forEach(el => {
            el.disabled = false;
            if (el.tagName === 'INPUT') el.readOnly = false;
            el.style.display = '';
        });
    }
}

function puedeVerTab(tab) {
    const esVendedor = obtenerRol() === 'vendedor';
    if (tab === 'compras') return esVendedor;
    if (tab === 'reportes') return !esVendedor;
    return true;
}

// Escuchar cambios en la categoría y nombre para actualizar presentaciones (KG, SACO, etc.)
const pCategoriaInit = document.getElementById('p-categoria');
const pNombreInit = document.getElementById('p-nombre');

if (pCategoriaInit) {
    pCategoriaInit.addEventListener('change', actualizarNombresPresentaciones);
    pCategoriaInit.addEventListener('keyup', actualizarNombresPresentaciones);
}
if (pNombreInit) {
    pNombreInit.addEventListener('input', actualizarNombresPresentaciones);
}

aplicarMenuPorRol();
// Función global para cambiar de pestaña en el menú superior
function cambiarTab(tab) {
    if (!puedeVerTab(tab)) {
        tab = 'ventas';
    }

    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    if (tab === 'ventas') {
        document.getElementById('tab-ventas').classList.add('active');
        document.getElementById('btn-tab-ventas').classList.add('active');
    } else if (tab === 'compras') {
        document.getElementById('tab-compras').classList.add('active');
        document.getElementById('btn-tab-compras').classList.add('active');
        renderizarCompras();
    } else if (tab === 'inventario') {
        document.getElementById('tab-inventario').classList.add('active');
        document.getElementById('btn-tab-inventario').classList.add('active');
        actualizarNombresPresentaciones();
    } else if (tab === 'caja') {
        document.getElementById('tab-caja').classList.add('active');
        document.getElementById('btn-tab-caja').classList.add('active');
        renderizarVistaCaja();
    } else if (tab === 'kardex') {
        document.getElementById('tab-kardex').classList.add('active');
        document.getElementById('btn-tab-kardex').classList.add('active');
        renderizarKardex();
    } else if (tab === 'reportes') {
        document.getElementById('tab-reportes').classList.add('active');
        document.getElementById('btn-tab-reportes').classList.add('active');
        renderizarReportes();
    } else if (tab === 'registro-ventas') {
        document.getElementById('tab-registro-ventas').classList.add('active');
        document.getElementById('btn-registro-ventas').classList.add('active');
        renderizarRegistroVentas();
    }
}

function actualizarNombresPresentaciones() {
    const pCategoria = document.getElementById('p-categoria');
    const pNombre = document.getElementById('p-nombre');
    
    const catVal = pCategoria ? pCategoria.value.trim().toUpperCase() : '';
    const nomVal = pNombre ? pNombre.value.trim().toUpperCase() : '';
    
    const esArrozAzucar = (catVal.includes('ARROZ') || catVal.includes('AZUCAR') || catVal.includes('AZÚCAR') ||
                           nomVal.includes('ARROZ') || nomVal.includes('AZUCAR') || nomVal.includes('AZÚCAR'));

    if (esArrozAzucar) {
        if (document.getElementById('sum-pres-1')) document.getElementById('sum-pres-1').textContent = '▼ 1. VENTAS KG';
        if (document.getElementById('lbl-costo-1')) document.getElementById('lbl-costo-1').textContent = 'Precio Costo KG (S/)';
        if (document.getElementById('lbl-precio-1')) document.getElementById('lbl-precio-1').textContent = 'Precio Venta KG (S/)';
        if (document.getElementById('lbl-stock-1')) document.getElementById('lbl-stock-1').textContent = 'Stock Inicial KG';

        if (document.getElementById('sum-pres-2')) document.getElementById('sum-pres-2').textContent = '▼ 2. VENTAS 10 KG';
        if (document.getElementById('lbl-costo-2')) document.getElementById('lbl-costo-2').textContent = 'Precio Costo 10 KG (S/)';
        if (document.getElementById('lbl-precio-2')) document.getElementById('lbl-precio-2').textContent = 'Precio Venta 10 KG (S/)';
        if (document.getElementById('lbl-stock-2')) document.getElementById('lbl-stock-2').textContent = 'Stock Inicial 10 KG';

        if (document.getElementById('sum-pres-3')) document.getElementById('sum-pres-3').textContent = '▼ 3. VENTAS 1/2 SACO';
        if (document.getElementById('lbl-costo-3')) document.getElementById('lbl-costo-3').textContent = 'Precio Costo 1/2 Saco (S/)';
        if (document.getElementById('lbl-precio-3')) document.getElementById('lbl-precio-3').textContent = 'Precio Venta 1/2 Saco (S/)';
        if (document.getElementById('lbl-stock-3')) document.getElementById('lbl-stock-3').textContent = 'Stock Inicial 1/2 Saco';

        if (document.getElementById('sum-pres-4')) document.getElementById('sum-pres-4').textContent = '▼ 4. VENTAS SACO';
        if (document.getElementById('lbl-costo-4')) document.getElementById('lbl-costo-4').textContent = 'Precio Costo Saco (S/)';
        if (document.getElementById('lbl-precio-4')) document.getElementById('lbl-precio-4').textContent = 'Precio Venta Saco (S/)';
        if (document.getElementById('lbl-stock-4')) document.getElementById('lbl-stock-4').textContent = 'Stock Inicial Saco';
    } else {
        if (document.getElementById('sum-pres-1')) document.getElementById('sum-pres-1').textContent = '▼ 1. VENTAS POR UNIDAD';
        if (document.getElementById('lbl-costo-1')) document.getElementById('lbl-costo-1').textContent = 'Precio Costo Unid (S/)';
        if (document.getElementById('lbl-precio-1')) document.getElementById('lbl-precio-1').textContent = 'Precio Venta Unid (S/)';
        if (document.getElementById('lbl-stock-1')) document.getElementById('lbl-stock-1').textContent = 'Stock Inicial Unid';

        if (document.getElementById('sum-pres-2')) document.getElementById('sum-pres-2').textContent = '▼ 2. VENTAS POR DOCENA';
        if (document.getElementById('lbl-costo-2')) document.getElementById('lbl-costo-2').textContent = 'Precio Costo Docena (S/)';
        if (document.getElementById('lbl-precio-2')) document.getElementById('lbl-precio-2').textContent = 'Precio Venta Docena (S/)';
        if (document.getElementById('lbl-stock-2')) document.getElementById('lbl-stock-2').textContent = 'Stock Inicial Docena';

        if (document.getElementById('sum-pres-3')) document.getElementById('sum-pres-3').textContent = '▼ 3. VENTAS POR PQTE';
        if (document.getElementById('lbl-costo-3')) document.getElementById('lbl-costo-3').textContent = 'Precio Costo Pqte (S/)';
        if (document.getElementById('lbl-precio-3')) document.getElementById('lbl-precio-3').textContent = 'Precio Venta Pqte (S/)';
        if (document.getElementById('lbl-stock-3')) document.getElementById('lbl-stock-3').textContent = 'Stock Inicial Pqte';

        if (document.getElementById('sum-pres-4')) document.getElementById('sum-pres-4').textContent = '▼ 4. VENTAS POR CAJA';
        if (document.getElementById('lbl-costo-4')) document.getElementById('lbl-costo-4').textContent = 'Precio Costo Caja (S/)';
        if (document.getElementById('lbl-precio-4')) document.getElementById('lbl-precio-4').textContent = 'Precio Venta Caja (S/)';
        if (document.getElementById('lbl-stock-4')) document.getElementById('lbl-stock-4').textContent = 'Stock Inicial Caja';
    }
    // Control de visibilidad de costos según el rol
    const rolUsuario = obtenerRol();
    for (let i = 1; i <= 4; i++) {
        const inputCosto = document.getElementById(`p-costo-${i}`);
        const lblCosto = document.getElementById(`lbl-costo-${i}`);
        
        if (inputCosto) {
            const grupo = inputCosto.closest('.form-group') || inputCosto.parentElement;
            if (grupo) {
                grupo.style.display = (rolUsuario === 'vendedor') ? 'none' : 'block';
            }
        }
    }
}

const inputImg = document.getElementById('input-imagen');
if (inputImg) {
    inputImg.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById('imagen-base64').value = evt.target.result;
                document.getElementById('img-preview').src = evt.target.result;
                document.getElementById('vista-previa').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

let productos = JSON.parse(localStorage.getItem('lista_productos')) || [];
let kardex = JSON.parse(localStorage.getItem('lista_kardex')) || [];
let comandas = JSON.parse(localStorage.getItem('lista_comandas')) || [];
let historialComandasRealizadas = JSON.parse(localStorage.getItem('historial_comandas_realizadas')) || [];
let gastosDelDia = JSON.parse(localStorage.getItem('lista_gastos_dia')) || [];
let historialCierresCaja = JSON.parse(localStorage.getItem('historial_cierres_caja')) || [];
let carrito = [];
let carritoCompras = [];
let comandaActualAprobar = null;
let metodoPagoSeleccionado = 'Efectivo';
let totalPagarActual = 0;

// Variables de paginación
let paginaInventario = 1;
let paginaCatalogo = 1;
const itemsPorPagina = 10;

function verificarAlertaStockUnidades() {
    let productosAlertados = [];
    productos.forEach(p => {
        const catUpper = p.categoria ? p.categoria.toUpperCase() : '';
        if (catUpper === 'ARROZ' || catUpper === 'AZUCAR') {
            if (p.stockUnid < 33) productosAlertados.push(`• <strong>${p.nombre}</strong> (${p.categoria}): <span style="color:#dc2626; font-weight:bold;">${p.stockUnid} Kg</span>`);
        } else {
            if (p.stockUnid < 4) productosAlertados.push(`• <strong>${p.nombre}</strong> (${p.categoria}): <span style="color:#dc2626; font-weight:bold;">${p.stockUnid} Unid</span>`);
        }
    });
    if (productosAlertados.length > 0) {
        const contenedor = document.getElementById('modal-alerta-contenido');
        if(contenedor) {
            contenedor.innerHTML = `<p style="margin-bottom: 12px; font-weight: 500;">Atención, los siguientes productos requieren reabastecimiento:</p>${productosAlertados.join('<br>')}`;
            document.getElementById('modal-alerta-stock').style.display = 'flex';
        }
    }
}
function cerrarModalAlerta() { document.getElementById('modal-alerta-stock').style.display = 'none'; }

function abrirModalMisComandas() {
    const cont = document.getElementById('contenedor-mis-comandas');
    cont.innerHTML = '';
    const misComandas = comandas.filter(c => c.usuario === rol);
    if (misComandas.length === 0) {
        cont.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">No has enviado ninguna comanda pendiente.</div>`;
    } else {
        misComandas.forEach(cmd => {
            let detalleStr = cmd.items.map(i => `${i.nombre} (${i.tipoPres}) x${i.cantidad}`).join(', ');
            cont.innerHTML += `
                <div class="costo-item-row" style="flex-direction: column; align-items: flex-start; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <strong style="color: #fbbf24;">${cmd.comandaId}</strong>
                        <span style="font-size: 11px; color: #94a3b8;">${cmd.fecha}</span>
                    </div>
                    <div style="font-size: 12px; color: #cbd5e1;"><strong>Detalle:</strong> ${detalleStr}</div>
                    <button onclick="eliminarComandaVendedor('${cmd.comandaId}')" style="background:#991b1b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; width:100%; margin-top:4px;">🗑️ Eliminar Pedido</button>
                </div>
            `;
        });
    }
    document.getElementById('modal-mis-comandas').style.display = 'flex';
}
function cerrarModalMisComandas() { document.getElementById('modal-mis-comandas').style.display = 'none'; }

function eliminarComandaVendedor(comandaId) {
    if (confirm(`¿Estás seguro de eliminar el pedido ${comandaId}?`)) {
        comandas = comandas.filter(c => c.comandaId !== comandaId);
        historialComandasRealizadas = historialComandasRealizadas.filter(c => c.comandaId !== comandaId);
        localStorage.setItem('lista_comandas', JSON.stringify(comandas));
        localStorage.setItem('historial_comandas_realizadas', JSON.stringify(historialComandasRealizadas));
        abrirModalMisComandas();
        renderizarRegistroComandasVendedor();
    }
}

function recargarListaProductos() {
    try {
        const raw = localStorage.getItem('lista_productos');
        if (raw) productos = JSON.parse(raw) || productos || [];
    } catch (e) {
        /* conservar lista en memoria */
    }
}

function recargarListaKardex() {
    try {
        const raw = localStorage.getItem('lista_kardex');
        if (raw) kardex = JSON.parse(raw) || kardex || [];
    } catch (e) {
        /* conservar kárdex en memoria */
    }
}

function aNumeroProd(valor, fallback = 0) {
    const n = parseFloat(valor);
    return Number.isFinite(n) ? n : fallback;
}

function primerValorDefinido(obj, keys) {
    if (!obj) return undefined;
    for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return undefined;
}

function esPresentacionArrozAzucar(prod) {
    const catVal = String((prod && prod.categoria) || '').trim().toUpperCase();
    const nomVal = String((prod && prod.nombre) || '').trim().toUpperCase();
    return catVal.includes('ARROZ') || catVal.includes('AZUCAR') || catVal.includes('AZÚCAR') ||
        nomVal.includes('ARROZ') || nomVal.includes('AZUCAR') || nomVal.includes('AZÚCAR');
}

function etiquetasPresentaciones(prod) {
    return esPresentacionArrozAzucar(prod)
        ? { unid: 'KG', doc: '10 KG', paq: '1/2 Saco', caja: 'Saco' }
        : { unid: 'Unid', doc: 'Docena', paq: 'Pqte', caja: 'Caja' };
}

function extraerPresentacionesProducto(prod) {
    return {
        costoUnid: aNumeroProd(primerValorDefinido(prod, ['costoUnid', 'costoKg', 'costo1'])),
        precioUnid: aNumeroProd(primerValorDefinido(prod, ['precioUnid', 'precioKg', 'precio1'])),
        stockUnid: aNumeroProd(primerValorDefinido(prod, ['stockUnid', 'stockKg', 'stock1'])),
        costoDoc: aNumeroProd(primerValorDefinido(prod, ['costoDoc', 'costo10kg', 'costo10Kg', 'costo2'])),
        precioDoc: aNumeroProd(primerValorDefinido(prod, ['precioDoc', 'precio10kg', 'precio10Kg', 'precio2'])),
        stockDoc: aNumeroProd(primerValorDefinido(prod, ['stockDoc', 'stock10kg', 'stock10Kg', 'stock2'])),
        costoPaq: aNumeroProd(primerValorDefinido(prod, ['costoPaq', 'costoMedioSaco', 'costo12saco', 'costo3'])),
        precioPaq: aNumeroProd(primerValorDefinido(prod, ['precioPaq', 'precioMedioSaco', 'precio12saco', 'precio3'])),
        stockPaq: aNumeroProd(primerValorDefinido(prod, ['stockPaq', 'stockMedioSaco', 'stock12saco', 'stock3'])),
        costoCaja: aNumeroProd(primerValorDefinido(prod, ['costoCaja', 'costoCaia', 'costoSaco', 'costo4'])),
        precioCaja: aNumeroProd(primerValorDefinido(prod, ['precioCaja', 'precioSaco', 'precio4'])),
        stockCaja: aNumeroProd(primerValorDefinido(prod, ['stockCaja', 'stockSaco', 'stock4']))
    };
}

function fmtPrecioKardex(valor) {
    const n = aNumeroProd(valor);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function detalleCambiosInventario(anterior, siguiente) {
    const labels = etiquetasPresentaciones(siguiente);
    const oldP = extraerPresentacionesProducto(anterior);
    const cambios = [];
    [
        { key: 'Unid', label: labels.unid },
        { key: 'Doc', label: labels.doc },
        { key: 'Paq', label: labels.paq },
        { key: 'Caja', label: labels.caja }
    ].forEach((u) => {
        const pOld = oldP['precio' + u.key];
        const pNew = siguiente['precio' + u.key];
        if (aNumeroProd(pOld) !== aNumeroProd(pNew)) {
            cambios.push(`P.${u.label}: S/ ${fmtPrecioKardex(pOld)} ➔ S/ ${fmtPrecioKardex(pNew)}`);
        }
        const sOld = oldP['stock' + u.key];
        const sNew = siguiente['stock' + u.key];
        if (aNumeroProd(sOld) !== aNumeroProd(sNew)) {
            cambios.push(`Stock ${u.label}: ${aNumeroProd(sOld)} ➔ ${aNumeroProd(sNew)}`);
        }
        const cOld = oldP['costo' + u.key];
        const cNew = siguiente['costo' + u.key];
        if (aNumeroProd(cOld) !== aNumeroProd(cNew)) {
            cambios.push(`Costo ${u.label}: S/ ${fmtPrecioKardex(cOld)} ➔ S/ ${fmtPrecioKardex(cNew)}`);
        }
    });
    return cambios;
}

function setCampoForm(id, valor, siVacio) {
    const el = document.getElementById(id);
    if (!el) return;
    if (valor === undefined || valor === null || valor === '') {
        el.value = siVacio;
        return;
    }
    el.value = valor;
}

function leerCampoNumero(id) {
    const el = document.getElementById(id);
    return aNumeroProd(el ? el.value : 0, 0);
}

function guardarProductoLocal(e) {
    if (e) e.preventDefault();
    recargarListaProductos();
    recargarListaKardex();

    const editId = document.getElementById('p-id-edit').value;
    const prodAnterior = editId
        ? productos.find(p => String(p.id) === String(editId))
        : null;
    const presentacionesForm = {
        costoUnid: leerCampoNumero('p-costo-unid'),
        precioUnid: leerCampoNumero('p-precio-unid'),
        stockUnid: leerCampoNumero('p-stock-unid'),
        costoDoc: leerCampoNumero('p-costo-doc'),
        precioDoc: leerCampoNumero('p-precio-doc'),
        stockDoc: leerCampoNumero('p-stock-doc'),
        costoPaq: leerCampoNumero('p-costo-paq'),
        precioPaq: leerCampoNumero('p-precio-paq'),
        stockPaq: leerCampoNumero('p-stock-paq'),
        costoCaja: leerCampoNumero('p-costo-caja'),
        precioCaja: leerCampoNumero('p-precio-caja'),
        stockCaja: leerCampoNumero('p-stock-caja')
    };

    const imagenNueva = (document.getElementById('imagen-base64') || {}).value;
    const productoData = {
        ...(prodAnterior || {}),
        id: editId ? parseInt(editId, 10) : Date.now(),
        nombre: document.getElementById('p-nombre').value,
        categoria: document.getElementById('p-categoria').value,
        codigo: document.getElementById('p-codigo').value || 'Sin código',
        ...presentacionesForm,
        imagen: imagenNueva || (prodAnterior && prodAnterior.imagen) || 'https://via.placeholder.com/80',
        unidadesPaq: leerCampoNumero('p-unidades-paq'),
        unidadesCaja: leerCampoNumero('p-unidades-caja'),
        kgPaq: leerCampoNumero('p-kg-paq'),
        kgCaja: leerCampoNumero('p-kg-caja'),
        // Nombres alternativos para compatibilidad
        unidades_paq: leerCampoNumero('p-unidades-paq'),
        unidades_caja: leerCampoNumero('p-unidades-caja'),
        kg_paq: leerCampoNumero('p-kg-paq'),
        kg_caja: leerCampoNumero('p-kg-caja')
    };

    const fechaActual = new Date().toLocaleString('es-PE');
    if (editId) {
        const index = productos.findIndex(p => String(p.id) === String(editId));
        if (index !== -1) {
            const cambiosDetalle = detalleCambiosInventario(productos[index], productoData);
            const textoCantidad = cambiosDetalle.length > 0
                ? cambiosDetalle.join(' | ')
                : 'Actualización de parámetros';

            productos[index] = productoData;
            kardex.unshift({
                fecha: fechaActual,
                producto: productoData.nombre,
                tipo: 'Modificación de Producto',
                cantidad: textoCantidad,
                usuario: `${rol} (Edición de parámetros)`
            });
        }
    } else {
        productos.push(productoData);
        kardex.unshift({
            fecha: fechaActual,
            producto: productoData.nombre,
            tipo: 'Nuevo Producto',
            cantidad: `Stock: ${productoData.stockUnid}`,
            usuario: rol
        });
    }

    localStorage.setItem('lista_productos', JSON.stringify(productos));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));

    renderizarProductos();
    cancelarEdicion();

    alert("¡Producto guardado exitosamente!");
}
function cancelarEdicion() {
    document.getElementById('form-producto').reset();
    document.getElementById('p-id-edit').value = '';
    document.getElementById('imagen-base64').value = '';
    document.getElementById('vista-previa').style.display = 'none';
    actualizarNombresPresentaciones();
}

function renderizarProductos(filtro = '') {
    if ((!productos || productos.length === 0) && localStorage.getItem('lista_productos')) {
        try {
            productos = JSON.parse(localStorage.getItem('lista_productos')) || [];
        } catch (e) {
            productos = [];
        }
    }

    const filtroLower = filtro.toLowerCase().trim();
    const prodsFiltrados = productos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        const categoria = (p.categoria || '').toLowerCase();
        return nombre.includes(filtroLower) || codigo.includes(filtroLower) || categoria.includes(filtroLower);
    });

    // Resetear páginas al cargar
    paginaInventario = 1;
    paginaCatalogo = 1;
    renderizarProductosPorLista(prodsFiltrados);
}

function renderizarCompras(filtro = '') {
    const catalogoCompras = document.getElementById('catalogo-compras');
    if (!catalogoCompras) return;
    catalogoCompras.innerHTML = '';

    // Eliminar paginación anterior de compras si existe
    const paginacionCompras = document.getElementById('paginacion-compras');
    if (paginacionCompras) paginacionCompras.remove();

    const productosFiltrados = productos.filter(p => (p.nombre || '').toLowerCase().includes((filtro || '').toLowerCase()));

    // Paginación para compras
    const inicioCompras = (paginaCatalogo - 1) * itemsPorPagina;
    const finCompras = inicioCompras + itemsPorPagina;
    const productosPaginaCompras = productosFiltrados.slice(inicioCompras, finCompras);

    productosPaginaCompras.forEach(prod => {
            const catUp = (prod.categoria || '').toUpperCase();
            const esArrozAzucar = (catUp === 'ARROZ' || catUp === 'AZUCAR' || catUp === 'AZÚCAR');
            const pres = extraerPresentacionesProducto(prod);
            let optsCompra = `<option value="Unidad|${pres.precioUnid}">${esArrozAzucar ? 'KG' : 'Unidad'} (S/ ${pres.precioUnid})</option>`;
            if (pres.precioDoc) optsCompra += `<option value="Docena/10KG|${pres.precioDoc}">${esArrozAzucar ? '10 KG' : 'Docena'} (S/ ${pres.precioDoc})</option>`;
            if (pres.precioPaq) optsCompra += `<option value="Paquete/Saco|${pres.precioPaq}">${esArrozAzucar ? '1/2 Saco' : 'Paquete'} (S/ ${pres.precioPaq})</option>`;
            if (pres.precioCaja) optsCompra += `<option value="Caja/Saco|${pres.precioCaja}">${esArrozAzucar ? 'Saco' : 'Caja'} (S/ ${pres.precioCaja})</option>`;

            catalogoCompras.innerHTML += `
                <div class="prod-card">
                    <img src="${prod.imagen || 'https://via.placeholder.com/80'}">
                    <div class="prod-title">${prod.nombre}</div>
                    <select id="pres-compra-${prod.id}" class="select-pres">
                        ${optsCompra}
                    </select>
                    <button class="btn-add-cart" style="background:#16a34a;" onclick="agregarAlCarritoCompra(${prod.id})">📦 Pedir</button>
                </div>
            `;
        });

    // Agregar controles de paginación para compras
    const totalPaginasCompras = Math.ceil(productosFiltrados.length / itemsPorPagina);
    if (catalogoCompras && totalPaginasCompras > 1) {
        const paginacionCompras = document.createElement('div');
        paginacionCompras.id = 'paginacion-compras';
        paginacionCompras.style.cssText = 'width: 100%; display: flex; justify-content: center; gap: 8px; padding: 15px; align-items: center;';
        paginacionCompras.innerHTML = `
            <button onclick="cambiarPaginaCatalogo(${paginaCatalogo - 1})" ${paginaCatalogo === 1 ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer;">Anterior</button>
            ${Array.from({length: totalPaginasCompras}, (_, i) => i + 1).map(p => `
                <button onclick="cambiarPaginaCatalogo(${p})" style="padding: 6px 12px; border-radius: 4px; border: 1px solid ${p === paginaCatalogo ? '#38bdf8' : '#334155'}; background: ${p === paginaCatalogo ? '#1e3a8a' : '#1e293b'}; color: white; cursor: pointer; font-weight: ${p === paginaCatalogo ? 'bold' : 'normal'};">${p}</button>
            `).join('')}
            <button onclick="cambiarPaginaCatalogo(${paginaCatalogo + 1})" ${paginaCatalogo === totalPaginasCompras ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer;">Siguiente</button>
        `;
        catalogoCompras.parentNode.appendChild(paginacionCompras);
    }

    if (typeof actualizarCarritoComprasUI === 'function') actualizarCarritoComprasUI();
    if (typeof renderizarRegistroComandasVendedor === 'function') renderizarRegistroComandasVendedor();
}

function agregarAlCarritoCompra(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    const rawVal = document.getElementById(`pres-compra-${id}`).value.split('|');
    const tipoPres = rawVal[0];
    const precioEstimado = parseFloat(rawVal[1]) || 0;

    const itemKey = `${id}-${tipoPres}`;
    const item = carritoCompras.find(i => i.key === itemKey);

    if (item) {
        item.cantidad += 1;
    } else {
        carritoCompras.push({
            key: itemKey,
            id: prod.id,
            nombre: prod.nombre,
            tipoPres: tipoPres,
            precioEstimado: precioEstimado,
            cantidad: 1
        });
    }
    actualizarCarritoComprasUI();
}

function cambiarCantidadCompra(key, delta) {
    const item = carritoCompras.find(i => i.key === key);
    if (item) {
        item.cantidad = Math.round((item.cantidad + delta) * 100) / 100;
        if (item.cantidad <= 0) carritoCompras = carritoCompras.filter(i => i.key !== key);
    }
    actualizarCarritoComprasUI();
}

function modificarCantidadCompraDirecta(key, valor) {
    const item = carritoCompras.find(i => i.key === key);
    const num = parseFloat(valor);
    if (item) {
        if (!isNaN(num) && num > 0) item.cantidad = num;
        else if (valor === '' || num <= 0) item.cantidad = 0;
    }
    actualizarCarritoComprasUI();
}

function eliminarDelCarritoCompra(key) {
    carritoCompras = carritoCompras.filter(i => i.key !== key);
    actualizarCarritoComprasUI();
}

function actualizarCarritoComprasUI() {
    const contenedor = document.getElementById('contenedor-carrito-compras');
    const btnEnviar = document.getElementById('btn-enviar-compra');
    if(!contenedor) return;

    if (carritoCompras.length === 0) {
        contenedor.className = 'cart-empty';
        contenedor.innerHTML = 'No hay productos en la solicitud';
        btnEnviar.disabled = true;
        return;
    }

    contenedor.className = 'cart-list';
    contenedor.innerHTML = '';

    carritoCompras.forEach(item => {
        contenedor.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nombre}</div>
                    <div class="cart-item-sub" style="color:#38bdf8;">Pres: ${item.tipoPres}</div>
                </div>
                <div class="cart-controls">
                    <button class="btn-qty" onclick="cambiarCantidadCompra('${item.key}', -1)">-</button>
                    <input type="number" step="1" min="1" class="input-qty" value="${item.cantidad}" onchange="modificarCantidadCompraDirecta('${item.key}', this.value)">
                    <button class="btn-qty" onclick="cambiarCantidadCompra('${item.key}', 1)">+</button>
                    <button class="btn-del" onclick="eliminarDelCarritoCompra('${item.key}')">🗑️</button>
                </div>
            </div>
        `;
    });

    btnEnviar.disabled = false;
}

function enviarSolicitudCompra() {
    if (carritoCompras.length === 0) return;
    const fechaActual = new Date().toLocaleString('es-PE');
    
    let montoTotalComanda = 0;
    carritoCompras.forEach(i => {
        montoTotalComanda += (i.precioEstimado || 0) * i.cantidad;
    });

    const nuevaComanda = {
        comandaId: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
        fecha: fechaActual,
        usuario: rol,
        estado: 'POR PAGAR',
        totalEstimado: montoTotalComanda.toFixed(2),
        items: JSON.parse(JSON.stringify(carritoCompras))
    };
    comandas.unshift(nuevaComanda);
    historialComandasRealizadas.unshift(nuevaComanda);

    kardex.unshift({
        ticketId: nuevaComanda.comandaId,
        fecha: fechaActual,
        producto: `Comanda ${nuevaComanda.comandaId}`,
        tipo: 'Comanda Solicitada',
        cantidad: `POR PAGAR (S/ ${montoTotalComanda.toFixed(2)})`,
        usuario: rol
    });

    localStorage.setItem('lista_comandas', JSON.stringify(comandas));
    localStorage.setItem('historial_comandas_realizadas', JSON.stringify(historialComandasRealizadas));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));
    carritoCompras = [];
    actualizarCarritoComprasUI();
    alert("Pedido enviado al administrador correctamente.");
    cambiarTab('ventas');
}

function abrirModalComandasLista() {
    const cont = document.getElementById('contenedor-comandas-pendientes');
    cont.innerHTML = '';
    if (comandas.length === 0) {
        cont.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">No hay comandas pendientes.</div>`;
    } else {
        comandas.forEach(cmd => {
            cont.innerHTML += `
                <div class="costo-item-row">
                    <div>
                        <strong style="color: #38bdf8;">${cmd.comandaId}</strong><br>
                        <span style="font-size: 11px; color: #94a3b8;">${cmd.fecha} (${cmd.usuario})</span>
                    </div>
                    <button onclick="abrirModalCostosComanda('${cmd.comandaId}')" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:bold; cursor:pointer;">Ingresar Costos</button>
                </div>
            `;
        });
    }
    document.getElementById('badge-comandas-count').textContent = comandas.length;
    document.getElementById('modal-comandas-lista').style.display = 'flex';
}
function cerrarModalComandasLista() { document.getElementById('modal-comandas-lista').style.display = 'none'; }

function abrirModalCostosComanda(comandaId) {
    comandaActualAprobar = comandas.find(c => c.comandaId === comandaId);
    if (!comandaActualAprobar) return;
    document.getElementById('subtitulo-comanda-id').textContent = `Comanda N° ${comandaActualAprobar.comandaId}`;
    document.getElementById('select-estado-comanda').value = comandaActualAprobar.estado || 'CANCELADO';
    
    const lista = document.getElementById('lista-items-costos');
    lista.innerHTML = '';
    comandaActualAprobar.items.forEach((it, idx) => {
        const valPrecio = it.precioEstimado ? it.precioEstimado.toFixed(2) : '';
        lista.innerHTML += `
            <div class="costo-item-row">
                <span>${it.nombre} (${it.tipoPres} x${it.cantidad})</span>
                <input type="number" step="0.01" class="costo-item-input" id="costo-item-${idx}" value="${valPrecio}" placeholder="S/ Costo">
            </div>
        `;
    });
    document.getElementById('modal-comandas-lista').style.display = 'none';
    document.getElementById('modal-costos-comanda').style.display = 'flex';
}
function cerrarModalCostos() { document.getElementById('modal-costos-comanda').style.display = 'none'; }

function confirmarCostosComanda() {
    if (!comandaActualAprobar) return;
    const estadoPago = document.getElementById('select-estado-comanda').value;
    comandaActualAprobar.estado = estadoPago;

    const fechaActual = new Date().toLocaleString('es-PE');
    let totalComanda = 0;

    comandaActualAprobar.items.forEach((it, idx) => {
        const costoInput = parseFloat(document.getElementById(`costo-item-${idx}`).value) || 0;
        totalComanda += costoInput * it.cantidad;

        const prod = productos.find(p => p.nombre.toLowerCase() === it.nombre.toLowerCase());
        if (prod) {
            prod.stockUnid = (parseFloat(prod.stockUnid) || 0) + it.cantidad;
        }

        kardex.unshift({
            fecha: fechaActual,
            producto: `${it.nombre} (${it.tipoPres})`,
            tipo: 'Compra Proveedor',
            cantidad: `+${it.cantidad}`,
            usuario: `${comandaActualAprobar.comandaId} (${estadoPago} S/ ${costoInput.toFixed(2)})`
        });
    });

    kardex.unshift({
        ticketId: comandaActualAprobar.comandaId,
        fecha: fechaActual,
        producto: `Pago Comanda ${comandaActualAprobar.comandaId}`,
        tipo: `Comanda [${estadoPago}]`,
        cantidad: `- S/ ${totalComanda.toFixed(2)}`,
        usuario: `${comandaActualAprobar.usuario} (Admin Pagó)`,
        metodo: `Comanda [${estadoPago}]`,
        total: totalComanda.toFixed(2),
        items: comandaActualAprobar.items.map(i => ({ desc: `${i.nombre} (${i.tipoPres})`, cant: i.cantidad, total: '0.00' }))
    });

    comandas = comandas.filter(c => c.comandaId !== comandaActualAprobar.comandaId);

    localStorage.setItem('lista_comandas', JSON.stringify(comandas));
    localStorage.setItem('historial_comandas_realizadas', JSON.stringify(historialComandasRealizadas));
    localStorage.setItem('lista_productos', JSON.stringify(productos));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));

    alert("Comanda procesada e inventario actualizado correctamente.");
    cerrarModalCostos();
    renderizarProductos();
    renderizarReportes();
    renderizarKardex();
}

function renderizarRegistroComandasVendedor() {
    const tabla = document.getElementById('tabla-registro-comandas-vendedor');
    if(!tabla) return;
    tabla.innerHTML = historialComandasRealizadas.filter(c => c.usuario === rol).map(cmd => `
        <tr>
            <td><strong style="color:#38bdf8;">${cmd.comandaId}</strong></td>
            <td>${cmd.fecha}</td>
            <td>${cmd.estado}</td>
            <td><button onclick="imprimirTicketComandaVendedor('${cmd.comandaId}')" style="background:#2563eb; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">🧾 Ver / Imprimir Ticket</button></td>
        </tr>
    `).join('') || `<tr><td colspan="4" style="text-align:center; color:#64748b;">No se han realizado comandas.</td></tr>`;
}

function imprimirTicketComandaVendedor(comandaId) {
    const cmd = historialComandasRealizadas.find(c => c.comandaId === comandaId) || comandas.find(c => c.comandaId === comandaId);
    if(!cmd) return;
    document.getElementById('t-titulo-comprobante').textContent = 'TICKET DE COMANDA';
    document.getElementById('t-id').textContent = cmd.comandaId;
    document.getElementById('t-fecha').textContent = cmd.fecha;
    document.getElementById('t-vendedor').textContent = cmd.usuario;
    document.getElementById('t-metodo').textContent = cmd.estado || 'PENDIENTE';

    const tbody = document.getElementById('t-items');
    tbody.innerHTML = '';
    cmd.items.forEach(it => {
        tbody.innerHTML += `<tr><td style="color:#000 !important;">${it.nombre} (${it.tipoPres})</td><td style="color:#000 !important;">x${it.cantidad}</td><td style="text-align:right; color:#000 !important;">${cmd.estado || 'PENDIENTE'}</td></tr>`;
    });
    document.getElementById('modal-ticket').style.display = 'flex';
}

function manejarEscaneo(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const codigoEscaneado = event.target.value.trim();
        if (!codigoEscaneado) return;

        procesarCodigoEscaneo(codigoEscaneado);
        event.target.value = '';
        buscarPorCodigo('');
    }
}

function detectarEscaneoInput(event) {
    if (event.key === 'Enter') {
        if (esEscaneoActivo && bufferInputEscaneo.length > 3) {
            event.preventDefault();
            event.stopPropagation();
            procesarCodigoEscaneado(bufferInputEscaneo);
            bufferInputEscaneo = '';
            esEscaneoActivo = false;
            tiempoUltimoCaracterInput = 0;
            if (timeoutInputEscaneo) clearTimeout(timeoutInputEscaneo);
            event.target.value = '';
            buscarPorCodigo('');
        }
        return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const ahora = Date.now();
        const tiempoEntreCaracteres = ahora - tiempoUltimoCaracterInput;
        tiempoUltimoCaracterInput = ahora;

        bufferInputEscaneo += event.key;
        esEscaneoActivo = true;

        if (timeoutInputEscaneo) clearTimeout(timeoutInputEscaneo);
        timeoutInputEscaneo = setTimeout(() => {
            bufferInputEscaneo = '';
            esEscaneoActivo = false;
            tiempoUltimoCaracterInput = 0;
        }, 300);
    }
}

function agregarProductoPorCodigo(prod, codigo) {
    const pres = extraerPresentacionesProducto(prod);
    const catUp = (prod.categoria || '').toUpperCase();
    const esArrozAzucar = (catUp === 'ARROZ' || catUp === 'AZUCAR' || catUp === 'AZÚCAR');

    let tipoPres = 'unid';
    let precioPres = pres.precioUnid || 0;
    let stockDisponible = pres.stockUnid || 0;

    const tieneUnidad = (pres.precioUnid > 0 && pres.stockUnid > 0) || (pres.stockUnid > 0);

    if (tieneUnidad) {
        tipoPres = 'unid';
        precioPres = pres.precioUnid || 0;
        stockDisponible = pres.stockUnid || 0;
    } else if (pres.precioDoc > 0 && pres.stockDoc > 0) {
        tipoPres = 'doc';
        precioPres = pres.precioDoc;
        stockDisponible = pres.stockDoc;
    } else if (pres.precioPaq > 0 && pres.stockPaq > 0) {
        tipoPres = 'paq';
        precioPres = pres.precioPaq;
        stockDisponible = pres.stockPaq;
    } else if (pres.precioCaja > 0 && pres.stockCaja > 0) {
        tipoPres = 'caja';
        precioPres = pres.precioCaja;
        stockDisponible = pres.stockCaja;
    } else if (pres.precioUnid > 0) {
        tipoPres = 'unid';
        precioPres = pres.precioUnid;
        stockDisponible = pres.stockUnid || 0;
    } else if (pres.precioDoc > 0) {
        tipoPres = 'doc';
        precioPres = pres.precioDoc;
        stockDisponible = pres.stockDoc || 0;
    } else if (pres.precioPaq > 0) {
        tipoPres = 'paq';
        precioPres = pres.precioPaq;
        stockDisponible = pres.stockPaq || 0;
    } else if (pres.precioCaja > 0) {
        tipoPres = 'caja';
        precioPres = pres.precioCaja;
        stockDisponible = pres.stockCaja || 0;
    }

    const itemKey = `${prod.id}-${tipoPres}`;
    const item = carrito.find(i => i.key === itemKey);
    const cantidadEnCarrito = item ? item.cantidad : 0;

    if (cantidadEnCarrito + 1 > stockDisponible) {
        alert(`❌ Stock insuficiente. Solo quedan ${stockDisponible} disponible(s) de ${esArrozAzucar ? 'KG' : 'Unidad'}.`);
        return;
    }

    if (item) {
        item.cantidad += 1;
    } else {
        carrito.push({
            key: itemKey,
            id: prod.id,
            tipoPres: tipoPres,
            nombre: prod.nombre,
            precio: precioPres,
            cantidad: 1,
            stockMax: stockDisponible
        });
    }
    actualizarCarritoUI();
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const selectPres = document.getElementById(`pres-${id}`).value.split('|');
    const tipoPres = selectPres[0];
    const precioPres = parseFloat(selectPres[1]);

    const itemKey = `${id}-${tipoPres}`;
    const item = carrito.find(i => i.key === itemKey);
    const cantidadEnCarrito = item ? item.cantidad : 0;

    if (cantidadEnCarrito + 1 > prod.stockUnid) {
        alert(`❌ Stock insuficiente. Solo quedan ${prod.stockUnid} disponible(s).`);
        return;
    }

    if (item) {
        item.cantidad += 1;
    } else {
        carrito.push({
            key: itemKey,
            id: prod.id,
            tipoPres: tipoPres,
            nombre: prod.nombre,
            precio: precioPres,
            cantidad: 1,
            stockMax: prod.stockUnid
        });
    }
    actualizarCarritoUI();
}

function cambiarCantidad(key, delta) {
    const item = carrito.find(i => i.key === key);
    if (item) {
        const nuevaCant = Math.round((item.cantidad + delta) * 100) / 100;
        if (nuevaCant > item.stockMax) {
            alert(`❌ Stock insuficiente. El límite es ${item.stockMax}.`);
            return;
        }
        item.cantidad = nuevaCant;
        if (item.cantidad <= 0) carrito = carrito.filter(i => i.key !== key);
    }
    actualizarCarritoUI();
}

function modificarCantidadDirecta(key, valor) {
    const item = carrito.find(i => i.key === key);
    const num = parseFloat(valor);
    if (item) {
        if (!isNaN(num) && num > 0) {
            if (num > item.stockMax) {
                alert(`❌ Stock insuficiente. El máximo es ${item.stockMax}.`);
                item.cantidad = item.stockMax;
            } else {
                item.cantidad = num;
            }
        } else if (valor === '' || num <= 0) {
            item.cantidad = 0;
        }
    }
    actualizarCarritoUI();
}

function eliminarDelCarrito(key) {
    carrito = carrito.filter(i => i.key !== key);
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const contenedor = document.getElementById('contenedor-carrito');
    const montoTotal = document.getElementById('monto-total');
    const btnPago = document.getElementById('btn-pago');

    if (carrito.length === 0) {
        contenedor.className = 'cart-empty';
        contenedor.innerHTML = 'El carrito está vacío';
        montoTotal.textContent = 'S/ 0.00';
        btnPago.disabled = true;
        btnPago.classList.remove('active');
        return;
    }

    contenedor.className = 'cart-list';
    contenedor.innerHTML = '';

    let total = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nombre}</div>
                    <div class="cart-item-sub">S/ ${item.precio.toFixed(2)} x ${item.cantidad} = <strong>S/ ${subtotal.toFixed(2)}</strong></div>
                </div>
                <div class="cart-controls">
                    <button class="btn-qty" onclick="cambiarCantidad('${item.key}', -1)">-</button>
                    <input type="number" step="0.1" min="0.1" max="${item.stockMax}" class="input-qty" value="${item.cantidad}" onchange="modificarCantidadDirecta('${item.key}', this.value)">
                    <button class="btn-qty" onclick="cambiarCantidad('${item.key}', 1)">+</button>
                    <button class="btn-del" onclick="eliminarDelCarrito('${item.key}')">🗑️</button>
                </div>
            </div>
        `;
    });

    totalPagarActual = total;
    montoTotal.textContent = 'S/ ' + total.toFixed(2);
    btnPago.disabled = false;
    btnPago.classList.add('active');
}

function abrirModalPago() {
    document.getElementById('modal-monto').textContent = 'S/ ' + totalPagarActual.toFixed(2);
    document.getElementById('monto-recibido').value = '';
    document.getElementById('monto-vuelto').textContent = '0.00';
    document.getElementById('monto-efectivo-mixto').value = '';
    document.getElementById('monto-yape-mixto').value = '';
    document.getElementById('total-pagado-mixto').textContent = '0.00';
    document.getElementById('vuelto-mixto').textContent = '0.00';
    seleccionarMetodo('Efectivo');
    document.getElementById('modal-pago').style.display = 'flex';
}
function cerrarModalPago() { document.getElementById('modal-pago').style.display = 'none'; }

function seleccionarMetodo(metodo) {
    metodoPagoSeleccionado = metodo;
    document.getElementById('btn-efectivo').className = 'btn-pago-opt ' + (metodo === 'Efectivo' ? 'selected' : '');
    document.getElementById('btn-yape').className = 'btn-pago-opt ' + (metodo === 'Yape' ? 'selected' : '');
    document.getElementById('btn-mixto').className = 'btn-pago-opt ' + (metodo === 'Mixto' ? 'selected' : '');
    document.getElementById('panel-efectivo').style.display = metodo === 'Efectivo' ? 'block' : 'none';
    document.getElementById('panel-yape').style.display = metodo === 'Yape' ? 'block' : 'none';
    document.getElementById('panel-mixto').style.display = metodo === 'Mixto' ? 'block' : 'none';
}

function calcularVuelto() {
    const recibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
    const vuelto = recibido - totalPagarActual;
    document.getElementById('monto-vuelto').textContent = vuelto > 0 ? vuelto.toFixed(2) : '0.00';
}

function calcularVueltoMixto() {
    const efectivo = parseFloat(document.getElementById('monto-efectivo-mixto').value) || 0;
    const yape = parseFloat(document.getElementById('monto-yape-mixto').value) || 0;
    const totalPagado = efectivo + yape;
    const vuelto = efectivo - (totalPagarActual - yape);

    document.getElementById('total-pagado-mixto').textContent = totalPagado.toFixed(2);
    document.getElementById('vuelto-mixto').textContent = vuelto > 0 ? vuelto.toFixed(2) : '0.00';
}

function confirmarCobro() {
    let montoEfectivo = 0;
    let montoYape = 0;

    if(metodoPagoSeleccionado === 'Efectivo') {
        const recibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
        if(recibido < totalPagarActual) {
            alert("El monto recibido en efectivo es menor al total a pagar.");
            return;
        }
        montoEfectivo = recibido;
    } else if(metodoPagoSeleccionado === 'Mixto') {
        montoEfectivo = parseFloat(document.getElementById('monto-efectivo-mixto').value) || 0;
        montoYape = parseFloat(document.getElementById('monto-yape-mixto').value) || 0;
        const totalPagado = montoEfectivo + montoYape;

        if(totalPagado < totalPagarActual) {
            alert(`El total pagado (S/ ${totalPagado.toFixed(2)}) es menor al total a pagar (S/ ${totalPagarActual.toFixed(2)}).`);
            return;
        }
    }

    let detalles = [];
    let itemsTicket = [];
    const fechaActual = new Date().toLocaleString('es-PE');
    const ticketId = 'TK-' + Math.floor(1000 + Math.random() * 9000);

    let metodoPagoTexto = metodoPagoSeleccionado;
    if(metodoPagoSeleccionado === 'Mixto') {
        metodoPagoTexto = `Mixto (Efectivo: S/ ${montoEfectivo.toFixed(2)}, Yape: S/ ${montoYape.toFixed(2)})`;
    }

    kardex.unshift({
        ticketId: ticketId,
        fecha: fechaActual,
        producto: carrito.map(i => `${i.nombre} x${i.cantidad}`).join(', '),
        tipo: metodoPagoSeleccionado,
        cantidad: totalPagarActual.toFixed(2),
        usuario: rol,
        metodo: metodoPagoTexto,
        total: totalPagarActual.toFixed(2),
        montoEfectivo: montoEfectivo.toFixed(2),
        montoYape: montoYape.toFixed(2),
        items: carrito.map(i => ({ desc: i.nombre, cant: i.cantidad, total: (i.precio * i.cantidad).toFixed(2) }))
    });

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        detalles.push(`${item.nombre} x${item.cantidad}`);
        itemsTicket.push({
            desc: item.nombre,
            cant: item.cantidad,
            total: subtotal.toFixed(2)
        });

        const prod = productos.find(p => p.id === item.id);
        if (prod) {
            const catUp = (prod.categoria || '').toUpperCase();
            const esArrozAzucar = (catUp === 'ARROZ' || catUp === 'AZUCAR' || catUp === 'AZÚCAR');
            const pres = extraerPresentacionesProducto(prod);

            // Conversión automática de stock
            let cantidadADescontar = item.cantidad;
            let stockDisponible = pres.stockUnid || 0;

            // Si el stock de unidades/KG es insuficiente, intentar convertir de presentaciones mayores
            if (cantidadADescontar > stockDisponible) {
                const deficit = cantidadADescontar - stockDisponible;

                if (esArrozAzucar) {
                    // Para arroz/azúcar: intentar convertir de sacos o 1/2 sacos
                    const kgPorSaco = prod.kgCaja || prod.kg_caja || 50; // Valor por defecto: 50 KG por saco
                    const kgPorMedioSaco = prod.kgPaq || prod.kg_paq || 25; // Valor por defecto: 25 KG por 1/2 saco

                    // Primero intentar de 1/2 sacos
                    let medioSacosAConvertir = Math.ceil(deficit / kgPorMedioSaco);
                    if (pres.stockPaq >= medioSacosAConvertir) {
                        prod.stockPaq -= medioSacosAConvertir;
                        prod.stockUnid += (medioSacosAConvertir * kgPorMedioSaco);
                        kardex.unshift({
                            fecha: fechaActual,
                            producto: item.nombre,
                            tipo: 'Conversión Stock',
                            cantidad: `-${medioSacosAConvertir} 1/2 Saco → +${(medioSacosAConvertir * kgPorMedioSaco).toFixed(2)} KG`,
                            usuario: rol
                        });
                    } else {
                        // Si no hay suficientes 1/2 sacos, intentar de sacos completos
                        let sacosAConvertir = Math.ceil(deficit / kgPorSaco);
                        if (pres.stockCaja >= sacosAConvertir) {
                            prod.stockCaja -= sacosAConvertir;
                            prod.stockUnid += (sacosAConvertir * kgPorSaco);
                            kardex.unshift({
                                fecha: fechaActual,
                                producto: item.nombre,
                                tipo: 'Conversión Stock',
                                cantidad: `-${sacosAConvertir} Saco → +${(sacosAConvertir * kgPorSaco).toFixed(2)} KG`,
                                usuario: rol
                            });
                        }
                    }
                } else {
                    // Para otros productos: intentar convertir de cajas o paquetes
                    const unidadesPorCaja = prod.unidadesCaja || prod.unidades_caja || 24; // Valor por defecto
                    const unidadesPorPaquete = prod.unidadesPaq || prod.unidades_paq || 12; // Valor por defecto

                    // Primero intentar de paquetes
                    let paquetesAConvertir = Math.ceil(deficit / unidadesPorPaquete);
                    if (pres.stockPaq >= paquetesAConvertir) {
                        prod.stockPaq -= paquetesAConvertir;
                        prod.stockUnid += (paquetesAConvertir * unidadesPorPaquete);
                        kardex.unshift({
                            fecha: fechaActual,
                            producto: item.nombre,
                            tipo: 'Conversión Stock',
                            cantidad: `-${paquetesAConvertir} Pqte → +${paquetesAConvertir * unidadesPorPaquete} Unid`,
                            usuario: rol
                        });
                    } else {
                        // Si no hay suficientes paquetes, intentar de cajas
                        let cajasAConvertir = Math.ceil(deficit / unidadesPorCaja);
                        if (pres.stockCaja >= cajasAConvertir) {
                            prod.stockCaja -= cajasAConvertir;
                            prod.stockUnid += (cajasAConvertir * unidadesPorCaja);
                            kardex.unshift({
                                fecha: fechaActual,
                                producto: item.nombre,
                                tipo: 'Conversión Stock',
                                cantidad: `-${cajasAConvertir} Caja → +${cajasAConvertir * unidadesPorCaja} Unid`,
                                usuario: rol
                            });
                        }
                    }
                }

                // Recalcular stock disponible después de la conversión
                stockDisponible = prod.stockUnid || 0;
            }

            // Verificar si aún hay suficiente stock después de la conversión
            if (cantidadADescontar > stockDisponible) {
                alert(`❌ Stock insuficiente incluso después de conversión. Solo quedan ${stockDisponible.toFixed(2)} disponible(s).`);
                return;
            }

            // Descontar del stock de unidades/KG
            prod.stockUnid = Math.max(0, prod.stockUnid - cantidadADescontar);
            kardex.unshift({
                fecha: fechaActual,
                producto: item.nombre,
                tipo: 'Venta',
                cantidad: `-${cantidadADescontar.toFixed(2)}`,
                usuario: `${rol} (${metodoPagoSeleccionado})`
            });
        }
    });

    localStorage.setItem('lista_productos', JSON.stringify(productos));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));

    ultimoTicketId = ticketId;
    cerrarModalPago();
    carrito = [];
    actualizarCarritoUI();
    renderizarProductos();
    if(typeof renderizarReportes === 'function') renderizarReportes();
    renderizarKardex();

    // Mostrar ticket visual automáticamente después de la venta
    verTicketComprobante(ticketId);
}

function imprimirTicketActual() {
    if (!ultimoTicketId) {
        alert("No hay ticket reciente para imprimir.");
        return;
    }
    verTicketComprobante(ultimoTicketId);
    setTimeout(() => {
        window.print();
    }, 500);
}

function renderizarVistaCaja() {
    const fechaHoyStr = new Date().toLocaleDateString('es-PE');
    let totalYapeHoy = 0;
    let totalEfectivoHoy = 0;

    kardex.forEach(k => {
        if (k.ticketId && k.fecha && k.fecha.includes(fechaHoyStr)) {
            if (k.metodo === 'Yape' || k.tipo === 'Yape') {
                totalYapeHoy += parseFloat(k.total || k.cantidad) || 0;
            } else if (k.metodo === 'Efectivo' || k.tipo === 'Efectivo') {
                totalEfectivoHoy += parseFloat(k.total || k.cantidad) || 0;
            } else if (k.metodo && k.metodo.includes('Mixto')) {
                totalEfectivoHoy += parseFloat(k.montoEfectivo || 0) || 0;
                totalYapeHoy += parseFloat(k.montoYape || 0) || 0;
            }
        }
    });

    let totalGastosHoy = 0;
    gastosDelDia.forEach(g => {
        if (g.fecha && g.fecha.includes(fechaHoyStr)) totalGastosHoy += parseFloat(g.monto) || 0;
    });

    document.getElementById('caja-card-inicio').textContent = 'S/ ' + montoInicialCaja.toFixed(2);
    document.getElementById('caja-card-yape').textContent = 'S/ ' + totalYapeHoy.toFixed(2);
    document.getElementById('caja-card-efectivo').textContent = 'S/ ' + totalEfectivoHoy.toFixed(2);
    document.getElementById('caja-card-gastos').textContent = 'S/ ' + totalGastosHoy.toFixed(2);

    const efectivoEnCajon = (montoInicialCaja + totalEfectivoHoy) - totalGastosHoy;
    document.getElementById('cuadre-efectivo-cobrado').textContent = 'S/ ' + totalEfectivoHoy.toFixed(2);
    document.getElementById('cuadre-gastos-salida').textContent = '- S/ ' + totalGastosHoy.toFixed(2);
    
    const lblEfectivoFinal = document.getElementById('cuadre-efectivo-cajon');
    lblEfectivoFinal.textContent = 'S/ ' + efectivoEnCajon.toFixed(2);
    
    if (efectivoEnCajon < 0 || totalGastosHoy > 0) {
        lblEfectivoFinal.style.color = '#f87171';
    } else {
        lblEfectivoFinal.style.color = '#38bdf8';
    }

    const tablaGastos = document.getElementById('tabla-gastos-dia');
    if(tablaGastos) {
        tablaGastos.innerHTML = gastosDelDia.filter(g => g.fecha && g.fecha.includes(fechaHoyStr)).map(g => `
            <tr>
                <td>${g.hora}</td>
                <td><strong style="color:#f87171;">${g.tipo}</strong></td>
                <td>${g.detalle}</td>
                <td><strong style="color:#ef4444;">- S/ ${parseFloat(g.monto).toFixed(2)}</strong></td>
                <td>${g.usuario}</td>
            </tr>
        `).join('') || `<tr><td colspan="5" style="text-align: center; color: #64748b;">No hay gastos o salidas de dinero registradas hoy.</td></tr>`;
    }

    renderizarHistorialCierres();
    renderizarHistorialDiarioConsolidado();
}

function evaluarTipoGasto(val) {
    const boxComanda = document.getElementById('box-gasto-comanda');
    if (val === 'Pago de comanda') {
        boxComanda.style.display = 'block';
        const select = document.getElementById('gasto-comanda-select');
        select.innerHTML = '<option value="">-- Seleccionar Comanda --</option>' + 
            kardex.filter(k => k.ticketId && k.ticketId.startsWith('CMD-') && k.tipo && k.tipo.includes('POR PAGAR')).map(c => `<option value="${c.ticketId}">${c.ticketId} - S/ ${c.total}</option>`).join('');
    } else {
        boxComanda.style.display = 'none';
    }
}

function seleccionarComandaCobrar(comandaId) {
    if (!comandaId) return;
    const comandaRecord = kardex.find(k => k.ticketId === comandaId);
    if (comandaRecord) {
        document.getElementById('gasto-monto').value = comandaRecord.total || comandaRecord.cantidad;
        document.getElementById('gasto-detalle').value = `Pago de Comanda ${comandaId}`;
    }
}

function registrarGastoDia(e) {
    e.preventDefault();
    const ahora = new Date();
    const comandaIdSel = document.getElementById('gasto-comanda-select').value;
    const tipoGasto = document.getElementById('gasto-tipo').value;

    gastosDelDia.unshift({
        id: Date.now(),
        fecha: ahora.toLocaleDateString('es-PE'),
        hora: ahora.toLocaleTimeString('es-PE'),
        tipo: tipoGasto,
        detalle: document.getElementById('gasto-detalle').value,
        monto: parseFloat(document.getElementById('gasto-monto').value).toFixed(2),
        usuario: rol
    });

    if (tipoGasto === 'Pago de comanda' && comandaIdSel) {
        const cmdKardex = kardex.find(k => k.ticketId === comandaIdSel);
        if (cmdKardex) {
            cmdKardex.tipo = 'COMPRA PROVEEDOR [CANCELADO]';
            cmdKardex.metodo = 'COMPRA PROVEEDOR [CANCELADO]';
            cmdKardex.producto = 'COMPRA PROVEEDOR [CANCELADO]';
        }
        const histCmd = historialComandasRealizadas.find(c => c.comandaId === comandaIdSel);
        if (histCmd) histCmd.estado = 'CANCELADO';
    }

    localStorage.setItem('lista_gastos_dia', JSON.stringify(gastosDelDia));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));
    localStorage.setItem('historial_comandas_realizadas', JSON.stringify(historialComandasRealizadas));
    
    alert("Salida de dinero registrada con éxito.");
    document.getElementById('form-registro-gasto').reset();
    document.getElementById('box-gasto-comanda').style.display = 'none';
    renderizarVistaCaja();
    renderizarReportes();
}

function imprimirArqueoTurno() {
    const fechaHoyStr = new Date().toLocaleDateString('es-PE');
    let totalYapeHoy = 0, totalEfectivoHoy = 0, totalGastosHoy = 0;

    const ventasDelDia = kardex.filter(k => k.ticketId && k.fecha && k.fecha.includes(fechaHoyStr) && !k.ticketId.startsWith('CMD-'));

    ventasDelDia.forEach(k => {
        if (k.metodo === 'Yape' || k.tipo === 'Yape') totalYapeHoy += parseFloat(k.total || k.cantidad) || 0;
        if (k.metodo === 'Efectivo' || k.tipo === 'Efectivo') totalEfectivoHoy += parseFloat(k.total || k.cantidad) || 0;
    });

    const gastosDelDiaHoy = gastosDelDia.filter(g => g.fecha && g.fecha.includes(fechaHoyStr));
    gastosDelDiaHoy.forEach(g => {
        totalGastosHoy += parseFloat(g.monto) || 0;
    });

    const efectivoFinalCajon = (montoInicialCaja + totalEfectivoHoy) - totalGastosHoy;
    const cierreId = 'CIERRE-' + Math.floor(100 + Math.random() * 900);
    const fechaHoraActual = new Date().toLocaleString('es-PE');

    const nuevoCierre = {
        id: cierreId,
        fecha: fechaHoraActual,
        usuario: rol,
        montoInicial: montoInicialCaja,
        efectivo: totalEfectivoHoy,
        yape: totalYapeHoy,
        gastos: totalGastosHoy,
        efectivoFinal: efectivoFinalCajon,
        ventas: ventasDelDia,
        salidas: gastosDelDiaHoy
    };
    historialCierresCaja.unshift(nuevoCierre);
    localStorage.setItem('historial_cierres_caja', JSON.stringify(historialCierresCaja));

    mostrarTicketCierre(nuevoCierre);
    renderizarHistorialCierres();
}

function mostrarTicketCierre(cierre) {
    document.getElementById('t-titulo-comprobante').textContent = 'ARQUEO / CIERRE DE CAJA';
    document.getElementById('t-id').textContent = cierre.id;
    document.getElementById('t-fecha').textContent = cierre.fecha;
    document.getElementById('t-vendedor').textContent = cierre.usuario;
    document.getElementById('t-metodo').textContent = 'RESUMEN Y DESGLOSE DIARIO';

    const tbody = document.getElementById('t-items');
    tbody.innerHTML = `
        <tr style="border-bottom: 1px solid #000;"><td colspan="3" style="font-weight:bold; color:#000 !important; text-align:center; padding-top:4px;">--- RESUMEN NUMÉRICO ---</td></tr>
        <tr><td style="color:#000 !important;">Monto Inicial Caja</td><td style="color:#000 !important;">-</td><td style="text-align:right; color:#000 !important;">S/ ${cierre.montoInicial.toFixed(2)}</td></tr>
        <tr><td style="color:#000 !important;">Ventas Efectivo</td><td style="color:#000 !important;">-</td><td style="text-align:right; color:#000 !important;">S/ ${cierre.efectivo.toFixed(2)}</td></tr>
        <tr><td style="color:#000 !important;">Ventas Yape</td><td style="color:#000 !important;">-</td><td style="text-align:right; color:#000 !important;">S/ ${cierre.yape.toFixed(2)}</td></tr>
        <tr><td style="color:#000 !important;">Total Salidas/Gastos</td><td style="color:#000 !important;">-</td><td style="text-align:right; color:#000 !important;">- S/ ${cierre.gastos.toFixed(2)}</td></tr>
        
        <tr style="border-bottom: 1px solid #000;"><td colspan="3" style="font-weight:bold; color:#000 !important; text-align:center; padding-top:10px;">--- DESGLOSE DE VENTAS (${cierre.ventas.length}) ---</td></tr>
    `;

    if (cierre.ventas.length === 0) {
        tbody.innerHTML += `<tr><td colspan="3" style="color:#000 !important; text-align:center;">No hay ventas hoy.</td></tr>`;
    } else {
        cierre.ventas.forEach(v => {
            let desc = v.producto || 'Venta de productos';
            let metodoStr = v.metodo || v.tipo || '';
            let montoStr = parseFloat(v.total || v.cantidad || 0).toFixed(2);
            tbody.innerHTML += `
                <tr>
                    <td style="color:#000 !important; font-size:10px;">${v.ticketId} - ${desc} (${metodoStr})</td>
                    <td style="color:#000 !important;">1</td>
                    <td style="text-align:right; color:#000 !important;">S/ ${montoStr}</td>
                </tr>
            `;
        });
    }

    tbody.innerHTML += `<tr style="border-bottom: 1px solid #000;"><td colspan="3" style="font-weight:bold; color:#000 !important; text-align:center; padding-top:10px;">--- DESGLOSE DE SALIDAS/GASTOS (${cierre.salidas.length}) ---</td></tr>`;

    if (cierre.salidas.length === 0) {
        tbody.innerHTML += `<tr><td colspan="3" style="color:#000 !important; text-align:center;">No hay salidas/gastos hoy.</td></tr>`;
    } else {
        cierre.salidas.forEach(g => {
            tbody.innerHTML += `
                <tr>
                    <td style="color:#000 !important; font-size:10px;">[${g.hora}] ${g.tipo}: ${g.detalle}</td>
                    <td style="color:#000 !important;">-</td>
                    <td style="text-align:right; color:#000 !important;">- S/ ${parseFloat(g.monto).toFixed(2)}</td>
                </tr>
            `;
        });
    }

    document.getElementById('t-total').textContent = cierre.efectivoFinal.toFixed(2);
    document.getElementById('modal-ticket').style.display = 'flex';
}

function renderizarHistorialCierres() {
    const tabla = document.getElementById('tabla-historial-cierres');
    if (!tabla) return;
    tabla.innerHTML = historialCierresCaja.map(c => `
        <tr>
            <td><strong style="color:#38bdf8;">${c.id}</strong></td>
            <td>${c.fecha}</td>
            <td>${c.usuario}</td>
            <td><strong style="color:${c.efectivoFinal < 0 ? '#f87171' : '#4ade80'};">S/ ${c.efectivoFinal.toFixed(2)}</strong></td>
            <td><button onclick="verCierreGuardado('${c.id}')" style="background:#2563eb; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🧾 Ver Ticket</button></td>
        </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:#64748b;">No hay cierres de caja guardados.</td></tr>`;
}

function verCierreGuardado(cierreId) {
    const cierre = historialCierresCaja.find(c => c.id === cierreId);
    if (cierre) mostrarTicketCierre(cierre);
}

function renderizarHistorialDiarioConsolidado() {
    const tabla = document.getElementById('tabla-historial-diario');
    if (!tabla) return;
    let diasMap = {};
    kardex.forEach(k => {
        if(k.ticketId && k.fecha) {
            let f = k.fecha.split(',')[0];
            if(!diasMap[f]) diasMap[f] = { fecha: f, inicio: montoInicialCaja, yape: 0, efectivo: 0, gastos: 0 };
            if(k.metodo === 'Yape' || k.tipo === 'Yape') diasMap[f].yape += parseFloat(k.total || k.cantidad) || 0;
            if(k.metodo === 'Efectivo' || k.tipo === 'Efectivo') diasMap[f].efectivo += parseFloat(k.total || k.cantidad) || 0;
        }
    });
    gastosDelDia.forEach(g => {
        if(g.fecha) {
            if(!diasMap[g.fecha]) diasMap[g.fecha] = { fecha: g.fecha, inicio: montoInicialCaja, yape: 0, efectivo: 0, gastos: 0 };
            diasMap[g.fecha].gastos += parseFloat(g.monto) || 0;
        }
    });
    tabla.innerHTML = Object.values(diasMap).map(d => {
        const netCaja = ((d.inicio + d.efectivo) - d.gastos);
        return `
            <tr>
                <td><strong>${d.fecha}</strong></td>
                <td>S/ ${d.inicio.toFixed(2)}</td>
                <td style="color:#c084fc;">S/ ${d.yape.toFixed(2)}</td>
                <td style="color:#4ade80;">S/ ${d.efectivo.toFixed(2)}</td>
                <td style="color:#f87171;">- S/ ${d.gastos.toFixed(2)}</td>
                <td><strong style="color:${netCaja < 0 ? '#f87171' : '#38bdf8'};">S/ ${netCaja.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('') || `<tr><td colspan="6" style="text-align:center; color:#64748b;">Sin historial.</td></tr>`;
}

function renderizarKardex() {
    const tablaKardex = document.getElementById('tabla-kardex');
    if(!tablaKardex) return;
    tablaKardex.innerHTML = '';

    if (kardex.length === 0) {
        tablaKardex.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">No hay movimientos registrados en el Kárdex.</td></tr>`;
        return;
    }

    kardex.forEach(k => {
        let prodNombre = k.producto || k.detalle || '-';
        let tipoMov = k.tipo || k.metodo || '-';
        let cantidadCambio = k.cantidad || k.total || '-';
        let usuarioDetalle = k.usuario || k.usuarioDetalle || '-';

        tablaKardex.innerHTML += `
            <tr>
                <td>${k.fecha || '-'}</td>
                <td><strong>${prodNombre}</strong></td>
                <td>${tipoMov}</td>
                <td style:color:${tipoMov.includes('Cancelado') || tipoMov.includes('Salida') || tipoMov.includes('Comanda Solicitada') ? '#f87171' : 'inherit'};">${cantidadCambio}</td>
                <td>${usuarioDetalle}</td>
            </tr>
        `;
    });
}

function renderizarRegistroVentas() {
    const tablaVentas = document.getElementById('tabla-ventas-registradas');
    if (!tablaVentas) return;
    tablaVentas.innerHTML = '';

    const ventasFiltradas = kardex.filter(k => k.ticketId && k.usuario && k.usuario.includes(rol));

    if (ventasFiltradas.length === 0) {
        tablaVentas.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No hay ventas registradas</td></tr>';
        return;
    }

    ventasFiltradas.forEach(k => {
        const metodoTexto = k.metodo || k.tipo || 'No especificado';
        tablaVentas.innerHTML += `
            <tr>
                <td><strong>${k.ticketId}</strong></td>
                <td>${k.fecha}</td>
                <td>${k.usuario}</td>
                <td>${metodoTexto}</td>
                <td style="color: #4ade80; font-weight: bold;">S/ ${k.total || k.cantidad}</td>
                <td>
                    <button onclick="verTicketComprobante('${k.ticketId}')" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Ver Ticket</button>
                </td>
            </tr>
        `;
    });
}

function verTicket(ticketId) {
    verTicketComprobante(ticketId);
}

function renderizarReportes() {
    let totalStock = 0, valorInv = 0, totEf = 0, totYape = 0;
    productos.forEach(p => { totalStock += parseFloat(p.stockUnid) || 0; valorInv += ((parseFloat(p.stockUnid) || 0) * (parseFloat(p.precioUnid) || 0)); });
    
    const tablaRep = document.getElementById('tabla-reportes-ventas');
    if(!tablaRep) return;

    const ticketsFiltro = kardex.filter(item => item.ticketId);

    ticketsFiltro.forEach(k => {
        if(k.metodo === 'Efectivo' || k.tipo === 'Efectivo') totEf += parseFloat(k.total || k.cantidad) || 0;
        if(k.metodo === 'Yape' || k.tipo === 'Yape') totYape += parseFloat(k.total || k.cantidad) || 0;
    });

    let totalGastosDiarios = 0;
    let totalGastosPersonal = 0;

    gastosDelDia.forEach(g => {
        if (g.tipo && g.tipo.includes('personal')) {
            totalGastosPersonal += parseFloat(g.monto) || 0;
        } else {
            totalGastosDiarios += parseFloat(g.monto) || 0;
        }
    });

    const totalIngresosMes = totEf + totYape;
    const utilidadNetaMes = totalIngresosMes - (totalGastosDiarios + totalGastosPersonal);

    document.getElementById('rep-stock-total').textContent = totalStock;
    document.getElementById('rep-valor-inventario').textContent = 'S/ ' + valorInv.toFixed(2);
    document.getElementById('rep-ventas-efectivo').textContent = 'S/ ' + totEf.toFixed(2);
    document.getElementById('rep-ventas-yape').textContent = 'S/ ' + totYape.toFixed(2);

    document.getElementById('mes-total-ingresos').textContent = 'S/ ' + totalIngresosMes.toFixed(2);
    document.getElementById('mes-gastos-diarios').textContent = '- S/ ' + totalGastosDiarios.toFixed(2);
    document.getElementById('mes-gastos-personal').textContent = '- S/ ' + totalGastosPersonal.toFixed(2);
    document.getElementById('mes-utilidad-neta').textContent = 'S/ ' + utilidadNetaMes.toFixed(2);

    tablaRep.innerHTML = ticketsFiltro.map(item => `
        <tr>
            <td><strong>${item.ticketId}</strong></td>
            <td>${item.fecha}</td>
            <td><span style="color:#38bdf8;">${item.usuario}</span></td>
            <td><strong>${item.metodo || item.tipo}</strong></td>
            <td><strong style="color:#4ade80;">S/ ${item.total || item.cantidad}</strong></td>
            <td><button onclick="verTicketComprobante('${item.ticketId}')" style="background:#2563eb; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🧾 Ver Ticket</button></td>
        </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center; color:#64748b;">No hay registros de ventas.</td></tr>`;
}

function verTicketComprobante(ticketId) {
    const k = kardex.find(item => item.ticketId === ticketId);
    if (!k) return;
    document.getElementById('t-id').textContent = k.ticketId;
    document.getElementById('t-fecha').textContent = k.fecha;
    document.getElementById('t-vendedor').textContent = k.usuario;
    document.getElementById('t-metodo').textContent = k.metodo || k.tipo;
    document.getElementById('t-total').textContent = k.total || k.cantidad;

    const tbody = document.getElementById('t-items');
    tbody.innerHTML = '';
    if (k.items && k.items.length > 0) {
        k.items.forEach(it => {
            tbody.innerHTML += `<tr><td style="color:#000 !important;">${it.desc}</td><td style="color:#000 !important;">x${it.cant}</td><td style="text-align:right; color:#000 !important;">S/ ${it.total}</td></tr>`;
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="3" style="color:#000 !important;">${k.producto || k.detalle}</td></tr>`;
    }
    document.getElementById('modal-ticket').style.display = 'flex';
}
function aplicarRestriccionesPorRol() {
    const rolUsuario = obtenerRol();
    
    // IDs EXACTOS definidos en el HTML para los costos
    const idsCostos = ['p-costo-unid', 'p-costo-doc', 'p-costo-paq', 'p-costo-caja'];
    
    const inputNombre = document.getElementById('p-nombre');
    const inputCategoria = document.getElementById('p-categoria');
    const inputCodigo = document.getElementById('p-codigo');
    const tituloForm = document.getElementById('titulo-form-producto') || document.querySelector('.form-title');

    if (rolUsuario === 'vendedor') {
        // Asignar clase al body para ocultar por CSS y por JS
        document.body.classList.add('rol-vendedor');
        document.body.setAttribute('data-rol', 'vendedor');

        idsCostos.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.style.display = 'none';
                const grupo = input.closest('.form-group') || input.parentElement;
                if (grupo) grupo.style.display = 'none';
            }
        });

        if (inputNombre) inputNombre.readOnly = false;
        if (inputCategoria) inputCategoria.disabled = false;
        if (inputCodigo) inputCodigo.readOnly = false;
        if (tituloForm) tituloForm.textContent = "Registrar / Editar Producto";

    } else {
        // Remover clase para que el Administrador vea todos los costos
        document.body.classList.remove('rol-vendedor');
        document.body.setAttribute('data-rol', 'admin');

        idsCostos.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.style.display = 'block';
                const grupo = input.closest('.form-group') || input.parentElement;
                if (grupo) grupo.style.display = 'block';
            }
        });

        // Asegurar que se muestren los contenedores generales de costo
        document.querySelectorAll('.campo-costo-admin').forEach(el => {
            el.style.display = 'block';
        });

        if (inputNombre) inputNombre.readOnly = false;
        if (inputCategoria) inputCategoria.disabled = false;
        if (inputCodigo) inputCodigo.readOnly = false;
        if (tituloForm) tituloForm.textContent = "Registrar / Editar Producto";
    }
}

function editarProducto(id) {
    recargarListaProductos();
    const prod = productos.find(p => String(p.id) === String(id));
    if (!prod) return;

    const pres = extraerPresentacionesProducto(prod);

    const idEdit = document.getElementById('p-id-edit');
    if (idEdit) idEdit.value = prod.id;

    const inputNombre = document.getElementById('p-nombre');
    if (inputNombre) inputNombre.value = prod.nombre || '';

    const inputCategoria = document.getElementById('p-categoria');
    if (inputCategoria) {
        inputCategoria.value = prod.categoria || '';
        actualizarNombresPresentaciones();
    }

    const inputCodigo = document.getElementById('p-codigo');
    if (inputCodigo) inputCodigo.value = prod.codigo || '';

    setCampoForm('p-costo-unid', pres.costoUnid, 0);
    setCampoForm('p-precio-unid', pres.precioUnid, 0);
    setCampoForm('p-stock-unid', pres.stockUnid, 0);

    setCampoForm('p-costo-doc', pres.costoDoc, 0);
    setCampoForm('p-precio-doc', pres.precioDoc, 0);
    setCampoForm('p-stock-doc', pres.stockDoc, 0);

    setCampoForm('p-costo-paq', pres.costoPaq, 0);
    setCampoForm('p-precio-paq', pres.precioPaq, 0);
    setCampoForm('p-stock-paq', pres.stockPaq, 0);

    setCampoForm('p-costo-caja', pres.costoCaja, 0);
    setCampoForm('p-precio-caja', pres.precioCaja, 0);
    setCampoForm('p-stock-caja', pres.stockCaja, 0);

    setCampoForm('p-unidades-paq', prod.unidadesPaq || 0);
    setCampoForm('p-unidades-caja', prod.unidadesCaja || 0);
    setCampoForm('p-kg-paq', prod.kgPaq || 0);
    setCampoForm('p-kg-caja', prod.kgCaja || 0);

    // Cargar también si existen con nombres alternativos por compatibilidad
    if (!prod.unidadesPaq && prod.unidades_paq) setCampoForm('p-unidades-paq', prod.unidades_paq);
    if (!prod.unidadesCaja && prod.unidades_caja) setCampoForm('p-unidades-caja', prod.unidades_caja);
    if (!prod.kgPaq && prod.kg_paq) setCampoForm('p-kg-paq', prod.kg_paq);
    if (!prod.kgCaja && prod.kg_caja) setCampoForm('p-kg-caja', prod.kg_caja);

    document.querySelectorAll('#form-producto details').forEach((bloque) => {
        bloque.open = true;
    });

    const imagenVal = prod.imagen || document.getElementById('imagen-base64')?.value || '';
    const hiddenImg = document.getElementById('imagen-base64');
    if (hiddenImg) hiddenImg.value = imagenVal;
    if (imagenVal && imagenVal.indexOf('via.placeholder') === -1) {
        const preview = document.getElementById('img-preview');
        const cajaPreview = document.getElementById('vista-previa');
        if (preview) preview.src = imagenVal;
        if (cajaPreview) cajaPreview.style.display = 'block';
    }

    const btnCancelar = document.getElementById('btn-cancelar-edit');
    if (btnCancelar) btnCancelar.style.display = 'block';

    if (typeof aplicarRestriccionesPorRol === 'function') {
        aplicarRestriccionesPorRol();
    }

    const tabInventario = document.getElementById('tab-inventario');
    if (tabInventario && !tabInventario.classList.contains('active') && typeof cambiarTab === 'function') {
        cambiarTab('inventario');
    }
}

function eliminarProducto(id) {
    if(confirm("¿Eliminar este producto del inventario?")) {
        const prod = productos.find(p => p.id === id);
        if (prod) {
            kardex.unshift({
                fecha: new Date().toLocaleString('es-PE'),
                producto: prod.nombre,
                tipo: 'Eliminación Producto',
                cantidad: 'Removido',
                usuario: rol
            });
            localStorage.setItem('lista_kardex', JSON.stringify(kardex));
        }
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('lista_productos', JSON.stringify(productos));
        renderizarProductos();
        renderizarKardex();
    }
}

function cerrarTicket() { document.getElementById('modal-ticket').style.display = 'none'; }

function cambiarPaginaInventario(pagina) {
    recargarListaProductos(); // Recargar desde localStorage
    const filtroActual = document.querySelector('#card-inventario-lista .search-input')?.value || '';
    paginaInventario = pagina;
    filtrarInventarioSinReset(filtroActual);
}

function cambiarPaginaCatalogo(pagina) {
    recargarListaProductos(); // Recargar desde localStorage
    const filtroActual = document.querySelector('#tab-ventas .search-input')?.value || '';
    paginaCatalogo = pagina;
    filtrarProductosSinReset(filtroActual);
}

function filtrarInventario(t) {
    const filtro = t.toLowerCase().trim();
    const prodsFiltrados = productos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        const categoria = (p.categoria || '').toLowerCase();
        return nombre.includes(filtro) || codigo.includes(filtro) || categoria.includes(filtro);
    });
    paginaInventario = 1; // Resetear a página 1 al filtrar
    renderizarProductosPorLista(prodsFiltrados);
}

function filtrarInventarioSinReset(t) {
    const filtro = t.toLowerCase().trim();
    const prodsFiltrados = productos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        const categoria = (p.categoria || '').toLowerCase();
        return nombre.includes(filtro) || codigo.includes(filtro) || categoria.includes(filtro);
    });
    // NO resetear la página (usar la actual)
    renderizarProductosPorLista(prodsFiltrados);
}

function filtrarProductos(t) {
    const filtro = t.toLowerCase().trim();
    const prodsFiltrados = productos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        const categoria = (p.categoria || '').toLowerCase();
        return nombre.includes(filtro) || codigo.includes(filtro) || categoria.includes(filtro);
    });
    paginaCatalogo = 1; // Resetear a página 1 al filtrar
    renderizarProductosPorLista(prodsFiltrados);

    if (prodsFiltrados.length === 1 && filtro.length > 5) {
        const prodEncontrado = prodsFiltrados[0];
        if (prodEncontrado.codigo && prodEncontrado.codigo.toLowerCase() === filtro) {
            setTimeout(() => resaltarProductoEnCatalogo(prodEncontrado.id), 100);
        }
    }
}

function filtrarProductosSinReset(t) {
    const filtro = t.toLowerCase().trim();
    const prodsFiltrados = productos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        const categoria = (p.categoria || '').toLowerCase();
        return nombre.includes(filtro) || codigo.includes(filtro) || categoria.includes(filtro);
    });
    // NO resetear la página (usar la actual)
    renderizarProductosPorLista(prodsFiltrados);
}

function buscarPorCodigo(codigo) {
    const filtro = codigo.toLowerCase().trim();
    if (!filtro) {
        renderizarProductos();
        return;
    }

    const prodsFiltrados = productos.filter(p => {
        const codigoProd = (p.codigo || '').toLowerCase();
        return codigoProd.includes(filtro);
    });

    renderizarProductosPorLista(prodsFiltrados);

    if (prodsFiltrados.length === 1) {
        const prodEncontrado = prodsFiltrados[0];
        if (prodEncontrado.codigo && prodEncontrado.codigo.toLowerCase() === filtro) {
            setTimeout(() => resaltarProductoEnCatalogo(prodEncontrado.id), 100);
        }
    }
}

function renderizarProductosPorLista(listaProductos) {
    const tablaInventario = document.getElementById('tabla-inventario');
    const catalogoVentas = document.getElementById('catalogo-productos');
    const catalogoCompras = document.getElementById('catalogo-compras');

    if (tablaInventario) tablaInventario.innerHTML = '';
    if (catalogoVentas) catalogoVentas.innerHTML = '';
    if (catalogoCompras) catalogoCompras.innerHTML = '';

    // Eliminar paginación anterior del catálogo si existe
    const paginacionCat = document.getElementById('paginacion-catalogo');
    if (paginacionCat) paginacionCat.remove();

    const tituloCat = document.getElementById('titulo-catalogo');
    if (tituloCat) tituloCat.textContent = `Catálogo (${listaProductos.length})`;

    const rolActual = typeof rol !== 'undefined' ? rol : 'admin';

    // Paginación para inventario
    const inicioInv = (paginaInventario - 1) * itemsPorPagina;
    const finInv = inicioInv + itemsPorPagina;
    const productosPaginaInventario = listaProductos.slice(inicioInv, finInv);

    productosPaginaInventario.forEach(prod => {
        const catUp = (prod.categoria || '').toUpperCase();
        const esArrozAzucar = (catUp === 'ARROZ' || catUp === 'AZUCAR' || catUp === 'AZÚCAR');

        const precioVal = prod.precioUnid ? parseFloat(prod.precioUnid).toFixed(2) : '0.00';
        const costoVal = prod.costoUnid ? parseFloat(prod.costoUnid).toFixed(2) : '0.00';

       let preciosHTML = `<span class="price-badge" style="color:#38bdf8;">${esArrozAzucar ? 'KG' : 'Unid'}: S/ ${precioVal}</span>`;

        let costosHTML = '';
        if (rolActual !== 'vendedor') {
            costosHTML = `<span class="price-badge" style="color:#4ade80;">Costo: S/ ${costoVal}</span>`;
        } else {
            costosHTML = `<span style="color: #64748b; font-style: italic;">Oculto</span>`;
        }
        const pres = extraerPresentacionesProducto(prod);
        if (pres.precioDoc) {
            preciosHTML += `<br><span class="price-badge" style="color:#fbbf24;">${esArrozAzucar ? '10 KG' : 'Doc'} - Venta: S/ ${pres.precioDoc.toFixed(2)}</span>`;
        }
        if (pres.precioPaq) {
            preciosHTML += `<br><span class="price-badge" style="color:#c084fc;">${esArrozAzucar ? '1/2 Saco' : 'Pqte'} - Venta: S/ ${pres.precioPaq.toFixed(2)}</span>`;
        }
        if (pres.precioCaja) {
            preciosHTML += `<br><span class="price-badge" style="color:#f87171;">${esArrozAzucar ? 'Saco' : 'Caja'} - Venta: S/ ${pres.precioCaja.toFixed(2)}</span>`;
        }

        let stockHTML = `<span class="price-badge" style="color:#4ade80;">${esArrozAzucar ? 'KG' : 'Unid'}: ${pres.stockUnid || 0}</span>`;
        if (pres.stockDoc > 0) stockHTML += `<br><span class="price-badge" style="color:#4ade80;">${esArrozAzucar ? '10 KG' : 'Doc'}: ${pres.stockDoc}</span>`;
        if (pres.stockPaq > 0) stockHTML += `<br><span class="price-badge" style="color:#4ade80;">${esArrozAzucar ? '1/2 Saco' : 'Pqte'}: ${pres.stockPaq}</span>`;
        if (pres.stockCaja > 0) stockHTML += `<br><span class="price-badge" style="color:#4ade80;">${esArrozAzucar ? 'Saco' : 'Caja'}: ${pres.stockCaja}</span>`;

        // Mostrar conversiones si existen
        const convPaq = prod.unidadesPaq || prod.unidades_paq || 0;
        const convCaja = prod.unidadesCaja || prod.unidades_caja || 0;
        const convKgPaq = prod.kgPaq || prod.kg_paq || 0;
        const convKgCaja = prod.kgCaja || prod.kg_caja || 0;

        if (convPaq > 0 || convCaja > 0 || convKgPaq > 0 || convKgCaja > 0) {
            stockHTML += `<br><span class="price-badge" style="color:#fbbf24; font-size:10px;">Conv: `;
            if (convPaq > 0) stockHTML += `${convPaq}U/Pq `;
            if (convCaja > 0) stockHTML += `${convCaja}U/Cja `;
            if (convKgPaq > 0) stockHTML += `${convKgPaq}KG/Pq `;
            if (convKgCaja > 0) stockHTML += `${convKgCaja}KG/Cja`;
            stockHTML += `</span>`;
        }

        let accionesTd = '';
        if (rolActual !== 'vendedor') {
            accionesTd = `
                <td>
                    <button onclick="editarProducto(${prod.id})" style="background: #2563eb; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">Editar</button>
                    <button onclick="eliminarProducto(${prod.id})" style="background: #991b1b; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">Borrar</button>
                </td>`;
        }
tablaInventario.innerHTML += `
            <tr>
                <td><strong>${prod.nombre}</strong></td>
                <td>${prod.categoria}</td>
                <td class="col-costo-admin">${costosHTML}</td>
                <td>${preciosHTML}</td>
                <td>${stockHTML}</td>
                ${accionesTd}
            </tr>
        `;
    });

    // Agregar controles de paginación para inventario
    const totalPaginasInv = Math.ceil(listaProductos.length / itemsPorPagina);
    if (tablaInventario && totalPaginasInv > 1) {
        tablaInventario.innerHTML += `
            <tr>
                <td colspan="6" style="text-align: center; padding: 15px;">
                    <div style="display: flex; justify-content: center; gap: 8px; align-items: center;">
                        <button onclick="cambiarPaginaInventario(${paginaInventario - 1})" ${paginaInventario === 1 ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer;">Anterior</button>
                        ${Array.from({length: totalPaginasInv}, (_, i) => i + 1).map(p => `
                            <button onclick="cambiarPaginaInventario(${p})" style="padding: 6px 12px; border-radius: 4px; border: 1px solid ${p === paginaInventario ? '#38bdf8' : '#334155'}; background: ${p === paginaInventario ? '#1e3a8a' : '#1e293b'}; color: white; cursor: pointer; font-weight: ${p === paginaInventario ? 'bold' : 'normal'};">${p}</button>
                        `).join('')}
                        <button onclick="cambiarPaginaInventario(${paginaInventario + 1})" ${paginaInventario === totalPaginasInv ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer;">Siguiente</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Paginación para catálogo de ventas
    const inicioCat = (paginaCatalogo - 1) * itemsPorPagina;
    const finCat = inicioCat + itemsPorPagina;
    const productosPaginaCatalogo = listaProductos.slice(inicioCat, finCat);

    productosPaginaCatalogo.forEach(prod => {
        const catUp = (prod.categoria || '').toUpperCase();
        const esArrozAzucar = (catUp === 'ARROZ' || catUp === 'AZUCAR' || catUp === 'AZÚCAR');
        const pres = extraerPresentacionesProducto(prod);

        let optsHTML = `<option value="unid|${pres.precioUnid}">${esArrozAzucar ? 'KG' : 'Unidad'} (S/ ${pres.precioUnid})</option>`;
        if (pres.precioDoc) optsHTML += `<option value="doc|${pres.precioDoc}">${esArrozAzucar ? '10 KG' : 'Docena'} (S/ ${pres.precioDoc})</option>`;
        if (pres.precioPaq) optsHTML += `<option value="paq|${pres.precioPaq}">${esArrozAzucar ? '1/2 Saco' : 'Pqte'} (S/ ${pres.precioPaq})</option>`;
        if (pres.precioCaja) optsHTML += `<option value="caja|${pres.precioCaja}">${esArrozAzucar ? 'Saco' : 'Caja'} (S/ ${pres.precioCaja})</option>`;

        if (catalogoVentas) {
            catalogoVentas.innerHTML += `
                <div class="prod-card">
                    <img src="${prod.imagen || 'https://via.placeholder.com/80'}">
                    <div class="prod-title">${prod.nombre}</div>
                    <select id="pres-${prod.id}" class="select-pres">
                        ${optsHTML}
                    </select>
                    <button class="btn-add-cart" onclick="agregarAlCarrito(${prod.id})">+ Añadir</button>
                </div>`;
        }
    });

    // Agregar controles de paginación para catálogo
    const totalPaginasCat = Math.ceil(listaProductos.length / itemsPorPagina);
    if (catalogoVentas && totalPaginasCat > 1) {
        const paginacionCat = document.createElement('div');
        paginacionCat.id = 'paginacion-catalogo';
        paginacionCat.style.cssText = 'width: 100%; display: flex; justify-content: center; gap: 8px; padding: 15px; align-items: center;';
        paginacionCat.innerHTML = `
            <button onclick="cambiarPaginaCatalogo(${paginaCatalogo - 1})" ${paginaCatalogo === 1 ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer;">Anterior</button>
            ${Array.from({length: totalPaginasCat}, (_, i) => i + 1).map(p => `
                <button onclick="cambiarPaginaCatalogo(${p})" style="padding: 6px 12px; border-radius: 4px; border: 1px solid ${p === paginaCatalogo ? '#38bdf8' : '#334155'}; background: ${p === paginaCatalogo ? '#1e3a8a' : '#1e293b'}; color: white; cursor: pointer; font-weight: ${p === paginaCatalogo ? 'bold' : 'normal'};">${p}</button>
            `).join('')}
            <button onclick="cambiarPaginaCatalogo(${paginaCatalogo + 1})" ${paginaCatalogo === totalPaginasCat ? 'disabled' : ''} style="padding: 6px 12px; border-radius: 4px; border: 1px solid #334155; background: #1e293b; color: white; cursor: pointer;">Siguiente</button>
        `;
        catalogoVentas.parentNode.appendChild(paginacionCat);
    }
}

let bufferEscaneo = '';
let timeoutEscaneo = null;
let esEscaneoActivo = false;
let tiempoUltimoCaracter = 0;
let bufferInputEscaneo = '';
let timeoutInputEscaneo = null;
let tiempoUltimoCaracterInput = 0;
let ultimoTicketId = null;

window.onload = function() {
    aplicarMenuPorRol();
    if (typeof aplicarRestriccionesPorRol === 'function') aplicarRestriccionesPorRol();
    if (typeof actualizarNombresPresentaciones === 'function') actualizarNombresPresentaciones();
    if (typeof renderizarProductos === 'function') renderizarProductos();
    if (typeof verificarAlertaStockUnidades === 'function') verificarAlertaStockUnidades();
    if (typeof renderizarRegistroComandasVendedor === 'function') renderizarRegistroComandasVendedor();
    if (typeof renderizarKardex === 'function') renderizarKardex();
    if (typeof renderizarReportes === 'function') renderizarReportes();
    if (typeof renderizarHistorialCierres === 'function') renderizarHistorialCierres();

    document.addEventListener('keydown', manejarAtajosTeclado);

    const scannerInput = document.getElementById('scanner-input');
    if (scannerInput) {
        scannerInput.focus();
    }
};

function mantenerFocoScanner() {
    const scannerInput = document.getElementById('scanner-input');
    if (scannerInput && document.activeElement !== scannerInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        scannerInput.focus();
    }
}

function detectarEscaneoGlobal(event) {
    const activeElement = document.activeElement;
    const esInputActivo = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

    if (esInputActivo) return;

    if (event.key === 'Enter') {
        if (esEscaneoActivo && bufferEscaneo.length > 3) {
            event.preventDefault();
            event.stopPropagation();
            procesarCodigoEscaneado(bufferEscaneo);
            bufferEscaneo = '';
            esEscaneoActivo = false;
            tiempoUltimoCaracter = 0;
            if (timeoutEscaneo) clearTimeout(timeoutEscaneo);
        }
        return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const ahora = Date.now();
        const tiempoEntreCaracteres = ahora - tiempoUltimoCaracter;
        tiempoUltimoCaracter = ahora;

        bufferEscaneo += event.key;
        esEscaneoActivo = true;

        if (timeoutEscaneo) clearTimeout(timeoutEscaneo);
        timeoutEscaneo = setTimeout(() => {
            bufferEscaneo = '';
            esEscaneoActivo = false;
            tiempoUltimoCaracter = 0;
        }, 250);
    }
}

function procesarCodigoEscaneado(codigo) {
    const prod = productos.find(p => p.codigo && p.codigo.toLowerCase() === codigo.toLowerCase());
    if (prod) {
        renderizarProductos();
        setTimeout(() => {
            resaltarProductoEnCatalogo(prod.id);
            agregarProductoPorCodigo(prod, codigo);
        }, 50);
    } else {
        alert(`❌ Producto no encontrado con código: ${codigo}`);
    }
}

function resaltarProductoEnCatalogo(productId) {
    const catalogo = document.getElementById('catalogo-productos');
    const cards = catalogo.querySelectorAll('.prod-card');

    cards.forEach(card => {
        card.style.transform = 'scale(1)';
        card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        card.style.zIndex = '1';
        card.style.border = '1px solid #334155';
        card.style.order = '0';
    });

    const targetCard = Array.from(cards).find(card => {
        const btn = card.querySelector('button[onclick*="agregarAlCarrito"]');
        return btn && btn.getAttribute('onclick').includes(`(${productId})`);
    });

    if (targetCard) {
        targetCard.style.transform = 'scale(1.2)';
        targetCard.style.boxShadow = '0 0 40px rgba(56, 189, 248, 0.9)';
        targetCard.style.zIndex = '100';
        targetCard.style.border = '4px solid #38bdf8';
        targetCard.style.transition = 'all 0.3s ease';
        targetCard.style.order = '-1';

        const parent = targetCard.parentNode;
        parent.insertBefore(targetCard, parent.firstChild);

        setTimeout(() => {
            targetCard.style.transform = 'scale(1)';
            targetCard.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
            targetCard.style.zIndex = '1';
            targetCard.style.border = '1px solid #334155';
            targetCard.style.order = '0';
        }, 2500);
    }
}

function manejarAtajosTeclado(event) {
    if (event.key === 'F2') {
        event.preventDefault();
        if (carrito.length > 0 && !document.getElementById('btn-pago').disabled) {
            abrirModalPago();
        }
    } else if (event.key === 'F4') {
        event.preventDefault();
        if (carrito.length > 0) {
            if (confirm('¿Limpiar el carrito?')) {
                carrito = [];
                actualizarCarritoUI();
            }
        } else {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    }
}

function cerrarSesion() { 
    localStorage.removeItem('sesion_activa'); 
    window.location.href = "login.html"; 
}

function cerrarCaja() {
    if (confirm("¿Cerrar caja y finalizar turno?")) {
        if (typeof imprimirArqueoTurno === 'function') imprimirArqueoTurno();
    }
}

function imprimirInventario() {
    document.body.classList.add('imprimir-inventario');
    window.print();
    setTimeout(() => {
        document.body.classList.remove('imprimir-inventario');
    }, 1000);
}

function descargarInventarioWord() {
    let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
            <meta charset="utf-8">
            <title>Inventario - QUEVEDO ABARROTES</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                h1 { text-align: center; }
                .fecha { text-align: right; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>INVENTARIO - QUEVEDO ABARROTES</h1>
            <div class="fecha">Fecha: ${new Date().toLocaleDateString('es-PE')}</div>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precios de Venta</th>
                        <th>Stock Disponible</th>
                    </tr>
                </thead>
                <tbody>
    `;

    productos.forEach(prod => {
        const catUp = (prod.categoria || '').toUpperCase();
        const esArrozAzucar = (catUp === 'ARROZ' || catUp === 'AZUCAR' || catUp === 'AZÚCAR');
        const pres = extraerPresentacionesProducto(prod);

        let preciosHTML = `${esArrozAzucar ? 'KG' : 'Unid'}: S/ ${pres.precioUnid.toFixed(2)}`;
        if (pres.precioDoc) preciosHTML += ` | ${esArrozAzucar ? '10 KG' : 'Doc'}: S/ ${pres.precioDoc.toFixed(2)}`;
        if (pres.precioPaq) preciosHTML += ` | ${esArrozAzucar ? '1/2 Saco' : 'Pqte'}: S/ ${pres.precioPaq.toFixed(2)}`;
        if (pres.precioCaja) preciosHTML += ` | ${esArrozAzucar ? 'Saco' : 'Caja'}: S/ ${pres.precioCaja.toFixed(2)}`;

        let stockHTML = `${esArrozAzucar ? 'KG' : 'Unid'}: ${pres.stockUnid || 0}`;
        if (pres.stockDoc > 0) stockHTML += ` | ${esArrozAzucar ? '10 KG' : 'Doc'}: ${pres.stockDoc}`;
        if (pres.stockPaq > 0) stockHTML += ` | ${esArrozAzucar ? '1/2 Saco' : 'Pqte'}: ${pres.stockPaq}`;
        if (pres.stockCaja > 0) stockHTML += ` | ${esArrozAzucar ? 'Saco' : 'Caja'}: ${pres.stockCaja}`;

        htmlContent += `
            <tr>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>${preciosHTML}</td>
                <td>${stockHTML}</td>
            </tr>
        `;
    });

    htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventario_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Exponer funciones al ámbito global de forma segura
if (typeof aplicarMenuPorRol !== 'undefined') window.aplicarMenuPorRol = aplicarMenuPorRol;
if (typeof cambiarTab !== 'undefined') window.cambiarTab = cambiarTab;
if (typeof editarProducto !== 'undefined') window.editarProducto = editarProducto;
if (typeof guardarProductoLocal !== 'undefined') window.guardarProductoLocal = guardarProductoLocal;
if (typeof cancelarEdicion !== 'undefined') window.cancelarEdicion = cancelarEdicion;
if (typeof actualizarNombresPresentaciones !== 'undefined') window.actualizarNombresPresentaciones = actualizarNombresPresentaciones;
if (typeof eliminarProducto !== 'undefined') window.eliminarProducto = eliminarProducto;
if (typeof agregarAlCarrito !== 'undefined') window.agregarAlCarrito = agregarAlCarrito;
if (typeof cambiarCantidad !== 'undefined') window.cambiarCantidad = cambiarCantidad;
if (typeof modificarCantidadDirecta !== 'undefined') window.modificarCantidadDirecta = modificarCantidadDirecta;
if (typeof eliminarDelCarrito !== 'undefined') window.eliminarDelCarrito = eliminarDelCarrito;
if (typeof abrirModalPago !== 'undefined') window.abrirModalPago = abrirModalPago;
if (typeof cerrarModalPago !== 'undefined') window.cerrarModalPago = cerrarModalPago;
if (typeof seleccionarMetodo !== 'undefined') window.seleccionarMetodo = seleccionarMetodo;
if (typeof calcularVuelto !== 'undefined') window.calcularVuelto = calcularVuelto;
if (typeof calcularVueltoMixto !== 'undefined') window.calcularVueltoMixto = calcularVueltoMixto;
if (typeof confirmarCobro !== 'undefined') window.confirmarCobro = confirmarCobro;
if (typeof cerrarTicket !== 'undefined') window.cerrarTicket = cerrarTicket;
if (typeof filtrarProductos !== 'undefined') window.filtrarProductos = filtrarProductos;
if (typeof buscarPorCodigo !== 'undefined') window.buscarPorCodigo = buscarPorCodigo;
if (typeof renderizarCompras !== 'undefined') window.renderizarCompras = renderizarCompras;
if (typeof agregarAlCarritoCompra !== 'undefined') window.agregarAlCarritoCompra = agregarAlCarritoCompra;
if (typeof cambiarCantidadCompra !== 'undefined') window.cambiarCantidadCompra = cambiarCantidadCompra;
if (typeof modificarCantidadCompraDirecta !== 'undefined') window.modificarCantidadCompraDirecta = modificarCantidadCompraDirecta;
if (typeof eliminarDelCarritoCompra !== 'undefined') window.eliminarDelCarritoCompra = eliminarDelCarritoCompra;
if (typeof enviarSolicitudCompra !== 'undefined') window.enviarSolicitudCompra = enviarSolicitudCompra;
if (typeof manejarEscaneo !== 'undefined') window.manejarEscaneo = manejarEscaneo;
if (typeof detectarEscaneoInput !== 'undefined') window.detectarEscaneoInput = detectarEscaneoInput;
if (typeof agregarProductoPorCodigo !== 'undefined') window.agregarProductoPorCodigo = agregarProductoPorCodigo;
if (typeof renderizarRegistroVentas !== 'undefined') window.renderizarRegistroVentas = renderizarRegistroVentas;
if (typeof verTicket !== 'undefined') window.verTicket = verTicket;
if (typeof verTicketComprobante !== 'undefined') window.verTicketComprobante = verTicketComprobante;
if (typeof imprimirTicketActual !== 'undefined') window.imprimirTicketActual = imprimirTicketActual;
window.cerrarSesion = cerrarSesion;
window.cerrarCaja = cerrarCaja;
window.imprimirInventario = imprimirInventario;
window.descargarInventarioWord = descargarInventarioWord;
window.cambiarPaginaInventario = cambiarPaginaInventario;
window.cambiarPaginaCatalogo = cambiarPaginaCatalogo;
window.filtrarInventario = filtrarInventario;
window.filtrarProductos = filtrarProductos;
window.filtrarInventarioSinReset = filtrarInventarioSinReset;
window.filtrarProductosSinReset = filtrarProductosSinReset;
window.recargarListaProductos = recargarListaProductos;