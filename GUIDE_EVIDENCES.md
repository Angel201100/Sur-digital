# Guía de evidencias — segundo entregable

Utiliza datos de prueba; oculta tokens, contraseñas y datos personales antes de entregar las capturas.

## Frontend

1. `frontend/tailwind.config.js` y `frontend/postcss.config.js`: configuración de Tailwind integrada con Vite.
2. Página `/` en escritorio y móvil: logotipo, identidad, navbar fijo y estilos responsivos.
3. Página `/`: carrusel; captura al menos los servicios 1, 5 y 10 para demostrar imágenes, texto, controles e indicadores.
4. Página `/`: botón flotante de WhatsApp y Footer completo con mapa, enlaces, redes y derechos reservados.
5. Página `/nosotros` y `/contacto`: navegación interna, contenido y mapa.
6. Página `/login`: formulario, estado de validaciones y enlace para recuperar la contraseña.
7. Modal **Crear una cuenta**: formulario completo, requisitos de contraseña en vivo, consentimiento y versión móvil.
8. Página `/recuperar-contrasena`: solicitud de recuperación y confirmación de respuesta. El envío requiere SMTP configurado.
9. Captura adicional con el panel responsive en ventana angosta para evidenciar el menú lateral.

## Panel administrativo

1. `/admin`: resumen al iniciar sesión como Administrador.
2. `/admin/users` y `/admin/clients`: tabla, formulario de alta/edición y estado activo/inactivo.
3. `/admin/roles`: roles y permisos asignables.
4. `/admin/permissions` y `/admin/services`: administración de catálogos.
5. Diálogo de confirmación de baja y mensaje de operación completada.
6. Inicia sesión con un Cliente y muestra que no ve módulos administrativos; opcionalmente prueba una petición API no autorizada que responde `403`.
7. Muestra cierre de sesión y la redirección al solicitar una ruta protegida.

## Backend y base de datos

1. Árbol `backend/app/`, `backend/database/` y `backend/tests/`.
2. Consola con entorno virtual y `pip install -r backend\requirements.txt`.
3. Diagrama MER `backend/database/MER.md` y tablas/relaciones visibles en Neon Console.
4. API activa en `http://127.0.0.1:8000/docs`; captura endpoints de autenticación, usuarios, roles, permisos y servicios.
5. Prueba en Swagger del alta de cliente y consulta pública de servicios; verifica el registro en Neon.
6. Prueba de login, `/api/auth/me` y JWT **sin exponer el token en la evidencia**.
7. Prueba de acceso prohibido por rol/permisos (`403`), actualización y baja lógica.
8. Consola con `python -m pytest -q` mostrando el resultado.

## Registro de prueba

Anota para cada captura fecha, URL, rol utilizado, acción y resultado esperado/obtenido. Las credenciales de administrador son las elegidas localmente en `backend/.env`, no se deben incluir en la evidencia.
