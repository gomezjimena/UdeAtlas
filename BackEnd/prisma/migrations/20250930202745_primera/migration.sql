-- CreateTable
CREATE TABLE "tbl_Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "id_tipo_documento" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "tbl_Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Tipo_Documento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tbl_Tipo_Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tbl_Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Permiso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tbl_Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Permiso_X_Rol" (
    "id" SERIAL NOT NULL,
    "id_permiso" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "tbl_Permiso_X_Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Comentario" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,

    CONSTRAINT "tbl_Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Favorito" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,

    CONSTRAINT "tbl_Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Eventos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_evento" TIMESTAMP(3) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "id_usuario_admin" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,

    CONSTRAINT "tbl_Eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Lugar" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "x_coord" DOUBLE PRECISION NOT NULL,
    "y_coord" DOUBLE PRECISION NOT NULL,
    "id_tipo_lugar" INTEGER NOT NULL,

    CONSTRAINT "tbl_Lugar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Tipo_Lugar" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tbl_Tipo_Lugar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Interior" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "piso" INTEGER NOT NULL,
    "id_lugar" INTEGER NOT NULL,

    CONSTRAINT "tbl_Interior_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Conexion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "distancia" DOUBLE PRECISION NOT NULL,
    "id_lugar_origen" INTEGER NOT NULL,
    "id_lugar_destino" INTEGER NOT NULL,

    CONSTRAINT "tbl_Conexion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Ruta" (
    "id" SERIAL NOT NULL,
    "distancia" DOUBLE PRECISION NOT NULL,
    "id_lugar_origen" INTEGER NOT NULL,
    "id_lugar_destino" INTEGER NOT NULL,

    CONSTRAINT "tbl_Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_Conexion_X_Ruta" (
    "id" SERIAL NOT NULL,
    "orden" INTEGER NOT NULL,
    "id_ruta" INTEGER NOT NULL,
    "id_conexion" INTEGER NOT NULL,

    CONSTRAINT "tbl_Conexion_X_Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_Usuario_documento_key" ON "tbl_Usuario"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_Usuario_correo_key" ON "tbl_Usuario"("correo");

-- AddForeignKey
ALTER TABLE "tbl_Usuario" ADD CONSTRAINT "tbl_Usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "tbl_Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Usuario" ADD CONSTRAINT "tbl_Usuario_id_tipo_documento_fkey" FOREIGN KEY ("id_tipo_documento") REFERENCES "tbl_Tipo_Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Permiso_X_Rol" ADD CONSTRAINT "tbl_Permiso_X_Rol_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "tbl_Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Permiso_X_Rol" ADD CONSTRAINT "tbl_Permiso_X_Rol_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "tbl_Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Comentario" ADD CONSTRAINT "tbl_Comentario_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Comentario" ADD CONSTRAINT "tbl_Comentario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tbl_Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Favorito" ADD CONSTRAINT "tbl_Favorito_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Favorito" ADD CONSTRAINT "tbl_Favorito_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tbl_Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Eventos" ADD CONSTRAINT "tbl_Eventos_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Eventos" ADD CONSTRAINT "tbl_Eventos_id_usuario_admin_fkey" FOREIGN KEY ("id_usuario_admin") REFERENCES "tbl_Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Lugar" ADD CONSTRAINT "tbl_Lugar_id_tipo_lugar_fkey" FOREIGN KEY ("id_tipo_lugar") REFERENCES "tbl_Tipo_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Interior" ADD CONSTRAINT "tbl_Interior_id_lugar_fkey" FOREIGN KEY ("id_lugar") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Conexion" ADD CONSTRAINT "tbl_Conexion_id_lugar_destino_fkey" FOREIGN KEY ("id_lugar_destino") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Conexion" ADD CONSTRAINT "tbl_Conexion_id_lugar_origen_fkey" FOREIGN KEY ("id_lugar_origen") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Ruta" ADD CONSTRAINT "tbl_Ruta_id_lugar_destino_fkey" FOREIGN KEY ("id_lugar_destino") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Ruta" ADD CONSTRAINT "tbl_Ruta_id_lugar_origen_fkey" FOREIGN KEY ("id_lugar_origen") REFERENCES "tbl_Lugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Conexion_X_Ruta" ADD CONSTRAINT "tbl_Conexion_X_Ruta_id_conexion_fkey" FOREIGN KEY ("id_conexion") REFERENCES "tbl_Conexion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_Conexion_X_Ruta" ADD CONSTRAINT "tbl_Conexion_X_Ruta_id_ruta_fkey" FOREIGN KEY ("id_ruta") REFERENCES "tbl_Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
