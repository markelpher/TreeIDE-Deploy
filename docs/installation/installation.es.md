# Guía de instalación de Tree IDE

[English](installation.md) · [Português](installation.pt-BR.md) · [README principal](../README.es.md)

Tree IDE publica paquetes oficiales para Windows x64. Es una aplicación exclusiva para Windows. Los paquetes NSIS y Portable están disponibles.

## Elige la descarga correcta

Descarga Tree IDE desde la página de Releases de GitHub:

```text
https://github.com/markelpher/treeide-deploy/releases
```

Elige uno de estos archivos:

| Sistema | Archivo | Nota |
| --- | --- | --- |
| Windows x64 | `Tree-IDE-Setup-{version}-win-x64.exe` | Recomendado (NSIS, soporta actualizaciones automáticas) |
| Windows x64 Portable | `Tree-IDE-Portable-{version}-win-x64.exe` | No instala, se ejecuta directamente |

## Instalar en Windows

1. Descarga el paquete NSIS x64 (recomendado, soporta actualizaciones automáticas) o el paquete Portable.
2. Haz doble clic en el instalador Setup o ejecuta directamente el Portable .exe.
3. Si aparece Windows SmartScreen, elige **Más información** y luego **Ejecutar de todas formas** solo si el archivo viene de la release oficial.
4. Espera a que termine la instalación (o simplemente inicia el Portable).
5. Abre Tree IDE desde el menú Inicio, acceso directo del escritorio o el ejecutable portable.

El instalador NSIS es por usuario e instala dentro del perfil del usuario actual de Windows, normalmente en `%LocalAppData%\Programs`. No debería pedir permisos de administrador para la instalación normal ni para las actualizaciones automáticas.

## Actualizaciones automáticas

Tree IDE usa el canal del instalador Windows NSIS para actualizar automáticamente.

1. Tree IDE revisa GitHub Releases para encontrar una versión finalizada más nueva.
2. Cuando hay una actualización, la app descarga en segundo plano el instalador NSIS x64.
3. Cuando termina la descarga, Tree IDE se cierra, instala la actualización en silencio y se vuelve a abrir automáticamente.

Usa siempre el instalador `Tree-IDE-Setup-{version}-win-x64.exe`. Los paquetes Portable no forman parte del canal de actualización automática.

## Desinstalar

Usa **Configuración -> Aplicaciones -> Aplicaciones instaladas -> Tree IDE -> Desinstalar**, o ejecuta el desinstalador desde la carpeta de instalación de Tree IDE.

## Solución de problemas

### Windows pide permisos de administrador

Instala la build `Tree-IDE-Setup-{version}-win-x64.exe` más reciente. Las builds actuales están configuradas como instalación por usuario y no deberían pedir administrador durante la instalación/actualización normal.

Si ya había una versión antigua instalada para todos los usuarios, desinstálala primero desde Configuración de Windows y luego instala el nuevo setup por usuario.

### La actualización no volvió a abrir la app

Abre Tree IDE manualmente desde el menú Inicio y revisa la versión en **Acerca de Tree IDE**. Si la versión no cambió, descarga el `Tree-IDE-Setup-{version}-win-x64.exe` más reciente desde GitHub Releases y ejecútalo una vez.
