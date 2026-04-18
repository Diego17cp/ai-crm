# AI-CRM: Plataforma de Gestión Inmobiliaria y Chatbot Inteligente

🌎 **Choose your language:**
- [📖 Documentación en Español](#documentación-técnica-en-español)
- [📖 English Documentation](#english-technical-documentation)

---

# Documentación Técnica en Español

Este proyecto es un CRM Inmobiliario altamente escalable diseñado con un sistema de Chatbot Inteligente impulsado por NLP (Gemini/OpenAI) e integrado con WhatsApp (Kapso AI). Facilita la derivación a asesores humanos en tiempo real mediante WebSockets, la gestión técnica de proyectos inmobiliarios (Lotes, Manzanas, Etapas) y el control financiero de ventas y cuotas.

## Instalación y Ejecución

Este proyecto utiliza **pnpm** como gestor de paquetes por defecto. 
*Nota: Si deseas cambiar de gestor de paquetes (a `npm` o `yarn`), simplemente elimina las carpetas `node_modules` y el archivo `pnpm-lock.yaml` en ambos directorios (frontend y backend), y luego ejecuta la instalación con tu gestor preferido (ej. `npm install`).*

### Backend
```bash
cd backend
pnpm install
# Configura tu archivo .env copiando las variables correspondientes
pnpm run db:reset  # Resetea la base de datos, corre migraciones y genera el cliente de Prisma
pnpm run dev       # Inicia el servidor de desarrollo
```
### Frontend
```bash
cd frontend
pnpm install
# Configura tu archivo .env con la URL de tu backend
pnpm run dev       # Inicia el servidor de desarrollo
```

---

## Tecnologías Esenciales

### Backend
- **Node.js & Express**: Servidor HTTP.
- **TypeScript**: Tipado fuerte para la lógica de negocio.
- **Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)**: Manejo de base de datos relacional y migraciones.
- **PostgreSQL**: Base de datos principal.
- **Socket.IO**: Comunicación bidireccional en tiempo real para el chat (asesor-cliente).
- **Integración WhatsApp Business API**: Arquitectura agnóstica mediante puertos e interfaces, soportando adaptadores duales: Meta Directo Oficial (`axios`) y Kapso AI SDK (`@kapso/whatsapp-cloud-api`).
- **Gemini / OpenAI API**: Motor de IA para el procesamiento de lenguaje natural en el chatbot, configurable mediante el entorno.

### Frontend
- **React & Vite**: Librería y empaquetador ultrarrápido.
- **TypeScript**: Consistencia de tipos compartidos con el backend.
- **TanStack Query (React Query)**: Gestión de estado asíncrono y caché para consumo de APIs.
- **Zustand**: Gestión del estado global ligero (stores del chat y sesión).
- **Socket.IO Client**: Escucha de eventos en tiempo real para el módulo de atenciones (Live Chat).
- **TailwindCSS & Sonner**: Estilos utilitarios y notificaciones de interfaz.

---

## Arquitectura del Sistema

### Backend: Arquitectura Hexagonal y Modular
El backend divide la aplicación en módulos independientes (`src/modules/*`), cada uno estructurado de forma hexagonal para desacoplar la lógica de negocio de las herramientas externas:
- **`domain/`**: Entidades y DTOs core.
- **`application/`**: Casos de uso (`UseCases`) e interfaces/puertos (`Ports`). Contiene las reglas del negocio puras.
- **`infrastructure/`**: Implementaciones técnicas. Adaptadores a DB (`PrismaRepository`), Controladores HTTP y Rutas, y Adaptadores externos (APIs, Sockets).

*¿Por qué?* Facilita el testing, el mantenimiento y permite cambiar herramientas (ej. migrar de OpenAI a Gemini o cambiar el proveedor de BD) sin tocar los Casos de Uso.

### Frontend: Screaming Architecture (Feature-Sliced Design)
El código se organiza en torno a las características del negocio en `src/features/`, "gritando" de qué trata la aplicación.
Ejemplo de estructura interna de un feature (`chat`, `sales`, `lots`):
- `components/`: Componentes UI aislados de la feature.
- `hooks/`: Lógica preempaquetada (ej. mutations de React Query).
- `pages/`: Vistas de jerarquía superior.
- `service/`: Llamadas `fetch/axios` a la API.
- `store/`: Estado global de la feature (Zustand).

*¿Por qué?* Evita el clásico "laberinto" de carpetas globales, garantizando que todo lo relacionado a "Ventas" viva y muera en la carpeta de Ventas.

---

## Entidades, Relaciones y Flujo (Prisma)

El flujo de base de datos abarca tres grandes ejes:

1. **Estructura Inmobiliaria:** 
   `Proyectos` (1:N) -> `Etapas` (1:N) -> `Manzanas` (1:N) -> `Lotes`.
   *Jerarquía estricta. No puedes eliminar una manzana si un lote interno ya fue vendido.*
2. **Ciclo de Clientes y Financiero:** 
   `Clientes` solicitan o tienen `Citas` (asignadas a un usuario/Asesor). Un Cliente puede tener múltiples `Ventas` ligadas a un `Lote`. Cada Venta genera N `Cuotas` si es a crédito (Cronograma de pagos).
3. **Comunicaciones (Chatbot & Live Chat):**
   `Conversaciones` almacenan N `Mensajes`. El chatbot inicia en estado `BOT`, transiciona a `ESPERANDO_ASESOR` si el NLP lo decide, y a `ATENDIDO_HUMANO` resolviendo la condición de carrera (*Race Condition*) para que un solo usuario atienda el chat simultáneamente.

---

## Descripción de los Módulos Principales

### Backend (`src/modules/`)
- **`chatbot/`**: Conecta con los LLMs (Gemini/OpenAI). Utiliza inyección de contexto de tiempo y llamadas a herramientas (Tools Registry) para consultar precios, enviar al humano o agendar citas.
- **`chats/`**: Gestiona colas de espera en tiempo real. Sus controladores Socket (`client:TAKE_CHAT`, `client:SEND_MESSAGE`) usan concurrencia (`updateMany` count === 0) para bloquear el chat.
- **`sales/`**: Lógica de creación transaccional. Calcula y despliega cronogramas de cuotas asegurando que un Lote no se venda dos veces en paralelo.
- **`projects/`, `lot/`, `clients/`**: CRUDs exhaustivos protegiendo violaciones de Llaves Foráneas (FK constraints bloqueados a nivel código si existen deudas o ventas previas).

### Frontend (`src/features/`)
- **`chat/`**: Consume hooks como `useLiveChat` (escucha clientes) y `useChatbot` (vista de cliente).
- **`sales/`**, **`lots/`**, **`appointments/`**: Tablas, modales de creación y lógica asíncrona sincronizada automáticamente con la red vía Tanstack.

---

## Configuración y Entorno (`.env`)

El backend utiliza una serie de *bootstraps* en `src/bootstrap/` que arrancan de forma modular la Base de Datos, Express y WebSockets. 

### Backend `.env` (Ejemplo)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/ai-crm?schema=public"
FRONTEND_URL="http://localhost:5173"

# Secretos JWT
JWT_SECRET="secret_token..."
JWT_SECRET_REFRESH="refresh_secret_token..."

# IA e LLMs
GEMINI_API_KEY="AIz..."
OPENAI_API_KEY="sk-..."
AI_MODEL_PROVIDER="openai" # Opciones: "openai" o "gemini"

# Proveedor de WhatsApp (Activo)
WHATSAPP_PROVIDER="meta" # Opciones: "meta" o "kapso"

# Variables para Meta Oficial (si WHATSAPP_PROVIDER="meta")
META_ACCESS_TOKEN="AccessTokenForMetaWhatsApp..."
META_VERIFY_TOKEN="SecretTokenForWebhook..."
META_WHATSAPP_PHONE_NUMBER_ID="..."

# Variables para Kapso AI (si WHATSAPP_PROVIDER="kapso")
KAPSO_API_KEY="tu_token_kapso..."
WHATSAPP_PHONE_NUMBER_ID="id_de_telefono_meta_via_kapso"
WEBHOOK_VERIFY_TOKEN="mi_token_secreto_para_webhook"
```
### Frontend `.env` (Ejemplo)
```env
VITE_API_URL="http://localhost:3000/api"
```

---

## Configuración de WhatsApp (Meta Oficial vs Kapso AI)

El backend cuenta con una arquitectura de Puertos y Adaptadores (`IWhatsappService`), lo que le permite al sistema cambiar dinámicamente el proveedor que despacha y recibe los mensajes de WhatsApp sin tocar la lógica de negocio ni el ruteo. Esto se controla mediante la variable `WHATSAPP_PROVIDER` en tu `.env`.

### 1. Proveedor Meta (Oficial)
Ideal para producción. Usa las APIs directas de Meta for Developers (`graph.facebook.com`).
- **`WHATSAPP_PROVIDER="meta"`**
- Debes configurar un Meta App con el producto WhatsApp activado.
- Configura el Webhook en el panel de Meta apuntando a tu servidor: `https://tu-dominio.com/api/chatbot/webhook/whatsapp`.
- Usa tu **Verify Token** (`META_VERIFY_TOKEN`) para validar el endpoint y el **Access Token** (`META_ACCESS_TOKEN`) para enviar los mensajes vía Axios.

### 2. Proveedor Kapso AI (Dev / Sandbox)
Ideal para saltarse las burocracias de Meta en etapa de desarrollo o pruebas rápidas utilizando un entorno Sandbox.
- **`WHATSAPP_PROVIDER="kapso"`**
- Entra al [Dashboard de Kapso](https://kapso.ai) y obtén tu API Key (`KAPSO_API_KEY`).
- Verifica en su panel el número celular desde el cual vas a probar (Sandbox mode).
- Expon tu puerto local (usando VS Code Port Forwarding o Ngrok): `https://id-ngrok.app/api/chatbot/webhook/whatsapp` y pégalo en la configuración de Webhooks de Kapso con tu `WEBHOOK_VERIFY_TOKEN`.
- El sistema inyectará automáticamente el SDK de Kapso para manejar los mensajes salientes.

---
## Advertencia sobre Inserción manual en la Base de Datos
Si como administrador necesitas insertar registros directamente mediante comandos o intertfaces SQL en Postgres (fuera de Prisma ORM):

1. Respeta estrictamente los campos `NOT NULL` requeridos por el `schema.prisma`
2. Sincronización de Secuencias (Serial/Auto-increment IDs): Si fuerzas un ID numérico manual (ej. `INSERT INTO lotes (id, ...)VALUES (10, ...)`), el contador automático de Postgres se desajusta. Tu próxima inserción mediante la app fallará. Debes ejecutar inmediatamente este comando SQL para reparar la secuencia:
```sql
-- Ejemplo para la tabla `clientes`:
SELECT setval(pg_get_serial_sequence('clientes', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM clientes;
```

---

# English Technical Documentation
This project is a highly scalable Real Estate CRM designed with an Intelligent Chatbot system powered by NLP (Gemini/OpenAI) and integrated with WhatsApp (Kapso AI). It facilitates real-time handoff to human advisors via WebSockets, technical management of real estate projects (Lots, Blocks, Stages), and financial control of sales and installments.
## Installation & Setup
This project uses **pnpm** as the default package manager.
*Note: If you want to switch package managers (to `npm` or `yarn`), simply delete the `node_modules` folders and the `pnpm-lock.yaml` file in both directories (frontend and backend), and then run the installation with your preferred manager (e.g., `npm install`).*

### Backend
```bash
cd backend
pnpm install
# Set up your .env file by copying the corresponding variables
pnpm run db:reset  # Resets the database, runs migrations, and generates the Prisma client
pnpm run dev       # Starts the development server
```
### Frontend
```bash
cd frontend
pnpm install
# Set up your .env file with the URL of your backend
pnpm run dev       # Starts the development server
```
---
## Core Technologies

### Backend
- **Node.js & Express**: HTTP server.
- **TypeScript**: Strong typing for business logic.
- **Prisma ORM (`@prisma/client`, `@prisma/adapter-pg`)**: Relational database management and migrations.
- **PostgreSQL**: Main database.
- **Socket.IO**: Real-time bidirectional communication for chat (advisor-client).
- **WhatsApp Business API Integration**: Agnostic architecture via ports and interfaces, supporting dual adapters: Official Meta Direct (`axios`) and Kapso AI SDK (`@kapso/whatsapp-cloud-api`).
- **Gemini / OpenAI API**: AI engine for natural language processing in the chatbot

### Frontend
- **React & Vite**: Library and ultra-fast bundler.
- **TypeScript**: Type consistency shared with the backend.
- **TanStack Query (React Query)**: Asynchronous state management and caching for API consumption.
- **Zustand**: Lightweight global state management (chat and session stores).
- **Socket.IO Client**: Real-time event listening for the attentions module (Live Chat).
- **TailwindCSS & Sonner**: Utility styles and UI notifications.
---

## System Architecture

### Backend: Hexagonal and Modular Architecture
The backend divides the application into independent modules (`src/modules/*`), each structured in a hexagonal way to decouple business logic from external tools:
- **`domain/`**: Core entities and DTOs.
- **`application/`**: Use cases and interfaces/ports. Contains pure business rules.
- **`infrastructure/`**: Technical implementations. Adapters to DB (`PrismaRepository`), HTTP Controllers and Routes, and External Adapters (APIs, Sockets).

*Why?* It facilitates testing, maintenance, and allows changing tools (e.g., migrating from OpenAI to Gemini or changing the DB provider) without touching the Use Cases.


### Frontend: Screaming Architecture (Feature-Sliced Design)
The code is organized around business features in `src/features/`, "screaming" what the application is about.
Example of internal structure of a feature (`chat`, `sales`, `lots`):
- `components/`: UI components isolated from the feature.
- `hooks/`: Pre-packaged logic (e.g., React Query mutations).
- `pages/`: Higher hierarchy views.
- `service/`: `fetch/axios` calls to the API.
- `store/`: Global state of the feature (Zustand).

*Why?* It avoids the classic "maze" of global folders, ensuring that everything related to "Sales" lives and dies in the Sales folder.

---

## Entities, Relationships, and Flow (Prisma)
The database flow encompasses three main axes:
1. **Real Estate Structure:** 
   `Projects` (1:N) -> `Stages` (1:N) -> `Blocks` (1:N) -> `Lots`.
   *Strict hierarchy. You cannot delete a block if an internal lot has already been sold.*
2. **Client and Financial Cycle:** 
   `Clients` request or have `Appointments` (assigned to a user/Advisor). A Client can have multiple `Sales` linked to a `Lot`. Each Sale generates N `Installments` if it's on credit (Payment schedule).
3. **Communications (Chatbot & Live Chat):**
   `Conversations` store N `Messages`. The chatbot starts in `BOT` state, transitions to `WAITING_FOR_ADVISOR` if the NLP decides, and to `HUMAN_ATTENDED` resolving the race condition to allow only one user to attend the chat simultaneously.

---
## Main Modules Description

### Backend (`src/modules/`)
- **`chatbot/`**: Connects with LLMs (Gemini/OpenAI). Uses time context injection and calls to tools registry to query prices, handoff to human, or schedule appointments.
- **`chats/`**: Manages real-time waiting queues. Its Socket controllers (`client:TAKE_CHAT`, `client:SEND_MESSAGE`) use concurrency (`updateMany` count === 0) to lock the chat.
- **`sales/`**: Transactional creation logic. Calculates and displays installment schedules ensuring that a Lot is not sold twice in parallel.
- **`projects/`, `lot/`, `clients/`**: Exhaustive CRUDs protecting foreign key violations (FK constraints blocked at code level if there are existing debts or sales).

### Frontend (`src/features/`)
- **`chat/`**: Consumes hooks like `useLiveChat` (listens to clients) and `useChatbot` (client view).
- **`sales/`**, **`lots/`**, **`appointments/`**: Tables, creation modals, and asynchronous logic automatically synchronized with the network via Tanstack.
---
## Configuration and Environment (`.env`)
The backend uses a series of bootstraps in `src/bootstrap/` that start the Database, Express, and WebSockets in a modular way.

### Backend `.env` (Example)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/ai-crm?schema=public"
FRONTEND_URL="http://localhost:5173"

# JWT Secrets
JWT_SECRET="secret_token..."
JWT_SECRET_REFRESH="refresh_secret_token..."

# AI and LLMs
GEMINI_API_KEY="AIz..."
OPENAI_API_KEY="sk-..."
AI_MODEL_PROVIDER="openai" # Options: "openai" or "gemini"

# WhatsApp Provider (Active)
WHATSAPP_PROVIDER="meta" # Options: "meta" or "kapso"

# Variables for Official Meta (if WHATSAPP_PROVIDER="meta")
META_ACCESS_TOKEN="AccessTokenForMetaWhatsApp..."
META_VERIFY_TOKEN="SecretTokenForWebhook..."
META_WHATSAPP_PHONE_NUMBER_ID="..."

# Variables for Kapso AI (if WHATSAPP_PROVIDER="kapso")
KAPSO_API_KEY="your_kapso_token..."
WHATSAPP_PHONE_NUMBER_ID="meta_phone_id..."
WEBHOOK_VERIFY_TOKEN="my_secret_token_for_webhook"
```

### Frontend `.env` (Example)
```env
VITE_API_URL="http://localhost:3000/api"
```
---
## WhatsApp Configuration (Official Meta vs Kapso AI)
The backend has a Ports and Adapters architecture (`IWhatsappService`), allowing the system to dynamically switch the provider that dispatches and receives WhatsApp messages without touching the business logic or routing. This is controlled by the `WHATSAPP_PROVIDER` variable in your `.env`.

### 1. Meta Provider (Official)
Ideal for production. Uses direct Meta for Developers APIs (`graph.facebook.com`).
- **`WHATSAPP_PROVIDER="meta"`**
- You must set up a Meta App with the WhatsApp product activated.
- Configure the Webhook in the Meta panel pointing to your server: `https://your-domain.com/api/chatbot/webhook/whatsapp`.
- Use your **Verify Token** (`META_VERIFY_TOKEN`) to validate the endpoint and the **Access Token** (`META_ACCESS_TOKEN`) to send messages via Axios.

### 2. Kapso AI Provider (Dev / Sandbox)
Ideal for bypassing Meta's bureaucracies in the development stage or quick testing using a Sandbox environment.
- **`WHATSAPP_PROVIDER="kapso"`**
- Go to the [Kapso Dashboard](https://kapso.ai) and get your API Key (`KAPSO_API_KEY`).
- Verify in their panel the cell phone number from which you will test (Sandbox mode).
- Expose your local port (using VS Code Port Forwarding or Ngrok): `https://your-ngrok-id.app/api/chatbot/webhook/whatsapp` and paste it in the Webhooks configuration of Kapso with your `WEBHOOK_VERIFY_TOKEN`.
- The system will automatically inject the Kapso SDK to handle outgoing messages.
---
## Warning about Manual Insertion in the Database
If as an administrator you need to insert records directly through SQL commands or interfaces in Postgres (outside of Prisma ORM):
1. Strictly respect the `NOT NULL` fields required by the `schema.prisma`
2. Sequence Synchronization (Serial/Auto-increment IDs): If you force a manual numeric ID (e.g., `INSERT INTO lots (id, ...)VALUES (10, ...)`), Postgres's automatic counter gets out of sync. Your next insertion through the app will fail. You must immediately run this SQL command to fix the sequence:
```sql
-- Example for the `clients` table:
SELECT setval(pg_get_serial_sequence('clients', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM clients;
```
