const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://nxiviidirmzqbcldegus.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Qf-bMKqDet0Xgh6PHExtsA_s3g0jXzn';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ruta del archivo CSV
const CSV_PATH = 'c:\\Users\\quevedo\\Documents\\productos -pagina.csv';

// Función para leer CSV separado por punto y coma
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        throw new Error('El archivo CSV está vacío');
    }
    
    // Primera línea: cabeceras
    const headers = lines[0].split(';').map(h => h.trim());
    
    // Resto: datos
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map(v => v.trim());
        
        // Ignorar filas vacías o sin nombre
        if (!values[0] || values[0] === '') continue;
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }
    
    return data;
}

// Función para limpiar y convertir valores numéricos
function parseNumber(value) {
    if (!value || value === '' || value === '-') return null;
    
    // Limpiar el valor (quitar espacios, símbolos de moneda, etc.)
    const cleaned = value.toString().trim().replace(/[^\d.,]/g, '');
    
    if (cleaned === '') return null;
    
    // Convertir a número (manejar punto y coma decimal)
    const num = parseFloat(cleaned.replace(',', '.'));
    return isNaN(num) ? null : num;
}

// Función para detectar tipo de producto (ARROZ/AZUCAR, FIDEO, OTROS)
function detectarTipoProducto(nombre, categoria) {
    const catUpper = (categoria || '').toUpperCase();
    const nomUpper = (nombre || '').toUpperCase();
    
    if (catUpper.includes('ARROZ') || catUpper.includes('AZUCAR') || catUpper.includes('AZÚCAR') ||
        nomUpper.includes('ARROZ') || nomUpper.includes('AZUCAR') || nomUpper.includes('AZÚCAR')) {
        return 'ARROZ_AZUCAR';
    }
    
    if (catUpper.includes('FIDEO') || nomUpper.includes('FIDEO')) {
        return 'FIDEO';
    }
    
    return 'OTRO';
}

// Función para mapear fila del CSV a estructura de Supabase
function mapearProducto(csvRow) {
    const tipo = detectarTipoProducto(csvRow.nombre, csvRow.categoria);
    
    const producto = {
        nombre: csvRow.nombre || '',
        categoria: csvRow.categoria || '',
        codigo: csvRow.codigo || null,
        imagen: null
    };
    
    if (tipo === 'ARROZ_AZUCAR') {
        // Productos de ARROZ/AZUCAR usan KG como unidad base
        producto.precio_unid = parseNumber(csvRow['Precios de kg']);
        producto.stock_unid = parseNumber(csvRow['Stock KG']);
        producto.precio_doc = parseNumber(csvRow['10 Kg']);
        producto.stock_doc = null; // No aplica
        producto.precio_paq = parseNumber(csvRow['SACO']); // SACO como precio_paq (medio saco)
        producto.stock_paq = null; // No aplica
        producto.precio_caja = parseNumber(csvRow['SACO']); // SACO como precio_caja
        producto.stock_caja = null; // No aplica
        producto.unidades_paq = null;
        producto.unidades_caja = null;
        producto.kg_paq = parseNumber(csvRow['Kg llegan en Saco']) / 2 || null; // Medio saco
        producto.kg_caja = parseNumber(csvRow['Kg llegan en Saco']) || null;
        producto.costo_unid = null;
        producto.costo_doc = null;
        producto.costo_paq = null;
        producto.costo_caja = null;
    } else if (tipo === 'FIDEO') {
        // Productos de FIDEO
        producto.precio_unid = parseNumber(csvRow.precio_unid);
        producto.stock_unid = parseNumber(csvRow.stock_unid);
        producto.precio_doc = null; // No aplica para fideos
        producto.stock_doc = null;
        producto.precio_paq = parseNumber(csvRow['Precios x 3unid']) || parseNumber(csvRow.precio_paq);
        producto.stock_paq = parseNumber(csvRow['Stock Disponible Pqte']);
        producto.precio_caja = parseNumber(csvRow.precio_caja);
        producto.stock_caja = parseNumber(csvRow.stock_caja);
        producto.unidades_paq = parseNumber(csvRow['Unidades que llegan en Pqt']);
        producto.unidades_caja = parseNumber(csvRow['Unidades que llegan en caja']);
        producto.kg_paq = null;
        producto.kg_caja = null;
        producto.costo_unid = null;
        producto.costo_doc = null;
        producto.costo_paq = parseNumber(csvRow['Precios de Costo Pqt']);
        producto.costo_caja = null;
    } else {
        // Productos generales (docena, paquete, caja)
        producto.precio_unid = parseNumber(csvRow.precio_unid);
        producto.stock_unid = parseNumber(csvRow.stock_unid);
        producto.precio_doc = parseNumber(csvRow['Precios x 2 unid']) || parseNumber(csvRow.precio_doc);
        producto.stock_doc = parseNumber(csvRow['Stock Disponible docena']);
        producto.precio_paq = parseNumber(csvRow['Precios x 3unid']) || parseNumber(csvRow.precio_paq);
        producto.stock_paq = parseNumber(csvRow['Stock Disponible Pqte']);
        producto.precio_caja = parseNumber(csvRow.precio_caja);
        producto.stock_caja = parseNumber(csvRow.stock_caja);
        producto.unidades_paq = parseNumber(csvRow['Unidades que llegan en Pqt']);
        producto.unidades_caja = parseNumber(csvRow['Unidades que llegan en caja']);
        producto.kg_paq = null;
        producto.kg_caja = null;
        producto.costo_unid = null;
        producto.costo_doc = null;
        producto.costo_paq = parseNumber(csvRow['Precios de Costo Pqt']);
        producto.costo_caja = null;
    }
    
    return producto;
}

// Función principal
async function importarProductos() {
    try {
        console.log('📖 Leyendo archivo CSV...');
        const csvData = parseCSV(CSV_PATH);
        console.log(`✅ Se encontraron ${csvData.length} productos en el CSV`);
        
        console.log('🔄 Mapeando productos...');
        const productos = csvData.map((row, index) => ({
            ...mapearProducto(row),
            id: index + 1  // Generar ID secuencial comenzando desde 1
        }));
        
        console.log(`📤 Insertando ${productos.length} productos en Supabase...`);
        
        // Insertar en lotes de 50 para evitar timeouts
        const batchSize = 50;
        let insertados = 0;
        let errores = 0;
        
        for (let i = 0; i < productos.length; i += batchSize) {
            const batch = productos.slice(i, i + batchSize);
            
            const { data, error } = await supabase
                .from('productos')
                .insert(batch)
                .select();
            
            if (error) {
                console.error(`❌ Error insertando lote ${i}-${i + batchSize}:`, error.message);
                errores += batch.length;
            } else {
                console.log(`✅ Lote ${i + 1}-${Math.min(i + batchSize, productos.length)} insertado (${data.length} productos)`);
                insertados += data.length;
            }
        }
        
        console.log('\n📊 Resumen:');
        console.log(`✅ Productos insertados: ${insertados}`);
        console.log(`❌ Errores: ${errores}`);
        console.log('🎉 Importación completada');
        
    } catch (error) {
        console.error('❌ Error durante la importación:', error.message);
        process.exit(1);
    }
}

// Ejecutar
importarProductos();
