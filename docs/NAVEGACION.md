# Historial interno — 2026-10-20

Atrás/Adelante usa el historial nativo para volver a pantallas y detalles visitados.
No es deshacer: navegar no revierte respuestas, XP, entregas ni guardados y no los repite.
Sólo identificadores de ruta en URL/history; nunca borradores, credenciales o datos clínicos.
Salir del laboratorio sigue disponible como acción explícita; al agotar el historial interno
el navegador puede volver a Disciplina. No se captura el botón Atrás indefinidamente.

Angular Router ya gestiona rutas. CanDeactivate protege crear/editar notas y categorías:\nCancelar conserva el formulario; aceptar permite salir sin guardar. Un guardado exitoso marca pristine;\nlos fallos conservan dirty. La caducidad/logout no queda bloqueada por el formulario.

## Verificación

`npm test -- --watch=false`, `npm run build`, `node scripts/probar-navegacion.cjs`\n(API ficticia; no abrir una sesión de usuario en el ensayo).

CI ejecuta estas comprobaciones en cada PR/promoción. Los gestos físicos iOS/Safari y
la aceptación con cuenta del propietario quedan como validación manual; Chromium móvil
no los sustituye. No se cambian fichas centrales ni se acredita el contenido académico.

## Publicación y réplica

Dev → QA → relase → PRD, PR y CI por puerta; son ramas, no entornos desplegados adicionales.
Sólo zAlice sobre el sitio existente y después de respaldo DB/código/config, rollback verificado,
comprobación de fuente y secretos. Reinicio exclusivamente de la aplicación autorizada.
No ejecutar scripts de pruebas contra producción. No ejecutar rm masivo ni restaurar DB
para deshacer un cambio de interfaz. Validar assets, salud/SSO, claves previas de tablas y
configuración efectiva; obtener respaldo posterior. Instrucciones operativas completas en
/home/server/plan/runbook-migracion-despliegue-zuritaserver.md y runbook-dev-zuritaserver.md;
evidencia privada en entregas/navegacion-todos-labs-2026-10-20, fuera del runtime público.
La rama main es el producto original: no sustituirla por la adaptación lab. Integrar el cierre\nverificado en lab y etiquetar la release de laboratorio, preservando main.\n
