# AgroDirecto - Plataforma Agropecuaria

AgroDirecto es una plataforma digital diseñada para conectar productores agrícolas, compradores y transportistas, eliminando intermediarios y optimizando la cadena de suministro agropecuaria.

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema antes de ejecutar el proyecto:

- **Node.js** (v16 o superior) - [Descargar Node.js](https://nodejs.org/)
- **SQL Server** - Base de datos para el backend.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:
- `/frontend`: Aplicación web desarrollada con React y Vite.
- `/backend`: API REST desarrollada con Node.js y Express.

---

## Instrucciones de Instalación y Ejecución

Sigue estos pasos para levantar el proyecto localmente en tu máquina.

### 1. Configurar y Ejecutar el Backend

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Crea un archivo `.env` en la carpeta `backend` (puedes basarte en el código de conexión de la base de datos). Asegúrate de tener tu instancia de SQL Server corriendo con la base de datos y credenciales correctas.
4. Inicia el servidor backend:
   ```bash
   npm run dev
   # o alternativamente: node server.js
   ```
   El servidor debería iniciar, típicamente en el puerto `5000`.

### 2. Configurar y Ejecutar el Frontend

1. Abre **otra** terminal (manteniendo el backend corriendo) y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo web:
   ```bash
   npm run dev
   ```
4. Vite te indicará en la terminal la URL local donde se está ejecutando (por ejemplo, `http://localhost:5173/`). Abre ese enlace en tu navegador.

---

## Notas Adicionales

- Asegúrate de ejecutar el script de creación de la base de datos SQL Server antes de probar las funcionalidades que requieran registro o lectura de datos.
- Verifica que el puerto de tu backend coincida con las peticiones `axios` del frontend (por defecto `http://localhost:5000`).
