const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./node_modules/@prisma/client');
const { supabase } = require('./supabaseClient');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const cors = require('cors');
app.use(cors({
  origin: ['https://ude-atlas.vercel.app/login' ,'http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));

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

// Ruta para obtener un usuario por ID (con creación automática)
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [1/5] Buscando usuario con auth_user_id:', id);
    
    // 1️⃣ Buscar usuario existente
    let usuario = await prisma.tbl_Usuario.findUnique({
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

    // 2️⃣ Si existe, retornarlo
    if (usuario) {
      console.log('✅ [2/5] Usuario encontrado en BD:', usuario.nombre);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return res.json(usuario);
    }

    // 3️⃣ Si no existe, obtener de Supabase
    console.log('⚠️ [2/5] Usuario NO encontrado en BD');
    console.log('📡 [3/5] Obteniendo de Supabase Auth...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);
    
    if (authError || !authData?.user) {
      console.error('❌ Error de Supabase:', authError);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado en Supabase'
      });
    }

    const authUser = authData.user;
    console.log('✅ [3/5] Usuario encontrado en Supabase:', authUser.email);
    
    // 4️⃣ Crear usuario en Prisma
    console.log('📝 [4/5] Creando usuario en BD Prisma...');
    
    const nombreUsuario = authUser.user_metadata?.full_name || 
                         authUser.user_metadata?.name || 
                         authUser.user_metadata?.display_name ||
                         authUser.email?.split('@')[0] || 
                         'Usuario';
    
    // ✅ Generar documento único basado en el auth_user_id
    const documentoUnico = `AUTH-${authUser.id.substring(0, 8).toUpperCase()}`;
    
    console.log('    Nombre a guardar:', nombreUsuario);
    console.log('    Email a guardar:', authUser.email);
    console.log('    Documento a guardar:', documentoUnico);
    
    try {
      usuario = await prisma.tbl_Usuario.create({
        data: {
          nombre: nombreUsuario,
          documento: documentoUnico, // ✅ Documento único
          correo: authUser.email,
          id_tipo_documento: 1, 
          id_rol: 2,
          auth_user_id: authUser.id,
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

      console.log('✅ [5/5] Usuario creado exitosamente en BD:');
      console.log('    ID en BD:', usuario.id);
      console.log('    Nombre:', usuario.nombre);
      console.log('    Email:', usuario.correo);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return res.json(usuario);
      
    } catch (prismaError) {
      console.error('❌ [5/5] Error al crear usuario en Prisma:');
      console.error('    Error:', prismaError.message);
      console.error('    Código:', prismaError.code);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return res.status(500).json({ 
        success: false,
        error: 'Error al crear usuario en la base de datos',
        details: prismaError.message
      });
    }
    
  } catch (error) {
    console.error('💥 Error general en /api/usuarios/:id:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
        id_tipo_lugar: true,
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

// Obtener favoritos por usuario
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


// Agregar a favoritos
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


//  Eliminar de favoritos
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

// Obtener usuario por auth_user_id
app.get('/api/usuarios/auth/:authUserId', async (req, res) => {
  try {
    const authUserId = req.params.authUserId;
    const usuario = await prisma.tbl_Usuario.findUnique({
      where: { auth_user_id: authUserId },
      select: { 
        id: true, 
        nombre: true, 
        correo: true,
        rol: {  // 👈 Agrega esto
          select: {
            nombre: true
          }
        }
      },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuario' });
  }
});

//  Obtener comentarios de un lugar
app.get('/api/comentarios/lugar/:lugarId', async (req, res) => {
  try {
    const lugarId = parseInt(req.params.lugarId);
    
    const comentarios = await prisma.tbl_Comentario.findMany({
      where: { id_lugar: lugarId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    res.json({ success: true, data: comentarios });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ success: false, error: 'Error al obtener comentarios' });
  }
});

//  Crear comentario
app.post('/api/comentarios', async (req, res) => {
  try {
    const { id_usuario, id_lugar, descripcion } = req.body;

    if (!descripcion || descripcion.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El comentario no puede estar vacío' 
      });
    }

    const nuevoComentario = await prisma.tbl_Comentario.create({
      data: {
        id_usuario,
        id_lugar,
        descripcion: descripcion.trim(),
        fecha: new Date(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json({ success: true, data: nuevoComentario });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ success: false, error: 'Error al crear comentario' });
  }
});

//  Actualizar comentario (solo el propietario)
app.put('/api/comentarios/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { descripcion, id_usuario } = req.body;

    // Verificar que el comentario existe y pertenece al usuario
    const comentarioExistente = await prisma.tbl_Comentario.findUnique({
      where: { id },
    });

    if (!comentarioExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comentario no encontrado' 
      });
    }

    if (comentarioExistente.id_usuario !== id_usuario) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para editar este comentario' 
      });
    }

    const comentarioActualizado = await prisma.tbl_Comentario.update({
      where: { id },
      data: { 
        descripcion: descripcion.trim(),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json({ success: true, data: comentarioActualizado });
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar comentario' });
  }
});

//  Eliminar comentario (solo el propietario)
app.delete('/api/comentarios/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_usuario } = req.body;

    // Verificar que el comentario existe y pertenece al usuario
    const comentarioExistente = await prisma.tbl_Comentario.findUnique({
      where: { id },
    });

    if (!comentarioExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comentario no encontrado' 
      });
    }

    if (comentarioExistente.id_usuario !== id_usuario) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permiso para eliminar este comentario' 
      });
    }

    await prisma.tbl_Comentario.delete({ where: { id } });

    res.json({ success: true, message: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar comentario' });
  }
});

// Obtener eventos de un lugar
app.get('/api/eventos/lugar/:lugarId', async (req, res) => {
  try {
    const lugarId = parseInt(req.params.lugarId);
    
    const eventos = await prisma.tbl_Eventos.findMany({
      where: { id_lugar: lugarId },
      include: {
        usuarioAdmin: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { fecha_evento: 'asc' }, // Eventos más próximos primero
    });

    res.json({ success: true, data: eventos });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eventos' });
  }
});

// Obtener todos los eventos (opcional, para vista general)
app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await prisma.tbl_Eventos.findMany({
      include: {
        usuarioAdmin: {
          select: {
            id: true,
            nombre: true,
          },
        },
        lugar: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { fecha_evento: 'asc' },
    });

    res.json({ success: true, data: eventos });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eventos' });
  }
});

// Crear evento (solo admins)
app.post('/api/eventos', async (req, res) => {
  try {
    const { id_usuario_admin, id_lugar, titulo, descripcion, fecha_evento } = req.body;

    // Verificar que el usuario sea admin
    const usuario = await prisma.tbl_Usuario.findUnique({
      where: { id: id_usuario_admin },
      include: { rol: true },
    });

    if (!usuario || (usuario.rol.nombre !== 'Admin' && usuario.rol.nombre !== 'SuperAdmin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo los administradores pueden crear eventos' 
      });
    }

    if (!titulo || titulo.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El título del evento es obligatorio' 
      });
    }

    if (!fecha_evento) {
      return res.status(400).json({ 
        success: false, 
        message: 'La fecha del evento es obligatoria' 
      });
    }

    const nuevoEvento = await prisma.tbl_Eventos.create({
      data: {
        id_usuario_admin,
        id_lugar,
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        fecha_evento: new Date(fecha_evento),
        fecha_creacion: new Date(),
      },
      include: {
        usuarioAdmin: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json({ success: true, data: nuevoEvento });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ success: false, error: 'Error al crear evento' });
  }
});

