const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://nxiviidirmzqbcldegus.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Qf-bMKqDet0Xgh6PHExtsA_s3g0jXzn';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ruta de la carpeta de imágenes
const IMAGENES_PATH = 'c:\\Users\\quevedo\\Desktop\\Pictures\\PRODUCTOS';
const STORAGE_BUCKET = 'productos';

// Función para obtener todos los archivos de imagen de una carpeta
function obtenerImagenes(folderPath) {
    const files = fs.readdirSync(folderPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.jfif', '.webp', '.gif'];
    
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });
}

// Función para normalizar texto (quitar espacios, mayúsculas, caracteres especiales)
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toString()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^A-Z0-9]/g, '') // Solo letras y números
        .trim();
}

// Función para buscar producto por código o nombre
async function buscarProducto(codigo, nombre) {
    try {
        // Primero buscar por código exacto
        if (codigo) {
            const { data: porCodigo } = await supabase
                .from('productos')
                .select('*')
                .eq('codigo', codigo)
                .single();
            
            if (porCodigo) {
                console.log(`   ✅ Encontrado por código: ${codigo}`);
                return porCodigo;
            }
        }
        
        // Si no encuentra por código, buscar por nombre
        if (nombre) {
            const nombreNormalizado = normalizarTexto(nombre);
            
            // Obtener todos los productos y buscar coincidencia
            const { data: todosProductos } = await supabase
                .from('productos')
                .select('*');
            
            if (todosProductos) {
                const encontrado = todosProductos.find(p => {
                    const nombreProductoNormalizado = normalizarTexto(p.nombre);
                    return nombreProductoNormalizado === nombreNormalizado;
                });
                
                if (encontrado) {
                    console.log(`   ✅ Encontrado por nombre: ${encontrado.nombre}`);
                    return encontrado;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error(`   ❌ Error buscando producto:`, error.message);
        return null;
    }
}

// Función para subir imagen a Supabase Storage
async function subirImagen(filePath, fileName) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const contentType = getContentType(fileName);
        
        const { data, error } = await supabase
            .storage
            .from(STORAGE_BUCKET)
            .upload(fileName, fileContent, {
                contentType: contentType,
                upsert: true // Sobrescribir si ya existe
            });
        
        if (error) {
            console.error(`   ❌ Error subiendo imagen:`, error.message);
            return null;
        }
        
        // Obtener URL pública
        const { data: { publicUrl } } = supabase
            .storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);
        
        return publicUrl;
    } catch (error) {
        console.error(`   ❌ Error subiendo imagen:`, error.message);
        return null;
    }
}

// Función para obtener el tipo de contenido MIME
function getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.jfif': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

// Función para actualizar la imagen del producto
async function actualizarImagenProducto(productoId, imageUrl) {
    try {
        const { error } = await supabase
            .from('productos')
            .update({ imagen: imageUrl })
            .eq('id', productoId);
        
        if (error) {
            console.error(`   ❌ Error actualizando producto:`, error.message);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error(`   ❌ Error actualizando producto:`, error.message);
        return false;
    }
}

// Función para crear el bucket si no existe
async function crearBucketSiNoExiste() {
    try {
        console.log(`🔍 Verificando si el bucket '${STORAGE_BUCKET}' existe...`);
        
        // Intentar listar buckets
        const { data: buckets, error } = await supabase
            .storage
            .listBuckets();
        
        if (error) {
            console.error(`❌ Error verificando buckets:`, error.message);
            return false;
        }
        
        const bucketExists = buckets.some(b => b.name === STORAGE_BUCKET);
        
        if (bucketExists) {
            console.log(`✅ El bucket '${STORAGE_BUCKET}' ya existe`);
            return true;
        }
        
        // Crear el bucket
        console.log(`📦 Creando bucket '${STORAGE_BUCKET}'...`);
        const { error: createError } = await supabase
            .storage
            .createBucket(STORAGE_BUCKET, {
                public: true // Hacer el bucket público
            });
        
        if (createError) {
            console.error(`❌ Error creando bucket:`, createError.message);
            console.log(`⚠️  Por favor, crea el bucket '${STORAGE_BUCKET}' manualmente en Supabase Storage`);
            return false;
        }
        
        console.log(`✅ Bucket '${STORAGE_BUCKET}' creado exitosamente`);
        return true;
    } catch (error) {
        console.error(`❌ Error verificando/creando bucket:`, error.message);
        return false;
    }
}

// Función principal
async function procesarImagenes() {
    try {
        console.log('📂 Leyendo imágenes de la carpeta...');
        const imagenes = obtenerImagenes(IMAGENES_PATH);
        console.log(`✅ Se encontraron ${imagenes.length} imágenes\n`);
        
        let procesadas = 0;
        let exitosas = 0;
        let errores = 0;
        let noEncontrados = 0;
        
        for (const imagen of imagenes) {
            procesadas++;
            const filePath = path.join(IMAGENES_PATH, imagen);
            const nombreSinExtension = path.basename(imagen, path.extname(imagen));
            
            console.log(`\n[${procesadas}/${imagenes.length}] Procesando: ${imagen}`);
            
            // Determinar si es código o nombre
            let codigo = null;
            let nombre = null;
            
            // Si el nombre es solo números, tratar como código
            if (/^\d+$/.test(nombreSinExtension)) {
                codigo = nombreSinExtension;
            } else {
                nombre = nombreSinExtension;
            }
            
            // Buscar producto
            const producto = await buscarProducto(codigo, nombre);
            
            if (!producto) {
                console.log(`   ⚠️  Producto no encontrado`);
                noEncontrados++;
                continue;
            }
            
            // Si el producto ya tiene imagen, preguntar si desea actualizar
            if (producto.imagen) {
                console.log(`   ℹ️  El producto ya tiene imagen: ${producto.imagen}`);
                console.log(`   🔄 Actualizando...`);
            }
            
            // Subir imagen a Storage
            console.log(`   📤 Subiendo imagen a Storage...`);
            const imageUrl = await subirImagen(filePath, imagen);
            
            if (!imageUrl) {
                console.log(`   ❌ No se pudo subir la imagen`);
                errores++;
                continue;
            }
            
            console.log(`   ✅ Imagen subida: ${imageUrl}`);
            
            // Actualizar producto
            console.log(`   🔄 Actualizando producto...`);
            const actualizado = await actualizarImagenProducto(producto.id, imageUrl);
            
            if (actualizado) {
                console.log(`   ✅ Producto actualizado correctamente`);
                exitosas++;
            } else {
                console.log(`   ❌ No se pudo actualizar el producto`);
                errores++;
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMEN');
        console.log('='.repeat(50));
        console.log(`📁 Imágenes procesadas: ${procesadas}`);
        console.log(`✅ Exitosas: ${exitosas}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`⚠️  Productos no encontrados: ${noEncontrados}`);
        console.log('='.repeat(50));
        console.log('🎉 Proceso completado');
        
    } catch (error) {
        console.error('❌ Error durante el proceso:', error.message);
        process.exit(1);
    }
}

// Ejecutar
procesarImagenes();
