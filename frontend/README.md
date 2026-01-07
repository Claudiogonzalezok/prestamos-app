# Frontend - CreditosPro

Frontend de React con Vite para el sistema de gestión de préstamos CreditosPro.

## Tecnologías

- **React 18** - Librería de UI
- **Vite** - Build tool y dev server (rápido)
- **React Router v6** - Enrutamiento
- **TailwindCSS** - Estilos
- **Axios** - Cliente HTTP
- **Context API** - State management

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

Se abrirá en `http://localhost:5173`

## Estructura

```
src/
├── components/
│   ├── Auth/          # Componentes de autenticación
│   ├── Dashboard/     # Dashboard
│   ├── Prestamos/     # CRUD de préstamos
│   ├── Clientes/      # CRUD de clientes
│   ├── Pagos/         # CRUD de pagos
│   ├── Reportes/      # Reportes
│   └── Common/        # Header, Footer, ProtectedRoute
├── pages/             # Páginas
├── services/          # API calls
├── context/           # AuthContext
├── styles/            # CSS/TailwindCSS
├── App.jsx
└── main.jsx
```

## Variables de Entorno

Crear un `.env.local`:

```
VITE_API_URL=http://localhost:5001/api
```

## Build

```bash
npm run build
```

Genera carpeta `dist/` lista para producción.

## Características Implementadas

- ✅ Autenticación (Login/Registro)
- ✅ Context API para estado global
- ✅ Protección de rutas
- ✅ Dashboard con métricas
- ✅ CRUD de Clientes
- ✅ CRUD de Préstamos
- ✅ CRUD de Pagos
- ✅ Integración con API backend

## Por Implementar

- [ ] Reportes con gráficos (Chart.js)
- [ ] Portal de clientes
- [ ] Descarga de PDF
- [ ] Notificaciones
- [ ] Validaciones mejoradas