// Actualizar evento (solo admins)
app.put('/api/eventos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_usuario_admin, titulo, descripcion, fecha_evento } = req.body;

    // Verificar que el usuario sea admin
    const usuario = await prisma.tbl_Usuario.findUnique({
      where: { id: id_usuario_admin },
      include: { rol: true },
    });

    if (!usuario || (usuario.rol.nombre !== 'Admin' && usuario.rol.nombre !== 'SuperAdmin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo los administradores pueden editar eventos' 
      });
    }

    // Verificar que el evento existe
    const eventoExistente = await prisma.tbl_Eventos.findUnique({
      where: { id },
    });

    if (!eventoExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    const eventoActualizado = await prisma.tbl_Eventos.update({
      where: { id },
      data: {
        titulo: titulo?.trim() || eventoExistente.titulo,
        descripcion: descripcion?.trim() || eventoExistente.descripcion,
        fecha_evento: fecha_evento ? new Date(fecha_evento) : eventoExistente.fecha_evento,
      },
      include: {
        usuarioAdmin: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    res.json({ success: true, data: eventoActualizado });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar evento' });
  }
});

// Eliminar evento (solo admins)
app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_usuario_admin } = req.body;

    // Verificar que el usuario sea admin
    const usuario = await prisma.tbl_Usuario.findUnique({
      where: { id: id_usuario_admin },
      include: { rol: true },
    });

    if (!usuario || (usuario.rol.nombre !== 'Admin' && usuario.rol.nombre !== 'SuperAdmin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo los administradores pueden eliminar eventos' 
      });
    }

    // Verificar que el evento existe
    const eventoExistente = await prisma.tbl_Eventos.findUnique({
      where: { id },
    });

    if (!eventoExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    await prisma.tbl_Eventos.delete({ where: { id } });

    res.json({ success: true, message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar evento' });
  }
});

