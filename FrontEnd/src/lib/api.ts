// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
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
    console.error('Error fetching usuario by id:', error);
    return {
      success: false,
      error: 'Error al obtener el usuario',
      data: null,
    };
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