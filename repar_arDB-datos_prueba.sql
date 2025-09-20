-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 21-09-2025 a las 00:19:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `repar_arDB`
--

--
-- Volcado de datos para la tabla `reparBackend_contratador`
--

INSERT INTO `reparBackend_contratador` (`id_contratador`, `nombre`, `apellido`, `email_contratador`, `telefono_contratador`, `dni`, `id_zona_geografica_contratador`) VALUES
(1, 'Angel', 'Labruna', 'angel@labruna.com', 2034912912, 1500000, 1),
(2, 'Pablo Cesar', 'Aimar', 'pablo@aimar.com', 2323159159, 15000000, 1);

--
-- Volcado de datos para la tabla `reparBackend_estado`
--

INSERT INTO `reparBackend_estado` (`id_estado`, `descripcion`) VALUES
(1, 'Publicado');

--
-- Volcado de datos para la tabla `reparBackend_profesion`
--

INSERT INTO `reparBackend_profesion` (`id_profesion`, `nombre_profesion`) VALUES
(1, 'Gasista'),
(2, 'Electricista'),
(3, 'Albañil');

--
-- Volcado de datos para la tabla `reparBackend_trabajador`
--

INSERT INTO `reparBackend_trabajador` (`id_trabajador`, `telefono_trabajador`, `mail_trabajador`, `id_contratador`, `id_zona_geografica_trabajador`) VALUES
(1, 2034912912, 'angel@labruna.com', 1, 1);

--
-- Volcado de datos para la tabla `reparBackend_trabajadoresprofesion`
--

INSERT INTO `reparBackend_trabajadoresprofesion` (`id_trabajador_profesion`, `matricula`, `id_profesion`, `id_trabajador`) VALUES
(1, '', 3, 1),
(2, '091218', 1, 1);

--
-- Volcado de datos para la tabla `reparBackend_trabajo`
--

INSERT INTO `reparBackend_trabajo` (`id_trabajo`, `descripcion`, `fecha_creacion`, `fecha_inicio`, `fecha_fin`, `id_contratador`, `id_estado`, `id_profesion_requerida`, `id_trabajador`, `id_zona_geografica_trabajo`) VALUES
(1, 'Esto es una prueba nada más', '2025-09-20 21:31:38.000000', NULL, NULL, 2, 1, 3, NULL, 1);

--
-- Volcado de datos para la tabla `reparBackend_zonageografica`
--

INSERT INTO `reparBackend_zonageografica` (`id_zona_geografica`, `calle`, `ciudad`, `provincia`) VALUES
(1, 'Dragon Ball 86', 'Turdera', 'Buenos Aires'),
(2, 'Fuwa Fuwa 401', 'Rafaela', 'Santa Fe');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
