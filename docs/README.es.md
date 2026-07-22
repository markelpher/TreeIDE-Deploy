# Tree IDE

[English](../README.md) · [Português](README.pt-BR.md) · [Guía de instalación](installation/installation.es.md)

![Tree IDE Interface](https://github.com/markelpher/treeide-deploy/blob/main/assets/previews/preview-ES.png)

Tree IDE v2 es una reescritura completa de la [aplicación original](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). La misma idea central: diseñar estructuras de carpetas en texto, previsualizarlas en tiempo real y generar proyectos. Con arquitectura modular Vite + Electron, herramientas más ricas y releases enfocadas en Windows.

## Funcionalidades

### Editor y árbol
- **Vista en árbol en vivo** con conectores ASCII, iconos Lucide, carpetas plegables y resaltado del archivo activo
- **Panel de validación** — indentación incorrecta, nombres no válidos, hermanos duplicados, rutas inseguras y estructuras vacías; haz clic en una advertencia para ir a la línea
- **Deshacer / rehacer** con hasta 100 estados de historial
- **Pestañas multi-proyecto** con indicadores de modificación, barra de pestañas desplazable y reordenación por arrastrar y soltar
- **Pestañas del editor de archivos por proyecto** — edita contenidos iniciales antes de crear, reordena pestañas arrastrándolas y cierra automáticamente las pestañas de archivos eliminados; vista previa Markdown en vivo para archivos `.md`
- **Sangría / reducción en bloque** con Tab y Shift+Tab, además de Backspace inteligente para bloques de sangría
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivo) con diseño persistido entre sesiones

### Build Studio y salida
- **Build Studio** — flujo de creación a pantalla completa con vista previa del árbol, contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo ZIP o exportar solo archivo `.tree`
- **Salidas combinadas** — opcionalmente exportar ZIP junto con la carpeta e incluir el archivo `.tree` en el archivo
- **Acción de creación según el contenido** — al crear una estructura con un ZIP adicional, el botón indica si creará un archivo, archivos, una carpeta, carpetas o una combinación, seguido de `+ ZIP`
- **Inspección previa** — escanea la carpeta de destino por estructura existente, `.tree` o ZIP antes de escribir
- **Manejo de conflictos** — elige omitir o sobrescribir cuando archivos o carpetas ya existen
- **Contenido inicial predeterminado** para 68+ tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Placeholders i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

### Archivos y cifrado
- **Compatibilidad con archivos Tree IDE 1** — Tree IDE 1 es el formato de archivo `.tree` de primera generación utilizado por Tree IDE Legacy; sus archivos de texto UTF-8 sin encabezado siguen siendo totalmente compatibles, incluida la indentación con tabulaciones o `...`
- **Exportación ZIP** con protección opcional por contraseña AES-256 vía 7-Zip
- **Proyectos `.tree` con cifrado de alto nivel** — TREEIDE2 usa AES-256-GCM autenticado con Argon2id (256 MiB, 4 pasadas y 4 vías), mientras los archivos de texto simple de Tree IDE Legacy siguen siendo compatibles como formato de primera generación
- **Protección explícita del `.tree` con contraseña** — los campos de contraseña permanecen visibles, pero deshabilitados hasta seleccionar la protección; al activarla aparece la advertencia de contraseña irrecuperable y los valores deben coincidir antes de guardar
- **Importación de archivos** mediante diálogo o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitud de contraseña** para ZIP cifrados y archivos `.tree` protegidos
- **Cargar carpeta como estructura** — escanea un directorio existente y lo convierte en texto editable

