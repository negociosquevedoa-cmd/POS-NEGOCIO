# Instrucciones de Integración con Supabase - POS NEGOCIO

## 📋 Resumen de la Implementación

El sistema POS NEGOCIO ahora está integrado con Supabase para:
- ✅ Sincronización bidireccional de datos
- ✅ Actualizaciones en tiempo real entre dispositivos
- ✅ Modo offline con cola de sincronización
- ✅ Persistencia local con localStorage como respaldo

---

## 🚀 Pasos para Configurar Supabase

### 1. Ejecutar el Script SQL en Supabase

1. Ve a tu panel de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `nxviiidirmzqbcldegus`
3. En el menú lateral, haz clic en **SQL Editor**
4. Crea una nueva consulta
5. Copia y pega el contenido del archivo `supabase_schema.sql`
6. Haz clic en **Run** para ejecutar el script

El script creará las siguientes tablas:
- `productos` - Catálogo de productos
- `kardex` - Movimientos de inventario
- `ventas` - Tickets de venta completos
- `almacen` - Stock de almacén separado
- `salidas_almacen` - Salidas de almacén
- `cierres_caja` - Cierres de caja

### 2. Verificar Configuración de Realtime

1. En el panel de Supabase, ve a **Database** → **Replication**
2. Asegúrate de que las siguientes tablas estén habilitadas para Realtime:
   - ✅ productos
   - ✅ kardex
   - ✅ ventas
   - ✅ almacen
   - ✅ salidas_almacen
   - ✅ cierres_caja

Si alguna tabla no está habilitada, haz clic en el botón para activarla.

### 3. Configurar Row Level Security (RLS) - Opcional

El script SQL ya configura políticas RLS permisivas. Si deseas restringir el acceso:

1. Ve a **Database** → **Authentication** → **Policies**
2. Puedes crear políticas más específicas según tus necesidades
3. Para desarrollo, las políticas actuales permiten todas las operaciones

---

## 📱 Funcionamiento del Sistema

### Modo Online (Con Internet)

1. **Al cargar la página:**
   - El sistema carga productos y almacén desde Supabase
   - Se activan las suscripciones Realtime
   - Se procesa la cola de sincronización pendiente

2. **Al guardar/editar productos:**
   - Se guarda en localStorage inmediatamente
   - Se sincroniza con Supabase en segundo plano
   - Otros dispositivos reciben la actualización vía Realtime

3. **Al procesar ventas:**
   - Se registra en localStorage
   - Se crea el ticket en Supabase
   - Se actualiza el stock en ambos sistemas
   - El Kárdex se sincroniza automáticamente

4. **Al trabajar con almacén:**
   - Productos y salidas se sincronizan
   - Cambios se reflejan en tiempo real

### Modo Offline (Sin Internet)

1. **El sistema sigue funcionando normalmente:**
   - Todas las operaciones se guardan en localStorage
   - El sistema detecta que está offline
   - Los cambios se encolan para sincronización

2. **Al recuperar conexión:**
   - El sistema detecta automáticamente el cambio
   - Procesa la cola de sincronización
   - Actualiza Supabase con todos los cambios pendientes
   - Recibe actualizaciones de otros dispositivos

---

## 🔧 Funciones de Sincronización Disponibles

El sistema expone las siguientes funciones JavaScript para uso avanzado:

```javascript
// Sincronizar manualmente un producto
syncProductoToSupabase(producto);

// Sincronizar manualmente un movimiento de Kárdex
syncKardexToSupabase(movimiento);

// Sincronizar manualmente una venta
syncVentaToSupabase(venta);

// Sincronizar manualmente producto de almacén
syncAlmacenToSupabase(producto);

// Sincronizar manualmente salida de almacén
syncSalidaAlmacenToSupabase(salida);

// Procesar cola de sincronización pendiente
procesarColaSincronizacion();

// Cargar datos desde Supabase
loadProductosFromSupabase();
loadAlmacenFromSupabase();
loadSalidasAlmacenFromSupabase();

// Configurar suscripciones Realtime
setupRealtimeSubscriptions();
```