// Algoritmo de Dijkstra
function dijkstra(lugares, conexiones, origenId, destinoId) {
  // Crear grafo de adyacencia
  const graph = new Map();
  lugares.forEach(lugar => graph.set(lugar.id, []));
  
  // Agregar conexiones (bidireccionales)
  conexiones.forEach(conexion => {
    graph.get(conexion.id_lugar_origen)?.push({
      lugarId: conexion.id_lugar_destino,
      distancia: conexion.distancia,
      conexion: conexion
    });
    
    graph.get(conexion.id_lugar_destino)?.push({
      lugarId: conexion.id_lugar_origen,
      distancia: conexion.distancia,
      conexion: conexion
    });
  });

  // Inicializar distancias
  const distancias = new Map();
  const previos = new Map();
  const visitados = new Set();
  
  lugares.forEach(lugar => {
    distancias.set(lugar.id, lugar.id === origenId ? 0 : Infinity);
    previos.set(lugar.id, null);
  });

  const pendientes = lugares.map(l => l.id);

  while (pendientes.length > 0) {
    // Nodo con menor distancia
    let actual = pendientes[0];
    let menorDistancia = distancias.get(actual);
    
    for (const lugarId of pendientes) {
      const dist = distancias.get(lugarId);
      if (dist < menorDistancia) {
        actual = lugarId;
        menorDistancia = dist;
      }
    }

    if (menorDistancia === Infinity) break;
    if (actual === destinoId) break;

    pendientes.splice(pendientes.indexOf(actual), 1);
    visitados.add(actual);

    // Revisar vecinos
    const vecinos = graph.get(actual) || [];
    for (const { lugarId, distancia, conexion } of vecinos) {
      if (visitados.has(lugarId)) continue;

      const nuevaDistancia = distancias.get(actual) + distancia;
      if (nuevaDistancia < distancias.get(lugarId)) {
        distancias.set(lugarId, nuevaDistancia);
        previos.set(lugarId, { lugarId: actual, conexion });
      }
    }
  }

  // Reconstruir camino
  if (distancias.get(destinoId) === Infinity) return null;

  const camino = [];
  const conexionesUsadas = [];
  let actual = destinoId;

  while (actual !== null) {
    const lugar = lugares.find(l => l.id === actual);
    camino.unshift(lugar);
    
    const previo = previos.get(actual);
    if (previo) {
      conexionesUsadas.unshift(previo.conexion);
      actual = previo.lugarId;
    } else {
      actual = null;
    }
  }

  return {
    lugares: camino,
    conexiones: conexionesUsadas,
    distanciaTotal: distancias.get(destinoId)
  };
}

//  Buscar ruta existente en BD
app.get('/api/rutas/:origenId/:destinoId', async (req, res) => {
  try {
    const origenId = parseInt(req.params.origenId);
    const destinoId = parseInt(req.params.destinoId);

    const rutaExistente = await prisma.tbl_Ruta.findFirst({
      where: {
        OR: [
          { id_lugar_origen: origenId, id_lugar_destino: destinoId },
          { id_lugar_origen: destinoId, id_lugar_destino: origenId }
        ]
      },
      include: {
        conexiones: {
          include: {
            conexion: true
          },
          orderBy: { orden: 'asc' }
        },
        lugarOrigen: {
          select: {
            id: true,
            nombre: true,
            x_coord: true,
            y_coord: true
          }
        },
        lugarDestino: {
          select: {
            id: true,
            nombre: true,
            x_coord: true,
            y_coord: true
          }
        }
      }
    });

    if (rutaExistente) {
      // Reconstruir lugares desde las conexiones
      const lugares = [rutaExistente.lugarOrigen];
      const conexiones = rutaExistente.conexiones.map(c => c.conexion);
      
      // Agregar lugares intermedios
      for (const conexionRuta of rutaExistente.conexiones) {
        const siguienteLugarId = conexionRuta.conexion.id_lugar_destino === lugares[lugares.length - 1].id
          ? conexionRuta.conexion.id_lugar_origen
          : conexionRuta.conexion.id_lugar_destino;
          
        const siguienteLugar = await prisma.tbl_Lugar.findUnique({
          where: { id: siguienteLugarId },
          select: {
            id: true,
            nombre: true,
            x_coord: true,
            y_coord: true
          }
        });
        
        if (siguienteLugar) lugares.push(siguienteLugar);
      }

      return res.json({
        success: true,
        cached: true,
        data: {
          lugares,
          conexiones,
          distanciaTotal: rutaExistente.distancia
        }
      });
    }

    res.json({ success: false, cached: false, message: 'Ruta no encontrada en caché' });
  } catch (error) {
    console.error('Error al buscar ruta:', error);
    res.status(500).json({ success: false, error: 'Error al buscar ruta' });
  }
});

