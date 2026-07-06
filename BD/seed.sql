-- ============================================================
-- Essence & Co. — Datos de prueba
-- Coinciden con los datos de ejemplo usados en las pantallas
-- (Noir Ambré, Fleur Blanche, etc.) para que veas todo conectado.
-- ============================================================
USE essence_co;

INSERT INTO categoria (nombre) VALUES
  ('Amaderado'), ('Floral'), ('Cítrico'), ('Oriental');

INSERT INTO producto (nombre, marca, categoria_id, descripcion, precio) VALUES
  ('Noir Ambré',    'Essence & Co.', 1, 'Acorde amaderado profundo con fondo de ámbar y vetiver.', 189),
  ('Fleur Blanche', 'Essence & Co.', 2, 'Jazmín y flor de azahar sobre almizcle blanco.', 149),
  ('Citrus Nova',   'Essence & Co.', 3, 'Bergamota y pomelo rosado con un toque de jengibre.', 129),
  ('Oud Impérial',  'Essence & Co.', 4, 'Oud, azafrán y cuero curtido.', 259),
  ('Velours Rose',  'Essence & Co.', 2, 'Rosa de mayo y peonía sobre sándalo.', 169),
  ('Bois Sauvage',  'Essence & Co.', 1, 'Cedro, cardamomo y pachulí.', 199),
  ('Aqua Marine',   'Essence & Co.', 3, 'Notas acuáticas y cítricas con almizcle ligero.', 119),
  ('Ambre Nuit',    'Essence & Co.', 4, 'Ámbar, vainilla y especias cálidas.', 219);

-- presentaciones (capacidad + stock por producto)
INSERT INTO producto_presentacion (producto_id, capacidad_ml, stock, stock_minimo) VALUES
  (1, 50, 12, 5), (1, 80, 8, 5),
  (2, 50, 4, 6),
  (3, 50, 20, 5), (3, 80, 10, 5),
  (4, 80, 0, 5),
  (5, 50, 8, 5),
  (6, 50, 3, 5), (6, 80, 6, 5),
  (7, 50, 15, 5),
  (8, 80, 10, 5);

INSERT INTO usuario_staff (nombre, usuario, password_hash, rol) VALUES
  ('Carlos Ruiz', 'usuario.vendedor', '$2b$12$reemplazarConHashReal', 'vendedor'),
  ('Rosa Medina', 'usuario.admin', '$2b$12$reemplazarConHashReal', 'administrador');

INSERT INTO cliente (nombre, dni, correo, password_hash, telefono) VALUES
  ('María López', '45678912', 'maria.lopez@correo.com', '$2b$12$reemplazarConHashReal', '987654321'),
  ('Jorge Díaz',  '41234567', 'jorge.diaz@correo.com',  '$2b$12$reemplazarConHashReal', '956123478');

INSERT INTO proveedor (nombre, contacto, telefono, correo) VALUES
  ('Aromas del Valle SAC', 'Ricardo Paredes', '944556677', 'ventas@aromasdelvalle.pe'),
  ('Distribuidora Fragancia Perú', 'Elena Castro', '944112233', 'contacto@fragranciaperu.pe'),
  ('Import Perfum EIRL', 'Hugo Salazar', '944998877', 'hugo@importperfum.pe');