---

## 📊 Estructura de Datos en Supabase

### Tabla: productos
```javascript
{
  id: BIGINT,
  nombre: TEXT,
  categoria: TEXT,
  codigo: TEXT,
  costo_unid: NUMERIC,
  precio_unid: NUMERIC,
  stock_unid: NUMERIC,
  costo_doc: NUMERIC,
  precio_doc: NUMERIC,
  stock_doc: NUMERIC,
  costo_paq: NUMERIC,
  precio_paq: NUMERIC,
  stock_paq: NUMERIC,
  costo_caja: NUMERIC,
  precio_caja: NUMERIC,
  stock_caja: NUMERIC,
  imagen: TEXT,
  unidades_paq: NUMERIC,
  unidades_caja: NUMERIC,
  kg_paq: NUMERIC,
  kg_caja: NUMERIC,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Tabla: ventas
```javascript
{
  id: BIGSERIAL,
  ticket_id: TEXT (UNIQUE),
  fecha: TEXT,
  items: JSONB,
  total: NUMERIC,
  metodo_pago: TEXT,
  monto_efectivo: NUMERIC,
  monto_yape: NUMERIC,
  usuario: TEXT,
  vendedor: TEXT,
  estado: TEXT,
  created_at: TIMESTAMP
}
```

---

## 🐛 Solución de Problemas

### No se cargan los datos desde Supabase

**Posibles causas:**
1. ❌ Script SQL no ejecutado
2. ❌ Tablas no creadas en Supabase
3. ❌ Credenciales incorrectas en app.js
4. ❌ Sin conexión a internet

**Soluciones:**
1. Ejecuta el script `supabase_schema.sql` en el SQL Editor de Supabase
2. Verifica que las tablas existan en Database → Tables
3. Revisa las credenciales en app.js (líneas 17-18)
4. Verifica tu conexión a internet

### Las ventas no se sincronizan

**Posibles causas:**
1. ❌ Sin conexión a internet
2. ❌ Cola de sincronización bloqueada
3. ❌ Error en la tabla de ventas

**Soluciones:**
1. Verifica que estés online
2. Abre la consola del navegador (F12) para ver errores
3. Ejecuta manualmente: `procesarColaSincronizacion()`

### Realtime no funciona

**Posibles causas:**
1. ❌ Realtime no habilitado para las tablas
2. ❌ Políticas RLS demasiado restrictivas
3. ❌ Suscripción no inicializada

**Soluciones:**
1. Habilita Realtime en Database → Replication
2. Revisa las políticas en Database → Authentication → Policies
3. Llama manualmente: `setupRealtimeSubscriptions()`

---

## 🔒 Seguridad

### Credenciales

Las credenciales actuales usan la **Anon Key** (Public Key), que es segura para uso en el cliente:
- ✅ Permite operaciones públicas
- ✅ No puede acceder a datos de otros usuarios
- ⚠️ Para producción, considera implementar autenticación

### Recomendaciones de Seguridad

1. **Para producción:**
   - Implementa autenticación de usuarios en Supabase
   - Usa Row Level Security (RLS) con políticas más estrictas
   - Considera usar Service Role Key solo en el backend

2. **Para desarrollo:**
   - Las configuraciones actuales son seguras
   - Las políticas RLS permiten todas las operaciones
   - Puedes probar libremente

---

## 📞 Soporte

Si encuentras problemas:

1. Abre la consola del navegador (F12)
2. Busca mensajes con ⚠️ o ❌
3. Revisa la pestaña Network para ver errores de API
4. Verifica el estado de Supabase en: https://status.supabase.com

---

## ✅ Verificación de Instalación

Después de configurar Supabase, verifica:

1. Abre `index.html` en tu navegador
2. Abre la consola (F12)
3. Deberías ver:
   - ✅ "Supabase inicializado correctamente"
   - ✅ "X productos cargados desde Supabase"
   - ✅ "Suscripciones Realtime activas"

Si ves estos mensajes, la integración está funcionando correctamente.
