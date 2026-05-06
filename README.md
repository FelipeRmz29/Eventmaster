EventMaster 🎟️
Plataforma web para gestión de boletos en congresos universitarios
👥 Equipo
Nombre	Rol
Felipe Ramírez	Scrum Master / Fullstack
Javier Lozano	Frontend
Emmanuel Castillo	Backend
Walter Silva	QA / Fullstack
Alejandro Ruiz	DBA

⚙️ Requisitos previos
Antes de comenzar, asegúrate de tener instalado lo siguiente en tu computadora:

•	Node.js v18 o superior — https://nodejs.org
•	Git — https://git-scm.com
•	PostgreSQL — https://www.postgresql.org/download
•	Redis — https://redis.io/docs/getting-started
•	Cuenta en Supabase (gratuita) — https://supabase.com

🚀 Instalación paso a paso
Paso 1 — Clonar el repositorio
Abre tu terminal y ejecuta los siguientes comandos:

git clone https://github.com/FelipeRmz29/Eventmaster.git
cd Eventmaster

Paso 2 — Configurar las variables de entorno
El proyecto requiere un archivo .env con tus credenciales. Crea uno a partir del archivo de ejemplo:

cp .env.example .env

Luego abre el archivo .env con tu editor de texto y completa los valores con tus datos de Supabase, PostgreSQL y Redis. Consulta la sección Variables de entorno más abajo para más detalle.

Paso 3 — Instalar y correr el Frontend
Desde la raíz del proyecto, entra a la carpeta del frontend e instala las dependencias:

cd frontend
npm install
npm run dev

Esto levantará la interfaz visual. Por defecto estará disponible en: http://localhost:5173

Paso 4 — Instalar y correr el Backend
Abre una nueva terminal (sin cerrar la anterior) y ejecuta:

cd backend
npm install
node index.js

El servidor backend quedará corriendo (por defecto en el puerto 3000 o el que esté configurado en tu .env).

Paso 5 — Crear el archivo .gitignore
Si aún no existe un archivo .gitignore en la raíz del proyecto, créalo con el siguiente contenido para evitar subir archivos sensibles o innecesarios a GitHub:

node_modules/
.env
.env.local
dist/
.DS_Store

🔐 Variables de entorno
Crea un archivo .env en la raíz del proyecto basándote en .env.example. Las variables típicas que necesitarás configurar son las de conexión a Supabase (URL y API Key), PostgreSQL y Redis.

Ejemplo de estructura del .env:

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_api_key
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/eventmaster
REDIS_URL=redis://localhost:6379
PORT=3000

🏗️ Arquitectura del sistema
Capa	Tecnología
Frontend	React + Vite + Tailwind CSS
Backend	Express.js + Supabase
Base de datos	PostgreSQL (gestionado con Supabase)
Caché / Locks	Redis

📋 Tablero Trello
Puedes ver el estado del proyecto y las tareas del equipo en el siguiente enlace:

https://trello.com/b/zUjHbTJu/eventmaster-sprint-board

