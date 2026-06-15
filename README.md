# AgroDirecto - Plataforma Agropecuaria 🌾

AgroDirecto es una plataforma digital integral que conecta de manera directa a **Productores**, **Compradores** y **Transportistas** en Bolivia. El objetivo es optimizar la cadena de suministro, eliminar intermediarios innecesarios y garantizar precios justos.

---

## 🛠️ Requisitos Previos

Antes de descargar y ejecutar el proyecto, asegúrate de tener instalados:

1. **[Git](https://git-scm.com/downloads)** (Para clonar el repositorio)
2. **[Node.js](https://nodejs.org/es/download/)** (Recomendado v18 o superior)
3. **SQL Server** (Puede ser SQL Server Express o Developer Edition)
4. **SQL Server Management Studio (SSMS)** (Para gestionar la base de datos)

---

## 🚀 Guía de Instalación Rápida (Paso a Paso)

### 1. Descargar el Proyecto
Abre tu terminal (Símbolo del sistema o PowerShell) y clona el repositorio:
```bash
git clone https://github.com/A13jandr0/Agro_Directo.git
cd Agro_Directo
```

### 2. Configurar la Base de Datos (SQL Server)
El proyecto requiere una base de datos local para funcionar.
1. Abre **SQL Server Management Studio (SSMS)**.
2. Ejecuta el script de creación de la base de datos (asegúrate de crear las tablas de `Usuarios`, `Cosechas`, `Pedidos`, etc., según la estructura de tu proyecto).
3. Asegúrate de tener habilitada la autenticación por SQL Server (usuario `sa` o el que prefieras) o autenticación de Windows.

### 3. Configurar y Levantar el Backend (Servidor)
El backend es la API que maneja la lógica de negocio y la base de datos.
1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo llamado `.env` en la carpeta `backend` y añade las credenciales de tu base de datos y JWT (ajusta los valores según tu SQL Server):
   ```env
   DB_SERVER=localhost
   DB_USER=tu_usuario_sql
   DB_PASSWORD=tu_contraseña_sql
   DB_NAME=nombre_de_tu_base_de_datos
   JWT_SECRET=una_clave_secreta_muy_segura_123
   PORT=5000
   ```
4. Inicia el servidor:
   ```bash
   npm run dev
   ```
   *(Si todo está correcto, verás un mensaje de "Servidor corriendo en el puerto 5000" y "Conectado a la base de datos").*

### 4. Configurar y Levantar el Frontend (Interfaz Web)
El frontend es la plataforma web con la que interactúan los usuarios.
1. Abre una **nueva ventana de terminal**, y vuelve a entrar a la carpeta del proyecto.
2. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia la plataforma:
   ```bash
   npm run dev
   ```
5. Vite te mostrará un enlace local (ej. `http://localhost:5173/`). Dale clic o cópialo en tu navegador para ver la plataforma funcionando.

---

## 💡 ¿Quieres ejecutarlo más fácil la próxima vez?

Si ya hiciste el proceso de instalación (`npm install` en ambas carpetas) y configuraste la base de datos, puedes levantar todo el proyecto con un solo comando en el futuro. 

Abre dos terminales en la carpeta raíz del proyecto:
- **Terminal 1:** `cd backend && npm run dev`
- **Terminal 2:** `cd frontend && npm run dev`

*(Nota: En sistemas operativos Windows, puedes crear un archivo `iniciar.bat` en la raíz del proyecto para abrir ambos servidores con doble clic).*

---

## 👥 Roles de Usuario
La plataforma maneja 3 tipos de usuarios:
- **Productor:** Publica cosechas y productos disponibles.
- **Comprador:** Explora el marketplace, compara precios y hace pedidos.
- **Transportista:** Encuentra cargas disponibles (fletes) y gestiona hojas de ruta.
