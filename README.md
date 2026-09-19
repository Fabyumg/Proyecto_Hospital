# 🏥 Sistema de Gestión de Clínicas y Hospitales

Solución Full-Stack completa, unificada y funcional para la gestión hospitalaria. Desarrollada con **Spring Boot**, **Spring Security (JWT RSA)**, **Spring Data JPA (Specification)**, **SQL Server / H2**, **Angular** y un **Sitio Web Público SPA en Vanilla JavaScript**.

---

## 📍 Ubicación del Archivo README.md
El archivo se encuentra ubicado en la raíz principal del proyecto:
`c:\Users\Faby H\Documents\GitHub\apirest-demo\README.md`

---

## 📐 Arquitectura General del Sistema

```
+-----------------------------------------------------------------------------------+
|                              HOSPITAL SYSTEM SOLUTION                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  1. BASE DE DATOS (SQL Server SSMS / H2 Fallback)                                |
|     - Database: hospital_db                                                       |
|     - Tablas: usuarios, roles, permisos, usuarios_roles, roles_permisos,         |
|               pacientes, medicos, citas                                           |
|                                                                                   |
|  2. BACKEND API REST (Spring Boot 3.3.4 / Java 21)                                |
|     - Seguridad: Spring Security + JWT RSA (RS256) con llaves pública/privada     |
|     - Endpoints de Autenticación: /api/auth/login, /api/auth/me                   |
|     - Especificación Dinámica: PacienteSpecification (Filtros en BD con Criteria)  |
|     - Paginación y Capped Size: PaginatedResponseDto (Máximo 200 por página)       |
|     - Documentación Interactiva: OpenAPI 3 / Swagger UI                           |
|                                                                                   |
|  3. FRONTEND 1: APP ADMINISTRATIVA (Angular 18+)                                  |
|     - Estructura Modular: core, guards, interceptors, models, services, pages     |
|     - Control de Menú Dinámico por Rol (ADMINISTRADOR vs OPERADOR)               |
|     - Interceptor HTTP: jwt.interceptor.ts (Bearer <token>)                       |
|     - Rutas Protegidas: auth.guard.ts, role.guard.ts                            |
|     - Módulos Activos: Pacientes (selector 50,100,200), Médicos, Citas, Admin    |
|                                                                                   |
|  4. FRONTEND 2: SITIO WEB PÚBLICO (Vanilla JS SPA)                               |
|     - Estructura SPA: index.html + router.js (hashchange + fetch asíncrono)       |
|     - Vistas Asíncronas: /views (inicio, nosotros, servicios, contacto)           |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Estructura de Directorios

```
apirest-demo/
├── README.md                                # Documentación principal del sistema
├── pom.xml                                  # Configuración de Maven (Spring Boot, Security, JJWT RSA, MSSQL)
├── sql/
│   └── hospital_db_schema.sql               # Script DDL/DML para SQL Server SSMS
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── gt/edu/umg/
│   │   │       ├── ApiDemoApplication.java
│   │   │       ├── config/
│   │   │       │   ├── DataInitializer.java # Carga automática de datos de prueba
│   │   │       │   ├── OpenApiConfig.java   # Configuración Swagger UI con Bearer JWT
│   │   │       │   └── SecurityConfig.java  # Configuración de Spring Security, CORS y preflight OPTIONS
│   │   │       ├── controller/
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── CitaController.java
│   │   │       │   ├── MedicoController.java
│   │   │       │   ├── PacienteController.java
│   │   │       │   └── UsuarioController.java
│   │   │       ├── core/entities/
│   │   │       │   ├── Cita.java
│   │   │       │   ├── Medico.java
│   │   │       │   ├── Paciente.java
│   │   │       │   ├── Permiso.java
│   │   │       │   ├── Rol.java
│   │   │       │   └── Usuario.java
│   │   │       ├── dao/
│   │   │       │   ├── CitaRepository.java
│   │   │       │   ├── MedicoRepository.java
│   │   │       │   ├── PacienteRepository.java
│   │   │       │   ├── RolRepository.java
│   │   │       │   ├── UsuarioRepository.java
│   │   │       │   └── specification/
│   │   │       │       └── PacienteSpecification.java
│   │   │       ├── security/
│   │   │       │   ├── jwt/
│   │   │       │   │   ├── JwtAuthenticationFilter.java
│   │   │       │   │   └── JwtTokenProvider.java
│   │   │       │   ├── rsa/
│   │   │       │   │   └── RsaKeyProvider.java
│   │   │       │   └── service/
│   │   │       │       └── CustomUserDetailsService.java
│   │   │       └── service/
│   │   │           ├── AuthService.java
│   │   │           ├── PacienteService.java
│   │   │           └── impl/
│   │   │               ├── AuthServiceImpl.java
│   │   │               └── PacienteServiceImpl.java
│   │   └── resources/
│   │       └── application.properties       # Configuración JDBC SQL Server / H2 y JWT RSA
├── frontend-angular/                         # Aplicación Web Angular 18+
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css                       # Glassmorphic UI & Micro-animations
│       └── app/
│           ├── app.component.ts
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── core/
│           │   ├── guards/ (auth.guard.ts, role.guard.ts)
│           │   ├── interceptors/ (jwt.interceptor.ts)
│           │   ├── models/ (auth.model.ts, paciente.model.ts)
│           │   └── services/ (auth.service.ts, paciente.service.ts)
│           ├── pages/
│           │   ├── administracion/          # Gestión de usuarios y roles
│           │   ├── citas/                   # Agendamiento de citas
│           │   ├── dashboard/               # Métricas generales
│           │   ├── login/                   # Inicio de sesión
│           │   ├── medicos/                 # Registro de médicos
│           │   └── pacientes/               # Tabla paginada (selector 50, 100, 200)
│           └── shared/
│               └── components/
│                   └── navbar/              # Menú dinámico basado en JWT
└── frontend-public-spa/                     # Sitio Web Informativo Público (Vanilla JS)
    ├── index.html
    ├── css/styles.css
    ├── js/router.js
    └── views/ (inicio.html, nosotros.html, servicios.html, contacto.html)
