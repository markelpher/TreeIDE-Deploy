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
- **Vista previa Markdown en plantillas** — los archivos `.md` muestran el editor y el documento renderizado lado a lado, con actualización en tiempo real al editar plantillas personalizadas
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
|   preview/
|       preview.png             # Capturas para los READMEs
|   icon.png                    # Iconos de la app
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Pruebas Vitest
build/                          # Configuración del instalador NSIS
docs/
|   changelog.md                # Notas de release en inglés (editar antes del tag)
|   changelogs/
|       locales.json            # Config de idiomas para traducción en CI
|       pt.md                   # Notas en portugués (sobrescritas por Release Finalize)
|       es.md                   # Notas en español (sobrescritas por Release Finalize)
|   README.pt-BR.md             # READMEs traducidos
|   README.es.md
|   installation/
|       installation.md         # Guía de instalación en inglés
|       installation.pt-BR.md   # Guía de instalación en portugués
|       installation.es.md      # Guía de instalación en español
scripts/                        # Scripts de build, changelog y CI
.github/workflows/
|   windows-build.yml           # Build Windows x64 (NSIS + Portable)
|   release-finalize.yml        # Traducir changelogs y publicar release
```

## Licencia

Tree IDE está licenciado bajo la [MIT License](../LICENSE).

## Créditos

Desarrollado por [Mare](https://github.com/git-mare) y con la contribución de [Mark Elpher](https://github.com/markelpher) en la creación de la v2 de Tree IDE.
