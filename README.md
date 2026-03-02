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

Configura las variables de entorno:
```bash
cd backend
cp .env.example .env
# Edita .env y agrega tu RESEND_API_KEY (obtener en https://resend.com)
```

Luego instala y levanta:
```bash
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

## Emails transaccionales

La app usa **Resend** para enviar emails automáticamente:

- **Bienvenida** — al voluntario cuando crea su cuenta
- **Confirmación de registro** — al voluntario cuando se inscribe a una oportunidad (incluye título, organización, descripción, ubicación y fechas)
- **Notificación a la organización** — cuando un voluntario se inscribe (incluye nombre, email, teléfono y comunidad del voluntario)

Requiere `RESEND_API_KEY` en `.env`. Sin dominio propio solo se puede enviar a emails verificados en el panel de Resend; con dominio verificado se envía a cualquier destinatario.

## Validaciones

- **Contraseña**: mínimo 8 caracteres, al menos una mayúscula y una minúscula
- **Teléfono**: exactamente 10 dígitos (se guarda normalizado sin espacios ni guiones); único por cuenta

## Notas

- SQLite se guarda en `backend/prisma/dev.db` (ignorado por git)
- Para producción: cambiar `DATABASE_URL` a PostgreSQL y verificar dominio en Resend
