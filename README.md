# EventMaster 🎟️
Plataforma web para gestión de boletos en congresos universitarios.

---

## 👥 Equipo
| Nombre | Rol |
|---|---|
| Felipe Ramírez | Scrum Master / Fullstack |
| Javier Lozano | Frontend |
| Emmanuel Castillo | Backend |
| Walter Silva | QA / Fullstack |
| Alejandro Ruiz | DBA |

---

## ⚙️ Requisitos previos
Antes de comenzar, asegúrate de tener instalado lo siguiente:
- [Node.js v18+](https://nodejs.org)
- [Git](https://git-scm.com)
- [PostgreSQL](https://www.postgresql.org/download)
- [Redis](https://redis.io/docs/getting-started)
- Cuenta en [Supabase](https://supabase.com) (gratuita)

---

## 🚀 Instalación paso a paso

### Paso 1 — Clonar el repositorio
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/FelipeRmz29/Eventmaster.git
cd Eventmaster
```

### Paso 2 — Configurar las variables de entorno
Crea tu archivo `.env` a partir del ejemplo incluido:
```bash
cp .env.example .env
```
Luego abre el `.env` y completa tus credenciales de Supabase, PostgreSQL y Redis.

### Paso 3 — Instalar y correr el Frontend
```bash
cd frontend
npm install
npm run dev
```
La interfaz quedará disponible en: `http://localhost:5173`

### Paso 4 — Instalar y correr el Backend
Abre una **nueva terminal** y ejecuta:
```bash
cd backend
npm install
node index.js
```
El servidor correrá en el puerto definido en tu `.env` (por defecto `3000`).

### Paso 5 — Crear el .gitignore
Si no existe aún, crea un archivo `.gitignore` en la raíz con esto:
```
node_modules/
.env
.env.local
dist/
.DS_Store
```

---

## 🔐 Variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_api_key
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/eventmaster
REDIS_URL=redis://localhost:6379
PORT=3000
```

---

## 🏗️ Arquitectura
| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Express.js + Supabase |
| Base de datos | PostgreSQL (Supabase) |
| Caché / Locks | Redis |

---

## 📋 Tablero Trello
[Ver tablero del proyecto](https://trello.com/b/zUjHbTJu/eventmaster-sprint-board)
