# Voluntarios App

Plataforma web para conectar oportunidades de voluntariado con personas que quieren completar horas de servicio social.

## Estructura

```
voluntarios-app/
├── frontend/   # React + Vite + Tailwind CSS
├── backend/    # Node.js + Express + Prisma + SQLite
└── README.md
```

## Correr en local

### 1. Backend

```bash
cd backend
cp .env.example .env
npm run setup
# Instala dependencias, migra la BD y carga datos de prueba
```

Luego en otra terminal:

```bash
npm run dev
# Corre en http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

Abre `http://localhost:5173` en tu navegador.

---

## Cuentas de prueba

| Rol          | Email                    | Contraseña       |
|--------------|--------------------------|------------------|
| Super Admin  | admin@voluntarios.app    | Admin1234!       |
| Org Admin    | org@cruzver.de           | Org1234!         |
| Voluntario   | voluntario@test.com      | Voluntario1234!  |

---

## Comandos útiles (backend)

```bash
npm run db:migrate    # Corre migraciones de Prisma
npm run db:seed       # Carga datos de prueba
npm run db:studio     # Abre Prisma Studio (UI para ver la BD)
```

---

## Roles

- **Super Admin** — Control total: organizaciones, oportunidades, registros
- **Org Admin** — Gestiona su organización y sus oportunidades
- **Voluntario** — Navega y se registra en oportunidades

## Notas

- Emails están en modo `console.log` — los verás en la terminal del backend
- SQLite se guarda en `backend/prisma/dev.db` (ignorado por git)
- Para producción: cambiar `DATABASE_URL` a PostgreSQL y configurar proveedor de email
