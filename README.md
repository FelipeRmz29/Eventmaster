# EventMaster 🎟️

Plataforma web para gestión de boletos en congresos universitarios.

## Equipo
| Nombre | Rol |
|---|---|
| Felipe Ramírez | Scrum Master / Fullstack |
| Javier Lozano | Frontend |
| Emmanuel Castillo | Backend |
| Walter Silva | QA / Fullstack |
| Alejandro Ruiz | DBA |

## Requisitos previos
- Node.js v18+
- PostgreSQL
- Redis
- Cuenta en Supabase

## Instalación
1. Clonar el repositorio
2. cd frontend → npm install → npm run dev
3. cd backend → npm install → node index.js
4. Configurar variables de entorno (ver .env.example)

## Variables de entorno
Crea un archivo .env basado en .env.example

## Tablero Trello
[Link al tablero] https://trello.com/b/zUjHbTJu/eventmaster-sprint-board

## Arquitectura
Frontend: React + Vite + Tailwind
Backend: Express + Supabase
BD: PostgreSQL (Supabase)
Cache/Locks: Redis
```

---

## PASO 5 — Crear el .gitignore

Crea un archivo `.gitignore` en la raíz con esto:
```
node_modules/
.env
.env.local
dist/
.DS_Store