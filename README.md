# 💰 prestamos-app

Sistema integral de **gestión de préstamos** para financieras, con soporte **multi-tenant**, panel web administrativo y aplicación móvil para clientes.

El proyecto permite administrar clientes, préstamos, cuotas y pagos de forma segura, centralizada y escalable.

---

El sistema está diseñado bajo un enfoque multi-tenant, donde cada financiera gestiona su propio conjunto de usuarios, clientes y préstamos.
## 📂 Estructura del Proyecto

```
prestamos-app/
├── backend/ # API REST (Node.js + Express + MongoDB)
├── frontend/ # Panel Web Administrativo (React)
├── mobile/ # App Mobile para clientes (React Native)
└── docs/ # Documentación técnica y funcional
```
---
##🧠 Modelo de Datos – Visión General

```
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


```

El sistema está diseñado bajo un enfoque multi-tenant, donde cada financiera gestiona su propio conjunto de usuarios, clientes y préstamos.
## 📌 Descripción de Carpetas

### 🔧 backend/
API principal del sistema.

- Autenticación (JWT)
- Lógica de negocio
- Cálculo de intereses y mora
- Persistencia de datos (MongoDB)

---

### 🖥️ frontend/
Panel web para empleados y administradores.

- Gestión de clientes
- Alta y seguimiento de préstamos
- Control de cuotas y pagos
- Reportes

---

### 📱 mobile/
Aplicación móvil para clientes.

- Consulta de préstamos
- Estado de cuotas
- Historial de pagos
- Notificaciones

---

### 📚 docs/
Documentación del proyecto.

- Diagramas
- Reglas de negocio
- Decisiones técnicas
- Endpoints de la API

---

## 🧠 Modelo de Datos (Conceptual)

Relaciones principales del sistema:

- Una **Financiera** tiene muchos **Usuarios**
- Un **Usuario** gestiona **Clientes**
- Un **Cliente** puede tener varios **Préstamos**
- Cada **Préstamo** tiene **Cuotas**
- Cada **Cuota** puede tener **Pagos**

---

## 🧩 Modelos Principales

### 🏦 Financiera (Tenant)
Entidad principal del sistema.

- Datos institucionales
- Configuración financiera
- Aislamiento de datos (multi-tenant)

---

### 👤 Usuario (Empleados)
Usuarios internos de la financiera.

- Roles: `admin`, `empleado`
- Autenticación y permisos
- Operación del sistema

---

### 👥 Cliente (Deudores)
Personas que reciben préstamos.

- Datos personales
- Préstamos asociados
- Historial crediticio

---

### ⚙️ Configuración
Parámetros financieros.

- Tasas de interés
- Interés por mora
- Penalizaciones
- Reglas de cálculo

---

### 💵 Préstamo
Contrato financiero.

- Monto
- Plazo
- Tasa aplicada
- Estado del préstamo

---

### 📆 Cuota
Detalle de pagos programados.

- Número de cuota
- Monto
- Fecha de vencimiento
- Estado (pendiente, pagada, vencida)

---

### 💳 Pago
Registro de pagos realizados.

- Fecha
- Monto
- Medio de pago
- Aplicación a cuotas

---

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT

### Frontend
- React
- React Router
- Axios
- Bootstrap / React-Bootstrap

### Mobile
- React Native
- API REST compartida

---

## 🔐 Seguridad

- Autenticación con JWT
- Control de acceso por roles
- Aislamiento por financiera
- Validaciones en backend

---

## 🚀 Estado del Proyecto

🟡 En desarrollo activo

Arquitectura modular preparada para escalar.

---

## 📌 Próximos Pasos

- [ ] Reportes financieros
- [ ] Gestión de mora automática
- [ ] Notificaciones push / email
- [ ] Exportación de datos
- [ ] Auditoría de operaciones

---

## 📄 Licencia

Proyecto de uso educativo / académico.  
Licencia a definir.
