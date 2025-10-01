import { PrismaClient } from '@prisma/client';

async function testDatabaseConnection() {
  console.log('🔍 Verificando conexión a la base de datos...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Verificar conexión básica
    console.log('1. Probando conexión básica...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos\n');
    
    // Test 2: Verificar si la tabla tbl_Tipo_Lugar existe
    console.log('2. Verificando tabla tbl_Tipo_Lugar...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tbl_tipo_lugar'
      );
    `;
    console.log('✅ Tabla tbl_Tipo_Lugar existe:', tableExists[0].exists);
    
    // Test 3: Contar registros en tbl_Tipo_Lugar
    console.log('\n3. Contando registros en tbl_Tipo_Lugar...');
    const count = await prisma.tbl_Tipo_Lugar.count();
    console.log(`✅ Número de categorías encontradas: ${count}`);
    
    // Test 4: Obtener algunas categorías de ejemplo
    console.log('\n4. Obteniendo categorías de ejemplo...');
    const categorias = await prisma.tbl_Tipo_Lugar.findMany({
      take: 5,
      select: {
        id: true,
        nombre: true,
      }
    });
    
    if (categorias.length > 0) {
      console.log('✅ Categorías encontradas:');
      categorias.forEach(cat => {
        console.log(`   - ID: ${cat.id}, Nombre: ${cat.nombre}`);
      });
    } else {
      console.log('⚠️  No se encontraron categorías en la tabla');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que PostgreSQL esté ejecutándose');
      console.log('   2. Verifica la URL de conexión en tu archivo .env');
      console.log('   3. Asegúrate de que la base de datos "route_atlas_campus" exista');
    } else if (error.code === 'P2021') {
      console.log('\n💡 La tabla no existe. Ejecuta las migraciones:');
      console.log('   npx prisma migrate dev');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el test
testDatabaseConnection();
