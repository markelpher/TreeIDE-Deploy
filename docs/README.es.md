# Tree IDE

[English](../README.md) · [Português](README.pt-BR.md)

Aplicación de escritorio ligera para diseñar estructuras de proyecto en texto simple, visualizarlas como un árbol interactivo y generar carpetas, archivos iniciales y archivos comprimidos mediante **Build Studio**.

![Tree IDE Interface](https://github.com/markelpher/TreeIDE-Deploy/blob/main/assets/preview/preview-ES.png)

Tree IDE v2 es una reescritura completa de la [aplicación original](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0). La misma idea central — diseñar estructuras de carpetas en texto, previsualizarlas en vivo y generar proyectos — con arquitectura modular Vite + Electron, herramientas más ricas y releases multiplataforma.

## Funcionalidades

### Editor y árbol
- **Vista en árbol en vivo** con conectores ASCII, iconos Lucide, carpetas plegables y resaltado del archivo activo
- **Panel de validación** — indentación incorrecta, nombres no válidos, hermanos duplicados, rutas inseguras y estructuras vacías; haz clic en una advertencia para ir a la línea
- **Deshacer / rehacer** con hasta 100 estados de historial
- **Pestañas multi-proyecto** con indicadores de modificación, barra de pestañas desplazable y reordenación por arrastrar y soltar
- **Pestañas de vista previa por archivo** — edita contenidos iniciales antes de crear; vista previa Markdown en vivo para archivos `.md`
- **Sangría / reducción en bloque** con Tab y Shift+Tab, además de Backspace inteligente para bloques de sangría
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivo) con diseño persistido entre sesiones

### Build Studio y salida
- **Build Studio** — flujo de creación a pantalla completa con vista previa del árbol, contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo ZIP o exportar solo archivo `.tree`
- **Salidas combinadas** — opcionalmente exportar ZIP junto con la carpeta e incluir el archivo `.tree` en el archivo
- **Inspección previa** — escanea la carpeta de destino por estructura existente, `.tree` o ZIP antes de escribir
- **Manejo de conflictos** — elige omitir o sobrescribir cuando archivos o carpetas ya existen
- **Contenido inicial predeterminado** para 68+ tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Placeholders i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

### Archivos y cifrado
- **Exportación ZIP** con protección opcional por contraseña AES-256 vía 7-Zip
- **Proyectos `.tree` cifrados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importación de archivos** mediante diálogo o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitud de contraseña** para ZIP cifrados y archivos `.tree` protegidos
- **Cargar carpeta como estructura** — escanea un directorio existente y lo convierte en texto editable

