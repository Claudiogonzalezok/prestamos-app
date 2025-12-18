📂 Estructura del Proyecto
prestamos-app/
├── backend/          # API REST (Node.js + Express + MongoDB)
├── frontend/         # Panel Web Administrativo (React)
├── mobile/           # App Mobile para clientes (React Native)
└── docs/             # Documentación técnica y funcional

📌 Descripción de cada módulo

backend/
API principal del sistema. Maneja autenticación, lógica de negocio, cálculos financieros y persistencia de datos.

frontend/
Panel web para empleados y administradores de la financiera:

Gestión de clientes

Alta y seguimiento de préstamos

Control de cuotas y pagos

Reportes

mobile/
Aplicación móvil para clientes:

Consulta de préstamos

Estado de cuotas

Historial de pagos

Notificaciones

docs/
Diagramas, documentación de API, reglas de negocio y decisiones técnicas.

🧠 Modelo de Datos – Visión General

El sistema está diseñado bajo un enfoque multi-tenant, donde cada financiera gestiona su propio conjunto de usuarios, clientes y préstamos.

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Financiera │────<│   Usuario   │────<│   Cliente   │
│  (tenant)   │     │ (empleados) │     │  (deudores) │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌─────────────┐            │
                    │ Configuración│            │
                    │ (tasas, mora)│            │
                    └─────────────┘            │
                                               ▼
                                        ┌─────────────┐
                                        │  Préstamo   │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Cuota     │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │    Pago     │
                                        └─────────────┘

🧩 Modelos de Datos Principales
🏦 Financiera (Tenant)

Representa a la entidad financiera.

Datos institucionales

Configuración general

Relación con usuarios y clientes

👤 Usuario (Empleados)

Usuarios internos de la financiera.

Roles: admin, empleado

Autenticación y permisos

Gestión operativa del sistema

👥 Cliente (Deudores)

Personas que reciben préstamos.

Datos personales

Relación con préstamos

Historial crediticio

⚙️ Configuración

Parámetros financieros de la financiera.

Tasas de interés

Interés por mora

Penalizaciones

Reglas de cálculo

💵 Préstamo

Contrato financiero entre la financiera y el cliente.

Monto

Plazo

Tasa aplicada

Estado del préstamo

📆 Cuota

Detalle de pagos programados del préstamo.

Número de cuota

Monto

Fecha de vencimiento

Estado (pendiente, pagada, vencida)

💳 Pago

Registro de pagos realizados por el cliente.

Fecha

Monto

Medio de pago

Aplicación a cuotas

🛠️ Tecnologías Utilizadas
Backend

Node.js

Express

MongoDB + Mongoose

JWT (autenticación)

Middleware de roles y permisos

Frontend

React

React Router

Bootstrap / React-Bootstrap

Axios

Mobile

React Native

Expo (opcional)

API REST compartida con frontend

🔐 Seguridad

Autenticación basada en JWT

Control de acceso por roles

Aislamiento de datos por financiera (multi-tenant)

Validaciones a nivel backend

🚀 Estado del Proyecto

En desarrollo activo
Diseño modular preparado para crecimiento y escalabilidad.

📌 Próximos pasos sugeridos

 Definir flujos de mora automática

 Reportes financieros

 Notificaciones push / email

 Exportación de datos

 Auditoría de operaciones

📄 Licencia

Proyecto de uso educativo / académico.
Licencia a definir.