//  Calcular ruta con Dijkstra
app.post('/api/rutas/calcular', async (req, res) => {
  try {
    const { id_lugar_origen, id_lugar_destino } = req.body;

    console.log(' [Backend] Calculando ruta');
    console.log('   Origen:', id_lugar_origen);
    console.log('   Destino:', id_lugar_destino);

    if (id_lugar_origen === id_lugar_destino) {
      console.error('[Backend] Origen y destino son iguales');
      return res.status(400).json({
        success: false,
        message: 'El origen y destino no pueden ser iguales'
      });
    }

    //  OBTENER TODOS LOS LUGARES (sin excluir tipo 7)
    const lugares = await prisma.tbl_Lugar.findMany({
      select: {
        id: true,
        nombre: true,
        x_coord: true,
        y_coord: true,
        id_tipo_lugar: true, // Incluir para verificar después
      },
    });

    console.log(`[Backend] Lugares encontrados: ${lugares.length}`);

    // Verificar que origen y destino NO sean tipo 7
    const lugarOrigen = lugares.find(l => l.id === id_lugar_origen);
    const lugarDestino = lugares.find(l => l.id === id_lugar_destino);

    if (!lugarOrigen || !lugarDestino) {
      console.error(' [Backend] Origen o destino no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Origen o destino no válido'
      });
    }

    if (lugarOrigen.id_tipo_lugar === 7) {
      console.error(' [Backend] El origen es tipo 7');
      return res.status(400).json({
        success: false,
        message: 'El origen no puede ser un punto de conexión interno'
      });
    }

    if (lugarDestino.id_tipo_lugar === 7) {
      console.error(' [Backend] El destino es tipo 7');
      return res.status(400).json({
        success: false,
        message: 'El destino no puede ser un punto de conexión interno'
      });
    }

    const conexiones = await prisma.tbl_Conexion.findMany({
      select: {
        id: true,
        nombre: true,
        distancia: true,
        id_lugar_origen: true,
        id_lugar_destino: true,
      },
    });

    console.log(`🔗 [Backend] Conexiones encontradas: ${conexiones.length}`);

    // Calcular ruta (ahora con todos los lugares disponibles)
    const ruta = dijkstra(lugares, conexiones, id_lugar_origen, id_lugar_destino);

    if (!ruta) {
      console.error('[Backend] No se encontró ruta');
      return res.status(404).json({
        success: false,
        message: 'No se encontró una ruta entre estos lugares'
      });
    }

    console.log('[Backend] Ruta calculada exitosamente');
    console.log('   Lugares en ruta:', ruta.lugares.length);
    console.log('   Distancia total:', ruta.distanciaTotal);

    res.json({ success: true, data: ruta });
  } catch (error) {
    console.error(' [Backend] Error al calcular ruta:', error);
    res.status(500).json({ success: false, error: 'Error al calcular ruta' });
  }
});

//  Guardar ruta calculada en BD
app.post('/api/rutas/guardar', async (req, res) => {
  try {
    const { id_lugar_origen, id_lugar_destino, distancia, conexiones } = req.body;

    // Verificar si ya existe
    const rutaExistente = await prisma.tbl_Ruta.findFirst({
      where: {
        OR: [
          { id_lugar_origen, id_lugar_destino },
          { id_lugar_origen: id_lugar_destino, id_lugar_destino: id_lugar_origen }
        ]
      }
    });

    if (rutaExistente) {
      return res.json({
        success: true,
        message: 'Ruta ya existe en caché',
        data: rutaExistente
      });
    }

    // Crear nueva ruta
    const nuevaRuta = await prisma.tbl_Ruta.create({
      data: {
        id_lugar_origen,
        id_lugar_destino,
        distancia,
        conexiones: {
          create: conexiones.map((idConexion, index) => ({
            id_conexion: idConexion,
            orden: index
          }))
        }
      },
      include: {
        conexiones: true
      }
    });

    res.json({
      success: true,
      message: 'Ruta guardada correctamente',
      data: nuevaRuta
    });
  } catch (error) {
    console.error('Error al guardar ruta:', error);
    res.status(500).json({ success: false, error: 'Error al guardar ruta' });
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
