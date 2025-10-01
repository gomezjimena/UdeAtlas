# 🔍 Diagnóstico de Conexión - Route Atlas Campus

## Pasos para diagnosticar el error "Error al cargar categorías"

### 1. **Crear archivo de configuración (.env)**

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/route_atlas_campus?schema=public"

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY="false"

# API Configuration (opcional)
VITE_API_URL="http://localhost:3001/api"
```

**⚠️ IMPORTANTE:** Reemplaza `username`, `password` y `localhost:5432` con tus credenciales reales de PostgreSQL.

### 2. **Instalar dependencias**

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del servidor
npm run server:install
```

### 3. **Verificar la base de datos**

```bash
# Ejecutar diagnóstico de base de datos
npm run test:db
```

Este comando verificará:
- ✅ Conexión a PostgreSQL
- ✅ Existencia de la tabla `tbl_Tipo_Lugar`
- ✅ Número de registros en la tabla
- ✅ Datos de ejemplo

### 4. **Configurar la base de datos (si es necesario)**

Si el test de base de datos falla:

```bash
# Ejecutar migraciones de Prisma
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate
```

### 5. **Verificar el servidor backend**

```bash
# Ejecutar diagnóstico del servidor
npm run test:server
```

Este comando verificará:
- ✅ Si el servidor está ejecutándose en puerto 3001
- ✅ Si los endpoints de API responden correctamente
- ✅ Si las categorías se obtienen correctamente

### 6. **Ejecutar diagnóstico completo**

```bash
# Ejecutar todos los tests de diagnóstico
npm run diagnose
```

### 7. **Iniciar el proyecto**

```bash
# Ejecutar frontend y backend juntos
npm run dev:all
```

## 🚨 Errores Comunes y Soluciones

### Error: "Can't reach database server"
- **Causa:** PostgreSQL no está ejecutándose
- **Solución:** Iniciar PostgreSQL y verificar la URL de conexión

### Error: "Table 'tbl_tipo_lugar' doesn't exist"
- **Causa:** Las migraciones no se han ejecutado
- **Solución:** Ejecutar `npx prisma migrate dev`

### Error: "ECONNREFUSED" en el servidor
- **Causa:** El servidor backend no está ejecutándose
- **Solución:** Ejecutar `npm run dev:server` en una terminal separada

### Error: "Failed to fetch" en el frontend
- **Causa:** El frontend no puede conectar con el backend
- **Solución:** Verificar que ambos estén ejecutándose y en los puertos correctos

## 📊 Verificación Manual

### Verificar en el navegador:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca llamadas a `/api/categorias`
5. Revisa el estado de la respuesta y los errores

### Verificar en la consola del servidor:
1. Ejecuta `npm run dev:server`
2. Revisa los logs para errores de base de datos
3. Verifica que las consultas se ejecuten correctamente

## 🆘 Si nada funciona

1. **Verifica que PostgreSQL esté instalado y ejecutándose**
2. **Confirma que la base de datos `route_atlas_campus` existe**
3. **Revisa que el usuario de PostgreSQL tenga permisos**
4. **Verifica que los puertos 3001 y 8080 estén disponibles**
