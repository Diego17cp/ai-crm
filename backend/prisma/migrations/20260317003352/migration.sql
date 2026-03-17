-- CreateEnum
CREATE TYPE "EstadoGeneral" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('Disponible', 'Reservado', 'Vendido');

-- CreateEnum
CREATE TYPE "SexoPersona" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'CONVIVIENTE', 'DIVORCIADO');

-- CreateEnum
CREATE TYPE "TipoTelefono" AS ENUM ('PERSONAL', 'TRABAJO', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "CanalContacto" AS ENUM ('WHATSAPP', 'WEB');

-- CreateEnum
CREATE TYPE "TipoRemitente" AS ENUM ('BOT', 'HUMANO');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PROGRAMADA', 'ATENDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('CONTADO', 'CREDITO');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('FINALIZADA', 'PENDIENTE', 'ANULADO');

-- CreateEnum
CREATE TYPE "SolvenciaEconomica" AS ENUM ('DESCARTADO', 'MOROSO', 'PAGA ATRASADO', 'BUEN_PAGADOR', 'EXCELENTE');

-- CreateEnum
CREATE TYPE "ActitudCliente" AS ENUM ('QUEJOSO', 'ENOJADO', 'DESCONFIADO', 'AMABLE');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('PENDIENTE', 'PAGADO');

-- CreateEnum
CREATE TYPE "EstadoContrato" AS ENUM ('ADENDA', 'POR RESOLVER', 'ESCRITURA PUBLICA', 'CESION CONTRACTUAL', 'FIRMADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'DEPOSITO');

-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('LEAD', 'CLIENTE');

-- CreateEnum
CREATE TYPE "EstadoChat" AS ENUM ('BOT', 'ESPERANDO_ASESOR', 'ATENDIDO_HUMANO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "ubigeos" (
    "id" CHAR(6) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "ubigeos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "dni" CHAR(8) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "ultimo_login" TIMESTAMP(3),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "id_ubigeo" CHAR(6) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "abreviatura" VARCHAR(20),
    "ubicacion" TEXT,
    "descripcion" TEXT,
    "estado" "EstadoGeneral",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas" (
    "id" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "estado" "EstadoGeneral",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manzanas" (
    "id" SERIAL NOT NULL,
    "id_etapa" INTEGER NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "estado" "EstadoGeneral",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manzanas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" SERIAL NOT NULL,
    "id_manzana" INTEGER NOT NULL,
    "numero_lote" VARCHAR(10) NOT NULL,
    "numero_partida" VARCHAR(20),
    "area_m2" DECIMAL(10,2) NOT NULL,
    "precio_m2" DECIMAL(10,2) NOT NULL,
    "precio_total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoLote",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes_imagenes" (
    "id" SERIAL NOT NULL,
    "id_lote" INTEGER NOT NULL,
    "url_imagen" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(100),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lotes_imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_doc_identidad" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "estado" "EstadoGeneral",

    CONSTRAINT "tipo_doc_identidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "id_tipo_doc_identidad" INTEGER NOT NULL,
    "id_ubigeo" CHAR(6),
    "tipo_persona" "TipoPersona",
    "numero" VARCHAR(12) NOT NULL,
    "nombres" VARCHAR(50),
    "apellidos" VARCHAR(50),
    "fecha_nacimiento" DATE,
    "sexo" "SexoPersona",
    "estado_civil" "EstadoCivil",
    "es_peruano" BOOLEAN NOT NULL DEFAULT true,
    "nacionalidad" VARCHAR(30),
    "direccion" VARCHAR(250),
    "email" VARCHAR(100),
    "ocupacion" VARCHAR(150),
    "solvencia" "SolvenciaEconomica",
    "actitud" "ActitudCliente",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefonos_cliente" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "numero" VARCHAR(20),
    "tipo" "TipoTelefono",

    CONSTRAINT "telefonos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversaciones" (
    "id" UUID NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "canal" "CanalContacto",
    "estado" "EstadoChat" NOT NULL DEFAULT 'BOT',
    "id_usuario_asignado" UUID,
    "fecha_asignacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" SERIAL NOT NULL,
    "id_usuario" UUID,
    "id_conversacion" UUID NOT NULL,
    "remitente" "TipoRemitente",
    "contenido" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_lote" INTEGER,
    "id_usuario_responsable" UUID NOT NULL,
    "fecha_cita" DATE NOT NULL,
    "hora_cita" TIME,
    "observaciones_visita" TEXT,
    "puntuacion_cliente" INTEGER,
    "estado_cita" "EstadoCita",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "id_lote" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "fecha_venta" DATE DEFAULT CURRENT_TIMESTAMP,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "cuota_inicial" DECIMAL(12,2) DEFAULT 0,
    "tipo_pago" "TipoPago",
    "num_cuotas" INTEGER,
    "monto_cuota" DECIMAL(12,2),
    "tasa_interes" DECIMAL(5,2),
    "dia_pago" INTEGER,
    "meses_gracia" INTEGER DEFAULT 0,
    "estado" "EstadoVenta",
    "estado_contrato" "EstadoContrato",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas" (
    "id" SERIAL NOT NULL,
    "id_venta" INTEGER NOT NULL,
    "numero_cuota" INTEGER NOT NULL,
    "monto_cuota" DECIMAL(12,2) NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "estado" "EstadoCuota" DEFAULT 'PENDIENTE',
    "metodo_pago" "MetodoPago",
    "comprobante_url" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_id_rol_idx" ON "usuarios"("id_rol");

-- CreateIndex
CREATE INDEX "proyectos_id_ubigeo_idx" ON "proyectos"("id_ubigeo");

-- CreateIndex
CREATE INDEX "etapas_id_proyecto_idx" ON "etapas"("id_proyecto");

-- CreateIndex
CREATE INDEX "manzanas_id_etapa_idx" ON "manzanas"("id_etapa");

-- CreateIndex
CREATE INDEX "lotes_id_manzana_idx" ON "lotes"("id_manzana");

-- CreateIndex
CREATE INDEX "lotes_imagenes_id_lote_idx" ON "lotes_imagenes"("id_lote");

-- CreateIndex
CREATE INDEX "clientes_id_tipo_doc_identidad_idx" ON "clientes"("id_tipo_doc_identidad");

-- CreateIndex
CREATE INDEX "clientes_id_ubigeo_idx" ON "clientes"("id_ubigeo");

-- CreateIndex
CREATE UNIQUE INDEX "telefonos_cliente_numero_key" ON "telefonos_cliente"("numero");

-- CreateIndex
CREATE INDEX "telefonos_cliente_id_cliente_idx" ON "telefonos_cliente"("id_cliente");

-- CreateIndex
CREATE INDEX "conversaciones_id_cliente_idx" ON "conversaciones"("id_cliente");

-- CreateIndex
CREATE INDEX "mensajes_id_usuario_idx" ON "mensajes"("id_usuario");

-- CreateIndex
CREATE INDEX "citas_id_cliente_idx" ON "citas"("id_cliente");

-- CreateIndex
CREATE INDEX "citas_id_proyecto_idx" ON "citas"("id_proyecto");

-- CreateIndex
CREATE INDEX "citas_id_lote_idx" ON "citas"("id_lote");

-- CreateIndex
CREATE INDEX "ventas_id_lote_idx" ON "ventas"("id_lote");

-- CreateIndex
CREATE INDEX "ventas_id_cliente_idx" ON "ventas"("id_cliente");

-- CreateIndex
CREATE INDEX "cuotas_id_venta_idx" ON "cuotas"("id_venta");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_id_ubigeo_fkey" FOREIGN KEY ("id_ubigeo") REFERENCES "ubigeos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapas" ADD CONSTRAINT "etapas_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manzanas" ADD CONSTRAINT "manzanas_id_etapa_fkey" FOREIGN KEY ("id_etapa") REFERENCES "etapas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_id_manzana_fkey" FOREIGN KEY ("id_manzana") REFERENCES "manzanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes_imagenes" ADD CONSTRAINT "lotes_imagenes_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_tipo_doc_identidad_fkey" FOREIGN KEY ("id_tipo_doc_identidad") REFERENCES "tipo_doc_identidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_ubigeo_fkey" FOREIGN KEY ("id_ubigeo") REFERENCES "ubigeos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telefonos_cliente" ADD CONSTRAINT "telefonos_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_id_usuario_asignado_fkey" FOREIGN KEY ("id_usuario_asignado") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_conversacion_fkey" FOREIGN KEY ("id_conversacion") REFERENCES "conversaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_usuario_responsable_fkey" FOREIGN KEY ("id_usuario_responsable") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_lote_fkey" FOREIGN KEY ("id_lote") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_id_venta_fkey" FOREIGN KEY ("id_venta") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
