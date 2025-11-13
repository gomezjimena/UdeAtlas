// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Servicio para obtener categorías de tipo de lugar
export const getTipoLugarCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching tipo lugar categories:', error);
    return {
      success: false,
      error: 'Error al obtener las categorías',
      data: [],
    };
  }
};

// Servicio para obtener lugares por categoría
export const getLugaresByCategory = async (categoryId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lugares/categoria/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching lugares by category:', error);
    return {
      success: false,
      error: 'Error al obtener los lugares',
      data: [],
    };
  }
};

// Servicio para obtener todos los lugares
export const getAllLugares = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/lugares`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching all lugares:', error);
    return {
      success: false,
      error: 'Error al obtener los lugares',
      data: [],
    };
  }
};

export const getLugarById = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/lugares/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = await res.json();

    if (!res.ok || !payload.success) {
      return { success: false, error: payload.error || 'Error al obtener el lugar' };
    }

    return { success: true, data: payload.data };
  } catch (error) {
    console.error('Network error getLugarById:', error);
    return { success: false, error: 'Error de red' };
  }
};

// Servicio para sincronizar usuario autenticado con Supabase Auth
export const syncAuthUser = async (authUser: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUser }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error syncing auth user:', error);
    return { success: false, error: 'Error al sincronizar usuario' };
  }
};

// Servicio para obtener todos los usuarios
export const getUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return {
      success: false,
      error: 'Error al obtener los usuarios',
      data: [],
    };
  }
};

// Servicio para obtener un usuario específico por ID
export const getUsuarioById = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    // El backend devuelve el usuario directamente, no envuelto
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching usuario by id:', error);
    return { success: false, error: 'Error al obtener usuario' };
  }
};

// ===================== FAVORITOS =====================

// Obtener favoritos por usuario
export const getFavoritosByUser = async (usuarioId: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/favoritos/${usuarioId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return { success: false, error: 'Error al obtener favoritos' };
  }
};

// Agregar a favoritos
export const addFavorito = async (id_usuario: number, id_lugar: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/favoritos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, id_lugar }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return { success: false, error: 'Error al agregar favorito' };
  }
};

// Eliminar de favoritos
export const deleteFavorito = async (favoritoId: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/favoritos/${favoritoId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return { success: false, error: 'Error al eliminar favorito' };
  }
};

export const getUserByAuthId = async (authUserId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/usuarios/auth/${authUserId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { success: false, error: 'Error al obtener usuario' };
  }
};

// Obtener comentarios de un lugar
export const getComentariosByLugar = async (lugarId: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/comentarios/lugar/${lugarId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return { success: false, error: 'Error al obtener comentarios' };
  }
};

// Crear comentario
export const createComentario = async (
  id_usuario: number,
  id_lugar: number,
  descripcion: string
) => {
  try {
    const res = await fetch(`${API_BASE_URL}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, id_lugar, descripcion }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return { success: false, error: 'Error al crear comentario' };
  }
};

// Actualizar comentario
export const updateComentario = async (
  comentarioId: number,
  id_usuario: number,
  descripcion: string
) => {
  try {
    const res = await fetch(`${API_BASE_URL}/comentarios/${comentarioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario, descripcion }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    return { success: false, error: 'Error al actualizar comentario' };
  }
};

// Eliminar comentario
export const deleteComentario = async (comentarioId: number, id_usuario: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/comentarios/${comentarioId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return { success: false, error: 'Error al eliminar comentario' };
  }
};

// Obtener eventos de un lugar
export const getEventosByLugar = async (lugarId: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/eventos/lugar/${lugarId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return { success: false, error: 'Error al obtener eventos' };
  }
};

// Obtener todos los eventos
export const getAllEventos = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/eventos`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return { success: false, error: 'Error al obtener eventos' };
  }
};

// Crear evento (solo admins)
export const createEvento = async (
  id_usuario_admin: number,
  id_lugar: number,
  titulo: string,
  descripcion: string | null,
  fecha_evento: string
) => {
  try {
    const res = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario_admin,
        id_lugar,
        titulo,
        descripcion,
        fecha_evento,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al crear evento:', error);
    return { success: false, error: 'Error al crear evento' };
  }
};

// Actualizar evento (solo admins)
export const updateEvento = async (
  eventoId: number,
  id_usuario_admin: number,
  titulo?: string,
  descripcion?: string | null,
  fecha_evento?: string
) => {
  try {
    const res = await fetch(`${API_BASE_URL}/eventos/${eventoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario_admin,
        titulo,
        descripcion,
        fecha_evento,
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return { success: false, error: 'Error al actualizar evento' };
  }
};

// Eliminar evento (solo admins)
export const deleteEvento = async (eventoId: number, id_usuario_admin: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/eventos/${eventoId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario_admin }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return { success: false, error: 'Error al eliminar evento' };
  }
};

export interface RutaCalculada {
  lugares: Array<{
    id: number;
    nombre: string;
    x_coord: number;
    y_coord: number;
  }>;
  conexiones: Array<{
    id: number;
    nombre: string;
    distancia: number;
    id_lugar_origen: number;
    id_lugar_destino: number;
  }>;
  distanciaTotal: number;
}

// Buscar ruta existente
export const getRutaExistente = async (origenId: number, destinoId: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/rutas/${origenId}/${destinoId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al buscar ruta:', error);
    return { success: false, error: 'Error al buscar ruta' };
  }
};

// Calcular nueva ruta
export const calcularRuta = async (origenId: number, destinoId: number) => {
  try {
    const res = await fetch(`${API_BASE_URL}/rutas/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_lugar_origen: origenId,
        id_lugar_destino: destinoId
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al calcular ruta:', error);
    return { success: false, error: 'Error al calcular ruta' };
  }
};

// Guardar ruta
export const guardarRuta = async (
  origenId: number,
  destinoId: number,
  distancia: number,
  conexiones: number[]
) => {
  try {
    const res = await fetch(`${API_BASE_URL}/rutas/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_lugar_origen: origenId,
        id_lugar_destino: destinoId,
        distancia,
        conexiones
      }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error al guardar ruta:', error);
    return { success: false, error: 'Error al guardar ruta' };
  }
};