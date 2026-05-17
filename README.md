# EventMaster
Plataforma web para venta y verificación de boletos en eventos universitarios.

Los usuarios pueden consultar eventos, elegir sus asientos y recibir sus boletos por correo en formato PDF con código QR. Los administradores gestionan eventos, recintos y validan boletos en la entrada escaneando el QR desde el celular.

---

## Equipo
| Nombre | Rol |
|---|---|
| Felipe Ramírez | Scrum Master / Fullstack |
| Javier Lozano | Frontend |
| Emmanuel Castillo | Backend |
| Walter Silva | QA / Fullstack |
| Alejandro Ruiz | DBA |

---

## Requisitos previos
Antes de comenzar, asegúrate de tener instalado lo siguiente:
- [Node.js v18+](https://nodejs.org)
- [Git](https://git-scm.com)
- Cuenta en [Supabase](https://supabase.com) (gratuita) — reemplaza a PostgreSQL local
- Cuenta de Gmail con [contraseña de aplicación](https://myaccount.google.com/apppasswords) habilitada — para el envío de boletos por correo

> Redis es opcional. Si no está instalado, el sistema funciona igual usando memoria interna como reemplazo.

---

## Instalacion paso a paso

### Paso 1 — Clonar el repositorio
```bash
git clone https://github.com/FelipeRmz29/Eventmaster.git
cd Eventmaster
```

### Paso 2 — Configurar las variables de entorno del backend
Crea el archivo `.env` dentro de la carpeta `backend/` a partir del ejemplo incluido:
```bash
cd backend
cp .env.example .env
```
Luego abre el `.env` y completa tus credenciales (ver sección de variables de entorno más abajo).

### Paso 3 — Instalar y correr el backend
Desde la carpeta `backend/`:
```bash
npm install
npm run dev
```
El servidor quedará corriendo en `http://localhost:3000`.

### Paso 4 — Crear la cuenta de administrador
Con el backend corriendo, ejecuta este comando desde la carpeta `backend/` para crear tu primer usuario admin:
```bash
node scripts/createAdmin.js tu@correo.com tucontraseña
```
Guarda esas credenciales — las necesitarás para entrar al panel de administración.

### Paso 5 — Instalar y correr el frontend
Abre una nueva terminal y desde la carpeta `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
La interfaz quedará disponible en `http://localhost:5173`.

---

## Acceso desde celular (red local)

Para usar el escáner de QR desde un celular, el sitio necesita correr con HTTPS. Sigue estos pasos:

**1. Lanzar el frontend con HTTPS y acceso en red:**
```bash
npm run dev -- --host
```
El sitio estará disponible en `https://TU-IP-LOCAL:5173` (por ejemplo `https://192.168.1.5:5173`).

**2. Abrir el puerto en el firewall de Windows** (solo la primera vez, ejecutar como administrador):
```powershell
New-NetFirewallRule -DisplayName "Vite 5173" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow
New-NetFirewallRule -DisplayName "Backend 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**3. Entrar desde el celular:**
Abre `https://TU-IP-LOCAL:5173` en el browser del celular. Aparecerá una advertencia de seguridad por el certificado autofirmado — presiona "Avanzado" y luego "Continuar". A partir de ahí la cámara funcionará normalmente.

---

## Variables de entorno
El archivo `.env` va dentro de la carpeta `backend/`. Aquí está cada variable y para qué sirve:

```env
# Supabase — obtener en supabase.com > Settings > API
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=clave_publica_de_supabase
SUPABASE_SERVICE_KEY=clave_de_servicio_de_supabase

# Servidor
PORT=3000

# Autenticacion — puede ser cualquier texto secreto largo
JWT_SECRET=texto_secreto_para_tokens

# Cifrado de codigos QR — puede ser cualquier texto secreto largo
AES_SECRET=texto_secreto_para_qr

# Correo — cuenta Gmail que enviará los boletos
MAIL_USER=tucorreo@gmail.com
MAIL_PASS=contraseña_de_aplicacion_de_gmail

# Opcionales
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## Arquitectura
| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 7 + Tailwind CSS 4 |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL via Supabase |
| Autenticacion | JSON Web Tokens (JWT) |
| Cifrado de QR | AES-256-GCM |
| Generacion de boletos | PDFKit + QRCode |
| Envio de correos | Nodemailer + Gmail |
| Bloqueo de asientos | Redis (con fallback en memoria) |
| Escaner QR (movil) | ZXing Browser |
| App instalable | PWA (Vite Plugin PWA) |

---

## Que hace cada parte

### Backend (`/backend`)
- Registro e inicio de sesión de administradores con contraseña cifrada
- CRUD completo de eventos y recintos
- Compra de boletos: hasta 2 asientos por compra, con bloqueo temporal para evitar que dos personas compren el mismo asiento al mismo tiempo
- Simulacion de pasarela de pago (95% de éxito, 600ms de delay)
- Generación de PDF con los boletos y códigos QR cifrados
- Envío del PDF por correo al comprador
- Validación de boletos: marca el boleto como usado y retorna si es válido, ya usado, o falso

### Frontend (`/frontend`)
- Página de inicio con buscador y vista previa de eventos
- Lista de eventos públicos con filtro por nombre o recinto
- Detalle de evento con mapa de asientos interactivo (colores por zona: morado VIP, verde General)
- Flujo de compra: selección de asientos, captura de nombre y correo, descarga automática del PDF
- Panel de administración: gestionar eventos (crear, editar, ocultar, eliminar) y recintos
- Verificador de boletos: escanea el QR con la cámara del celular y muestra si el acceso es válido

---

## Endpoints principales

| Metodo | Ruta | Descripcion | Requiere login |
|---|---|---|---|
| POST | `/api/login` | Iniciar sesion como admin | No |
| GET | `/eventos` | Listar eventos publicados | No |
| GET | `/eventos/:id` | Detalle de un evento | No |
| GET | `/eventos/admin/all` | Listar todos los eventos | Si |
| POST | `/eventos` | Crear evento | Si |
| PUT | `/eventos/:id` | Editar evento | Si |
| DELETE | `/eventos/:id` | Eliminar evento | Si |
| GET | `/recintos` | Listar recintos | No |
| POST | `/recintos` | Crear recinto | Si |
| GET | `/asientos/:recintoId` | Asientos de un recinto | No |
| POST | `/tickets/confirmar` | Comprar boleto(s) | No |
| POST | `/tickets/validar` | Validar boleto con QR | Si |

---

## Tablero del proyecto
[Ver tablero Trello](https://trello.com/b/zUjHbTJu/eventmaster-sprint-board)
