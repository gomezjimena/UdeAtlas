const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./node_modules/@prisma/client');
const { supabase } = require('./supabaseClient');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para sincronizar usuario de Supabase con Prisma
app.post('/api/auth/sync', async (req, res) => {
  try {
    const { authUser } = req.body;

    if (!authUser || !authUser.id) {
      return res.status(400).json({ error: 'Faltan datos del usuario' });
    }

    // Buscar usuario existente por correo
    let usuario = await prisma.tbl_Usuario.findUnique({
      where: { correo: authUser.email },
    });

    // Si no existe, lo creamos
    if (!usuario) {
      usuario = await prisma.tbl_Usuario.create({
        data: {
          nombre: authUser.user_metadata?.full_name || 'Usuario sin nombre',
          documento: 'N/A',
          correo: authUser.email,
          id_tipo_documento: 1, 
          id_rol: 2, 
          auth_user_id: authUser.id, 
        },
      });
    }

    res.json({ success: true, usuario });
  } catch (error) {
    console.error('Error sincronizando usuario:', error);
    res.status(500).json({ error: 'Error al sincronizar usuario' });
  }
});

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

//Ruta para obtener usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.tbl_Usuario.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        id_rol: true,
      },
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await prisma.tbl_Usuario.findUnique({
      where: { 
        auth_user_id: id
      },
      select: {
        id: true,
        auth_user_id: true,
        nombre: true,
        correo: true,
        id_rol: true,
        rol: {
          select: {
            id: true,
            nombre: true,
          }
        }
      },
    });

    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    // 👇 SOLO retornar el usuario, sin envolver en {success, data}
    res.json(usuario);
    
  } catch (error) {
    console.error('Error fetching usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
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
app.get('/api/lugares/:id', async (req, res) => {  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }  try {
    
    const lugar = await prisma.tbl_Lugar.findUnique({
      where: { id },
      include: {
        tipoLugar: true,  
        comentarios: {    
          select: { 
            id: true, 
            descripcion: true, 
            fecha: true, 
            id_usuario: true 
          },
        },        eventos: {        
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            fecha_evento: true,
            fecha_creacion: true,
            id_usuario_admin: true,
          },
        },        favoritos: {      
          select: { 
            id: true, 
            id_usuario: true 
          }
        },        interiores: {    
          select: { 
            id: true, 
            nombre: true, 
            descripcion: true, 
            piso: true 
          },
        },      },    });

    if (!lugar) {
      return res.status(404).json({ success: false, error: 'Lugar no encontrado' });
    }
    return res.json({ success: true, data: lugar });  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ Obtener favoritos por usuario
app.get('/api/favoritos/:usuarioId', async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const favoritos = await prisma.tbl_Favorito.findMany({
      where: { id_usuario: usuarioId },
      include: {
        lugar: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            imagen: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    res.json({ success: true, data: favoritos });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener favoritos' });
  }
});


// ✅ Agregar a favoritos
app.post('/api/favoritos', async (req, res) => {
  try {
    const { id_usuario, id_lugar } = req.body;

    // Evitar duplicados
    const existente = await prisma.tbl_Favorito.findFirst({
      where: { id_usuario, id_lugar },
    });

    if (existente) {
      return res.status(400).json({ success: false, message: 'Ya está en favoritos' });
    }

    const nuevoFavorito = await prisma.tbl_Favorito.create({
      data: { id_usuario, id_lugar },
    });

    res.json({ success: true, data: nuevoFavorito });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ success: false, error: 'Error al agregar favorito' });
  }
});


// ✅ Eliminar de favoritos
app.delete('/api/favoritos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tbl_Favorito.delete({ where: { id } });
    res.json({ success: true, message: 'Favorito eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar favorito' });
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
