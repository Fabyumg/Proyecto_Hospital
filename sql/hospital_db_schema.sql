-- ============================================================================
-- SCRIPT DDL & DML PARA BASE DE DATOS: hospital_db
-- Motor: Microsoft SQL Server (SSMS)
-- Descripción: Creación de esquemas, tablas, llaves foráneas e inserción
--              de roles, permisos, usuarios (admin/operador con BCrypt) y pacientes.
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'hospital_db')
BEGIN
    CREATE DATABASE hospital_db;
END
GO

USE hospital_db;
GO

-- ----------------------------------------------------------------------------
-- 1. TABLA: roles
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles_permisos;
IF OBJECT_ID('dbo.usuarios_roles', 'U') IS NOT NULL DROP TABLE dbo.usuarios_roles;
IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles;
IF OBJECT_ID('dbo.permisos', 'U') IS NOT NULL DROP TABLE dbo.permisos;
IF OBJECT_ID('dbo.usuarios', 'U') IS NOT NULL DROP TABLE dbo.usuarios;
IF OBJECT_ID('dbo.pacientes', 'U') IS NOT NULL DROP TABLE dbo.pacientes;
GO

CREATE TABLE dbo.roles (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
GO

-- ----------------------------------------------------------------------------
-- 2. TABLA: permisos
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.permisos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
GO

-- ----------------------------------------------------------------------------
-- 3. TABLA INTERMEDIA: roles_permisos
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.roles_permisos (
    rol_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    CONSTRAINT FK_roles_permisos_rol FOREIGN KEY (rol_id) REFERENCES dbo.roles(id) ON DELETE CASCADE,
    CONSTRAINT FK_roles_permisos_permiso FOREIGN KEY (permiso_id) REFERENCES dbo.permisos(id) ON DELETE CASCADE
);
GO

-- ----------------------------------------------------------------------------
-- 4. TABLA: usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.usuarios (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Almacenará la clave encriptada con BCrypt
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ----------------------------------------------------------------------------
-- 5. TABLA INTERMEDIA: usuarios_roles
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.usuarios_roles (
    usuario_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT FK_usuarios_roles_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
    CONSTRAINT FK_usuarios_roles_rol FOREIGN KEY (rol_id) REFERENCES dbo.roles(id) ON DELETE CASCADE
);
GO

-- ----------------------------------------------------------------------------
-- 6. TABLA: pacientes
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.pacientes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dpi VARCHAR(13) NOT NULL UNIQUE,
    telefono VARCHAR(8) NULL,
    correo VARCHAR(100) NULL,
    fecha_nacimiento DATE NULL,
    activo BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES (DML)
-- ============================================================================

-- A. Permisos
INSERT INTO dbo.permisos (nombre, descripcion) VALUES
('PACIENTES_CONSULTAR', 'Permite consultar y buscar pacientes paginados'),
('PACIENTES_REGISTRAR', 'Permite crear y modificar registros de pacientes'),
('MEDICOS_GESTION', 'Permite gestionar médicos y especialidades'),
('CITAS_GESTION', 'Permite agendar y cancelar citas médicas'),
('ADMINISTRACION_GESTION', 'Permite administrar usuarios y configuración del sistema');
GO

-- B. Roles
INSERT INTO dbo.roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Acceso total a todas las funciones del sistema'),
('OPERADOR', 'Acceso limitado (Inicio, Consultar Pacientes, Citas)');
GO

-- C. Asignación Roles -> Permisos
-- ADMINISTRADOR tiene TODOS los permisos
INSERT INTO dbo.roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM dbo.roles r, dbo.permisos p
WHERE r.nombre = 'ADMINISTRADOR';

-- OPERADOR tiene PACIENTES_CONSULTAR y CITAS_GESTION
INSERT INTO dbo.roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM dbo.roles r
JOIN dbo.permisos p ON p.nombre IN ('PACIENTES_CONSULTAR', 'CITAS_GESTION')
WHERE r.nombre = 'OPERADOR';
GO

-- D. Usuarios Predeterminados
-- Contraseña encriptada con BCrypt para "admin1":
-- $2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVymGe07xd00DMxs.AQubh4a
INSERT INTO dbo.usuarios (username, password, nombre, apellido, email, activo, fecha_creacion) VALUES
('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Administrador', 'Sistema', 'admin@hospital.com', 1, GETDATE()),
('operador', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Operador', 'Recepcion', 'operador@hospital.com', 1, GETDATE());
GO

-- E. Asignación Usuarios -> Roles
INSERT INTO dbo.usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM dbo.usuarios u, dbo.roles r
WHERE u.username = 'admin' AND r.nombre = 'ADMINISTRADOR';

INSERT INTO dbo.usuarios_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM dbo.usuarios u, dbo.roles r
WHERE u.username = 'operador' AND r.nombre = 'OPERADOR';
GO

-- F. Registros Iniciales de Pacientes
INSERT INTO dbo.pacientes (nombre, apellido, dpi, telefono, correo, fecha_nacimiento, activo, fecha_creacion) VALUES
('Juan', 'Pérez', '2589631470101', '55443322', 'juan.perez@email.com', '1990-05-15', 1, GETDATE()),
('María', 'Gómez', '1472583690101', '55112233', 'maria.gomez@email.com', '1985-08-20', 1, GETDATE()),
('Carlos', 'López', '3692581470101', '44332211', 'carlos.lopez@email.com', '1992-11-03', 1, GETDATE()),
('Ana', 'Martínez', '7894561230101', '44112233', 'ana.martinez@email.com', '1995-02-14', 1, GETDATE()),
('Roberto', 'Hernández', '1237894560101', '33221100', 'roberto.h@email.com', '1980-09-30', 1, GETDATE()),
('Lucía', 'Morales', '9876543210101', '33998877', 'lucia.m@email.com', '1998-12-01', 0, GETDATE()),
('Fernando', 'Castillo', '4561237890101', '55667788', 'fernando.c@email.com', '1975-04-18', 1, GETDATE()),
('Sofia', 'Vásquez', '6549873210101', '44556677', 'sofia.v@email.com', '2001-07-22', 1, GETDATE());
GO

SELECT 'Base de datos hospital_db configurada con éxito.' AS Status;
GO
