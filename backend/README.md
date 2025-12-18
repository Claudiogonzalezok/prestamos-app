# 💰 CreditosPro - Backend API

Sistema de gestión de préstamos personales para financieras y prestamistas.

## 🚀 Características

- **Multi-tenant**: Cada financiera tiene su cuenta aislada
- **Roles**: Admin, Empleados, Clientes
- **Sistema Francés y Alemán**: Cálculo automático de cuotas
- **Cuotas fijas o variables**
- **Cancelación anticipada** con descuento por días
- **Mora configurable** con días de gracia
- **Portal de clientes**: Los clientes pueden ver sus préstamos
- **Reportes**: Dashboard, cartera, cobranza, morosidad

## 📋 Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/Claudiogonzalezok/prestamos-app.git
cd prestamos-app/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar servidor
npm run dev
```

## 📁 Estructura

```
backend/
├── server.js              # Punto de entrada
├── src/
│   ├── models/            # Modelos de MongoDB
│   │   ├── Financiera.js  # Tenant principal
│   │   ├── Usuario.js     # Admins y empleados
│   │   ├── Cliente.js     # Deudores
│   │   ├── Prestamo.js    # Préstamos
│   │   ├── Cuota.js       # Cuotas individuales
│   │   └── Pago.js        # Registro de pagos
│   ├── routes/            # Rutas de la API
│   ├── middlewares/       # Auth, permisos
│   ├── utils/             # Cálculos de préstamos
│   └── services/          # Servicios (WhatsApp, etc.)
└── uploads/               # Archivos subidos
```

## 🔐 Autenticación

La API usa JWT. Incluir en headers:
```
Authorization: Bearer <token>
```

## 📡 Endpoints Principales

### Auth
- `POST /api/auth/registro` - Registrar financiera + admin
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id` - Obtener cliente
- `PUT /api/clientes/:id` - Actualizar cliente

### Préstamos
- `POST /api/prestamos/simular` - Simular préstamo
- `GET /api/prestamos` - Listar préstamos
- `POST /api/prestamos` - Crear préstamo
- `GET /api/prestamos/:id` - Obtener préstamo con cuotas
- `GET /api/prestamos/:id/cancelacion-anticipada` - Calcular cancelación

### Cuotas
- `GET /api/cuotas` - Listar cuotas
- `GET /api/cuotas/proximas-vencer` - Próximas a vencer
- `GET /api/cuotas/vencidas` - Cuotas vencidas

### Pagos
- `GET /api/pagos` - Listar pagos
- `POST /api/pagos` - Registrar pago
- `PUT /api/pagos/:id/anular` - Anular pago

### Reportes
- `GET /api/reportes/dashboard` - Dashboard principal
- `GET /api/reportes/cartera` - Reporte de cartera
- `GET /api/reportes/cobranza` - Reporte de cobranza
- `GET /api/reportes/morosidad` - Reporte de morosidad

### Portal Clientes
- `POST /api/portal/login` - Login cliente
- `GET /api/portal/mis-prestamos` - Préstamos del cliente
- `GET /api/portal/mis-cuotas` - Cuotas pendientes
- `GET /api/portal/mis-pagos` - Historial de pagos

## 💡 Sistemas de Amortización

### Sistema Francés (cuota fija)
- Cuota constante durante todo el préstamo
- Al inicio se paga más interés, luego más capital
- Fórmula: `C = P * [r(1+r)^n] / [(1+r)^n - 1]`

### Sistema Alemán (amortización fija)
- Capital constante, interés decreciente
- Cuotas más altas al inicio, menores al final
- Fórmula: `Amortización = Capital / n cuotas`

## 🔧 Variables de Entorno

```env
PORT=5001
MONGO_URI=mongodb+srv://...
JWT_SECRET=clave_secreta
JWT_ACCESS_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=30d
FRONTEND_URL=http://localhost:5173
```

## 👨‍💻 Autor

Claudio Gonzalez - UTN FRT

## 📄 Licencia

ISC
