const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./node_modules/@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para obtener todas las categorías de tipo de lugar
app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await prisma.tbl_Tipo_Lugar.findMany({
      where: {
        nombre: {
          not: "Nodo"
        }
      },
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(categorias);
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Ruta para obtener un lugar por su ID y listarlos
app.get('/api/lugares', async (req, res) => {
  try {
    const lugares = await prisma.tbl_Lugar.findMany({
      /***where: {
        id_tipo_lugar: {
          not: 7
        }
      },***/
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        imagen: true,
        x_coord: true,
        y_coord: true,
        id_tipo_lugar: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(lugares);
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Ruta para obtener lugares por categoría
app.get('/api/lugares/categoria/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    const lugares = await prisma.tbl_Lugar.findMany({
      where: {
        id_tipo_lugar: categoryId,
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        x_coord: true,
        y_coord: true,
        imagen: true,
        tipoLugar: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(lugares);
  } catch (error) {
    console.error('Error fetching lugares by category:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos los lugares
app.get('/api/lugares', async (req, res) => {
  try {
    const lugares = await prisma.tbl_Lugar.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        x_coord: true,
        y_coord: true,
        imagen: true,
        tipoLugar: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    res.json(lugares);
  } catch (error) {
    console.error('Error fetching all lugares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/lugares/:id
app.get('/api/lugares/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  console.log("🔵 Recibiendo petición para lugar ID:", id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }

  try {
    console.log("🔵 Buscando lugar en BD...");
    
    const lugar = await prisma.tbl_Lugar.findUnique({
      where: { id },
      include: {
        tipoLugar: true,  // ✅ Cambiado
        comentarios: {    // ✅ Cambiado
          select: { 
            id: true, 
            descripcion: true, 
            fecha: true, 
            id_usuario: true 
          },
        },
        eventos: {        // ✅ Cambiado
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            fecha_evento: true,
            fecha_creacion: true,
            id_usuario_admin: true,
          },
        },
        favoritos: {      // ✅ Cambiado
          select: { 
            id: true, 
            id_usuario: true 
          }
        },
        interiores: {     // ✅ Cambiado
          select: { 
            id: true, 
            nombre: true, 
            descripcion: true, 
            piso: true 
          },
        },
      },
    });

    console.log("🔵 Lugar encontrado:", lugar);

    if (!lugar) {
      return res.status(404).json({ success: false, error: 'Lugar no encontrado' });
    }

    return res.json({ success: true, data: lugar });
  } catch (error) {
    console.error('❌ Error completo getting lugar by id:', error);
    console.error('❌ Stack:', error.stack);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});



// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Cerrar conexión de Prisma al terminar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