```

---

## 🔑 Credenciales Predeterminadas

| Usuario | Contraseña | Rol | Accesos y Permisos |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin1` | **`ADMINISTRADOR`** | Acceso total (Inicio, Pacientes -consultar/registrar-, Médicos, Citas, Administración). |
| **`operador`** | `admin1` | **`OPERADOR`** | Acceso limitado (Inicio, Consultar Pacientes, Citas). Menú restrictivo. |

*Las contraseñas se almacenan encriptadas con **BCrypt** (`$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVymGe07xd00DMxs.AQubh4a`).*

---

## ⚡ Guía de Instalación y Ejecución Local NATIVA

### 1. Requisitos Previos
- **Java JDK 21+** instalado.
- **Node.js 18+** y **npm** instalados.
- **Microsoft SQL Server (SSMS)** *(Opcional, incluye H2 en memoria configurado por defecto)*.

---

### 2. Base de Datos SQL Server (Opcional SSMS)
1. Abre SQL Server Management Studio (SSMS).
2. Ejecuta el script completo ubicado en: `sql/hospital_db_schema.sql`.
3. Si deseas usar tu contraseña propia de `sa`, edita `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=hospital_db;encrypt=false;trustServerCertificate=true;
   spring.datasource.username=sa
   spring.datasource.password=TU_CONTRASEÑA
   spring.jpa.database-platform=org.hibernate.dialect.SQLServerDialect
   ```

---

### 3. Ejecutar el Backend Spring Boot
En la raíz del proyecto (`apirest-demo`), abre una terminal y ejecuta:

```powershell
.\mvnw.cmd spring-boot:run
```

- **URL Base**: `http://localhost:8080`
- **Documentación Swagger UI**: `http://localhost:8080/swagger-ui/index.html`

---

### 4. Ejecutar la Aplicación Angular (`frontend-angular`)
En una nueva terminal, dirígete a la carpeta `frontend-angular`:

```powershell
cd frontend-angular
npm start
```

- **URL de Acceso**: `http://localhost:4200`
- **Uso**: Inicia sesión con `admin` / `admin1` u `operador` / `admin1`.

---

### 5. Abrir el Sitio Web Público SPA (`frontend-public-spa`)
Abre directamente en cualquier navegador el archivo:
`frontend-public-spa/index.html`

Navega mediante los enlaces del menú (`#inicio`, `#nosotros`, `#servicios`, `#contacto`) para verificar la carga asíncrona mediante el enrutador en Vanilla JavaScript.

---

## 📌 Endpoints Principales de la API REST

### Autenticación
- `POST /api/auth/login` - Inicio de sesión y generación del Token JWT RSA.
- `GET /api/auth/me` - Consulta del usuario autenticado.

### Pacientes (Paginados y Filtrados)
- `GET /api/v1/pacientes?page=0&size=50&nombre=Juan&activo=true` - Consulta paginada dinámica con `Specification` (Metadatos: `totalRecords`, `page`, `pageSize`, `totalPages`, `hasPreviousPage`, `hasNextPage`). Límite cappeado a máximo 200.
- `POST /api/v1/pacientes` - Registrar paciente.
- `DELETE /api/v1/pacientes/{id}` - Eliminar paciente *(Sólo Administrador)*.

### Médicos
- `GET /api/v1/medicos` - Listar médicos.
- `POST /api/v1/medicos` - Registrar nuevo médico especialista.

### Citas
- `GET /api/v1/citas` - Listar citas.
- `POST /api/v1/citas` - Agendar nueva cita médica.

### Usuarios y Roles
- `GET /api/v1/usuarios` - Listar usuarios.
- `POST /api/v1/usuarios` - Crear usuario y asignar rol.
