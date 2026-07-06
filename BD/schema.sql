-- ============================================================
-- Essence & Co. — Esquema de base de datos
-- Cada tabla está comentada con la entidad (e_) del diagrama de
-- colaboración a la que corresponde, para trazabilidad con el informe.
-- ============================================================

CREATE DATABASE IF NOT EXISTS essence_co
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE essence_co;

-- ---------------------------------------------------------
-- e_categoria — Consultar Catálogo
-- ---------------------------------------------------------
CREATE TABLE categoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
);

-- ---------------------------------------------------------
-- e_producto — Consultar Catálogo, Modificar Productos, Registrar productos
-- ---------------------------------------------------------
CREATE TABLE producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  marca VARCHAR(80) NOT NULL DEFAULT 'Essence & Co.',
  categoria_id INT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

-- Cada producto puede venir en más de una capacidad (50 ml, 80 ml),
-- y CADA capacidad tiene su propio stock — así se maneja RF05/RF06.
CREATE TABLE producto_presentacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  capacidad_ml INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE,
  UNIQUE KEY uq_producto_capacidad (producto_id, capacidad_ml)
);

-- ---------------------------------------------------------
-- e_cliente — Confirmar Pedido, Buscar/Registrar Cliente
-- ---------------------------------------------------------
CREATE TABLE cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  dni VARCHAR(8) UNIQUE,
  correo VARCHAR(120) UNIQUE,
  password_hash VARCHAR(255),          -- NULL si fue registrado por el vendedor en tienda física
  telefono VARCHAR(20),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- e_usuario (staff) — Login Vendedor/Administrador
-- ---------------------------------------------------------
CREATE TABLE usuario_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('vendedor','administrador') NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- e_carrito — Agregar/Eliminar/Modificar Productos del Carrito
-- ---------------------------------------------------------
CREATE TABLE carrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NULL,                 -- NULL mientras el cliente no inicie sesión (carrito público)
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

CREATE TABLE carrito_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrito_id INT NOT NULL,
  presentacion_id INT NOT NULL,
  cantidad INT NOT NULL,
  FOREIGN KEY (carrito_id) REFERENCES carrito(id) ON DELETE CASCADE,
  FOREIGN KEY (presentacion_id) REFERENCES producto_presentacion(id),
  UNIQUE KEY uq_carrito_item (carrito_id, presentacion_id)
);

-- ---------------------------------------------------------
-- e_pedido — Confirmar Pedido (venta web)
-- ---------------------------------------------------------
CREATE TABLE pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  estado ENUM('Pendiente','Enviado','Entregado') NOT NULL DEFAULT 'Pendiente',
  total DECIMAL(10,2) NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

CREATE TABLE pedido_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  presentacion_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (presentacion_id) REFERENCES producto_presentacion(id)
);

-- ---------------------------------------------------------
-- e_venta — Realizar Venta (mostrador, atendida por vendedor)
-- ---------------------------------------------------------
CREATE TABLE venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendedor_id INT NOT NULL,
  cliente_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo','tarjeta') NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES usuario_staff(id),
  FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

CREATE TABLE venta_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  presentacion_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
  FOREIGN KEY (presentacion_id) REFERENCES producto_presentacion(id)
);

-- ---------------------------------------------------------
-- e_pago — Realizar Pago (web: Yape/tarjeta)
-- ---------------------------------------------------------
CREATE TABLE pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NULL,
  venta_id INT NULL,
  metodo ENUM('yape','tarjeta','efectivo') NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado ENUM('aprobado','rechazado') NOT NULL,
  referencia VARCHAR(50),              -- N° operación Yape o últimos 4 de tarjeta
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id),
  FOREIGN KEY (venta_id) REFERENCES venta(id),
  CONSTRAINT chk_pago_origen CHECK (pedido_id IS NOT NULL OR venta_id IS NOT NULL)
);

-- ---------------------------------------------------------
-- e_comprobante — Generar Comprobante (boleta o factura)
-- ---------------------------------------------------------
CREATE TABLE comprobante (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NULL,
  venta_id INT NULL,
  tipo ENUM('boleta','factura') NOT NULL,
  serie VARCHAR(4) NOT NULL,
  numero VARCHAR(10) NOT NULL,
  documento_cliente VARCHAR(11) NOT NULL,   -- DNI (8) o RUC (11)
  nombre_cliente VARCHAR(150) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  igv DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id),
  FOREIGN KEY (venta_id) REFERENCES venta(id),
  UNIQUE KEY uq_serie_numero (serie, numero)
);

-- ---------------------------------------------------------
-- e_notificacion — Enviar Notificación
-- ---------------------------------------------------------
CREATE TABLE notificacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,          -- 'confirmacion_pedido', 'pago_aprobado', 'cambio_estado'
  mensaje TEXT NOT NULL,
  estado ENUM('enviado','fallido') NOT NULL DEFAULT 'enviado',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- ---------------------------------------------------------
-- e_proveedor / e_ordenCompra — Generar Orden de Compra
-- ---------------------------------------------------------
CREATE TABLE proveedor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(120),
  telefono VARCHAR(20),
  correo VARCHAR(120)
);

CREATE TABLE orden_compra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT NOT NULL,
  administrador_id INT NOT NULL,
  estado ENUM('enviada','atendida','rechazada') NOT NULL DEFAULT 'enviada',
  numero_factura_proveedor VARCHAR(30),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
  FOREIGN KEY (administrador_id) REFERENCES usuario_staff(id)
);

CREATE TABLE orden_compra_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_compra_id INT NOT NULL,
  presentacion_id INT NOT NULL,
  cantidad INT NOT NULL,
  FOREIGN KEY (orden_compra_id) REFERENCES orden_compra(id) ON DELETE CASCADE,
  FOREIGN KEY (presentacion_id) REFERENCES producto_presentacion(id)
);