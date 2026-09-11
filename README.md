# Registro de Empleados

Aplicación sencilla para registrar y evaluar empleados: login, listado con búsqueda y paginación, alta, edición y baja de registros. Responsive (móvil y escritorio).

- **Frontend**: React + Vite + TypeScript
- **Backend**: NestJS + TypeORM
- **Base de datos**: SQLite (`backend/data/db.sqlite`)

## Campos del empleado

| Campo | Obligatorio |
|---|---|
| CI | Sí (único) |
| Nombre | No |
| Apellido | Sí |
| Profesión | Sí |
| Puesto de trabajo | No |
| Calificación (1-10) | Sí |
| Comentario | No |

## Requisitos

- Node.js 18+ y npm

## Instalación

```bash
npm run install:all
```

Esto instala las dependencias de `backend/` y `frontend/`.

Copiá `backend/.env.example` a `backend/.env` si querés personalizar el puerto, el secreto JWT, etc. (ya viene un `.env` de desarrollo listo para usar).

## Ejecutar en desarrollo

Desde la raíz del proyecto, con ambos servidores a la vez:

```bash
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

O por separado, en dos terminales:

```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

## Login

En el primer arranque del backend se crea automáticamente un usuario administrador:

- **Usuario**: `admin`
- **Contraseña**: `admin123`

Cambiá estos valores en `backend/src/users/users.seed.ts` antes de usar la app en un entorno real, o eliminá el usuario desde la base y creá uno nuevo con otra contraseña.

## Build de producción

```bash
npm run build
```

Compila `backend/dist` y `frontend/dist`. Para servir el backend compilado: `cd backend && npm run start:prod`. El `frontend/dist` es un sitio estático que se puede servir con cualquier servidor web (o `npm run preview` desde `frontend/`).

## Estructura

```
bolsa-trabajo/
├── backend/   # API NestJS + SQLite
└── frontend/  # SPA React
```
