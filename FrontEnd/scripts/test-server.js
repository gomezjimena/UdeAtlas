import fetch from 'node-fetch';

async function testServerConnection() {
  console.log('🔍 Verificando conexión al servidor backend...\n');
  
  const serverUrl = 'http://localhost:3001';
  
  try {
    // Test 1: Verificar si el servidor está ejecutándose
    console.log('1. Probando conexión al servidor...');
    const healthResponse = await fetch(`${serverUrl}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Servidor backend funcionando:', healthData.message);
    } else {
      console.log('❌ Servidor respondió con error:', healthResponse.status);
      return;
    }
    
    // Test 2: Probar endpoint de categorías
    console.log('\n2. Probando endpoint de categorías...');
    const categoriasResponse = await fetch(`${serverUrl}/api/categorias`);
    
    if (categoriasResponse.ok) {
      const categorias = await categoriasResponse.json();
      console.log('✅ Endpoint de categorías funcionando');
      console.log(`   Categorías encontradas: ${categorias.length}`);
      
      if (categorias.length > 0) {
        console.log('   Primeras categorías:');
        categorias.slice(0, 3).forEach(cat => {
          console.log(`   - ID: ${cat.id}, Nombre: ${cat.nombre}`);
        });
      }
    } else {
      console.log('❌ Error en endpoint de categorías:', categoriasResponse.status);
      const errorText = await categoriasResponse.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión al servidor:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Asegúrate de que el servidor esté ejecutándose: npm run dev:server');
    console.log('   2. Verifica que el puerto 3001 esté disponible');
    console.log('   3. Revisa los logs del servidor para más detalles');
  }
}

// Ejecutar el test
testServerConnection();
