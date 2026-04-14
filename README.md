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

### Socios Formadores (todos usan `Socio1234!`)
| Email | Socio |
|-------|-------|
| admin@cruzroja.mx | Cruz Roja Monterrey |
| admin@bancoalimentos.mx | Banco de Alimentos NL |
| admin@caritasmty.mx | Cáritas Monterrey |
| admin@techo.mx | TECHO México |
| admin@aldeas.mx | Aldeas Infantiles SOS NL |
| admin@merced.mx | Fundación Merced NL |
| admin@pcivil.mx | Voluntarios Protección Civil NL |
| admin@bancoropa.mx | Banco de Ropa NL |
| admin@ambientalmty.mx | Colectivo Ambiental MTY |
| admin@cij.mx | Centro de Integración Juvenil NL |

### Alumnos (login con matrícula, contraseña = matrícula)
| Matrícula | Nombre | Carrera | Sem | Inscrito en |
|-----------|--------|---------|-----|-------------|
| A01234560 | Carlos García | Ing. en Sistemas | 6 | Brigadas de Salud |
| A01234561 | María López | Medicina | 4 | Brigadas de Salud |
| A01234562 | José Martínez | Ing. Industrial | 8 | Brigadas de Salud |
| A01234563 | Ana González | Psicología | 5 | Brigadas de Salud |
| A01234564 | Luis Rodríguez | Ing. Civil | 7 | Brigadas de Salud |
| A01234565 | Laura Hernández | Ing. en Sistemas | 3 | Primeros Auxilios |
| A01234566 | Miguel Pérez | Ing. Biomédica | 6 | Primeros Auxilios |
| A01234567 | Sofía Sánchez | Arquitectura | 4 | Primeros Auxilios |
| A01234568 | Ricardo Ramírez | Admon. y Finanzas | 8 | Clasificación Alimentos |
| A01234569 | Valentina Torres | Medicina | 2 | Clasificación Alimentos |
| A01234570 | Diego Flores | Ing. en Sistemas | 5 | Clasificación Alimentos |
| A01234571 | Isabella Rivera | Nutrición | 7 | Clasificación Alimentos |
| A01234572 | Alejandro Morales | Ing. Industrial | 9 | Clasificación Alimentos |
| A01234573 | Camila Jiménez | Derecho | 3 | Campaña Recolección |
| A01234574 | Andrés Vargas | Ing. Civil | 6 | Campaña Recolección |
| A01234575 | Gabriela Castro | Psicología | 4 | TECHO Construcción |
| A01234576 | Daniel Mendoza | Ing. Mecánica | 7 | TECHO Construcción |
| A01234577 | Fernanda Guerrero | Arquitectura | 5 | TECHO Construcción |
| A01234578 | Sebastián Ortiz | Ing. en Sistemas | 8 | PC Simulacros |
| A01234579 | Valeria Ruiz | Nutrición | 2 | PC Simulacros |
| A01234580 | Jorge Aguilar | Ing. Industrial | 6 | PC Simulacros |
| A01234581 | Natalia Gutiérrez | Admon. y Finanzas | 4 | PC Capacitación |
| A01234582 | Eduardo Núñez | Ing. Civil | 7 | PC Capacitación |
| A01234583 | Daniela Medina | Medicina | 3 | Cáritas Catequesis |
| A01234584 | Roberto Delgado | Ing. en Sistemas | 9 | Merced Microfinanzas |
| A01234585 | Paulina Herrera | Ing. Biomédica | 5 | Banco de Ropa |
| A01234586 | Javier Suárez | Ing. en Robótica | 6 | Banco de Ropa |
| A01234587 | Verónica Vega | Psicología | 4 | Reforestación Pastora |
| A01234588 | Francisco Cruz | Derecho | 8 | Reforestación Pastora |
| A01234589 | Mariana Reyes | Arquitectura | 2 | Aldeas Recreación |
| A01234590 | Héctor Cabrera | Ing. en Sistemas | 7 | Aldeas Recreación |
| A01234591 | Sandra Moreno | Nutrición | 5 | TECHO Diagnóstico |
| A01234592 | Arturo Silva | Ing. Industrial | 3 | TECHO Diagnóstico |
| A01234593 | Patricia Ríos | Admon. y Finanzas | 6 | CIJ Prevención |
| A01234594 | Enrique Romero | Ing. Civil | 8 | _(sin inscripción)_ |
| A01234595 | Mónica Salinas | Medicina | 4 | _(sin inscripción)_ |
| A01234596 | Gerardo Mendez | Ing. Mecánica | 5 | _(sin inscripción)_ |
| A01234597 | Lucía Díaz | Arquitectura | 7 | _(sin inscripción)_ |
| A01234598 | Omar Acosta | Ing. en Sistemas | 6 | _(sin inscripción)_ |
| A01234599 | Alicia Fuentes | Nutrición | 4 | _(sin inscripción)_ |

> Contraseña de cada alumno = su propia matrícula (ej. `A01234560`).

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
