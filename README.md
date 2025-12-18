# prestamos-app
Estructura de Proyecto Propuesta
prestamos-app/
├── backend/          # API Node.js + Express + MongoDB
├── frontend/         # React (panel web)
├── mobile/           # React Native (app clientes)
└── docs/             # Documentación
Modelos de Datos Principales
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
                                        │             │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Cuota     │
                                        │             │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │    Pago     │
                                        └─────────────┘
