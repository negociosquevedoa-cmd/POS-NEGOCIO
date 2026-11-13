CREATE TABLE IF NOT EXISTS sesiones_caja (
    id BIGSERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    fecha_operativa DATE NOT NULL,
    fecha_apertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    estado TEXT NOT NULL DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA', 'CERRADA')),
    monto_inicial NUMERIC NOT NULL DEFAULT 0,
    total_efectivo NUMERIC NOT NULL DEFAULT 0,
    total_yape NUMERIC NOT NULL DEFAULT 0,
    total_gastos NUMERIC NOT NULL DEFAULT 0,
    monto_final NUMERIC NOT NULL DEFAULT 0,
    detalle_monedas JSONB NOT NULL DEFAULT '{}'::JSONB,
    ventas JSONB NOT NULL DEFAULT '[]'::JSONB,
    salidas JSONB NOT NULL DEFAULT '[]'::JSONB,
    UNIQUE (usuario, fecha_operativa)
);

CREATE INDEX IF NOT EXISTS idx_sesiones_caja_usuario_fecha
    ON sesiones_caja(usuario, fecha_operativa, estado);

ALTER TABLE sesiones_caja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en sesiones_caja" ON sesiones_caja;
CREATE POLICY "Permitir todo en sesiones_caja" ON sesiones_caja
    FOR ALL USING (true) WITH CHECK (true);