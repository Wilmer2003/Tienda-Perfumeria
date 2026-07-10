# ⚜️ AURA Boutique - Sistema de Gestión de Ventas de Perfumería

"Año de la Esperanza y el Fortalecimiento de la Democracia"

### 🏛️ UNIVERSIDAD PRIVADA ANTENOR ORREGO
**Escuela Profesional de Sistemas e Inteligencia Artificial**

* **Curso:** Ingeniería de Software
* **Docente:** Ing. Calderón Sedano, José Antonio
* **NRC:** 5572-5573
* **Sede:** Trujillo, 2026

---

## 👥 Integrantes del Equipo
* 🧑‍💻 **Maximiliano Villanueva, Jhon**
* 🧑‍💻 **Sandoval Vargas, Robert**
* 🧑‍💻 **Silva López, Wilmer** (Product Owner / Administrador del Repositorio)
* 🧑‍💻 **Vergara López, Junior**

---

## 📝 1. Modelado y Reglas del Negocio

El sistema **AURA Boutique** automatiza de manera integral los procesos comerciales de la empresa a través de tres flujos principales:

1. **Atención de Pedidos Web:** Acceso público al catálogo de fragancias, gestión asíncrona de un carrito de compras volátil, autenticación obligatoria del cliente antes de confirmar el pedido y procesamiento seguro del pago directamente en la plataforma web.
2. **Venta Directa en Tienda Física:** Interfaz optimizada para el mostrador (Staff/Vendedor) que permite la consulta de disponibilidad de stock en tiempo real, registro rápido de clientes y procesamiento de cobros en efectivo o tarjeta.
3. **Gestión de Abastecimiento y Control Comercial:** Panel administrativo privado enfocado en el monitoreo de alertas de stock mínimo, generación automática de órdenes de compra dirigidas a proveedores y descarga de reportes comerciales para la toma de decisiones gerenciales.

### 📐 Reglas Críticas del Negocio (Business Rules)
* **RN-01 (Obligatoriedad de Registro):** Todo pedido web y venta presencial debe estar registrado obligatoriamente en el sistema con los datos completos del cliente.
* **RN-02 (Seguridad por Roles):** El acceso al panel de gestión y reportes requiere credenciales válidas del administrador. El vendedor está restringido exclusivamente a la gestión de ventas de mostrador y actualización de pedidos web.
* **RN-03 (Control de Inventario en Tiempo Real):** El control de inventario debe actualizarse automáticamente tras cada transacción o reabastecimiento. El sistema impedirá procesar cualquier venta si se detecta que no hay stock disponible.
* **RN-04 (Comprobantes Electrónicos):** Toda transacción finalizada (web o física) debe emitir un comprobante electrónico (boleta o factura).
* **RN-05 (Formatos de Salida Gerenciales):** Los reportes de ventas generados por el administrador deben exportarse exclusivamente en formatos PDF o Excel.

---

## 🛠️ 2. Stack Tecnológico

El proyecto está diseñado bajo una arquitectura modular desacoplada para garantizar un rendimiento óptimo de respuesta menor a 2 segundos (`RNF 04`):

* **Base de Datos:** PostgreSQL / MySQL (Relacional, garantizando la integridad de stock mediante transacciones y restricciones de llave foránea).
* **Backend:** Python (FastAPI / Flask) - Estructurado bajo patrones limpios de controladores, servicios, esquemas y modelos ORM.
* **Frontend:** HTML5 nativo, JavaScript Moderno (ES6+) para manejo asíncrono de estados del carrito, y CSS3 corporativo basado en tokens de diseño de lujo (Modo Oscuro).

---

## 📁 3. Estructura Completa del Repositorio

El árbol de directorios está organizado estrictamente de la siguiente manera:

```text
Tienda-Perfumeria/
├── BD/
│   ├── schema.sql           # Script de creación de tablas, llaves y restricciones de stock
│   └── seed.sql             # Datos de prueba (perfumes, capacidades y usuarios staff)
├── Backend/
│   ├── Main.py              # Punto de entrada de la API del servidor backend
│   ├── requirements.txt     # Dependencias del ecosistema Python
│   ├── .env.example         # Plantilla de variables de entorno (Credenciales de BD)
│   ├── core/                # Módulos de configuración global y seguridad JWT
│   ├── database/            # Inicialización de la sesión de la base de datos
│   ├── models/              # Clases de entidad reflejadas de las tablas SQL
│   ├── schemas/             # Esquemas de validación de datos (Pydantic / DTO)
│   ├── controllers/         # Controladores lógicos de los Casos de Uso (c_realizar_venta, etc.)
│   └── services/            # Servicios de soporte y lógica de persistencia
└── Frontend/
    ├── index.html           # CU-02: Consultar Catálogo (Acceso Público)
    ├── carrito.html         # CU-04: Gestionar Carrito de Compras
    ├── login_cliente.html   # CU-03: Iniciar Sesión (Clientes)
    ├── realizar_pago.html   # CU-08: Realizar Pago Electrónico / Presencial
    ├── generar_comprobante.html # CU-09: Emisión de Boleta o Factura
    ├── confirmar_pedido.html# CU-06: Confirmar Pedido Web (Pendiente de armar)
    ├── staff/
    │   ├── login_staff.html # CU-01: Autenticación del Personal (Vendedor/Admin)
    │   ├── vendedor/
    │   │   └── realizar_venta.html # CU-10: Registro de Venta Física en Mostrador
    │   └── admin/
    │       ├── productos.html      # CU-09: Panel de Gestión (CRUD de Productos)
    │       ├── orden_compra.html   # CU-11: Generar Orden de Compra (Abastecimiento)
    │       └── reportes_ventas.html# CU-12: Reporte de Ventas y Exportación
    └── assets/
        ├── css/             # Hojas de estilo estructuradas por pantalla
        │   ├── tokens.css   # Variables globales de color corporativo
        │   └── (estilos individuales...)
        ├── js/              # Controladores interactivos frontend (uno por pantalla)
        └── img/             # Carpeta contenedora de capturas del prototipo de interfaz