const REGLAS_PRESENTACION = {
    PH: {
        unidadBase: 'rollos sueltos',
        slots: [
            { id: 1, campo: 'Unid', tipo: 'unid', nombreCorto: 'Unidad', label: 'Unidad (1 rollo)', precio: 1, factor: 1, resumen: '▼ 1. UNIDAD (1 rollo)' },
            { id: 2, campo: 'Doc', tipo: 'doc', nombreCorto: 'Pareja', label: 'Pareja (2 rollos)', precio: 1.5, factor: 2, resumen: '▼ 2. PAREJA (2 rollos)' },
            { id: 3, campo: 'Paq', tipo: 'paq', nombreCorto: 'Bloque', label: 'Bloque (5 pares / 10 rollos)', precio: 6.3, factor: 10, resumen: '▼ 3. BLOQUE (5 pares / 10 rollos)' },
            { id: 4, campo: 'Caja', tipo: 'caja', nombreCorto: 'Paquete', label: 'Paquete (10 pares / 20 rollos)', precio: 12.5, factor: 20, resumen: '▼ 4. PAQUETE (20 rollos)' }
        ]
    },
    PHX4: {
        unidadBase: 'paquetes',
        slots: [
            { id: 3, campo: 'Paq', tipo: 'paq', nombreCorto: 'Paquete', label: 'Paquete', precio: 4.5, factor: 1, resumen: '▼ PAQUETE' },
            { id: 4, campo: 'Caja', tipo: 'caja', nombreCorto: 'Plancha', label: 'Plancha (6 paquetes)', precio: 27, factor: 6, resumen: '▼ PLANCHA (6 paquetes)' }
        ]
    },
    PILA: {
        unidadBase: 'pilas sueltas',
        slots: [
            { id: 1, campo: 'Unid', tipo: 'unid', nombreCorto: 'Unidad', label: 'Unidad (1 pila)', precio: 1, factor: 1, resumen: '▼ 1. UNIDAD (1 pila)' },
            { id: 2, campo: 'Doc', tipo: 'doc', nombreCorto: 'Par', label: 'Par (2 pilas)', precio: 2, factor: 2, resumen: '▼ 2. PAR (2 pilas)' },
            { id: 3, campo: 'Paq', tipo: 'paq', nombreCorto: 'Caja / Blíster', label: 'Caja / Blíster (20 pilas)', precio: 16, factor: 20, resumen: '▼ 3. CAJA / BLÍSTER (20 pilas)' }
        ]
    },
    GUSTA: {
        unidadBase: 'sobres',
        slots: [
            { id: 1, campo: 'Unid', tipo: 'unid', nombreCorto: 'Unidad', label: 'Unidad (1 sobre)', precio: 0.4, factor: 1, resumen: '▼ 1. UNIDAD (1 sobre)' },
            { id: 2, campo: 'Doc', tipo: 'promocion', nombreCorto: 'Promoción', label: 'Promoción (3 sobres)', precio: 1, factor: 3, resumen: '▼ 2. PROMOCIÓN (3 sobres)' },
            { id: 5, campo: 'Tira', tipo: 'tira', nombreCorto: 'Tira', label: 'Tira (10 sobres)', precio: 0, factor: 10, resumen: '▼ 3. TIRA (10 sobres)' },
            { id: 6, campo: 'Docena', tipo: 'docena', nombreCorto: 'Docena', label: 'Docena (12 sobres)', precio: 0, factor: 12, resumen: '▼ 4. DOCENA (12 sobres)' },
            { id: 3, campo: 'Paq', tipo: 'paq', nombreCorto: 'Paquete completo', label: 'Paquete completo (80 sobres)', precio: 21, factor: 80, resumen: '▼ 5. PAQUETE COMPLETO (80 sobres)' }
        ]
    },
    OREGANO: {
        unidadBase: 'sobres',
        slots: [
            { id: 1, campo: 'Unid', tipo: 'unid', nombreCorto: 'Unidad', label: 'Unidad (1 sobre)', precio: 0.3, factor: 1, resumen: '▼ 1. UNIDAD (1 sobre)' },
            { id: 2, campo: 'Doc', tipo: 'doc', nombreCorto: 'Promoción', label: 'Promoción (2 sobres)', precio: 0.5, factor: 2, resumen: '▼ 2. PROMOCIÓN (2 sobres)' },
            { id: 3, campo: 'Paq', tipo: 'paq', nombreCorto: 'Caja', label: 'Caja completo (40 sobres)', precio: 9, factor: 40, resumen: '▼ 3. CAJA COMPLETO (40 sobres)' }
        ]
    }
};

function obtenerRol() {
    const raw = (
        localStorage.getItem('usuario_rol') ||
        localStorage.getItem('rol_usuario') ||
        localStorage.getItem('rol') ||
        'admin'
    ).trim().toLowerCase();

    if (raw === 'administrador' || raw === 'admin') return 'admin';
    if (raw === 'vendedor' || raw === 'vendedor2') return 'vendedor';
    if (raw === 'inventario_consulta') return 'inventario_consulta';
    return raw;
}

function obtenerFechaCajaLocal(fecha = new Date()) {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

// Configuración de Supabase
const SUPABASE_URL = 'https://nxiviidirmzqbcldegus.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Qf-bMKqDet0Xgh6PHExtsA_s3g0jXzn';

let supabaseClient = null;
let isOnline = navigator.onLine;
let syncQueue = [];

// Variables globales (declaradas al inicio para evitar errores de inicialización)
let productos = [];
let kardex = [];
let comandas = [];
let historialComandasRealizadas = [];
let gastosDelDia = [];
let historialCierresCaja = [];
let almacen = [];
let salidasAlmacen = [];
let carrito = [];
let carritoCompras = [];
let comandaActualAprobar = null;
let metodoPagoSeleccionado = 'Efectivo';
let totalPagarActual = 0;

// Variables de paginación
let paginaInventario = 1;
let paginaCatalogo = 1;
const itemsPorPagina = 18;

// Inicializar cliente de Supabase
function initSupabase() {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        return supabaseClient;
    }
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase inicializado correctamente');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return null;
    }
}

// Inicializar Supabase al cargar
if (typeof window.supabase !== 'undefined') {
    initSupabase();
}

const rol = obtenerRol();
const fechaAperturaCajaHoy = obtenerFechaCajaLocal();
let montoInicialCaja = rol === 'vendedor' && localStorage.getItem('caja_apertura_fecha') === fechaAperturaCajaHoy
    ? (parseFloat(localStorage.getItem('caja_inicial')) || 0)
    : 0;

// Asignar clase del rol al body inmediatamente para evitar parpadeo
const rolUsuario = obtenerRol();
document.body.classList.toggle('rol-vendedor', rolUsuario === 'vendedor');
document.body.classList.toggle('rol-inventario-consulta', rolUsuario === 'inventario_consulta');
document.body.setAttribute('data-rol', rolUsuario);

// Función para restringir elementos según el rol
function restringirPorRol() {
    const rolActual = obtenerRol();
    if (rolActual === 'inventario_consulta') {
        document.querySelectorAll(
            '.col-costo-admin, .campo-costo-admin, .btn-editar, .btn-eliminar, ' +
            'button[onclick*="editarProducto"], button[onclick*="eliminarProducto"], ' +
            '#col-header-costos, #col-header-stock, #col-header-acciones, ' +
            '#card-inventario-form, #form-producto, #btn-nuevo-producto'
        ).forEach(el => {
            if (el) el.style.display = 'none';
        });
    }
}

// Función completa para aplicar restricciones de consulta de inventario
function aplicarRestriccionesConsulta() {
    const rolActivo = obtenerRol();
    
    // Agregar clase del rol al body INMEDIATAMENTE al detectar el rol
    if (rolActivo) {
        document.body.classList.add('rol-' + rolActivo);
    }
    
    if (rolActivo === 'inventario_consulta') {
        // Ocultar pestañas administrativas (Ventas, Almacén, Caja, Kárdex, Reportes)
        const pestañasOcultar = ['btn-tab-ventas', 'btn-tab-almacen', 'btn-tab-caja', 'btn-tab-kardex', 'btn-tab-reportes', 'btn-tab-compras', 'btn-registro-ventas', 'btn-cierre-caja'];
        pestañasOcultar.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        // Ocultar columnas/inputs de costo
        document.querySelectorAll('.col-costo-admin, .campo-costo-admin, input[type="number"].input-costo, label[id^="lbl-costo"]').forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Ocultar botones de editar/borrar
        document.querySelectorAll('button[onclick*="editarProducto"], button[onclick*="eliminarProducto"]').forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Ocultar botón de nuevo producto
        const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
        if (btnNuevoProducto) btnNuevoProducto.style.display = 'none';
        
        // Ocultar formulario de productos
        const formProducto = document.getElementById('form-producto');
        if (formProducto) formProducto.style.display = 'none';
        
        // Ocultar columnas de la tabla
        const colHeaderCostos = document.getElementById('col-header-costos');
        const colHeaderStock = document.getElementById('col-header-stock');
        const colHeaderAcciones = document.getElementById('col-header-acciones');
        
        if (colHeaderCostos) colHeaderCostos.style.display = 'none';
        if (colHeaderStock) colHeaderStock.style.display = 'none';
        if (colHeaderAcciones) colHeaderAcciones.style.display = 'none';
        
        // Ocultar información de caja
        const infoCaja = document.getElementById('info-caja');
        if (infoCaja) infoCaja.style.display = 'none';

        // Activar la pestaña de inventario directamente (sin llamar a cambiarTab para evitar recursividad)
        const tabInventario = document.getElementById('tab-inventario');
        const btnTabInventario = document.getElementById('btn-tab-inventario');
        if (tabInventario) tabInventario.classList.add('active');
        if (btnTabInventario) btnTabInventario.classList.add('active');
    }
}

// Ejecutar restricciones después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    aplicarRestriccionesConsulta();
    restringirPorRol();
});

function mostrarEl(id, visible, displayValue) {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? (displayValue || '') : 'none';
}

