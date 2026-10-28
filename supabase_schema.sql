-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA POS NEGOCIO
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    codigo TEXT DEFAULT 'Sin código',
    costo_unid NUMERIC DEFAULT 0,
    precio_unid NUMERIC DEFAULT 0,
    stock_unid NUMERIC DEFAULT 0,
    costo_doc NUMERIC DEFAULT 0,
    precio_doc NUMERIC DEFAULT 0,
    stock_doc NUMERIC DEFAULT 0,
    costo_paq NUMERIC DEFAULT 0,
    precio_paq NUMERIC DEFAULT 0,
    stock_paq NUMERIC DEFAULT 0,
    costo_caja NUMERIC DEFAULT 0,
    precio_caja NUMERIC DEFAULT 0,
    stock_caja NUMERIC DEFAULT 0,
    imagen TEXT DEFAULT 'https://via.placeholder.com/80',
    unidades_paq NUMERIC DEFAULT 0,
    unidades_caja NUMERIC DEFAULT 0,
    kg_paq NUMERIC DEFAULT 0,
    kg_caja NUMERIC DEFAULT 0,
    unidades_paquete NUMERIC DEFAULT 0,
    unidades_caja_box NUMERIC DEFAULT 0,
    kg_paquete NUMERIC DEFAULT 0,
    kg_caja_box NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para productos
ALTER PUBLICATION supabase_realtime ADD TABLE productos;

-- ============================================
-- TABLA: kardex (movimientos de inventario)
-- ============================================
CREATE TABLE IF NOT EXISTS kardex (
    id BIGSERIAL PRIMARY KEY,
    ticket_id TEXT,
    fecha TEXT NOT NULL,
    producto TEXT NOT NULL,
    tipo TEXT NOT NULL,
    cantidad TEXT NOT NULL,
    usuario TEXT NOT NULL,
    metodo TEXT,
    total TEXT,
    monto_efectivo TEXT,
    monto_yape TEXT,
    items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para kardex
ALTER PUBLICATION supabase_realtime ADD TABLE kardex;

-- ============================================
-- TABLA: ventas (tickets de venta completos)
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
    id BIGSERIAL PRIMARY KEY,
    ticket_id TEXT UNIQUE NOT NULL,
    fecha TEXT NOT NULL,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    metodo_pago TEXT NOT NULL,
    monto_efectivo NUMERIC DEFAULT 0,
    monto_yape NUMERIC DEFAULT 0,
    usuario TEXT NOT NULL,
    vendedor TEXT,
    estado TEXT DEFAULT 'completado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para ventas
ALTER PUBLICATION supabase_realtime ADD TABLE ventas;

-- ============================================
-- TABLA: almacen (stock de almacén separado)
-- ============================================
CREATE TABLE IF NOT EXISTS almacen (
    id BIGSERIAL PRIMARY KEY,
    fecha TEXT NOT NULL,
    producto TEXT NOT NULL,
    costo NUMERIC NOT NULL,
    costo_actual NUMERIC,
    fecha_costo_actual TEXT,
    stock NUMERIC NOT NULL,
    presentacion TEXT NOT NULL,
    usuario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para almacen
ALTER PUBLICATION supabase_realtime ADD TABLE almacen;

-- ============================================
-- TABLA: salidas_almacen (salidas de almacén)
-- ============================================
CREATE TABLE IF NOT EXISTS salidas_almacen (
    id BIGSERIAL PRIMARY KEY,
    fecha TEXT NOT NULL,
    producto TEXT NOT NULL,
    cantidad NUMERIC NOT NULL,
    presentacion TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    usuario TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para salidas_almacen
ALTER PUBLICATION supabase_realtime ADD TABLE salidas_almacen;

-- ============================================
-- TABLA: cierres_caja
-- ============================================
CREATE TABLE IF NOT EXISTS cierres_caja (
    id BIGSERIAL PRIMARY KEY,
    fecha TEXT NOT NULL,
    monto_inicial NUMERIC NOT NULL,
    monto_final NUMERIC NOT NULL,
    total_ventas NUMERIC NOT NULL,
    total_efectivo NUMERIC DEFAULT 0,
    total_yape NUMERIC DEFAULT 0,
    monedas_detalle JSONB,
    usuario TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para cierres_caja
ALTER PUBLICATION supabase_realtime ADD TABLE cierres_caja;

-- ============================================
-- ÍNDICES para mejorar rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_kardex_producto ON kardex(producto);
CREATE INDEX IF NOT EXISTS idx_kardex_fecha ON kardex(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_ticket_id ON ventas(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_almacen_producto ON almacen(producto);
CREATE INDEX IF NOT EXISTS idx_salidas_almacen_producto ON salidas_almacen(producto);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Opcional
-- ============================================
-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kardex ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE almacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE salidas_almacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_caja ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir todas las operaciones (puedes restringir más adelante)
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true);
CREATE POLICY "Permitir todo en kardex" ON kardex FOR ALL USING (true);
CREATE POLICY "Permitir todo en ventas" ON ventas FOR ALL USING (true);
CREATE POLICY "Permitir todo en almacen" ON almacen FOR ALL USING (true);
CREATE POLICY "Permitir todo en salidas_almacen" ON salidas_almacen FOR ALL USING (true);
CREATE POLICY "Permitir todo en cierres_caja" ON cierres_caja FOR ALL USING (true);

-- ============================================
-- TRIGGER para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_almacen_updated_at BEFORE UPDATE ON almacen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
