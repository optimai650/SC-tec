# Feria de Servicio Social — Tecnológico de Monterrey

Plataforma web para gestionar la Feria de Servicio Social universitaria. Los socios formadores ofrecen proyectos y los alumnos se inscriben presencialmente mediante un sistema de códigos QR + códigos únicos de un solo uso.

## Estructura

```
SC-tec/
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

### Super Admin
| Email | Contraseña |
|-------|-----------|
| admin@tec.mx | Admin1234! |

### Socios Formadores
| Email | Contraseña | Socio |
|-------|-----------|-------|
| admin@cruzroja.mx | Socio1234! | Cruz Roja Monterrey |
| admin@bancoalimentos.mx | Socio1234! | Banco de Alimentos NL |

### Alumnos (login con matrícula)
| Matrícula | Contraseña |
|-----------|-----------|
| A01234567 | A01234567 |
| A01234568 | A01234568 |
| A01234569 | A01234569 |
| A01234570 | A01234570 |
| A01234571 | A01234571 |

> La contraseña por defecto de cada alumno es su propia matrícula.

---

## Roles

- **Super Admin** — Control total: socios formadores, proyectos, ferias, periodos, matrículas, inscripciones
- **Socio Admin** — Gestiona sus proyectos, ve alumnos inscritos y genera códigos de inscripción
- **Alumno** — Inicia sesión con matrícula, ve su proyecto asignado y redime códigos QR

---

## Flujo de inscripción presencial

1. La organización presiona **"Agregar alumno"** en su dashboard
2. Ingresa la matrícula del alumno dos veces para confirmar
3. El sistema valida que la matrícula esté preregistrada y que el alumno no tenga proyecto
4. Se genera un **código de 8 caracteres** que la organización entrega en persona al alumno
5. El alumno escanea el **código QR** del proyecto (URL: `/qr/:token`)
6. Ingresa el código recibido → queda inscrito

---

## Ferias y Periodos

Hay dos ferias por año:

| Feria | Periodos |
|-------|---------|
| Feria 1 | Febrero-Junio, Intensivo de Invierno |
| Feria 2 | Verano, Agosto-Diciembre |

El superadmin controla cuál feria está activa. Solo se muestran los proyectos de la feria activa.

---

## Importar matrículas

Desde el panel admin → **Matrículas**, pegar en el textarea o subir un `.csv`:

```
A01234567,Juan Pérez,juan@tec.mx
A01234568,María García
A01234569
```

Formato: `matricula,nombre,email` (nombre y email opcionales). Una por línea.

---

## Comandos útiles (backend)

```bash
npm run db:migrate    # Corre migraciones de Prisma
npm run db:seed       # Carga datos de prueba
npm run db:studio     # Abre Prisma Studio (UI para ver la BD)
```

---

## Notas

- SQLite se guarda en `backend/prisma/dev.db` (ignorado por git)
- Para producción: cambiar `DATABASE_URL` a PostgreSQL en `.env`
- JWT secret en variable `JWT_SECRET` — cambiar en producción
