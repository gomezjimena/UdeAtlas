# Configuración del Proyecto Route Atlas Campus

## Configuración de la Base de Datos

1. **Crear archivo `.env` en la raíz del proyecto:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/route_atlas_campus?schema=public"

# Prisma
PRISMA_GENERATE_DATAPROXY="false"
```

2. **Configurar la base de datos PostgreSQL:**
   - Instalar PostgreSQL
   - Crear una base de datos llamada `route_atlas_campus`
   - Actualizar la `DATABASE_URL` en el archivo `.env` con tus credenciales

3. **Ejecutar migraciones de Prisma:**
```bash
npx prisma migrate dev
npx prisma generate
```

## Instalación y Ejecución

### 1. Instalar dependencias del frontend:
```bash
npm install
```

### 2. Instalar dependencias del servidor:
```bash
npm run server:install
```

### 3. Ejecutar el proyecto completo (frontend + backend):
```bash
npm run dev:all
```

### 4. O ejecutar por separado:

**Solo el servidor (puerto 3001):**
```bash
npm run dev:server
```

**Solo el frontend (puerto 8080):**
```bash
npm run dev
```

## Estructura del Proyecto

- `src/` - Frontend React con Vite
- `server/` - Backend Express con Prisma
- `prisma/` - Schema y migraciones de la base de datos

## API Endpoints

- `GET /api/health` - Estado del servidor
- `GET /api/categorias` - Obtener todas las categorías de tipo de lugar
- `GET /api/lugares` - Obtener todos los lugares
- `GET /api/lugares/categoria/:categoryId` - Obtener lugares por categoría

## Características Implementadas

✅ Servicio para obtener categorías de `tbl_Tipo_Lugar`
✅ Hook personalizado `useCategories` para manejar el estado
✅ Sidebar actualizado con categorías dinámicas
✅ Backend API con Express y Prisma
✅ Configuración de desarrollo con scripts automatizados