### Plantillas
- **19 plantillas iniciales integradas** — Frontend (HTML, React, Vite), Stacks (Node.js, MVC, Python, PHP), Systems (Go, Java, Kotlin, Rust, Ruby, Swift, Dart) y Native (C, C++, C#)
- **Pantalla de Plantillas** — navegador a pantalla completa con tres columnas, pestañas integradas y personalizadas, edición inline de la estructura y vista previa en vivo
- **Búsqueda y favoritos de plantillas** — filtro que ignora acentos en plantillas integradas y personalizadas, además de favoritos guardados localmente con un icono de estrella incluido para uso offline
- **Plantillas personalizadas** — crear en blanco, importar del proyecto actual, renombrar, editar contenidos inline, exportar o eliminar
- **Vista previa Markdown en plantillas** — los archivos `.md` muestran el editor y el documento renderizado lado a lado, con actualización en tiempo real al editar plantillas personalizadas
- **Archivos `.tree-template`** — exportar e importar plantillas personalizadas compartibles (JSON `treeide-template` v1)

### UI, i18n y sesión
- **Ventana sin marco personalizada** con minimizar, maximizar y cerrar; barra de menú (Archivo, Editar, Ver, Ventana, Acerca de)
- **Modal de bienvenida** en el primer uso con selección de idioma y configuración agrupada
- **Temas** — claro, oscuro y **Sistema** (sigue el esquema de colores del SO)
- **Inglés, portugués (pt-BR) y español** — traducciones de la interfaz y de los diálogos del proceso principal
- **Informes de problemas estructurados** — completa el título de la issue, la descripción, los pasos para reproducir y el comportamiento esperado en un formulario localizado con campos autoajustables dentro de la app
- **Integración con labels de GitHub** — elige una label de la lista actual del repositorio usando el mismo dropdown personalizado de la app; el borrador localizado se abre con título, cuerpo Markdown y label completos para revisión
- **Diagnóstico con privacidad primero** — guarda un ZIP local con metadatos permitidos del sistema/app, errores sanitizados del renderer y registros limitados a la ejecución actual; se excluyen nombres y contenidos de proyectos
- **Captura opcional solo de la app** — captura únicamente la ventana de Tree IDE después del consentimiento explícito; ZIP, registro y captura permanecen locales hasta que los adjuntes manualmente
- **Almacenamiento de sesión en IndexedDB** con guardado automático de pestañas abiertas, contenidos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre empezar limpio
- **Fuentes incluidas** — Inter y JetBrains Mono; iconos Lucide locales (sin CDN)
- **Paleta de comandos** — usa `Ctrl+Shift+P` para acceder a 23 acciones de proyecto, edición, navegación entre pestañas, creación, vista, actualización y ayuda; los comandos contextuales no disponibles aparecen deshabilitados
- **Mejoras de accesibilidad** — etiquetas localizadas para lectores de pantalla, anuncios de resultados, listboxes y pestañas semánticas, foco visible y navegación por teclado en los flujos de comandos y plantillas
- **Rich Presence opcional de Discord** — estados localizados de editor/archivo/plantillas/build/configuración, iconos dedicados por actividad y para inactividad, pausa al bloquear o suspender, reconexión y tres niveles de privacidad

### Actualizador automático
- **Actualizador en la app** — consulta GitHub Releases, descarga con progreso y reinicia para instalar
- **Canales estable y beta**
- **Notas de release localizadas** en el modal de actualización (inglés, portugués y español)
- Edita las notas en `docs/changelog.md`; la CI las traduce para la app y publica el inglés en GitHub

## Sintaxis de la estructura

Tree IDE usa un formato simple basado en indentación. Usa tabulaciones o grupos de cuatro espacios para anidar elementos.

```text
mi-proyecto/
    src/
        main.js
        utils.ts
    assets/
        logo.png
        preview.png
    README.md
    package.json
```

Las carpetas pueden terminar con `/` para mayor claridad. Tree IDE también detecta carpetas cuando contienen elementos anidados.

## Flujo de trabajo

1. Escribe o pega una estructura de proyecto en el editor (o empieza desde **Plantillas**)
2. Revisa la vista en árbol y el panel de validación
3. Personaliza contenidos iniciales en las pestañas de vista previa si es necesario
4. Haz clic en **Build** para abrir **Build Studio**
5. Elige el modo de salida (carpeta, ZIP, `.tree` o combinado) y confirma la ruta de destino
6. Opcionalmente protege el archivo `.tree` o ZIP con contraseña

También puedes abrir proyectos `.tree`, archivos comprimidos o carpetas mediante arrastrar y soltar o **Archivo → Abrir**.

## Atajos de teclado

| Atajo | Acción |
| --- | --- |
| `Ctrl + N` | Nuevo proyecto |
| `Ctrl + O` | Abrir proyecto |
| `Ctrl + S` | Guardar proyecto `.tree` actual |
| `Ctrl + Shift + S` | Guardar proyecto como |
| `Ctrl + Alt + S` | Guardar todos los proyectos |
| `Ctrl + B` | Abrir Build Studio |
| `Ctrl + Shift + P` | Abrir Paleta de comandos |
| `Ctrl + Z` / `Ctrl + Y` | Deshacer / rehacer |
| `Ctrl + T` | Nueva pestaña |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | Siguiente / pestaña anterior |
| `Ctrl + W` / `Ctrl + Shift + W` | Cerrar pestaña de proyecto / cerrar pestaña de archivo |
| `Ctrl + Q` | Salir de la app |
| `Ctrl + R` | Recargar app |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | Acercar / alejar / restablecer zoom |
| `F11` | Pantalla completa |
| `Tab` / `Shift + Tab` | Aumentar / disminuir sangría |

Los atajos son totalmente configurables en **Configuración → Atajos**.

## Rich Presence

Abre **Configuración → Rich Presence** y activa Rich Presence. La aplicación de Tree IDE en Discord ya está configurada, y la aplicación de Discord para escritorio debe estar abierta. La Presence comienza como Inactivo y cambia a Editando estructura solo después de una interacción directa con el editor de estructura. Los estados contextuales abarcan la vista de archivos, plantillas, configuración, creación de un archivo, varios archivos, una estructura de carpetas o carpetas y archivos, además de la exportación genérica de un archivo, sin revelar nombres, rutas, formatos ni cifrado; cada grupo usa un icono pequeño dedicado mientras el logotipo de Tree IDE permanece como imagen principal.

Elige privacidad Básico, Actividad o Detallado; solo Detallado puede incluir el nombre del proyecto y el tipo de archivo. Nunca se envían rutas ni contenidos. Después de cinco minutos sin interacción, la Presence vuelve a Inactivo con su icono de teclado. Se limpia mientras Windows está bloqueado o suspendido y se restaura cuando el dispositivo vuelve.

El idioma de la Presence sigue el idioma de Tree IDE de forma predeterminada o puede fijarse por separado en inglés, portugués o español. Discord recibe un único texto localizado, por lo que todos los observadores ven el idioma elegido por el usuario de Tree IDE, sin traducción automática según el idioma de Discord de cada observador. Los desarrolladores pueden sustituir el ID incluido con `TREEIDE_DISCORD_CLIENT_ID`.

Los PNG contextuales de Presence se versionan en `assets/discord-presence/` y pueden recrearse con `scripts/generate-discord-presence-icons.ps1`.

## Desarrollo

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/markelpher/treeide-deploy.git
cd TreeIDE
npm install
```

Ejecuta la app localmente:

```bash
npm start
```

Ejecuta las pruebas:

```bash
npm test
```

Valida los archivos de idioma:

```bash
npm run i18n:validate
```

Compilación:

### Windows (x64)

```bash
npm run build
```

Para un build explícito de Windows:

```bash
npm run build:win
```

Tree IDE es solo para Windows y soporta x64. Proporciona paquetes NSIS y Portable. El instalador NSIS soporta instalación por usuario y actualizaciones automáticas silenciosas sin pedir administrador.

Las builds de producción mantienen el código de la aplicación organizado en un único paquete `app.asar` con validación de integridad. Los datos del perfil de Windows permanecen separados del ejecutable, como se espera en aplicaciones por usuario. Cuando Setup encuentra datos de una instalación anterior, una instalación manual pregunta si debe conservarlos (la opción segura y predeterminada) o eliminar la configuración, la caché, los registros, la sesión y los datos de actualización. El desinstalador presenta la misma elección explícita.

El instalador manual asistido y el desinstalador muestran las opciones de datos. Las actualizaciones silenciosas iniciadas dentro de la aplicación omiten esas páginas y siempre conservan los datos. La pantalla de bienvenida aparece con un perfil nuevo o después de elegir eliminar los datos, pero no cuando se conservan los datos existentes.

El desinstalador mantiene el mismo flujo asistido y localizado hasta la acción final **Terminar**.

| Identificador Windows | Valor |
| --- | --- |
| Application ID | `com.treeide.treeide` |
| Nombre del ejecutable | `Tree IDE` |
| Tipos de instalador | Setup NSIS (x64), Portable (x64) |
| Idiomas del instalador | Inglés (`en_US`), Portugués (`pt_BR`), Español (`es_ES`) |
| Metadatos del actualizador | `latest.yml` (x64) |
| Workflow de CI | `Build Windows` — `.github/workflows/windows-build.yml` |
| Nombre del artefacto en CI | `tree-ide-windows-x64` |
| Archivos de release | `Tree-IDE-Setup-{version}-win-x64.exe`, `Tree-IDE-Portable-{version}-win-x64.exe` |

## Estructura del proyecto

```text
src/
|-- main/                       # Proceso principal Electron, IPC, proyecto/archivos
|-- preload/                    # API contextBridge expuesta al renderer
|-- renderer/
|   |-- index.html              # Punto de entrada HTML
|   |-- main.js                 # Bootstrap del renderer
|   |-- modules/                # Editor, árbol, modales, build studio, pestañas, etc.
|   |-- data/                   # Contenidos predeterminados y plantillas iniciales
|   |-- css/                    # Estilos modulares
|   |-- fonts/                  # Fuentes Inter y JetBrains Mono
|-- shared/                     # Helpers compartidos, i18n, actualizador
assets/
|   previews/
|       preview.png             # Capturas para los READMEs
|   discord-presence/           # PNG contextuales versionados de Presence de Discord
|   icon.png                    # Iconos de la app
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Pruebas Vitest
build/                          # Configuración del instalador NSIS
docs/
|   changelog.md                # Notas de release en inglés (editar antes del tag)
|   changelogs/
|       locales.json            # Config de idiomas para traducción en CI
|       pt-br.md                # Notas en portugués de Brasil (sobrescritas por Release Finalize)
|       es.md                   # Notas en español (sobrescritas por Release Finalize)
|   README.pt-BR.md             # READMEs traducidos
|   README.es.md
|   installation/
|       installation.md         # Guía de instalación en inglés
|       installation.pt-BR.md   # Guía de instalación en portugués
|       installation.es.md      # Guía de instalación en español
scripts/                        # Scripts de build, changelog, CI y generación de assets de Presence
.github/workflows/
|   windows-build.yml           # Build Windows x64 (NSIS + Portable)
|   release-finalize.yml        # Traducir changelogs y publicar release
```

## Licencia

Tree IDE está licenciado bajo la [MIT License](../LICENSE).

## Créditos

Desarrollado por [Mare](https://github.com/git-mare) y con la contribución de [Mark Elpher](https://github.com/markelpher) en la creación de la v2 de Tree IDE.