### Plantillas
- **19 plantillas iniciales integradas** — Frontend (HTML, React, Vite), Stacks (Node.js, MVC, Python, PHP), Systems (Go, Java, Kotlin, Rust, Ruby, Swift, Dart) y Native (C, C++, C#)
- **Pantalla de Plantillas** — navegador a pantalla completa con tres columnas, pestañas integradas y personalizadas, edición inline de la estructura y vista previa en vivo
- **Plantillas personalizadas** — crear en blanco, importar del proyecto actual, renombrar, editar contenidos inline, exportar o eliminar
- **Archivos `.tree-template`** — exportar e importar plantillas personalizadas compartibles (JSON `treeide-template` v1)

### UI, i18n y sesión
- **Ventana sin marco personalizada** con minimizar, maximizar y cerrar; barra de menú (Archivo, Editar, Ver, Ventana, Acerca de)
- **Modal de bienvenida** en el primer uso con selección de idioma y configuración agrupada
- **Temas** — claro, oscuro y **Sistema** (sigue el esquema de colores del SO)
- **Inglés, portugués (pt-BR) y español** — traducciones de la interfaz y de los diálogos del proceso principal
- **Almacenamiento de sesión en IndexedDB** con guardado automático de pestañas abiertas, contenidos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre empezar limpio
- **Fuentes incluidas** — Inter y JetBrains Mono; iconos Lucide locales (sin CDN)

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
6. Opcionalmente guarda el proyecto como `.tree` o exporta un archivo cifrado

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
| `Ctrl + Z` / `Ctrl + Y` | Deshacer / rehacer |
| `Ctrl + T` | Nueva pestaña |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | Siguiente / pestaña anterior |
| `Ctrl + W` / `Ctrl + Shift + W` | Cerrar pestaña / cerrar todas |
| `Ctrl + Q` | Salir de la app |
| `Ctrl + R` | Recargar app |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | Acercar / alejar / restablecer zoom |
| `F11` | Pantalla completa |
| `Tab` / `Shift + Tab` | Aumentar / disminuir sangría |

Los atajos son totalmente configurables en **Configuración → Atajos**.

## Desarrollo

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/markelpher/TreeIDE-Deploy.git
cd TreeIDE-Deploy
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

### Windows (x64 + arm64)

```bash
npm run build
```

En equipos arm64, agrega `--arm64` para generar paquetes ARM64: `vite build && electron-builder --win nsis msi portable --arm64`.

| Identificador Windows | Valor |
| --- | --- |
| ID de aplicación | `com.treeide.treeide` |
| Nombre del ejecutable | `Tree IDE` |
| Idiomas del instalador | Inglés (`en_US`), portugués (`pt_BR`), español (`es_ES`) |
| Metadatos del actualizador | `latest.yml` (x64), `latest-arm64.yml` (arm64) |
| Workflow de CI | `Build Windows` — `.github/workflows/windows-build.yml` |
| Nombres de artefactos en CI | `tree-ide-windows-x64`, `tree-ide-windows-arm64` |
| Archivos de release (x64 / arm64) | `Tree-IDE-Setup-{version}-win-{arch}.exe` (NSIS), `Tree-IDE-{version}-win-{arch}.msi`, `Tree-IDE-Portable-{version}-win-{arch}.exe` |

### Linux (x64 + arm64)

```bash
vite build && electron-builder --linux AppImage deb snap
```

En equipos arm64, agrega `--arm64` para generar paquetes ARM64. Los bundles Flatpak se construyen por separado en la CI.

| Identificador Linux | Valor |
| --- | --- |
| ID de aplicación | `com.treeide.treeide` |
| Entrada de escritorio | `com.treeide.treeide.desktop` |
| Categoría de la app | `Development` |
| Metadatos del actualizador | `latest-linux.yml` (x64), `latest-linux-arm64.yml` (arm64) |
| Workflow de CI | `Build Linux` — `.github/workflows/linux-build.yml` |
| Nombres de artefactos en CI | `tree-ide-linux-x64`, `tree-ide-linux-arm64`, `tree-ide-linux-flatpak-x64`, `tree-ide-linux-flatpak-arm64` |
| Archivos de release (x64) | `Tree-IDE-{version}-x64.AppImage`, `.deb`, `.snap`, `Tree-IDE-{version}-x86_64.flatpak` |
| Archivos de release (arm64) | `Tree-IDE-{version}-arm64.AppImage`, `.deb`, `Tree-IDE-{version}-aarch64.flatpak` |

### macOS (Apple Silicon / arm64)

```bash
npm run build:mac
```

Los Mac con Intel no son compatibles.

| Identificador macOS | Valor |
| --- | --- |
| Bundle ID | `com.treeide.treeide` |
| Categoría de la app | `public.app-category.developer-tools` |
| Metadatos del actualizador | `latest-mac.yml` |
| Workflow de CI | `Build macOS` — `.github/workflows/macos-build.yml` |
| Nombre del artefacto en CI | `tree-ide-macos-arm64` |
| Archivos de release | `Tree-IDE-{version}-macOS-arm64.dmg`, `Tree-IDE-{version}-macOS-arm64.zip` |

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
|   preview/
|       preview.png             # Capturas para los READMEs
|   icon.png                    # Iconos de la app
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Pruebas Vitest
build/                          # Configuración del instalador NSIS
build-flatpak/                  # Empaquetado Flatpak
docs/
|   changelog.md                # Notas de release en inglés (editar antes del tag)
|   changelogs/
|       locales.json            # Config de idiomas para traducción en CI
|       pt.md                   # Notas en portugués (sobrescritas por Release Finalize)
|       es.md                   # Notas en español (sobrescritas por Release Finalize)
|   README.pt-BR.md             # READMEs traducidos
|   README.es.md
scripts/                        # Scripts de build, changelog y CI
.github/workflows/
|   windows-build.yml           # Build Windows (x64 + arm64)
|   linux-build.yml             # Build Linux (x64 + arm64 + Flatpak)
|   macos-build.yml             # Build macOS (arm64 DMG + ZIP)
|   release-finalize.yml        # Traducir changelogs y publicar release
```

## Licencia

Tree IDE está licenciado bajo la [MIT License](../LICENSE).

## Créditos

Desarrollado por [Mare](https://github.com/git-mare) y con la contribución de [Mark Elpher](https://github.com/markelpher) en la creación de la v2 de Tree IDE.