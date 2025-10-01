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