function aplicarMenuPorRol() {
    const rolActual = obtenerRol();
    const esVendedor = rolActual === 'vendedor';
    const esInventarioConsulta = rolActual === 'inventario_consulta';

    document.body.classList.toggle('rol-vendedor', esVendedor);
    document.body.classList.toggle('rol-inventario-consulta', esInventarioConsulta);
    document.body.setAttribute('data-rol', rolActual);

    const elUsuarioRol = document.getElementById('usuario-rol');
    if (elUsuarioRol) elUsuarioRol.textContent = esInventarioConsulta ? 'inventario consulta' : (esVendedor ? 'vendedor' : 'administrador');

    const elMontoInicial = document.getElementById('monto-inicial');
    if (elMontoInicial) elMontoInicial.textContent = montoInicialCaja.toFixed(2);
    actualizarEstadoVisualCaja();

    // Administrador: ventas, inventario, almacén, caja, kárdex, reportes, cierre/arqueo
    // Vendedor: ventas, compras directas, inventario, caja, kárdex, registro ventas, cierre/arqueo
    mostrarEl('btn-tab-ventas', !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-tab-inventario', true, 'inline-block');
    mostrarEl('btn-tab-almacen', !esVendedor && !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-tab-caja', !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-tab-kardex', !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-tab-compras', esVendedor && !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-tab-reportes', !esVendedor && !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-registro-ventas', esVendedor && !esInventarioConsulta, 'inline-block');
    mostrarEl('seccion-historial-diario-admin', !esVendedor && !esInventarioConsulta, 'block');
    mostrarEl('btn-mis-comandas-vendedor', esVendedor && !esInventarioConsulta, 'inline-block');
    mostrarEl('btn-cierre-caja', !esInventarioConsulta, 'inline-block');
    mostrarEl('col-header-acciones', !esVendedor && !esInventarioConsulta, 'table-cell');
    mostrarEl('col-header-costos', !esVendedor && !esInventarioConsulta, 'table-cell');
    mostrarEl('col-header-stock', !esInventarioConsulta, 'table-cell');
    mostrarEl('info-caja', !esInventarioConsulta, 'block');
    mostrarEl('card-inventario-form', !esInventarioConsulta, 'flex');

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

    Object.values(CAMPOS_FORM_PRES).forEach(meta => {
        const inputPrecio = document.getElementById(meta.precio);
        const inputStock = document.getElementById(meta.stock);
        if (inputPrecio) inputPrecio.disabled = false;
        if (inputStock) inputStock.disabled = false;
    });

    if (esVendedor) {
        Object.values(CAMPOS_FORM_PRES).forEach(meta => {
            const inputCosto = document.getElementById(meta.costo);
            const lblCosto = document.getElementById(meta.lblCosto);
            if (inputCosto) {
                const grupo = inputCosto.closest('.form-group');
                if (grupo) grupo.style.display = 'none';
            }
            if (lblCosto) lblCosto.style.display = 'none';
        });
    } else {
        document.querySelectorAll('#form-producto input, #form-producto select, #form-producto button').forEach(el => {
            el.disabled = false;
            if (el.tagName === 'INPUT') el.readOnly = false;
            el.style.display = '';
        });
        document.querySelectorAll('#form-producto .campo-costo-admin').forEach(el => {
            el.style.display = 'block';
        });
    }

    // Redirigir automáticamente a inventario si el rol es inventario_consulta
    if (esInventarioConsulta) {
        cambiarTab('inventario');
    }
}

function puedeVerTab(tab) {
    const rolActual = obtenerRol();
    if (rolActual === 'inventario_consulta') return tab === 'inventario';
    const esVendedor = rolActual === 'vendedor';
    if (tab === 'compras') return esVendedor;
    if (tab === 'reportes') return !esVendedor;
    if (tab === 'almacen') return !esVendedor;
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

// Función global para cambiar de pestaña en el menú superior
function cambiarTab(tab) {
    if (!puedeVerTab(tab)) {
        tab = obtenerRol() === 'inventario_consulta' ? 'inventario' : 'ventas';
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
        // NO llamar a renderizarProductos aquí para evitar recursividad
        // Los productos ya se renderizan en inicializarSistema
    } else if (tab === 'almacen') {
        document.getElementById('tab-almacen').classList.add('active');
        document.getElementById('btn-tab-almacen').classList.add('active');
        renderizarAlmacen();
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

const CAMPOS_FORM_PRES = {
    1: { campo: 'Unid', precio: 'p-precio-unid', costo: 'p-costo-unid', stock: 'p-stock-unid', sum: 'sum-pres-1', lblPrecio: 'lbl-precio-1', lblCosto: 'lbl-costo-1', lblStock: 'lbl-stock-1' },
    2: { campo: 'Doc', precio: 'p-precio-doc', costo: 'p-costo-doc', stock: 'p-stock-doc', sum: 'sum-pres-2', lblPrecio: 'lbl-precio-2', lblCosto: 'lbl-costo-2', lblStock: 'lbl-stock-2' },
    3: { campo: 'Paq', precio: 'p-precio-paq', costo: 'p-costo-paq', stock: 'p-stock-paq', sum: 'sum-pres-3', lblPrecio: 'lbl-precio-3', lblCosto: 'lbl-costo-3', lblStock: 'lbl-stock-3' },
    4: { campo: 'Caja', precio: 'p-precio-caja', costo: 'p-costo-caja', stock: 'p-stock-caja', sum: 'sum-pres-4', lblPrecio: 'lbl-precio-4', lblCosto: 'lbl-costo-4', lblStock: 'lbl-stock-4' },
    5: { campo: 'Tira', precio: 'p-precio-tira', costo: 'p-costo-tira', stock: 'p-stock-tira', sum: 'sum-pres-5', lblPrecio: 'lbl-precio-5', lblCosto: 'lbl-costo-5', lblStock: 'lbl-stock-5' },
    6: { campo: 'Docena', precio: 'p-precio-docena', costo: 'p-costo-docena', stock: 'p-stock-docena', sum: 'sum-pres-6', lblPrecio: 'lbl-precio-6', lblCosto: 'lbl-costo-6', lblStock: 'lbl-stock-6' }
};

function reglaPresentacionProducto(prodOrCat) {
    const cat = typeof prodOrCat === 'string'
        ? prodOrCat
        : (prodOrCat && prodOrCat.categoria);
    const c = String(cat || '').trim().toUpperCase();
    if (c === 'GUSTA' || c === 'GUSTAS') return REGLAS_PRESENTACION.GUSTA;
    if (c === 'PHX4') {
        const paquetesPlancha = Number(prodOrCat && typeof prodOrCat === 'object'
            ? (prodOrCat.paquetesPlancha ?? prodOrCat.unidadesCaja ?? prodOrCat.unidades_caja)
            : 0);
        const factorPlancha = paquetesPlancha === 8 ? 8 : 6;
        return {
            ...REGLAS_PRESENTACION.PHX4,
            slots: REGLAS_PRESENTACION.PHX4.slots.map(slot => slot.tipo === 'caja'
                ? {
                    ...slot,
                    label: `Plancha (${factorPlancha} paquetes)`,
                    factor: factorPlancha,
                    resumen: `▼ PLANCHA (${factorPlancha} paquetes)`
                }
                : slot)
        };
    }
    if (c === 'PH') return REGLAS_PRESENTACION.PH;
    return REGLAS_PRESENTACION[c] || null;
}

function slotPorTipo(prod, tipoPres) {
    const regla = reglaPresentacionProducto(prod);
    if (!regla) return null;
    const tipo = String(tipoPres || '').trim().toLowerCase();
    return regla.slots.find(s => s.tipo === tipo || s.campo.toLowerCase() === tipo) || null;
}

function factorDePresentacion(prod, tipoPres) {
    const slot = slotPorTipo(prod, tipoPres);
    return slot ? slot.factor : 1;
}

function factorStockBasePorPresentacion(prod, item) {
    const tipoPres = item && item.tipoPres;
    if (tipoPres === 'monto') return 1;
    const presentacion = String((item && (
        item.presentacion ||
        item.unidad_medida ||
        item.etiquetaPres ||
        (tipoPres ? etiquetaDePresentacion(prod, tipoPres) : '')
    )) || tipoPres || '').trim();
    const normalizada = presentacion.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const categoria = String((prod && prod.categoria) || '').trim().toUpperCase();
    const regla = reglaPresentacionProducto(prod);
    const normalizarTexto = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    if (regla) {
        const slot = regla.slots.find(s =>
            [s.tipo, s.campo, s.label, s.nombreCorto].some(valor => {
                const nombre = normalizarTexto(valor);
                return normalizada === nombre || normalizada.startsWith(`${nombre} (`);
            })
        );
        if (slot) return slot.factor;
    }

    if (esPresentacionSaco(prod)) {
        if (categoria.includes('MENESTRAS') &&
            (normalizada.includes('1/4') || String(tipoPres || '').trim().toLowerCase() === 'paq')) {
            return 0.25;
        }
        const kgEnPresentacion = normalizada.match(/(\d+(?:[.,]\d+)?)\s*kg/);
        if (kgEnPresentacion) return Number(kgEnPresentacion[1].replace(',', '.'));
        if (normalizada.includes('1/4') && normalizada.includes('saco')) {
            return (Number(prod.kgPaq || prod.kg_paq) / 2) || (Number(prod.kgCaja || prod.kg_caja) / 4) || 12.5;
        }
        if (normalizada.includes('1/2') && normalizada.includes('saco')) {
            return Number(prod.kgPaq || prod.kg_paq) || 25;
        }
        if (normalizada.includes('saco')) {
            return Number(prod.kgCaja || prod.kg_caja) || 50;
        }
    }

    if (normalizada.includes('paq')) {
        return Number(prod.kgPaq || prod.kg_paq || prod.unidadesPaq || prod.unidades_paq) || 1;
    }
    if (normalizada.includes('caja') || normalizada.includes('plancha')) {
        return Number(prod.kgCaja || prod.kg_caja || prod.unidadesCaja || prod.unidades_caja) || 1;
    }

    const factorGuardado = Number(item && item.factorUnidades);
    return Number.isFinite(factorGuardado) && factorGuardado > 0 ? factorGuardado : 1;
}

function etiquetaDePresentacion(prod, tipoPres) {
    const slot = slotPorTipo(prod, tipoPres);
    if (slot) return slot.label;
    const labels = etiquetasPresentaciones(prod);
    const mapa = { unid: labels.unid, doc: labels.doc, paq: labels.paq, caja: labels.caja };
    return mapa[String(tipoPres || '').toLowerCase()] || tipoPres || '';
}

function listaPresentacionesComerciales(prod) {
    const pres = extraerPresentacionesProducto(prod);
    const regla = reglaPresentacionProducto(prod);
    if (regla) {
        return regla.slots.map(slot => {
            const guardado = pres['precio' + slot.campo];
            return {
                tipo: slot.tipo,
                label: slot.label,
                nombreCorto: slot.nombreCorto,
                precio: guardado > 0 ? guardado : slot.precio,
                factor: slot.factor,
                campo: slot.campo
            };
        });
    }
    const labels = etiquetasPresentaciones(prod);
    const lista = [{ tipo: 'unid', label: labels.unid, precio: pres.precioUnid, factor: 1, campo: 'Unid' }];
    if (pres.precioDoc > 0) lista.push({ tipo: 'doc', label: labels.doc, precio: pres.precioDoc, factor: 1, campo: 'Doc' });
    if (pres.precioPaq > 0) lista.push({ tipo: 'paq', label: labels.paq, precio: pres.precioPaq, factor: 1, campo: 'Paq' });
    if (pres.precioCaja > 0) lista.push({ tipo: 'caja', label: labels.caja, precio: pres.precioCaja, factor: 1, campo: 'Caja' });
    return lista;
}

function unidadesReservadasCarrito(prodId, exceptoKey) {
    return carrito.reduce((acc, item) => {
        if (String(item.id) !== String(prodId)) return acc;
        if (exceptoKey && item.key === exceptoKey) return acc;
        if (item.tipoPres === 'monto') return acc + (parseFloat(item.cantidad) || 0);
        const factor = item.factorUnidades || 1;
        return acc + (parseFloat(item.cantidad) || 0) * factor;
    }, 0);
}

function normalizarPresentacionesCategoria(data) {
    const regla = reglaPresentacionProducto(data);
    if (!regla) {
        ['Tira', 'Docena'].forEach(campo => {
            data['precio' + campo] = 0;
            data['costo' + campo] = 0;
            data['stock' + campo] = 0;
        });
        return data;
    }
    if (String(data.categoria || '').trim().toUpperCase() === 'PHX4') {
        const paquetesPlancha = Number(data.paquetesPlancha ?? data.unidadesCaja ?? data.unidades_caja);
        data.paquetesPlancha = paquetesPlancha === 8 ? 8 : 6;
        data.unidadesCaja = data.paquetesPlancha;
        data.unidades_caja = data.paquetesPlancha;
        ['Unid', 'Doc', 'Tira', 'Docena'].forEach(campo => {
            data['precio' + campo] = 0;
            data['costo' + campo] = 0;
            data['stock' + campo] = 0;
        });
        if (!(data.precioPaq > 0)) data.precioPaq = regla.slots.find(slot => slot.tipo === 'paq').precio;
        if (!(data.precioCaja > 0)) {
            const factorPlancha = regla.slots.find(slot => slot.tipo === 'caja').factor;
            data.precioCaja = data.precioPaq * factorPlancha;
        }
        data.stockUnid = aNumeroProd(data.stockPaq);
        data.stockDoc = 0;
        data.stockPaq = 0;
        data.stockCaja = 0;
        return data;
    }
    const camposRegla = new Set(regla.slots.map(slot => slot.campo));
    ['Unid', 'Doc', 'Paq', 'Caja', 'Tira', 'Docena'].forEach(campo => {
        if (camposRegla.has(campo)) return;
        data['precio' + campo] = 0;
        data['costo' + campo] = 0;
        data['stock' + campo] = 0;
    });
    regla.slots.forEach(slot => {
        const campo = slot.campo;
        if (!(data['precio' + campo] > 0)) data['precio' + campo] = slot.precio;
        if (campo !== 'Unid') data['stock' + campo] = 0;
    });
    return data;
}

function textoCampo(id, texto) {
    const el = document.getElementById(id);
    if (el && texto !== undefined) el.textContent = texto;
}

function aplicarFormularioCategoriaEspecial(regla, aplicarPrecios) {
    Object.keys(CAMPOS_FORM_PRES).forEach(id => {
        const i = Number(id);
        const meta = CAMPOS_FORM_PRES[i];
        const slot = regla.slots.find(s => s.id === i);
        const bloque = document.getElementById('bloque-pres-' + i);
        if (bloque) bloque.style.display = slot ? '' : 'none';
        const inputPrecio = document.getElementById(meta.precio);
        const inputStock = document.getElementById(meta.stock);
        if (inputPrecio) inputPrecio.required = Boolean(slot);
        if (inputStock) inputStock.required = Boolean(slot && slot.factor === 1);
        if (!slot) return;

        textoCampo(meta.sum, slot.resumen);
        textoCampo(meta.lblCosto, `Precio Costo ${slot.nombreCorto} (S/)`);
        textoCampo(meta.lblPrecio, `Precio Venta ${slot.nombreCorto} (S/)`);
        textoCampo(meta.lblStock, slot.factor === 1 ? `Stock (${regla.unidadBase})` : `Stock ${slot.nombreCorto}`);

        const grupoStock = inputStock ? inputStock.closest('.form-group') : null;
        if (grupoStock) grupoStock.style.display = slot.factor === 1 ? '' : 'none';

        if (aplicarPrecios) {
            if (inputPrecio) inputPrecio.value = slot.precio;
        }
    });
}

function mostrarBloquesPresentacionEstandar() {
    Object.keys(CAMPOS_FORM_PRES).forEach(id => {
        const i = Number(id);
        const bloque = document.getElementById('bloque-pres-' + i);
        if (bloque) bloque.style.display = i <= 4 ? '' : 'none';
        const meta = CAMPOS_FORM_PRES[i];
        const precioInput = document.getElementById(meta.precio);
        const stockInput = document.getElementById(meta.stock);
        if (precioInput) precioInput.required = i === 1;
        if (stockInput) stockInput.required = i === 1;
        const grupoStock = stockInput ? stockInput.closest('.form-group') : null;
        if (grupoStock) grupoStock.style.display = '';
    });
}

function actualizarPrecioPlanchaPHX4() {
    const categoria = document.getElementById('p-categoria')?.value.trim().toUpperCase();
    if (categoria !== 'PHX4') return;

    const paquetesPlancha = Number(document.getElementById('p-paquetes-plancha')?.value) === 8 ? 8 : 6;
    const precioPaquete = aNumeroProd(document.getElementById('p-precio-paq')?.value);
    const precioPlancha = document.getElementById('p-precio-caja');
    if (precioPlancha) precioPlancha.value = (precioPaquete * paquetesPlancha).toFixed(2);
}

function cambiarPaquetesPorPlancha() {
    actualizarPrecioPlanchaPHX4();
    actualizarNombresPresentaciones();
}

function actualizarNombresPresentaciones(aplicarPrecios) {
    const pCategoria = document.getElementById('p-categoria');
    const pNombre = document.getElementById('p-nombre');

    const catVal = pCategoria ? pCategoria.value.trim().toUpperCase() : '';
    const nomVal = pNombre ? pNombre.value.trim().toUpperCase() : '';
    const esMenestras = catVal.includes('MENESTRAS');
    const selectorPlancha = document.getElementById('p-paquetes-plancha');
    const esPHX4 = catVal === 'PHX4';
    const regla = reglaPresentacionProducto(esPHX4
        ? { categoria: catVal, paquetesPlancha: Number(selectorPlancha?.value) || 6 }
        : catVal);
    const nota = document.getElementById('nota-stock-categoria');
    const bloqueConv = document.getElementById('bloque-conversiones');
    const bloquePlancha = document.getElementById('bloque-plancha-phx4');

    if (bloquePlancha) bloquePlancha.style.display = esPHX4 ? '' : 'none';

    if (regla) {
        aplicarFormularioCategoriaEspecial(regla, aplicarPrecios === true);
        if (esPHX4 && aplicarPrecios === true) actualizarPrecioPlanchaPHX4();
        if (nota) {
            const descuentos = regla.slots
                .filter(s => s.factor > 1)
                .map(s => `${s.label} descuenta ${s.factor}`)
                .join('. ');
            nota.style.display = 'block';
            nota.textContent = `El stock se controla en ${regla.unidadBase}. ${descuentos}.`;
        }
        if (bloqueConv) bloqueConv.style.display = 'none';
        if (esPHX4 && nota) {
            const factorPlancha = regla.slots.find(slot => slot.tipo === 'caja').factor;
            nota.textContent = `El stock se controla en paquetes. Cada plancha descuenta ${factorPlancha} paquetes. El precio de Plancha se calcula con el precio de Paquete, pero puedes editarlo.`;
        }
    } else {
        if (nota) nota.style.display = 'none';
        if (bloqueConv) bloqueConv.style.display = '';
        mostrarBloquesPresentacionEstandar();

    const esCategoriaSaco = (catVal.includes('ARROZ') || catVal.includes('AZUCAR') || catVal.includes('AZÚCAR') ||
                             catVal.includes('MENESTRAS') ||
                             nomVal.includes('ARROZ') || nomVal.includes('AZUCAR') || nomVal.includes('AZÚCAR') ||
                             nomVal.includes('MENESTRAS'));

    const esFideo = (catVal.includes('FIDEO') || nomVal.includes('FIDEO'));

    if (esCategoriaSaco) {
        if (document.getElementById('sum-pres-1')) document.getElementById('sum-pres-1').textContent = '▼ 1. VENTAS KG';
        if (document.getElementById('lbl-costo-1')) document.getElementById('lbl-costo-1').textContent = 'Precio Costo KG (S/)';
        if (document.getElementById('lbl-precio-1')) document.getElementById('lbl-precio-1').textContent = 'Precio Venta KG (S/)';
        if (document.getElementById('lbl-stock-1')) document.getElementById('lbl-stock-1').textContent = 'Stock Inicial KG';

        if (document.getElementById('sum-pres-2')) document.getElementById('sum-pres-2').textContent = '▼ 2. VENTAS 10 KG';
        if (document.getElementById('lbl-costo-2')) document.getElementById('lbl-costo-2').textContent = 'Precio Costo 10 KG (S/)';
        if (document.getElementById('lbl-precio-2')) document.getElementById('lbl-precio-2').textContent = 'Precio Venta 10 KG (S/)';
        if (document.getElementById('lbl-stock-2')) document.getElementById('lbl-stock-2').textContent = 'Stock Inicial 10 KG';

        const presentacionSaco = esMenestras ? '1/4' : '1/2 Saco';
        if (document.getElementById('sum-pres-3')) document.getElementById('sum-pres-3').textContent = `▼ 3. VENTAS ${presentacionSaco.toUpperCase()}`;
        if (document.getElementById('lbl-costo-3')) document.getElementById('lbl-costo-3').textContent = `Precio Costo ${presentacionSaco} (S/)`;
        if (document.getElementById('lbl-precio-3')) document.getElementById('lbl-precio-3').textContent = `Precio Venta ${presentacionSaco} (S/)`;
        if (document.getElementById('lbl-stock-3')) document.getElementById('lbl-stock-3').textContent = `Stock Inicial ${presentacionSaco}`;

        if (document.getElementById('sum-pres-4')) document.getElementById('sum-pres-4').textContent = '▼ 4. VENTAS SACO';
        if (document.getElementById('lbl-costo-4')) document.getElementById('lbl-costo-4').textContent = 'Precio Costo Saco (S/)';
        if (document.getElementById('lbl-precio-4')) document.getElementById('lbl-precio-4').textContent = 'Precio Venta Saco (S/)';
        if (document.getElementById('lbl-stock-4')) document.getElementById('lbl-stock-4').textContent = 'Stock Inicial Saco';
    } else if (esFideo) {
        if (document.getElementById('sum-pres-1')) document.getElementById('sum-pres-1').textContent = '▼ 1. VENTAS POR UNID';
        if (document.getElementById('lbl-costo-1')) document.getElementById('lbl-costo-1').textContent = 'Precio Costo Unid (S/)';
        if (document.getElementById('lbl-precio-1')) document.getElementById('lbl-precio-1').textContent = 'Precio Venta Unid (S/)';
        if (document.getElementById('lbl-stock-1')) document.getElementById('lbl-stock-1').textContent = 'Stock Inicial Unid';

        if (document.getElementById('sum-pres-2')) document.getElementById('sum-pres-2').textContent = '▼ 2. VENTAS KG';
        if (document.getElementById('lbl-costo-2')) document.getElementById('lbl-costo-2').textContent = 'Precio Costo KG (S/)';
        if (document.getElementById('lbl-precio-2')) document.getElementById('lbl-precio-2').textContent = 'Precio Venta KG (S/)';
        if (document.getElementById('lbl-stock-2')) document.getElementById('lbl-stock-2').textContent = 'Stock Inicial KG';

        if (document.getElementById('sum-pres-3')) document.getElementById('sum-pres-3').textContent = '▼ 3. VENTAS POR PQTE';
        if (document.getElementById('lbl-costo-3')) document.getElementById('lbl-costo-3').textContent = 'Precio Costo Pqte (S/)';
        if (document.getElementById('lbl-precio-3')) document.getElementById('lbl-precio-3').textContent = 'Precio Venta Pqte (S/)';
        if (document.getElementById('lbl-stock-3')) document.getElementById('lbl-stock-3').textContent = 'Stock Inicial Pqte';

        if (document.getElementById('sum-pres-4')) document.getElementById('sum-pres-4').textContent = '▼ 4. VENTAS POR CAJA';
        if (document.getElementById('lbl-costo-4')) document.getElementById('lbl-costo-4').textContent = 'Precio Costo Caja (S/)';
        if (document.getElementById('lbl-precio-4')) document.getElementById('lbl-precio-4').textContent = 'Precio Venta Caja (S/)';
        if (document.getElementById('lbl-stock-4')) document.getElementById('lbl-stock-4').textContent = 'Stock Inicial Caja';
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
    }
    // Control de visibilidad de costos según el rol
    const rolUsuario = obtenerRol();
    Object.values(CAMPOS_FORM_PRES).forEach(meta => {
        const inputCosto = document.getElementById(meta.costo);
        const lblCosto = document.getElementById(meta.lblCosto);

        if (inputCosto) {
            const grupo = inputCosto.closest('.form-group') || inputCosto.parentElement;
            if (grupo) {
                grupo.style.display = (rolUsuario === 'vendedor') ? 'none' : 'block';
            }
        }
        if (lblCosto) lblCosto.style.display = (rolUsuario === 'vendedor') ? 'none' : '';
    });
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

// Cargar datos desde localStorage después de declarar las variables
async function cargarDatosDesdeLocalStorage() {
    productos = JSON.parse(localStorage.getItem('lista_productos')) || [];
    kardex = JSON.parse(localStorage.getItem('lista_kardex')) || [];
    comandas = JSON.parse(localStorage.getItem('lista_comandas')) || [];
    historialComandasRealizadas = JSON.parse(localStorage.getItem('historial_comandas_realizadas')) || [];
    gastosDelDia = JSON.parse(localStorage.getItem('lista_gastos_dia')) || [];
    historialCierresCaja = JSON.parse(localStorage.getItem('historial_cierres_caja')) || [];
    almacen = JSON.parse(localStorage.getItem('lista_almacen')) || [];
    salidasAlmacen = JSON.parse(localStorage.getItem('lista_salidas_almacen')) || [];

    // Si localStorage está vacío o no tiene productos, cargar desde Supabase (una sola vez)
    if (!productos || productos.length === 0) {
        console.log('📥 localStorage vacío, cargando productos desde Supabase...');
        await loadProductosFromSupabase();
    }
}

function verificarAlertaStockUnidades() {
    const rolActual = obtenerRol();
    
    // 2. Si el usuario es de consulta, no ejecutar ni mostrar la alerta
    if (rolActual === 'inventario_consulta' || rolActual === 'consulta') {
        return;
    }

    let productosAlertados = [];
    productos.forEach(p => {
        const labels = etiquetasPresentaciones(p);
        const stock = extraerPresentacionesProducto(p).stockUnid;
        if (esPresentacionSaco(p)) {
            if (stock < 33) productosAlertados.push(`• <strong>${p.nombre}</strong> (${p.categoria || ''}): <span style="color:red; font-weight:bold;">${stock} ${labels.unid}</span>`);
        } else {
            if (stock < 4) productosAlertados.push(`• <strong>${p.nombre}</strong> (${p.categoria || ''}): <span style="color:red; font-weight:bold;">${stock} ${labels.unid}</span>`);
        }
    });

    if (productosAlertados.length > 0) {
        const contenedor = document.getElementById('modal-alerta-contenido');
        if (contenedor) {
            contenedor.innerHTML = `<p style="margin-bottom: 12px; font-weight: 500;">Atención, los siguientes productos requieren reabastecimiento:</p>` + productosAlertados.join('<br>');
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

function esPresentacionSaco(prod) {
    const catVal = String((prod && prod.categoria) || '').trim().toUpperCase();
    const nomVal = String((prod && prod.nombre) || '').trim().toUpperCase();
    return catVal.includes('ARROZ') || catVal.includes('AZUCAR') || catVal.includes('AZÚCAR') ||
        catVal.includes('MENESTRAS') ||
        nomVal.includes('ARROZ') || nomVal.includes('AZUCAR') || nomVal.includes('AZÚCAR') ||
        nomVal.includes('MENESTRAS');
}

function esProductoAGranel(prod) {
    const catVal = String((prod && prod.categoria) || '').trim().toUpperCase();
    const nomVal = String((prod && prod.nombre) || '').trim().toUpperCase();
    return catVal.includes('ARROZ') || catVal.includes('AZUCAR') || catVal.includes('AZÚCAR') ||
           catVal.includes('FIDEO') || catVal.includes('MENESTRAS') || catVal.includes('ACEITE') ||
           nomVal.includes('ARROZ') || nomVal.includes('AZUCAR') || nomVal.includes('AZÚCAR') ||
           nomVal.includes('FIDEO') || nomVal.includes('MENESTRAS') || nomVal.includes('ACEITE');
}

function etiquetasPresentaciones(prod) {
    const regla = reglaPresentacionProducto(prod);
    if (regla) {
        const porCampo = {};
        regla.slots.forEach(s => { porCampo[s.campo] = s.label; });
        return {
            unid: porCampo.Unid || 'Unid',
            doc: porCampo.Doc || '',
            paq: porCampo.Paq || '',
            caja: porCampo.Caja || '',
            tira: porCampo.Tira || '',
            docena: porCampo.Docena || ''
        };
    }
    const catVal = String((prod && prod.categoria) || '').trim().toUpperCase();
    const nomVal = String((prod && prod.nombre) || '').trim().toUpperCase();
    const esFideo = catVal.includes('FIDEO') || nomVal.includes('FIDEO');

    if (esPresentacionSaco(prod)) {
        return { unid: 'KG', doc: '10 KG', paq: catVal.includes('MENESTRAS') ? '1/4 Saco' : '1/2 Saco', caja: 'Saco' };
    } else if (esFideo) {
        return { unid: 'Unid', doc: 'KG', paq: 'Pqte', caja: 'Caja' };
    } else {
        return { unid: 'Unid', doc: 'Docena', paq: 'Pqte', caja: 'Caja' };
    }
}

function extraerPresentacionesProducto(prod) {
    return {
        costoUnid: aNumeroProd(primerValorDefinido(prod, ['costoUnid', 'costoKg', 'costo1'])),
        precioUnid: aNumeroProd(primerValorDefinido(prod, ['precioUnid', 'precioKg', 'precio1'])),
        stockUnid: aNumeroProd(primerValorDefinido(prod, ['stockUnid', 'stockKg', 'stock1'])),
        costoDoc: aNumeroProd(primerValorDefinido(prod, ['costoDoc', 'costo10kg', 'costo10Kg', 'costo2'])),
        precioDoc: aNumeroProd(primerValorDefinido(prod, ['precioDoc', 'precio10kg', 'precio10Kg', 'precio2'])),
        stockDoc: aNumeroProd(primerValorDefinido(prod, ['stockDoc', 'stock10kg', 'stock10Kg', 'stock2'])),
        costoPaq: aNumeroProd(primerValorDefinido(prod, ['costoPaq', 'precioCostoPqte', 'precio_costo_pqte', 'costoMedioSaco', 'costo12saco', 'costo3'])),
        precioPaq: aNumeroProd(primerValorDefinido(prod, ['precioPaq', 'precioMedioSaco', 'precio12saco', 'precio3'])),
        stockPaq: aNumeroProd(primerValorDefinido(prod, ['stockPaq', 'stockMedioSaco', 'stock12saco', 'stock3'])),
        costoCaja: aNumeroProd(primerValorDefinido(prod, ['costoCaja', 'costoCaia', 'costoSaco', 'costo4'])),
        precioCaja: aNumeroProd(primerValorDefinido(prod, ['precioCaja', 'precioSaco', 'precio4'])),
        stockCaja: aNumeroProd(primerValorDefinido(prod, ['stockCaja', 'stockSaco', 'stock4'])),
        costoTira: aNumeroProd(primerValorDefinido(prod, ['costoTira', 'costo_tira'])),
        precioTira: aNumeroProd(primerValorDefinido(prod, ['precioTira', 'precio_tira'])),
        stockTira: aNumeroProd(primerValorDefinido(prod, ['stockTira', 'stock_tira'])),
        costoDocena: aNumeroProd(primerValorDefinido(prod, ['costoDocena', 'costo_docena'])),
        precioDocena: aNumeroProd(primerValorDefinido(prod, ['precioDocena', 'precio_docena'])),
        stockDocena: aNumeroProd(primerValorDefinido(prod, ['stockDocena', 'stock_docena']))
    };
}

function fmtPrecioKardex(valor) {
    const n = aNumeroProd(valor);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function detalleCambiosInventario(anterior, siguiente) {
    const oldP = extraerPresentacionesProducto(anterior);
    const regla = reglaPresentacionProducto(siguiente);
    const presentaciones = regla
        ? regla.slots.map(slot => ({ key: slot.campo, label: slot.label }))
        : Object.values(CAMPOS_FORM_PRES)
            .filter(meta => meta.campo !== 'Tira' && meta.campo !== 'Docena')
            .map(meta => ({ key: meta.campo, label: meta.campo }));
    const cambios = [];
    presentaciones.forEach((u) => {
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

function leerPresentacionesFormulario(categoria) {
    const regla = reglaPresentacionProducto(categoria);
    const camposActivos = regla
        ? regla.slots.map(slot => CAMPOS_FORM_PRES[slot.id]).filter(Boolean)
        : Object.values(CAMPOS_FORM_PRES);
    return camposActivos.reduce((presentaciones, meta) => {
        presentaciones['costo' + meta.campo] = leerCampoNumero(meta.costo);
        presentaciones['precio' + meta.campo] = leerCampoNumero(meta.precio);
        presentaciones['stock' + meta.campo] = leerCampoNumero(meta.stock);
        return presentaciones;
    }, {});
}

async function guardarProductoLocal(e) {
    if (e) e.preventDefault();
    if (obtenerRol() === 'inventario_consulta') return;
    recargarListaProductos();
    recargarListaKardex();

    const editId = document.getElementById('p-id-edit').value;
    const prodAnterior = editId
        ? productos.find(p => String(p.id) === String(editId))
        : null;
    const imagenNueva = (document.getElementById('imagen-base64') || {}).value;
    const categoriaProducto = document.getElementById('p-categoria').value;
    const presentacionesForm = leerPresentacionesFormulario(categoriaProducto);
    const esPHX4 = categoriaProducto.trim().toUpperCase() === 'PHX4';
    const paquetesPlancha = esPHX4
        ? (Number(document.getElementById('p-paquetes-plancha')?.value) === 8 ? 8 : 6)
        : leerCampoNumero('p-unidades-caja');
    const productoData = {
        ...(prodAnterior || {}),
        id: editId ? parseInt(editId, 10) : Date.now(),
        nombre: document.getElementById('p-nombre').value,
        categoria: categoriaProducto,
        codigo: document.getElementById('p-codigo').value || 'Sin código',
        ...presentacionesForm,
        imagen: imagenNueva || (prodAnterior && prodAnterior.imagen) || 'https://via.placeholder.com/80',
        unidadesPaq: leerCampoNumero('p-unidades-paq'),
        unidadesCaja: paquetesPlancha,
        paquetesPlancha: esPHX4 ? paquetesPlancha : 0,
        kgPaq: leerCampoNumero('p-kg-paq'),
        kgCaja: leerCampoNumero('p-kg-caja'),
        // Nombres alternativos para compatibilidad
        unidades_paq: leerCampoNumero('p-unidades-paq'),
        unidades_caja: paquetesPlancha,
        kg_paq: leerCampoNumero('p-kg-paq'),
        kg_caja: leerCampoNumero('p-kg-caja')
    };
    normalizarPresentacionesCategoria(productoData);

    const fechaActual = new Date().toLocaleString('es-PE');
    if (editId) {
        const productoId = productoData.id;
        const index = productos.findIndex(p => String(p.id) === String(editId));
        if (index === -1) {
            alert('No se encontró el producto que intentas editar. No se guardaron los cambios.');
            return;
        }
        if (!supabaseClient || !checkOnlineStatus()) {
            alert('No se pudo conectar con Supabase. No se guardaron los cambios ni el movimiento en el Kárdex.');
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('productos')
                .update(productoParaSupabase(productoData))
                .eq('id', productoId)
                .select('*')
                .single();
            if (error) throw error;

            // Actualizar el producto local con los datos retornados de Supabase
            if (data) {
                productos[index] = data;
                // Guardar en localStorage
                localStorage.setItem('lista_productos', JSON.stringify(productos));
            }
        } catch (error) {
            console.error('Error al actualizar producto en Supabase:', error);
            alert('Supabase no pudo actualizar el producto. No se guardaron los cambios ni el movimiento en el Kárdex.');
            return;
        }

        const cambiosDetalle = detalleCambiosInventario(productos[index], productoData);
        const textoCantidad = cambiosDetalle.length > 0
            ? cambiosDetalle.join(' | ')
            : 'Actualización de parámetros';

        kardex.unshift({
            fecha: fechaActual,
            producto: productoData.nombre,
            tipo: 'Modificación de Producto',
            cantidad: textoCantidad,
            usuario: `${rol} (Edición de parámetros)`
        });

        // Refrescar la UI después de actualizar
        renderizarProductos();
    } else {
        productos.push(productoData);
        kardex.unshift({
            fecha: fechaActual,
            producto: productoData.nombre,
            tipo: 'Nuevo Producto',
            cantidad: `Stock: ${productoData.stockUnid}`,
            usuario: rol
        });
        syncProductoToSupabase(productoData);
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
    console.log('🔄 renderizarProductos() llamado, productos cargados:', productos.length);

    // Solo recargar desde localStorage si productos está vacío (evitar recarga innecesaria)
    if (!productos || productos.length === 0) {
        if (localStorage.getItem('lista_productos')) {
            try {
                productos = JSON.parse(localStorage.getItem('lista_productos')) || [];
                console.log('📥 Recargados productos desde localStorage:', productos.length);
            } catch (e) {
                productos = [];
            }
        }
    }

    const filtroLower = filtro.toLowerCase().trim();
    const prodsFiltrados = productos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        const categoria = (p.categoria || '').toLowerCase();
        return nombre.includes(filtroLower) || codigo.includes(filtroLower) || categoria.includes(filtroLower);
    });

    console.log(`🔍 Productos filtrados: ${prodsFiltrados.length}`);

    // Resetear páginas al cargar
    paginaInventario = 1;
    paginaCatalogo = 1;

    // Renderizar UNA SOLA VEZ sin recursividad
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
            const pres = extraerPresentacionesProducto(prod);
            const comerciales = listaPresentacionesComerciales(prod);
            let optsCompra = comerciales.map(p => `<option value="${p.label}|${p.precio}">${p.label} (S/ ${Number(p.precio).toFixed(2)})</option>`).join('');

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

async function confirmarCostosComanda() {
    if (!comandaActualAprobar) return;
    const estadoPago = document.getElementById('select-estado-comanda').value;
    comandaActualAprobar.estado = estadoPago;

    const fechaActual = new Date().toLocaleString('es-PE');
    let totalComanda = 0;
    let stockSupabaseActualizado = true;
    const itemsTicketComanda = [];

    for (const [idx, it] of comandaActualAprobar.items.entries()) {
        const costoInput = parseFloat(document.getElementById(`costo-item-${idx}`).value) || 0;
        const totalItem = costoInput * (Number(it.cantidad) || 0);
        totalComanda += totalItem;
        it.precioUnitario = costoInput.toFixed(2);
        it.total = totalItem.toFixed(2);
        itemsTicketComanda.push({
            desc: `${it.nombre} (${it.tipoPres})`,
            presentacion: it.tipoPres,
            cant: it.cantidad,
            precioUnitario: it.precioUnitario,
            total: it.total
        });

        const prod = productos.find(p => String(p.id) === String(it.id)) ||
            productos.find(p => p.nombre.toLowerCase() === it.nombre.toLowerCase());
        if (prod) {
            const cantidadIngresada = (Number(it.cantidad) || 0) * factorStockBasePorPresentacion(prod, it);
            prod.stockUnid = (parseFloat(prod.stockUnid) || 0) + cantidadIngresada;
            if (!await incrementarStockProductoEnSupabase(prod.id, cantidadIngresada, prod.nombre)) {
                stockSupabaseActualizado = false;
            }
        } else {
            console.error(`No se encontró el producto "${it.nombre}" para actualizar su stock.`);
            stockSupabaseActualizado = false;
        }

        const movimientoCompra = {
            fecha: fechaActual,
            producto: `${it.nombre} (${it.tipoPres})`,
            tipo: 'Compra Proveedor',
            cantidad: `+${it.cantidad} ${it.presentacion || it.unidad_medida || it.tipoPres}`,
            usuario: `${comandaActualAprobar.comandaId} (${estadoPago} S/ ${costoInput.toFixed(2)})`
        };
        kardex.unshift(movimientoCompra);
        await syncKardexToSupabase(movimientoCompra);
    }

    const movimientoPago = {
        ticketId: comandaActualAprobar.comandaId,
        fecha: fechaActual,
        producto: `Pago Comanda ${comandaActualAprobar.comandaId}`,
        tipo: `Comanda [${estadoPago}]`,
        cantidad: `- S/ ${totalComanda.toFixed(2)}`,
        usuario: `${comandaActualAprobar.usuario} (Admin Pagó)`,
        metodo: `Comanda [${estadoPago}]`,
        total: totalComanda.toFixed(2),
        items: itemsTicketComanda
    };
    kardex.unshift(movimientoPago);
    await syncKardexToSupabase(movimientoPago);

    const comandaHistorial = historialComandasRealizadas.find(item => item.comandaId === comandaActualAprobar.comandaId);
    if (comandaHistorial) {
        comandaHistorial.estado = estadoPago;
        comandaHistorial.total = totalComanda.toFixed(2);
        comandaHistorial.items = comandaActualAprobar.items.map(item => ({ ...item }));
    }

    comandas = comandas.filter(c => c.comandaId !== comandaActualAprobar.comandaId);

    localStorage.setItem('lista_comandas', JSON.stringify(comandas));
    localStorage.setItem('historial_comandas_realizadas', JSON.stringify(historialComandasRealizadas));
    localStorage.setItem('lista_productos', JSON.stringify(productos));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));

    alert(stockSupabaseActualizado
        ? "Comanda procesada e inventario actualizado correctamente."
        : "Comanda procesada localmente, pero no se pudo actualizar todo el stock en Supabase. Revise la consola y los productos pendientes de sincronización.");
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
    const totalComanda = cmd.items.reduce((total, item) => {
        const precio = Number(item.precioUnitario ?? item.precioEstimado) || 0;
        return total + (Number(item.total) || precio * (Number(item.cantidad) || 0));
    }, 0);
    document.getElementById('t-total').textContent = Number(cmd.total || cmd.totalEstimado || totalComanda).toFixed(2);

    const tbody = document.getElementById('t-items');
    tbody.innerHTML = cmd.items.map(it => filaItemTicket({
        ...it,
        desc: it.nombre,
        presentacion: it.tipoPres,
        cant: it.cantidad,
    })).join('');
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
    const labels = etiquetasPresentaciones(prod);

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

    const reglaCodigo = reglaPresentacionProducto(prod);
    if (reglaCodigo) {
        tipoPres = 'unid';
        const slotUnidad = slotPorTipo(prod, 'unid');
        precioPres = pres.precioUnid > 0 ? pres.precioUnid : (slotUnidad ? slotUnidad.precio : 0);
        stockDisponible = pres.stockUnid || 0;
    }

    const itemKey = `${prod.id}-${tipoPres}`;
    const item = carrito.find(i => i.key === itemKey);
    const cantidadEnCarrito = item ? item.cantidad : 0;
    const factorCodigo = reglaCodigo ? factorDePresentacion(prod, tipoPres) : 1;
    const reservadasCodigo = unidadesReservadasCarrito(prod.id, null);
    const topeCodigo = reglaCodigo ? (pres.stockUnid || 0) : stockDisponible;

    if (reservadasCodigo + factorCodigo > topeCodigo && reglaCodigo) {
        alert(`❌ Stock insuficiente. Solo quedan ${Math.max(0, (pres.stockUnid || 0) - reservadasCodigo)} ${reglaCodigo.unidadBase}.`);
        return;
    }
    if (!reglaCodigo && cantidadEnCarrito + 1 > stockDisponible) {
        alert(`❌ Stock insuficiente. Solo quedan ${stockDisponible} disponible(s) de ${labels.unid}.`);
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
            precio_unitario_aplicado: precioPres,
            cantidad: 1,
            stockMax: reglaCodigo ? Math.floor(Math.max(0, (pres.stockUnid || 0) - reservadasCodigo) / factorCodigo) : stockDisponible,
            factorUnidades: reglaCodigo ? factorCodigo : 1,
            etiquetaPres: reglaCodigo ? etiquetaDePresentacion(prod, tipoPres) : ''
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

    // Manejar venta por monto para productos a granel
    if (tipoPres === 'monto') {
        const montoInput = document.getElementById(`monto-${id}`);
        const montoIngresado = parseFloat(montoInput.value) || 0;

        if (montoIngresado <= 0) {
            alert('Por favor ingrese un monto válido.');
            return;
        }

        const pres = extraerPresentacionesProducto(prod);
        const kgCalculados = montoIngresado / pres.precioUnid;

        if (kgCalculados > pres.stockUnid) {
            alert(`❌ Stock insuficiente. Solo quedan ${pres.stockUnid.toFixed(2)} KG disponible(s).`);
            return;
        }

        const itemKey = `${id}-monto`;
        const item = carrito.find(i => i.key === itemKey);

        if (item) {
            item.cantidad += kgCalculados;
            item.montoTotal += montoIngresado;
        } else {
            carrito.push({
                key: itemKey,
                id: prod.id,
                tipoPres: 'monto',
                nombre: prod.nombre,
                precio: pres.precioUnid,
                precio_unitario_aplicado: pres.precioUnid,
                cantidad: kgCalculados,
                montoTotal: montoIngresado,
                stockMax: pres.stockUnid
            });
        }

        // Limpiar el input de monto
        montoInput.value = '';
        montoInput.style.display = 'none';

        actualizarCarritoUI();
        return;
    }

    // Lógica normal para otras presentaciones
    const itemKey = `${id}-${tipoPres}`;
    const item = carrito.find(i => i.key === itemKey);
    const cantidadEnCarrito = item ? item.cantidad : 0;
    const reglaVenta = reglaPresentacionProducto(prod);
    const factorVenta = reglaVenta ? factorDePresentacion(prod, tipoPres) : 1;
    const etiquetaVenta = reglaVenta ? etiquetaDePresentacion(prod, tipoPres) : '';

    if (reglaVenta) {
        const reservadas = unidadesReservadasCarrito(id, null);
        const sueltos = parseFloat(prod.stockUnid) || 0;
        if (reservadas + factorVenta > sueltos) {
            const quedan = Math.max(0, sueltos - reservadas);
            alert(`❌ Stock insuficiente. Quedan ${quedan} ${reglaVenta.unidadBase} y esta presentación descuenta ${factorVenta}.`);
            return;
        }
    } else if (cantidadEnCarrito + 1 > prod.stockUnid) {
        alert(`❌ Stock insuficiente. Solo quedan ${prod.stockUnid} disponible(s).`);
        return;
    }

    if (item) {
        item.cantidad += 1;
        if (reglaVenta) {
            item.factorUnidades = factorVenta;
            item.etiquetaPres = etiquetaVenta;
            const otras = unidadesReservadasCarrito(id, item.key);
            const sueltos = parseFloat(prod.stockUnid) || 0;
            item.stockMax = Math.floor(Math.max(0, sueltos - otras) / factorVenta);
        }
    } else {
        const otras = reglaVenta ? unidadesReservadasCarrito(id, null) : 0;
        const sueltos = parseFloat(prod.stockUnid) || 0;
        carrito.push({
            key: itemKey,
            id: prod.id,
            tipoPres: tipoPres,
            nombre: prod.nombre,
            precio: precioPres,
            precio_unitario_aplicado: precioPres,
            cantidad: 1,
            stockMax: reglaVenta ? Math.floor(Math.max(0, sueltos - otras) / factorVenta) : prod.stockUnid,
            factorUnidades: factorVenta,
            etiquetaPres: etiquetaVenta
        });
    }
    actualizarCarritoUI();
}

function habilitarInputMonto(prodId, valor) {
    const tipoPres = valor.split('|')[0];
    const montoInput = document.getElementById(`monto-${prodId}`);

    if (tipoPres === 'monto') {
        montoInput.style.display = 'block';
        montoInput.focus();
    } else {
        montoInput.style.display = 'none';
        montoInput.value = '';
    }
}

function cambiarCantidad(key, delta) {
    const item = carrito.find(i => i.key === key);
    if (item) {
        if (item.tipoPres === 'monto') {
            // Para venta por monto, calcular el nuevo monto y KG
            const nuevoMonto = Math.round((item.montoTotal + delta * item.precio) * 100) / 100;
            const nuevoKG = nuevoMonto / item.precio;

            if (nuevoKG > item.stockMax) {
                alert(`❌ Stock insuficiente. El límite es ${item.stockMax.toFixed(2)} KG.`);
                return;
            }

            item.montoTotal = nuevoMonto;
            item.cantidad = nuevoKG;

            if (item.montoTotal <= 0) carrito = carrito.filter(i => i.key !== key);
        } else {
            const prodItem = productos.find(p => String(p.id) === String(item.id));
            const reglaItem = prodItem && reglaPresentacionProducto(prodItem);
            if (reglaItem) {
                const factor = item.factorUnidades || factorDePresentacion(prodItem, item.tipoPres);
                item.factorUnidades = factor;
                const otras = unidadesReservadasCarrito(item.id, item.key);
                const sueltos = parseFloat(prodItem.stockUnid) || 0;
                item.stockMax = Math.floor(Math.max(0, sueltos - otras) / factor);
            }
            const nuevaCant = Math.round((item.cantidad + delta) * 100) / 100;
            if (nuevaCant > item.stockMax) {
                const detalle = reglaItem
                    ? ` Quedan ${Math.max(0, (parseFloat(prodItem.stockUnid) || 0) - unidadesReservadasCarrito(item.id, item.key))} ${reglaItem.unidadBase}.`
                    : '';
                alert(`❌ Stock insuficiente. El límite es ${item.stockMax}.${detalle}`);
                return;
            }
            item.cantidad = nuevaCant;
            if (item.cantidad <= 0) carrito = carrito.filter(i => i.key !== key);
        }
    }
    actualizarCarritoUI();
}

function modificarCantidadDirecta(key, valor) {
    const item = carrito.find(i => i.key === key);
    const num = parseFloat(valor);
    if (item) {
        if (item.tipoPres === 'monto') {
            // Para venta por monto, el valor ingresado es el monto en soles
            if (!isNaN(num) && num > 0) {
                const nuevoKG = num / item.precio;
                if (nuevoKG > item.stockMax) {
                    alert(`❌ Stock insuficiente. El máximo es ${item.stockMax.toFixed(2)} KG.`);
                    item.montoTotal = item.stockMax * item.precio;
                    item.cantidad = item.stockMax;
                } else {
                    item.montoTotal = num;
                    item.cantidad = nuevoKG;
                }
            } else if (valor === '' || num <= 0) {
                item.montoTotal = 0;
                item.cantidad = 0;
            }
        } else {
            const prodItem = productos.find(p => String(p.id) === String(item.id));
            const reglaItem = prodItem && reglaPresentacionProducto(prodItem);
            if (reglaItem) {
                const factor = item.factorUnidades || factorDePresentacion(prodItem, item.tipoPres);
                item.factorUnidades = factor;
                const otras = unidadesReservadasCarrito(item.id, item.key);
                const sueltos = parseFloat(prodItem.stockUnid) || 0;
                item.stockMax = Math.floor(Math.max(0, sueltos - otras) / factor);
            }
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
    }
    actualizarCarritoUI();
}

function eliminarDelCarrito(key) {
    carrito = carrito.filter(i => i.key !== key);
    actualizarCarritoUI();
}

function precioUnitarioAplicado(item) {
    const precio = Number(item.precio_unitario_aplicado ?? item.precio);
    return Number.isFinite(precio) ? precio : 0;
}

function subtotalItemCarrito(item) {
    if (item.tipoPres === 'monto' && item.precio_personalizado === undefined) {
        return Number(item.montoTotal) || 0;
    }
    return precioUnitarioAplicado(item) * (Number(item.cantidad) || 0);
}

function modificarPrecioCarrito(key, valor) {
    if (rolUsuario !== 'admin') return;

    const item = carrito.find(i => i.key === key);
    const precio = Number(valor);
    if (!item || !Number.isFinite(precio) || precio < 0) {
        alert('Ingrese un precio válido para el producto.');
        actualizarCarritoUI();
        return;
    }

    item.precio_personalizado = precio;
    item.precio_unitario_aplicado = precio;
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
        let subtotal;
        let displayInfo;

        if (item.tipoPres === 'monto') {
            // Para venta por monto, usar el monto total directamente
            subtotal = subtotalItemCarrito(item);
            displayInfo = `💰 S/ ${subtotal.toFixed(2)} (${item.cantidad.toFixed(2)} KG)`;
        } else {
            const precio = precioUnitarioAplicado(item);
            subtotal = subtotalItemCarrito(item);
            const unidadesTxt = item.factorUnidades > 1
                ? ` · ${item.cantidad * item.factorUnidades} unid`
                : '';
            const presTxt = item.etiquetaPres ? `${item.etiquetaPres} · ` : '';
            displayInfo = `${presTxt}S/ ${precio.toFixed(2)} x ${item.cantidad}${unidadesTxt}`;
        }

        total += subtotal;
        const editorPrecio = rolUsuario === 'admin'
            ? `<label style="display:block; margin-top:4px; font-size:11px;">Precio unitario S/
                <input type="number" min="0" step="0.01" value="${precioUnitarioAplicado(item).toFixed(2)}"
                    aria-label="Precio unitario de ${item.nombre}"
                    onchange="modificarPrecioCarrito('${item.key}', this.value)"
                    style="width:76px; margin-left:4px;"></label>`
            : '';

        contenedor.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nombre}</div>
                    <div class="cart-item-sub">${displayInfo} = <strong>S/ ${subtotal.toFixed(2)}</strong></div>
                    ${editorPrecio}
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
    if (requiereAperturaCajaHoy()) {
        alert('Debe registrar la apertura de caja de hoy antes de iniciar las ventas.');
        window.location.href = 'caja.html';
        return;
    }
    if (cajaEstaCerradaHoy()) {
        alert('La caja está cerrada por hoy. No se pueden registrar más ventas.');
        return;
    }
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

function preciosOficialesProducto(prod, tipoPres) {
    const pres = extraerPresentacionesProducto(prod);
    const tipo = String(tipoPres || '').toLowerCase();
    const camposPorTipo = {
        monto: 'Unid',
        unid: 'Unid',
        doc: 'Doc',
        promocion: 'Doc',
        paq: 'Paq',
        caja: 'Caja',
        tira: 'Tira',
        docena: 'Docena'
    };
    const campo = camposPorTipo[tipo] || 'Unid';

    return {
        precio: Number(pres[`precio${campo}`]) || 0,
        costo: Number(pres[`costo${campo}`]) || 0
    };
}

function confirmarCobro() {
    if (requiereAperturaCajaHoy()) {
        alert('Debe registrar la apertura de caja de hoy antes de iniciar las ventas.');
        window.location.href = 'caja.html';
        return;
    }
    if (cajaEstaCerradaHoy()) {
        alert('La caja está cerrada por hoy. No se pueden registrar más ventas.');
        return;
    }

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
    const itemsTicket = carrito.map(item => {
        const producto = productos.find(prod => String(prod.id) === String(item.id));
        const presentacion = item.etiquetaPres ||
            (producto && item.tipoPres !== 'monto'
                ? etiquetaDePresentacion(producto, item.tipoPres)
                : (item.tipoPres === 'monto' ? 'KG' : item.tipoPres));
        const precioAplicado = precioUnitarioAplicado(item);
        const total = item.tipoPres === 'monto' && item.precio_personalizado === undefined
            ? Number(item.montoTotal) || 0
            : precioAplicado * (Number(item.cantidad) || 0);
        const preciosOficiales = producto
            ? preciosOficialesProducto(producto, item.tipoPres)
            : { precio: Number(item.precio) || 0, costo: 0 };

        return {
            desc: item.nombre,
            presentacion,
            tipoPres: item.tipoPres,
            cant: item.cantidad,
            precioUnitario: precioAplicado.toFixed(2),
            precio_unitario_aplicado: precioAplicado,
            precio_personalizado: item.precio_personalizado ?? null,
            precio_catalogo: preciosOficiales.precio,
            costo_catalogo: preciosOficiales.costo,
            valor_precio_catalogo: preciosOficiales.precio * (Number(item.cantidad) || 0),
            valor_costo_catalogo: preciosOficiales.costo * (Number(item.cantidad) || 0),
            total: total.toFixed(2)
        };
    });
    const fechaActual = new Date().toLocaleString('es-PE');
    const ticketId = 'TK-' + Math.floor(1000 + Math.random() * 9000);

    let metodoPagoTexto = metodoPagoSeleccionado;
    if(metodoPagoSeleccionado === 'Mixto') {
        metodoPagoTexto = `Mixto (Efectivo: S/ ${montoEfectivo.toFixed(2)}, Yape: S/ ${montoYape.toFixed(2)})`;
    }

    const movimientoTicket = {
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
        items: itemsTicket
    };
    kardex.unshift(movimientoTicket);
    syncKardexToSupabase(movimientoTicket);

    carrito.forEach(item => {
        detalles.push(`${item.nombre} x${item.cantidad}`);

        const prod = productos.find(p => p.id === item.id);
        if (prod) {
            const reglaVenta = reglaPresentacionProducto(prod);
            const esCategoriaSaco = esPresentacionSaco(prod);
            const esAGranel = esProductoAGranel(prod);
            const pres = extraerPresentacionesProducto(prod);

            if (reglaVenta) {
                const factor = factorStockBasePorPresentacion(prod, item);
                const cantidadADescontar = (parseFloat(item.cantidad) || 0) * factor;
                const stockDisponible = parseFloat(prod.stockUnid) || 0;
                const etiqueta = item.etiquetaPres || etiquetaDePresentacion(prod, item.tipoPres);

                if (cantidadADescontar > stockDisponible) {
                    alert(`❌ Stock insuficiente. Solo quedan ${stockDisponible} ${reglaVenta.unidadBase} de ${prod.nombre}.`);
                    return;
                }

                prod.stockUnid = Math.max(0, stockDisponible - cantidadADescontar);
                kardex.unshift({
                    fecha: fechaActual,
                    producto: item.nombre,
                    tipo: 'Venta',
                    cantidad: `-${cantidadADescontar} ${reglaVenta.unidadBase} (${item.cantidad} ${etiqueta})`,
                    usuario: `${rol} (${metodoPagoSeleccionado})`
                });
            } else if (esAGranel) {
                // Descuento directo al stock de KG/Unidades
                const cantidadADescontar = (parseFloat(item.cantidad) || 0) * factorStockBasePorPresentacion(prod, item);
                const stockDisponible = pres.stockUnid || 0;
                const esMenestras = String(prod.categoria || '').trim().toUpperCase().includes('MENESTRAS');
                const presentacionVenta = item.etiquetaPres || etiquetaDePresentacion(prod, item.tipoPres);
                const esVentaCuartoMenestras = esMenestras && String(presentacionVenta).includes('1/4');

                if (cantidadADescontar > stockDisponible) {
                    alert(`❌ Stock insuficiente. Solo quedan ${stockDisponible.toFixed(2)} KG/Unid disponible(s) de ${prod.nombre}.`);
                    return;
                }

                // Descontar directamente del stock
                prod.stockUnid = Math.max(0, prod.stockUnid - cantidadADescontar);
                kardex.unshift({
                    fecha: fechaActual,
                    producto: item.nombre,
                    tipo: item.tipoPres === 'monto' ? 'Venta por Monto' : 'Venta a Granel',
                    cantidad: esVentaCuartoMenestras
                        ? `-${cantidadADescontar.toFixed(2)} KG (${item.cantidad} ${presentacionVenta})`
                        : `-${cantidadADescontar.toFixed(2)} KG/Unid (S/ ${subtotalItemCarrito(item).toFixed(2)})`,
                    usuario: `${rol} (${metodoPagoSeleccionado})`
                });
            } else {
                // Para otros productos: conversión automática de stock
                let cantidadADescontar = (parseFloat(item.cantidad) || 0) * factorStockBasePorPresentacion(prod, item);
                let stockDisponible = pres.stockUnid || 0;

                // Si el stock de unidades/KG es insuficiente, intentar convertir de presentaciones mayores
                if (cantidadADescontar > stockDisponible) {
                    const deficit = cantidadADescontar - stockDisponible;

                    if (esCategoriaSaco) {
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
        }
    });

    localStorage.setItem('lista_productos', JSON.stringify(productos));
    localStorage.setItem('lista_kardex', JSON.stringify(kardex));

    // Sincronizar venta y productos con Supabase
    syncVentaToSupabase({
        ticketId: ticketId,
        fecha: fechaActual,
        items: itemsTicket,
        total: totalPagarActual,
        metodoPago: metodoPagoTexto,
        montoEfectivo: montoEfectivo,
        montoYape: montoYape,
        usuario: rol,
        vendedor: rol
    });

    // Sincronizar productos actualizados
    carrito.forEach(item => {
        const prod = productos.find(p => p.id === item.id);
        if (prod) {
            syncProductoToSupabase(prod);
        }
    });

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

function cajaEstaCerradaHoy() {
    return localStorage.getItem('caja_estado') === 'CERRADA' &&
        localStorage.getItem('caja_estado_fecha') === obtenerFechaCajaLocal();
}

function requiereAperturaCajaHoy() {
    return rol === 'vendedor' && localStorage.getItem('caja_apertura_fecha') !== obtenerFechaCajaLocal();
}

function actualizarEstadoVisualCaja() {
    const estado = document.getElementById('estado-caja');
    if (!estado) return;
    const cerrada = cajaEstaCerradaHoy();
    const pendienteApertura = !cerrada && requiereAperturaCajaHoy();
    estado.textContent = cerrada ? 'CERRADA' : (pendienteApertura ? 'PENDIENTE APERTURA' : 'ABIERTA');
    estado.style.color = cerrada ? '#f87171' : (pendienteApertura ? '#fbbf24' : '#4ade80');
    const resumenApertura = document.getElementById('resumen-apertura-caja');
    const resumenCierre = document.getElementById('resumen-cierre-caja');
    const montoCierre = document.getElementById('monto-cierre');
    if (resumenApertura) resumenApertura.style.display = cerrada ? 'none' : '';
    if (resumenCierre) resumenCierre.style.display = cerrada ? '' : 'none';
    if (cerrada && montoCierre) {
        montoCierre.textContent = (parseFloat(localStorage.getItem('caja_monto_cierre')) || 0).toFixed(2);
    }
}

function obtenerResumenCajaHoy() {
    const fechaHoyStr = new Date().toLocaleDateString('es-PE');
    let totalYapeHoy = 0, totalEfectivoHoy = 0, totalGastosHoy = 0;
    const ventasDelDia = kardex.filter(k =>
        k.ticketId && k.fecha && k.fecha.includes(fechaHoyStr) && !k.ticketId.startsWith('CMD-')
    );

    ventasDelDia.forEach(k => {
        if (k.metodo === 'Yape' || k.tipo === 'Yape') {
            totalYapeHoy += parseFloat(k.total || k.cantidad) || 0;
        } else if (k.metodo === 'Efectivo' || k.tipo === 'Efectivo') {
            totalEfectivoHoy += parseFloat(k.total || k.cantidad) || 0;
        } else if (k.metodo && k.metodo.includes('Mixto')) {
            totalEfectivoHoy += parseFloat(k.montoEfectivo || 0) || 0;
            totalYapeHoy += parseFloat(k.montoYape || 0) || 0;
        }
    });

    const gastosDelDiaHoy = gastosDelDia.filter(g => g.fecha && g.fecha.includes(fechaHoyStr));
    gastosDelDiaHoy.forEach(g => {
        totalGastosHoy += parseFloat(g.monto) || 0;
    });
    return { ventasDelDia, gastosDelDiaHoy, totalYapeHoy, totalEfectivoHoy, totalGastosHoy };
}

function registrarEstadoCierreCaja(fecha = new Date()) {
    const fechaCaja = obtenerFechaCajaLocal(fecha);
    if (localStorage.getItem('caja_estado') === 'CERRADA' &&
        localStorage.getItem('caja_estado_fecha') === fechaCaja) return false;

    const resumen = obtenerResumenCajaHoy();
    const efectivoFinal = Number((montoInicialCaja + resumen.totalEfectivoHoy - resumen.totalGastosHoy).toFixed(2));
    localStorage.setItem('caja_estado', 'CERRADA');
    localStorage.setItem('caja_estado_fecha', fechaCaja);
    localStorage.setItem('caja_monto_cierre', efectivoFinal.toFixed(2));
    localStorage.setItem('caja_hora_cierre', fecha.toISOString());
    actualizarEstadoVisualCaja();
    return true;
}

function verificarCierreAutomaticoCaja() {
    const ahora = new Date();
    if (ahora.getHours() >= 19 && !cajaEstaCerradaHoy()) {
        registrarEstadoCierreCaja(ahora);
    }
    actualizarEstadoVisualCaja();
}

function programarCierreAutomaticoCaja() {
    verificarCierreAutomaticoCaja();
    const ahora = new Date();
    const cierreHoy = new Date(ahora);
    cierreHoy.setHours(19, 0, 0, 0);
    if (ahora < cierreHoy) {
        window.setTimeout(verificarCierreAutomaticoCaja, cierreHoy.getTime() - ahora.getTime());
    }
    window.setInterval(verificarCierreAutomaticoCaja, 60 * 1000);
}

function renderizarVistaCaja() {
    const { totalYapeHoy, totalEfectivoHoy, totalGastosHoy } = obtenerResumenCajaHoy();

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
    if (requiereAperturaCajaHoy()) {
        alert('Debe registrar la apertura de caja de hoy antes de registrar salidas.');
        window.location.href = 'caja.html';
        return;
    }
    if (cajaEstaCerradaHoy()) {
        alert('La caja está cerrada por hoy. No se pueden registrar más salidas.');
        return;
    }

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
    const { ventasDelDia, gastosDelDiaHoy, totalYapeHoy, totalEfectivoHoy, totalGastosHoy } = obtenerResumenCajaHoy();

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

function precioUnitarioTicket(item) {
    const precio = Number(
        item.precio_unitario || item.precio || item.precioVenta ||
        item.precioUnitario || item.precioEstimado || 0
    );
    return Number.isFinite(precio) ? precio : 0;
}

function filaItemTicket(item) {
    const cantidad = Number(item.cant ?? item.cantidad) || 0;
    const precioUnitario = precioUnitarioTicket(item);
    const total = precioUnitario * cantidad;
    const presentacion = item.presentacion || item.etiquetaPres || '';
    const descripcion = presentacion && !String(item.desc || '').includes(presentacion)
        ? `${item.desc} (${presentacion})`
        : (item.desc || item.nombre || '');

    return `<tr>
        <td style="color:#000 !important;">${descripcion}</td>
        <td style="color:#000 !important;">x${cantidad}</td>
        <td style="text-align:right; color:#000 !important;">S/ ${precioUnitario.toFixed(2)} c/u<br><small>Total: S/ ${total.toFixed(2)}</small></td>
    </tr>`;
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
        tbody.innerHTML = k.items.map(filaItemTicket).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="3" style="color:#000 !important;">${k.producto || k.detalle}</td></tr>`;
    }
    document.getElementById('modal-ticket').style.display = 'flex';
}
function aplicarRestriccionesPorRol() {
    const rolUsuario = obtenerRol();
    const esInventarioConsulta = rolUsuario === 'inventario_consulta';
    
    // IDs EXACTOS definidos en el HTML para los costos
    const idsCostos = Object.values(CAMPOS_FORM_PRES).map(meta => meta.costo);
    
    const inputNombre = document.getElementById('p-nombre');
    const inputCategoria = document.getElementById('p-categoria');
    const inputCodigo = document.getElementById('p-codigo');
    const tituloForm = document.getElementById('titulo-form-producto') || document.querySelector('.form-title');
    mostrarEl('card-inventario-form', !esInventarioConsulta, 'flex');

    if (esInventarioConsulta) {
        document.body.classList.add('rol-inventario-consulta');
        document.querySelectorAll('.campo-costo-admin').forEach(el => { el.style.display = 'none'; });
    } else if (rolUsuario === 'vendedor') {
        // Asignar clase al body para ocultar por CSS y por JS
        document.body.classList.add('rol-vendedor');
        document.body.classList.remove('rol-inventario-consulta');
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
        document.body.classList.remove('rol-inventario-consulta');
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
    if (obtenerRol() === 'inventario_consulta') return;
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
        let catForm = prod.categoria || '';
        if (String(catForm).trim().toUpperCase() === 'GUSTAS') catForm = 'GUSTA';
        inputCategoria.value = catForm;
        actualizarNombresPresentaciones();
    }

    const inputCodigo = document.getElementById('p-codigo');
    if (inputCodigo) inputCodigo.value = prod.codigo || '';

    Object.values(CAMPOS_FORM_PRES).forEach(meta => {
        setCampoForm(meta.costo, pres['costo' + meta.campo], 0);
        setCampoForm(meta.precio, pres['precio' + meta.campo], 0);
        setCampoForm(meta.stock, pres['stock' + meta.campo], 0);
    });
    if (String(prod.categoria || '').trim().toUpperCase() === 'PHX4') {
        setCampoForm('p-stock-paq', pres.stockUnid, 0);
    }

    const reglaEdicion = reglaPresentacionProducto(prod);
    if (reglaEdicion) {
        reglaEdicion.slots.forEach((slot) => {
            const meta = CAMPOS_FORM_PRES[slot.id];
            const inputPrecio = meta && document.getElementById(meta.precio);
            if (inputPrecio && !(parseFloat(inputPrecio.value) > 0)) inputPrecio.value = slot.precio;
        });
    }

    setCampoForm('p-unidades-paq', prod.unidadesPaq || 0);
    setCampoForm('p-unidades-caja', prod.unidadesCaja || 0);
    setCampoForm('p-kg-paq', prod.kgPaq || 0);
    setCampoForm('p-kg-caja', prod.kgCaja || 0);

    // Cargar también si existen con nombres alternativos por compatibilidad
    if (!prod.unidadesPaq && prod.unidades_paq) setCampoForm('p-unidades-paq', prod.unidades_paq);
    if (!prod.unidadesCaja && prod.unidades_caja) setCampoForm('p-unidades-caja', prod.unidades_caja);
    if (!prod.kgPaq && prod.kg_paq) setCampoForm('p-kg-paq', prod.kg_paq);
    if (!prod.kgCaja && prod.kg_caja) setCampoForm('p-kg-caja', prod.kg_caja);

    if (String(prod.categoria || '').trim().toUpperCase() === 'PHX4') {
        const paquetesPlancha = Number(prod.paquetesPlancha ?? prod.unidadesCaja ?? prod.unidades_caja);
        setCampoForm('p-paquetes-plancha', paquetesPlancha === 8 ? 8 : 6);
        setCampoForm('p-stock-paq', pres.stockUnid, 0);
        actualizarNombresPresentaciones();
    }

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
    if (obtenerRol() === 'inventario_consulta') return;
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
    // No recargar desde localStorage, ya tenemos los datos en memoria
    const filtroActual = document.querySelector('#card-inventario-lista .search-input')?.value || '';
    paginaInventario = pagina;
    filtrarInventarioSinReset(filtroActual);
}

function cambiarPaginaCatalogo(pagina) {
    // No recargar desde localStorage, ya tenemos los datos en memoria
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

    // Si no existe la tabla de inventario, no hacer nada
    if (!tablaInventario) {
        console.warn('⚠️ No se encontró la tabla de inventario (#tabla-inventario)');
        return;
    }

    console.log(`📊 Renderizando ${listaProductos.length} productos en la tabla de inventario`);

    if (tablaInventario) tablaInventario.innerHTML = '';
    if (catalogoVentas) catalogoVentas.innerHTML = '';
    if (catalogoCompras) catalogoCompras.innerHTML = '';

    // Eliminar paginación anterior del catálogo si existe
    const paginacionCat = document.getElementById('paginacion-catalogo');
    if (paginacionCat) paginacionCat.remove();

    const tituloCat = document.getElementById('titulo-catalogo');
    if (tituloCat) tituloCat.textContent = `Catálogo (${listaProductos.length})`;

    const rolActual = obtenerRol();

    // Paginación para inventario
    const inicioInv = (paginaInventario - 1) * itemsPorPagina;
    const finInv = inicioInv + itemsPorPagina;
    const productosPaginaInventario = listaProductos.slice(inicioInv, finInv);

    // Construir HTML de filas en un string para evitar múltiples manipulaciones del DOM
    let filasHTML = '';

    productosPaginaInventario.forEach(prod => {
        const pres = extraerPresentacionesProducto(prod);
        const labels = etiquetasPresentaciones(prod);
        const reglaCat = reglaPresentacionProducto(prod);
        const comerciales = listaPresentacionesComerciales(prod);

        const coloresPrecio = ['#38bdf8', '#fbbf24', '#c084fc', '#f87171'];
        let preciosHTML = comerciales.map((p, idx) => {
            const sep = idx ? '<br>' : '';
            return `${sep}<span class="price-badge" style="color:${coloresPrecio[idx] || '#38bdf8'};">${p.label}: S/ ${Number(p.precio).toFixed(2)}</span>`;
        }).join('');

        let costosHTML = '';
        if (rolActual !== 'vendedor' && rolActual !== 'inventario_consulta') {
            const presentacionesCosto = reglaCat
                ? reglaCat.slots.map(slot => ({
                    campo: slot.campo,
                    label: slot.label
                }))
                : [
                    { campo: 'Unid', label: labels.unid },
                    { campo: 'Doc', label: labels.doc },
                    { campo: 'Paq', label: labels.paq },
                    { campo: 'Caja', label: labels.caja },
                    { campo: 'Tira', label: labels.tira },
                    { campo: 'Docena', label: labels.docena }
                ];
            const costoPrincipal = presentacionesCosto
                .map(p => ({ ...p, valor: pres['costo' + p.campo] }))
                .find(p => Number.isFinite(p.valor) && p.valor > 0);
            const costoPrincipalHTML = pres.costoUnid <= 0 && costoPrincipal
                ? `<span class="price-badge" style="color:#4ade80;">Costo principal (${costoPrincipal.label}): S/ ${costoPrincipal.valor.toFixed(2)}</span>`
                : '';
            const costosPresentacionesHTML = presentacionesCosto
                .filter(p => pres['costo' + p.campo] > 0)
                .map(p => `<span class="price-badge" style="color:#4ade80;">Costo ${p.label}: S/ ${pres['costo' + p.campo].toFixed(2)}</span>`)
                .join('<br>');
            costosHTML = [costoPrincipalHTML, costosPresentacionesHTML].filter(Boolean).join('<br>');
        } else if (rolActual === 'vendedor') {
            costosHTML = `<span style="color: #64748b; font-style: italic;">Oculto</span>`;
        }

        let stockHTML = '';
        if (reglaCat) {
            stockHTML = `<span class="price-badge" style="color:#4ade80;">${reglaCat.unidadBase}: ${pres.stockUnid || 0}</span>`;
            const eqs = reglaCat.slots.filter(s => s.factor > 1).map(s => `${s.nombreCorto}=${s.factor}`).join(' · ');
            if (eqs) stockHTML += `<br><span class="price-badge" style="color:#94a3b8; font-size:10px;">Descuenta: ${eqs}</span>`;
        } else {
            stockHTML = `<span class="price-badge" style="color:#4ade80;">${labels.unid}: ${pres.stockUnid || 0}</span>`;
            if (pres.stockDoc > 0) stockHTML += `<br><span class="price-badge" style="color:#4ade80;">${labels.doc}: ${pres.stockDoc}</span>`;
            if (pres.stockPaq > 0) stockHTML += `<br><span class="price-badge" style="color:#4ade80;">${labels.paq}: ${pres.stockPaq}</span>`;
            if (pres.stockCaja > 0) stockHTML += `<br><span class="price-badge" style="color:#4ade80;">${labels.caja}: ${pres.stockCaja}</span>`;
        }

        // Mostrar conversiones si existen
        const esPHX4 = String(prod.categoria || '').trim().toUpperCase() === 'PHX4';
        const convPaq = prod.unidadesPaq || prod.unidades_paq || 0;
        const convCaja = prod.unidadesCaja || prod.unidades_caja || 0;
        const convKgPaq = prod.kgPaq || prod.kg_paq || 0;
        const convKgCaja = prod.kgCaja || prod.kg_caja || 0;

        if (esPHX4) {
            stockHTML += `<br><span class="price-badge" style="color:#fbbf24; font-size:10px;">Plancha: ${reglaCat.slots.find(slot => slot.tipo === 'caja').factor} paquetes</span>`;
        } else if (convPaq > 0 || convCaja > 0 || convKgPaq > 0 || convKgCaja > 0) {
            stockHTML += `<br><span class="price-badge" style="color:#fbbf24; font-size:10px;">Conv: `;
            if (convPaq > 0) stockHTML += `${convPaq}U/Pq `;
            if (convCaja > 0) stockHTML += `${convCaja}U/Cja `;
            if (convKgPaq > 0) stockHTML += `${convKgPaq}KG/Pq `;
            if (convKgCaja > 0) stockHTML += `${convKgCaja}KG/Cja`;
            stockHTML += `</span>`;
        }

        let accionesTd = '';
        if (rolActual !== 'vendedor' && rolActual !== 'inventario_consulta') {
            accionesTd = `
                <td>
                    <button onclick="editarProducto(${prod.id})" style="background: #2563eb; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">Editar</button>
                    <button onclick="eliminarProducto(${prod.id})" style="background: #991b1b; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">Borrar</button>
                </td>`;
        }
        if (rolActual === 'inventario_consulta') {
            filasHTML += `
                <tr>
                    <td><strong>${prod.nombre}</strong></td>
                    <td>${prod.categoria}</td>
                    <td>${preciosHTML}</td>
                </tr>
            `;
        } else {
            filasHTML += `
                <tr>
                    <td><strong>${prod.nombre}</strong></td>
                    <td>${prod.categoria}</td>
                    <td class="col-costo-admin">${costosHTML}</td>
                    <td>${preciosHTML}</td>
                    <td>${stockHTML}</td>
                    ${accionesTd}
                </tr>
            `;
        }
    });

    // Inyectar todas las filas de una sola vez
    if (tablaInventario && filasHTML) {
        tablaInventario.innerHTML = filasHTML;
        console.log(`✅ ${productosPaginaInventario.length} filas inyectadas en la tabla`);
        console.log(`📏 Longitud del HTML inyectado: ${filasHTML.length} caracteres`);
    } else {
        console.warn('⚠️ No se pudo inyectar filas: tablaInventario=', !!tablaInventario, 'filasHTML=', !!filasHTML);
    }

    // Agregar controles de paginación para inventario
    const totalPaginasInv = Math.ceil(listaProductos.length / itemsPorPagina);
    if (tablaInventario && totalPaginasInv > 1) {
        tablaInventario.innerHTML += `
            <tr>
                <td colspan="${rolActual === 'inventario_consulta' ? 3 : 6}" style="text-align: center; padding: 15px;">
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
        const pres = extraerPresentacionesProducto(prod);
        const comerciales = listaPresentacionesComerciales(prod);
        const esAGranel = esProductoAGranel(prod);

        let optsHTML = comerciales.map(p => `<option value="${p.tipo}|${p.precio}">${p.label} (S/ ${Number(p.precio).toFixed(2)})</option>`).join('');

        // Agregar opción de venta por monto para productos a granel
        if (esAGranel && pres.precioUnid > 0) {
            optsHTML += `<option value="monto|${pres.precioUnid}">💰 Venta por Monto (S/)</option>`;
        }

        if (catalogoVentas) {
            const imagenSrc = prod.imagen && prod.imagen !== 'https://via.placeholder.com/80' ? prod.imagen : 'https://via.placeholder.com/80';
            catalogoVentas.innerHTML += `
                <div class="prod-card">
                    <img src="${imagenSrc}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/80'">
                    <div class="prod-title">${prod.nombre}</div>
                    <select id="pres-${prod.id}" class="select-pres" onchange="habilitarInputMonto(${prod.id}, this.value)">
                        ${optsHTML}
                    </select>
                    <input type="number" step="0.01" id="monto-${prod.id}" class="form-control" placeholder="Monto S/" style="display: none; margin-bottom: 6px; font-size: 12px; padding: 4px;">
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

    // NO aplicar restricciones aquí para evitar recursividad
    // Las restricciones se aplican en DOMContentLoaded y en inicializarSistema
}

let bufferEscaneo = '';
let timeoutEscaneo = null;
let esEscaneoActivo = false;
let tiempoUltimoCaracter = 0;
let bufferInputEscaneo = '';
let timeoutInputEscaneo = null;
let tiempoUltimoCaracterInput = 0;
let ultimoTicketId = null;

async function inicializarSistema() {
    // Cargar datos desde localStorage primero (async porque puede consultar Supabase)
    await cargarDatosDesdeLocalStorage();
    await loadVentasFromSupabase();

    programarCierreAutomaticoCaja();
    aplicarMenuPorRol();
    if (typeof aplicarRestriccionesPorRol === 'function') aplicarRestriccionesPorRol();
    // NO llamar a cambiarTab aquí para evitar recursividad
    // aplicarRestriccionesConsulta() ya activa la pestaña de inventario si es necesario
    if (typeof actualizarNombresPresentaciones === 'function') actualizarNombresPresentaciones();

    // Renderizar productos solo una vez (sin recursividad)
    if (typeof renderizarProductos === 'function') renderizarProductos();

    if (typeof verificarAlertaStockUnidades === 'function') verificarAlertaStockUnidades();
    if (typeof renderizarRegistroComandasVendedor === 'function') renderizarRegistroComandasVendedor();
    if (typeof renderizarKardex === 'function') renderizarKardex();
    if (typeof renderizarReportes === 'function') renderizarReportes();
    if (typeof renderizarHistorialCierres === 'function') renderizarHistorialCierres();
    refrescarVistasAlmacen();
    arrancarSincronizacion();

    document.addEventListener('keydown', manejarAtajosTeclado);

    const scannerInput = document.getElementById('scanner-input');
    if (scannerInput) {
        scannerInput.focus();
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', inicializarSistema, { once: true });
} else {
    inicializarSistema();
}
document.addEventListener('keydown', function(event) {
    // Detectar la combinacion de teclas Ctrl + 4
    if (event.ctrlKey && event.key === '4') {
        event.preventDefault(); // Evitar comportamientos predeterminados del navegador
        
        // Buscar el boton de guardar producto en el formulario activo
        const btnGuardar = document.getElementById('btn-guardar-producto') || 
                           document.querySelector('button[onclick*="guardar"]');
        
        if (btnGuardar) {
            btnGuardar.click();
            console.log('⚡ Producto guardado mediante el atajo Ctrl + 4');
        } else if (typeof guardarProducto === 'function') {
            guardarProducto();
        } else {
            console.warn('⚠️ No se encontro la funcion o boton de guardado para Ctrl + 4');
        }
    }
});
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
    if (cajaEstaCerradaHoy()) {
        alert('La caja ya está cerrada por hoy.');
        return;
    }
    if (confirm("¿Cerrar caja y finalizar turno?")) {
        registrarEstadoCierreCaja();
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
    const esInventarioConsulta = obtenerRol() === 'inventario_consulta';
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
                        ${esInventarioConsulta ? '' : '<th>Stock Disponible</th>'}
                    </tr>
                </thead>
                <tbody>
    `;

    productos.forEach(prod => {
        const pres = extraerPresentacionesProducto(prod);
        const comerciales = listaPresentacionesComerciales(prod);
        const reglaCat = reglaPresentacionProducto(prod);

        let preciosHTML = comerciales.map(p => `${p.label}: S/ ${Number(p.precio).toFixed(2)}`).join(' | ');

        let stockHTML = '';
        if (!esInventarioConsulta) {
            if (reglaCat) {
                stockHTML = `${reglaCat.unidadBase}: ${pres.stockUnid || 0}`;
                const eqs = reglaCat.slots.filter(s => s.factor > 1).map(s => `${s.nombreCorto}=${s.factor}`).join(' · ');
                if (eqs) stockHTML += ` (descuenta ${eqs})`;
            } else {
                const labels = etiquetasPresentaciones(prod);
                stockHTML = `${labels.unid}: ${pres.stockUnid || 0}`;
                if (pres.stockDoc > 0) stockHTML += ` | ${labels.doc}: ${pres.stockDoc}`;
                if (pres.stockPaq > 0) stockHTML += ` | ${labels.paq}: ${pres.stockPaq}`;
                if (pres.stockCaja > 0) stockHTML += ` | ${labels.caja}: ${pres.stockCaja}`;
            }
        }

        htmlContent += `
            <tr>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>${preciosHTML}</td>
                ${esInventarioConsulta ? '' : `<td>${stockHTML}</td>`}
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

// Funciones de Almacén
function guardarProductoAlmacen(e) {
    e.preventDefault();
    const fecha = document.getElementById('alm-fecha').value;
    const producto = document.getElementById('alm-producto').value;
    const presentacion = document.getElementById('alm-presentacion').value;
    const costo = parseFloat(document.getElementById('alm-costo').value) || 0;
    const stock = parseFloat(document.getElementById('alm-stock').value) || 0;

    const nuevoProducto = {
        id: Date.now(),
        fecha: fecha,
        producto: producto,
        presentacion: presentacion,
        costo: costo,
        actualCosto: costo,
        actualCostoFecha: fecha,
        stock: stock
    };

    almacen.push(nuevoProducto);
    localStorage.setItem('lista_almacen', JSON.stringify(almacen));

    // Sincronizar con Supabase
    syncAlmacenToSupabase(nuevoProducto);

    document.getElementById('form-almacen').reset();
    // Establecer fecha actual por defecto
    document.getElementById('alm-fecha').value = new Date().toISOString().split('T')[0];

    renderizarAlmacen();
    alert('Producto guardado en almacén exitosamente.');
}

function registrarSalidaAlmacen(e) {
    e.preventDefault();
    const fecha = document.getElementById('sal-fecha').value;
    const productoId = parseInt(document.getElementById('sal-producto').value);
    const cantidad = parseFloat(document.getElementById('sal-cantidad').value) || 0;
    const descripcion = document.getElementById('sal-descripcion').value;

    const prodAlmacen = almacen.find(p => p.id === productoId);
    if (!prodAlmacen) {
        alert('Producto no encontrado en almacén.');
        return;
    }

    if (cantidad > prodAlmacen.stock) {
        alert(`Stock insuficiente. Solo hay ${prodAlmacen.stock} ${prodAlmacen.presentacion} disponible(s).`);
        return;
    }

    // Descontar stock
    prodAlmacen.stock -= cantidad;

    // Registrar salida
    const nuevaSalida = {
        id: Date.now(),
        fecha: fecha,
        producto: prodAlmacen.producto,
        presentacion: prodAlmacen.presentacion,
        cantidad: cantidad,
        descripcion: descripcion,
        usuario: rol
    };

    salidasAlmacen.push(nuevaSalida);
    localStorage.setItem('lista_almacen', JSON.stringify(almacen));
    localStorage.setItem('lista_salidas_almacen', JSON.stringify(salidasAlmacen));

    // Sincronizar con Supabase
    syncSalidaAlmacenToSupabase(nuevaSalida);
    syncAlmacenToSupabase(prodAlmacen);

    document.getElementById('form-salida-almacen').reset();
    document.getElementById('sal-fecha').value = new Date().toISOString().split('T')[0];

    renderizarAlmacen();
    alert('Salida registrada exitosamente.');
}

function renderizarAlmacen() {
    const tablaAlmacen = document.getElementById('tabla-almacen');
    const tablaSalidas = document.getElementById('tabla-salidas-almacen');
    const selectProducto = document.getElementById('sal-producto');

    if (!tablaAlmacen || !tablaSalidas || !selectProducto) return;

    // Renderizar tabla de almacén
    tablaAlmacen.innerHTML = almacen.map(prod => `
        <tr>
            <td>${prod.fecha || ''}</td>
            <td><strong>${prod.producto || ''}</strong></td>
            <td>${prod.presentacion || ''}</td>
            <td>S/ ${aNumeroProd(prod.costo).toFixed(2)}</td>
            <td>S/ ${aNumeroProd(prod.actualCosto).toFixed(2)} (${prod.actualCostoFecha || ''})</td>
            <td>${aNumeroProd(prod.stock).toFixed(2)} ${prod.presentacion || ''}</td>
            <td>
                <button onclick="editarProductoAlmacen(${prod.id})" style="background: #2563eb; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">Editar</button>
                <button onclick="eliminarProductoAlmacen(${prod.id})" style="background: #991b1b; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer;">Eliminar</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7" style="text-align: center; color: #64748b;">No hay productos en almacén.</td></tr>';

    // Renderizar tabla de salidas
    tablaSalidas.innerHTML = salidasAlmacen.map(salida => `
        <tr>
            <td>${salida.fecha}</td>
            <td><strong>${salida.producto}</strong></td>
            <td style="color: #f87171;">-${aNumeroProd(salida.cantidad).toFixed(2)} ${salida.presentacion || ''}</td>
            <td>${salida.descripcion}</td>
            <td>${salida.usuario}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align: center; color: #64748b;">No hay salidas registradas.</td></tr>';

    // Actualizar select de productos
    selectProducto.innerHTML = '<option value="">-- Seleccionar Producto --</option>' +
        almacen.map(prod => `<option value="${prod.id}">${prod.producto} (Stock: ${aNumeroProd(prod.stock).toFixed(2)} ${prod.presentacion || ''})</option>`).join('');

    // Agregar evento para mostrar presentación al seleccionar producto
    selectProducto.onchange = function() {
        const prodId = parseInt(this.value);
        const prod = almacen.find(p => p.id === prodId);
        const presField = document.getElementById('sal-presentacion');
        if (presField) {
            presField.value = prod ? prod.presentacion : '';
        }
    };

    // Establecer fecha actual por defecto
    const fechaHoy = new Date().toISOString().split('T')[0];
    document.getElementById('alm-fecha').value = fechaHoy;
    document.getElementById('sal-fecha').value = fechaHoy;
}

function editarProductoAlmacen(id) {
    const prod = almacen.find(p => p.id === id);
    if (!prod) return;

    const nuevoCosto = prompt('Nuevo costo (S/):', prod.actualCosto);
    if (nuevoCosto !== null) {
        const costoNum = parseFloat(nuevoCosto);
        if (!isNaN(costoNum) && costoNum >= 0) {
            prod.actualCosto = costoNum;
            prod.actualCostoFecha = new Date().toISOString().split('T')[0];
            localStorage.setItem('lista_almacen', JSON.stringify(almacen));

            // Sincronizar con Supabase
            syncAlmacenToSupabase(prod);

            renderizarAlmacen();
            alert('Costo actualizado exitosamente.');
        }
    }
}

function eliminarProductoAlmacen(id) {
    if (confirm('¿Eliminar este producto del almacén?')) {
        const prodAEliminar = almacen.find(p => p.id === id);
        almacen = almacen.filter(p => p.id !== id);
        localStorage.setItem('lista_almacen', JSON.stringify(almacen));

        // Nota: Para eliminar de Supabase necesitaríamos usar .delete()
        // Por ahora solo sincronizamos el estado local
        if (prodAEliminar && supabaseClient && isOnline) {
            supabaseClient.from('almacen').delete().eq('id', id).then(({ error }) => {
                if (error) console.error('Error al eliminar de Supabase:', error);
            });
        }

        renderizarAlmacen();
    }
}

function obtenerTablasReporteAlmacen() {
    const contenedorAlmacen = document.getElementById('tab-almacen');
    const cuerpoTablaAlmacen = contenedorAlmacen?.querySelector('#tabla-almacen');
    const cuerpoTablaSalidas = contenedorAlmacen?.querySelector('#tabla-salidas-almacen');
    const tablaAlmacen = cuerpoTablaAlmacen?.closest('table');
    const tablaSalidas = cuerpoTablaSalidas?.closest('table');

    if (!contenedorAlmacen || !tablaAlmacen || !tablaSalidas ||
        !contenedorAlmacen.contains(tablaAlmacen) || !contenedorAlmacen.contains(tablaSalidas)) {
        console.error('No se encontraron las tablas del reporte de almacén dentro de #tab-almacen.');
        return null;
    }

    const tablaStockReporte = tablaAlmacen.cloneNode(true);
    const encabezadoStock = tablaStockReporte.querySelector('thead tr');
    const indiceAcciones = encabezadoStock
        ? Array.from(encabezadoStock.cells).findIndex(celda => celda.textContent.trim().toLowerCase() === 'acciones')
        : -1;

    if (indiceAcciones !== -1) {
        tablaStockReporte.querySelectorAll('tr').forEach(fila => fila.cells[indiceAcciones]?.remove());
    }

    return {
        tablaAlmacen: tablaStockReporte,
        tablaSalidas: tablaSalidas.cloneNode(true)
    };
}

function descargarAlmacenWord() {
    const tablas = obtenerTablasReporteAlmacen();
    if (!tablas) return;

    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
            <meta charset="utf-8">
            <title>Reporte Almacén - QUEVEDO ABARROTES</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                h1 { text-align: center; }
                .fecha { text-align: right; margin-bottom: 20px; }
                h2 { margin-top: 30px; }
            </style>
        </head>
        <body>
            <h1>REPORTE DE ALMACÉN - QUEVEDO ABARROTES</h1>
            <div class="fecha">Fecha: ${new Date().toLocaleDateString('es-PE')}</div>

            <h2>Stock Actual</h2>
            ${tablas.tablaAlmacen.outerHTML}

            <h2>Historial de Salidas</h2>
            ${tablas.tablaSalidas.outerHTML}
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReporteAlmacen_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function imprimirAlmacen() {
    const tablas = obtenerTablasReporteAlmacen();
    if (!tablas) return;

    const htmlImpresion = `
        <html>
        <head>
            <title>Reporte Almacén</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                h1 { text-align: center; }
                h2 { margin-top: 30px; }
            </style>
        </head>
        <body>
            <h1>REPORTE DE ALMACÉN - QUEVEDO ABARROTES</h1>
            <p>Fecha: ${new Date().toLocaleDateString('es-PE')}</p>

            <h2>Stock Actual</h2>
            ${tablas.tablaAlmacen.outerHTML}

            <h2>Historial de Salidas</h2>
            ${tablas.tablaSalidas.outerHTML}
        </body>
        </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(htmlImpresion);
    ventanaImpresion.document.close();
    ventanaImpresion.print();
}

window.guardarProductoAlmacen = guardarProductoAlmacen;
window.registrarSalidaAlmacen = registrarSalidaAlmacen;
window.renderizarAlmacen = renderizarAlmacen;
window.editarProductoAlmacen = editarProductoAlmacen;
window.eliminarProductoAlmacen = eliminarProductoAlmacen;
window.descargarAlmacenWord = descargarAlmacenWord;
window.imprimirAlmacen = imprimirAlmacen;
window.habilitarInputMonto = habilitarInputMonto;

// ============================================
// FUNCIONES DE SINCRONIZACIÓN CON SUPABASE
// ============================================

// Detectar cambios de conexión
window.addEventListener('online', () => {
    isOnline = true;
    console.log('🟢 Conexión restaurada. Sincronizando datos...');
    procesarColaSincronizacion();
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('🔴 Sin conexión. Trabajando en modo offline.');
});

// Verificar si estamos online
function checkOnlineStatus() {
    isOnline = navigator.onLine;
    return isOnline;
}

// ============================================
// SINCRONIZACIÓN: LOCAL -> SUPABASE
// ============================================

function productoParaSupabase(producto) {
    // Columnas de stock que existen en Supabase
    const stockColumnsValidas = ['unid', 'doc', 'paq', 'caja'];

    const camposPresentaciones = Object.values(CAMPOS_FORM_PRES).reduce((campos, meta) => {
        const sufijo = meta.campo.toLowerCase();
        // Siempre incluir costo y precio
        campos[`costo_${sufijo}`] = producto['costo' + meta.campo] || 0;
        campos[`precio_${sufijo}`] = producto['precio' + meta.campo] || 0;
        // Solo incluir stock si el sufijo está en las columnas válidas de Supabase
        if (stockColumnsValidas.includes(sufijo)) {
            campos[`stock_${sufijo}`] = producto['stock' + meta.campo] || 0;
        }
        return campos;
    }, {});

    return {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        codigo: producto.codigo,
        ...camposPresentaciones,
        imagen: producto.imagen || 'https://via.placeholder.com/80',
        unidades_paq: producto.unidadesPaq || producto.unidades_paq || 0,
        unidades_caja: producto.unidadesCaja || producto.unidades_caja || 0,
        kg_paq: producto.kgPaq || producto.kg_paq || 0,
        kg_caja: producto.kgCaja || producto.kg_caja || 0,
        unidades_paquete: producto.unidadesPaq || 0,
        unidades_caja_box: producto.unidadesCaja || 0,
        kg_paquete: producto.kgPaq || 0,
        kg_caja_box: producto.kgCaja || 0,
        // NOTA: rollosPlancha es una propiedad local temporal, no se envía a Supabase
        updated_at: new Date().toISOString()
    };
}

// Sincronizar un producto con Supabase
async function syncProductoToSupabase(producto) {
    if (!supabaseClient || !isOnline) {
        syncQueue.push({ type: 'producto', data: producto });
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .upsert(productoParaSupabase(producto), { onConflict: 'id' });

        if (error) {
            console.error('Error al sincronizar producto:', error);
            syncQueue.push({ type: 'producto', data: producto });
        } else {
            console.log('✅ Producto sincronizado:', producto.nombre);
        }
    } catch (error) {
        console.error('Error de red al sincronizar producto:', error);
        syncQueue.push({ type: 'producto', data: producto });
    }
}

async function incrementarStockProductoEnSupabase(productoId, cantidad, nombreProducto) {
    const incremento = Number(cantidad);
    if (!Number.isFinite(incremento) || incremento <= 0) {
        console.error(`No se puede incrementar el stock de ${nombreProducto}: cantidad inválida.`);
        return false;
    }

    const incrementoPendiente = {
        productoId,
        cantidad: incremento,
        nombreProducto
    };

    if (!supabaseClient || !isOnline) {
        syncQueue.push({ type: 'incremento_stock_producto', data: incrementoPendiente });
        return false;
    }

    try {
        const { data: productoActual, error: errorLectura } = await supabaseClient
            .from('productos')
            .select('stock_unid')
            .eq('id', productoId)
            .single();

        if (errorLectura) {
            console.error(`Error al consultar el stock de ${nombreProducto}:`, errorLectura);
            syncQueue.push({ type: 'incremento_stock_producto', data: incrementoPendiente });
            return false;
        }

        const stockActual = Number(productoActual.stock_unid) || 0;
        const { data, error } = await supabaseClient
            .from('productos')
            .update({ stock_unid: stockActual + incremento })
            .eq('id', productoId)
            .select('id')
            .single();

        if (error || !data) {
            console.error(`Error al actualizar el stock de ${nombreProducto}:`, error || 'Producto no encontrado');
            syncQueue.push({ type: 'incremento_stock_producto', data: incrementoPendiente });
            return false;
        }

        console.log(`✅ Stock de ${nombreProducto} actualizado en Supabase: +${incremento}`);
        return true;
    } catch (error) {
        console.error(`Error de red al actualizar el stock de ${nombreProducto}:`, error);
        syncQueue.push({ type: 'incremento_stock_producto', data: incrementoPendiente });
        return false;
    }
}

// Sincronizar un movimiento de Kárdex con Supabase
async function syncKardexToSupabase(movimiento) {
    if (!supabaseClient || !isOnline) {
        syncQueue.push({ type: 'kardex', data: movimiento });
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('kardex')
            .insert({
                ticket_id: movimiento.ticketId || null,
                fecha: movimiento.fecha,
                producto: movimiento.producto,
                tipo: movimiento.tipo,
                cantidad: movimiento.cantidad,
                usuario: movimiento.usuario,
                metodo: movimiento.metodo || null,
                total: movimiento.total || null,
                monto_efectivo: movimiento.montoEfectivo || null,
                monto_yape: movimiento.montoYape || null,
                items: movimiento.items || null
            });

        if (error) {
            console.error('Error al sincronizar kardex:', error);
            syncQueue.push({ type: 'kardex', data: movimiento });
        } else {
            console.log('✅ Kárdex sincronizado');
        }
    } catch (error) {
        console.error('Error de red al sincronizar kardex:', error);
        syncQueue.push({ type: 'kardex', data: movimiento });
    }
}

// Sincronizar una venta completa con Supabase
async function syncVentaToSupabase(venta) {
    if (!supabaseClient || !isOnline) {
        syncQueue.push({ type: 'venta', data: venta });
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('ventas')
            .insert({
                ticket_id: venta.ticketId,
                fecha: venta.fecha,
                items: venta.items,
                total: venta.total,
                metodo_pago: venta.metodoPago,
                monto_efectivo: venta.montoEfectivo || 0,
                monto_yape: venta.montoYape || 0,
                usuario: venta.usuario,
                vendedor: venta.vendedor || null,
                estado: 'completado'
            });

        if (error) {
            console.error('Error al sincronizar venta:', error);
            syncQueue.push({ type: 'venta', data: venta });
        } else {
            console.log('✅ Venta sincronizada:', venta.ticketId);
        }
    } catch (error) {
        console.error('Error de red al sincronizar venta:', error);
        syncQueue.push({ type: 'venta', data: venta });
    }
}

// Sincronizar producto de almacén con Supabase
async function syncAlmacenToSupabase(producto) {
    if (!supabaseClient || !isOnline) {
        syncQueue.push({ type: 'almacen', data: producto });
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('almacen')
            .upsert({
                id: producto.id,
                fecha: producto.fecha,
                producto: producto.producto,
                costo: producto.costo,
                costo_actual: producto.actualCosto || producto.costo,
                fecha_costo_actual: producto.actualCostoFecha || producto.fecha,
                stock: producto.stock,
                presentacion: producto.presentacion,
                usuario: producto.usuario || rol,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error al sincronizar almacén:', error);
            syncQueue.push({ type: 'almacen', data: producto });
        } else {
            console.log('✅ Almacén sincronizado:', producto.producto);
        }
    } catch (error) {
        console.error('Error de red al sincronizar almacén:', error);
        syncQueue.push({ type: 'almacen', data: producto });
    }
}

// Sincronizar salida de almacén con Supabase
async function syncSalidaAlmacenToSupabase(salida) {
    if (!supabaseClient || !isOnline) {
        syncQueue.push({ type: 'salida_almacen', data: salida });
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('salidas_almacen')
            .insert({
                fecha: salida.fecha,
                producto: salida.producto,
                cantidad: salida.cantidad,
                presentacion: salida.presentacion,
                descripcion: salida.descripcion,
                usuario: salida.usuario
            });

        if (error) {
            console.error('Error al sincronizar salida de almacén:', error);
            syncQueue.push({ type: 'salida_almacen', data: salida });
        } else {
            console.log('✅ Salida de almacén sincronizada');
        }
    } catch (error) {
        console.error('Error de red al sincronizar salida de almacén:', error);
        syncQueue.push({ type: 'salida_almacen', data: salida });
    }
}

// Procesar cola de sincronización
async function procesarColaSincronizacion() {
    if (!isOnline || !supabaseClient || syncQueue.length === 0) {
        return;
    }

    console.log(`🔄 Procesando ${syncQueue.length} items pendientes de sincronización...`);

    const queueCopy = [...syncQueue];
    syncQueue = [];

    for (const item of queueCopy) {
        switch (item.type) {
            case 'producto':
                await syncProductoToSupabase(item.data);
                break;
            case 'incremento_stock_producto':
                await incrementarStockProductoEnSupabase(
                    item.data.productoId,
                    item.data.cantidad,
                    item.data.nombreProducto
                );
                break;
            case 'kardex':
                await syncKardexToSupabase(item.data);
                break;
            case 'venta':
                await syncVentaToSupabase(item.data);
                break;
            case 'almacen':
                await syncAlmacenToSupabase(item.data);
                break;
            case 'salida_almacen':
                await syncSalidaAlmacenToSupabase(item.data);
                break;
        }
    }

    console.log('✅ Sincronización completada');
}

// ============================================
// SINCRONIZACIÓN: SUPABASE -> LOCAL
// ============================================

function refrescarVistasProductos() {
    recargarListaProductos();
    if (typeof renderizarProductos === 'function') renderizarProductos();
    if (typeof renderizarCompras === 'function') renderizarCompras();
}

function refrescarVistasAlmacen() {
    try {
        const rawAlm = localStorage.getItem('lista_almacen');
        if (rawAlm) almacen = JSON.parse(rawAlm) || almacen || [];
    } catch (e) { /* conservar almacén en memoria */ }
    try {
        const rawSal = localStorage.getItem('lista_salidas_almacen');
        if (rawSal) salidasAlmacen = JSON.parse(rawSal) || salidasAlmacen || [];
    } catch (e) { /* conservar salidas en memoria */ }
    if (typeof renderizarAlmacen === 'function') renderizarAlmacen();
}

async function loadVentasFromSupabase() {
    if (!supabaseClient && typeof window.supabase !== 'undefined') {
        initSupabase();
    }
    if (!supabaseClient || !isOnline) {
        console.log('⚠️ No se pueden cargar ventas: offline o Supabase no inicializado');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('ventas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al cargar ventas:', error);
            return;
        }

        const ventasSupabase = (data || []).map(venta => ({
            ticketId: venta.ticket_id,
            fecha: venta.fecha,
            producto: Array.isArray(venta.items)
                ? venta.items.map(item => `${item.desc || item.nombre || 'Producto'} x${item.cant ?? item.cantidad ?? 0}`).join(', ')
                : `Venta ${venta.ticket_id}`,
            tipo: venta.metodo_pago,
            cantidad: venta.total,
            usuario: venta.vendedor || venta.usuario,
            metodo: venta.metodo_pago,
            total: venta.total,
            montoEfectivo: venta.monto_efectivo || 0,
            montoYape: venta.monto_yape || 0,
            items: venta.items || []
        }));
        const ventasPorTicket = new Map(ventasSupabase.map(venta => [venta.ticketId, venta]));
        const ticketsActualizados = new Set();
        const kardexActualizado = kardex.map(movimiento => {
            const venta = ventasPorTicket.get(movimiento.ticketId);
            if (!venta) return movimiento;
            ticketsActualizados.add(venta.ticketId);
            return { ...movimiento, ...venta };
        });

        kardex = [
            ...ventasSupabase.filter(venta => !ticketsActualizados.has(venta.ticketId)),
            ...kardexActualizado
        ];

        try {
            localStorage.setItem('lista_kardex', JSON.stringify(kardex));
        } catch (error) {
            console.error('Error al guardar las ventas descargadas en el almacenamiento local:', error);
        }

        console.log(`✔️ ${ventasSupabase.length} ventas cargadas de Supabase`);
        renderizarKardex();
        renderizarRegistroVentas();
        renderizarHistorialDiarioConsolidado();
        renderizarReportes();
    } catch (error) {
        console.error('Error de red al cargar ventas:', error);
    }
}

// Cargar productos desde Supabase
async function loadProductosFromSupabase() {
    if (!supabaseClient && typeof window.supabase !== 'undefined') {
        initSupabase();
    }
    if (!supabaseClient || !isOnline) {
        console.log('⚠️ No se pueden cargar productos: offline o Supabase no inicializado');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error al cargar productos:', error);
            return;
        }

        if (data && data.length > 0) {
            const productosSupabase = data.map(p => ({
                id: p.id,
                nombre: p.nombre,
                categoria: p.categoria,
                codigo: p.codigo,
                ...Object.values(CAMPOS_FORM_PRES).reduce((presentaciones, meta) => {
                    const sufijo = meta.campo.toLowerCase();
                    presentaciones['costo' + meta.campo] = p[`costo_${sufijo}`];
                    presentaciones['precio' + meta.campo] = p[`precio_${sufijo}`];
                    presentaciones['stock' + meta.campo] = p[`stock_${sufijo}`];
                    return presentaciones;
                }, {}),
                imagen: p.imagen,
                unidadesPaq: p.unidades_paq || p.unidades_paquete,
                unidadesCaja: p.unidades_caja || p.unidades_caja_box,
                paquetesPlancha: String(p.categoria || '').trim().toUpperCase() === 'PHX4'
                    ? (p.unidades_caja || p.unidades_caja_box || 6)
                    : 0,
                kgPaq: p.kg_paq || p.kg_paquete,
                kgCaja: p.kg_caja || p.kg_caja_box,
                unidades_paq: p.unidades_paq || p.unidades_paquete,
                unidades_caja: p.unidades_caja || p.unidades_caja_box,
                kg_paq: p.kg_paq || p.kg_paquete,
                kg_caja: p.kg_caja || p.kg_caja_box,
                // NOTA: rollosPlancha es una propiedad local temporal, no existe en Supabase
                // Se usa unidades_caja para PHX4 como valor por defecto
                rollosPlancha: String(p.categoria || '').trim().toUpperCase() === 'PHX4'
                    ? (p.unidades_caja || p.unidades_caja_box || 24)
                    : 24
            }));

            localStorage.setItem('lista_productos', JSON.stringify(productosSupabase));
            productos = productosSupabase;
            console.log(`✔️ ${productosSupabase.length} productos cargados de Supabase`);
        } else {
            console.log('ℹ️ Supabase no devolvió productos; se muestra el catálogo local');
        }
    } catch (error) {
        console.error('Error de red al cargar productos:', error);
    }
}

// Cargar almacén desde Supabase
async function loadAlmacenFromSupabase() {
    if (!supabaseClient && typeof window.supabase !== 'undefined') {
        initSupabase();
    }
    if (!supabaseClient || !isOnline) {
        refrescarVistasAlmacen();
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('almacen')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error al cargar almacén:', error);
            refrescarVistasAlmacen();
            return;
        }

        if (data && data.length > 0) {
            const almacenSupabase = data.map(a => ({
                id: a.id,
                fecha: a.fecha,
                producto: a.producto,
                costo: a.costo,
                actualCosto: a.costo_actual,
                actualCostoFecha: a.fecha_costo_actual,
                stock: a.stock,
                presentacion: a.presentacion,
                usuario: a.usuario
            }));

            localStorage.setItem('lista_almacen', JSON.stringify(almacenSupabase));
            almacen = almacenSupabase;
            console.log(`✔️ ${almacenSupabase.length} productos de almacén cargados`);
        }
    } catch (error) {
        console.error('Error de red al cargar almacén:', error);
    }

    refrescarVistasAlmacen();
}

// Cargar salidas de almacén desde Supabase
async function loadSalidasAlmacenFromSupabase() {
    if (!supabaseClient && typeof window.supabase !== 'undefined') {
        initSupabase();
    }
    if (!supabaseClient || !isOnline) {
        refrescarVistasAlmacen();
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('salidas_almacen')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al cargar salidas de almacén:', error);
            refrescarVistasAlmacen();
            return;
        }

        if (data && data.length > 0) {
            const salidasSupabase = data.map(s => ({
                id: s.id,
                fecha: s.fecha,
                producto: s.producto,
                cantidad: s.cantidad,
                presentacion: s.presentacion,
                descripcion: s.descripcion,
                usuario: s.usuario
            }));

            localStorage.setItem('lista_salidas_almacen', JSON.stringify(salidasSupabase));
            salidasAlmacen = salidasSupabase;
            console.log(`✔️ ${salidasSupabase.length} salidas de almacén cargadas`);
        }
    } catch (error) {
        console.error('Error de red al cargar salidas de almacén:', error);
    }

    refrescarVistasAlmacen();
}

// ============================================
// SUPABASE REALTIME
// ============================================

// Variables para guardar las suscripciones
let productosSubscription = null;
let almacenSubscription = null;
let salidasSubscription = null;

// Suscribirse a cambios en tiempo real
function setupRealtimeSubscriptions() {
    if (!supabaseClient) {
        console.log('⚠️ Supabase no inicializado, no se pueden suscribir a Realtime');
        return;
    }

    // Desasociar canales anteriores si existen
    if (productosSubscription) {
        supabaseClient.removeChannel(productosSubscription);
        productosSubscription = null;
    }
    if (almacenSubscription) {
        supabaseClient.removeChannel(almacenSubscription);
        almacenSubscription = null;
    }
    if (salidasSubscription) {
        supabaseClient.removeChannel(salidasSubscription);
        salidasSubscription = null;
    }

    // Crear nuevas suscripciones
    productosSubscription = supabaseClient
        .channel('productos-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, (payload) => {
            console.log('📡 Cambio en productos detectado:', payload);
            loadProductosFromSupabase();
        })
        .subscribe();

    almacenSubscription = supabaseClient
        .channel('almacen-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'almacen' }, (payload) => {
            console.log('📡 Cambio en almacén detectado:', payload);
            loadAlmacenFromSupabase();
        })
        .subscribe();

    salidasSubscription = supabaseClient
        .channel('salidas-almacen-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'salidas_almacen' }, (payload) => {
            console.log('📡 Cambio en salidas de almacén detectado:', payload);
            loadSalidasAlmacenFromSupabase();
        })
        .subscribe();

    console.log('✅ Suscripciones Realtime activas');
}

// ============================================
// INICIALIZACIÓN DE SINCRONIZACIÓN
// ============================================

async function initSync() {
    if (!supabaseClient && typeof window.supabase !== 'undefined') {
        initSupabase();
    }

    if (!supabaseClient) {
        console.log('⚠️ Supabase no disponible, trabajando en modo offline-only');
        refrescarVistasProductos();
        refrescarVistasAlmacen();
        return;
    }

    await Promise.all([
        loadProductosFromSupabase(),
        loadAlmacenFromSupabase(),
        loadSalidasAlmacenFromSupabase()
    ]);

    refrescarVistasProductos();
    refrescarVistasAlmacen();

    setupRealtimeSubscriptions();

    setTimeout(() => {
        procesarColaSincronizacion();
    }, 2000);
}

function arrancarSincronizacion() {
    initSync();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancarSincronizacion);
} else {
    arrancarSincronizacion();
}

// Exponer funciones de sincronización
window.syncProductoToSupabase = syncProductoToSupabase;
window.syncKardexToSupabase = syncKardexToSupabase;
window.syncVentaToSupabase = syncVentaToSupabase;
window.syncAlmacenToSupabase = syncAlmacenToSupabase;
window.syncSalidaAlmacenToSupabase = syncSalidaAlmacenToSupabase;
window.procesarColaSincronizacion = procesarColaSincronizacion;
window.loadProductosFromSupabase = loadProductosFromSupabase;
window.loadVentasFromSupabase = loadVentasFromSupabase;
window.loadAlmacenFromSupabase = loadAlmacenFromSupabase;
window.loadSalidasAlmacenFromSupabase = loadSalidasAlmacenFromSupabase;
window.refrescarVistasProductos = refrescarVistasProductos;
window.refrescarVistasAlmacen = refrescarVistasAlmacen;
window.setupRealtimeSubscriptions = setupRealtimeSubscriptions;
window.initSupabase = initSupabase;
window.initSync = initSync;
window.arrancarSincronizacion = arrancarSincronizacion;