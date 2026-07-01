# Tree IDE

[English](../README.md) · [Português](README.pt-BR.md)

Aplicación de escritorio ligera para diseñar estructuras de proyecto en texto, visualizarlas como un árbol interactivo y generar carpetas, archivos iniciales y archivos ZIP en pocos clics.

![Tree IDE Interface](https://github.com/markelpher/TreeIDE-Deploy/blob/main/assets/preview.png)

## Funcionalidades

- **Vista en árbol en vivo** — escribe una estructura en texto simple y ve el resultado al instante
- **Generación de proyecto** — crea carpetas y archivos en una carpeta de salida seleccionada
- **Exportación ZIP y tar.gz** — empaqueta la estructura actual después de crear o bajo demanda
- **Extracción de archivos** — extrae ZIP, tar.gz, RAR y 7z mediante arrastrar y soltar
- **Plantillas iniciales** — inserta estructuras listas para Node.js, React, Python, MVC y sitios estáticos
- **Vista previa de archivos** — inspecciona el contenido generado antes de crear
- **Validación** — detecta indentación incorrecta, nombres duplicados, rutas no válidas y estructuras vacías antes de escribir los archivos
- **Iconos inteligentes** — iconos contextuales para carpetas comunes, lenguajes de programación, medios, archivos y configuración
- **Deshacer y rehacer** — historial completo de deshacer y rehacer para editar el árbol
- **Sesiones persistentes** — los proyectos se guardan automáticamente en IndexedDB
- **Inglés, portugués y español** — traducción integrada de la interfaz con selección de idioma en el primer uso
- **Temas y configuración** — temas claro y oscuro, selección de carpeta de salida y sesiones guardadas automáticamente
- **Actualizador automático** — consulta versiones en GitHub Releases, descarga actualizaciones en la app y reinicia para instalar

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

1. Escribe o pega una estructura de proyecto en el editor
2. Revisa la vista en árbol y el panel de validación
3. Elige una carpeta de salida en la configuración
4. Haz clic en **Build** para crear la estructura
5. Opcionalmente exporta la misma estructura como archivo ZIP o tar.gz

También puedes empezar desde el panel de Plantillas y personalizar el árbol generado y el contenido de los archivos antes de crear.

## Atajos de teclado

| Atajo | Acción |
| --- | --- |
| `Ctrl + S` | Guardar proyecto `.tree` actual |
| `Ctrl + Shift + S` | Guardar proyecto como |
| `Ctrl + O` | Abrir proyecto |
| `Ctrl + N` | Nuevo proyecto |
| `Ctrl + R` | Recargar app |
| `Ctrl + +` / `Ctrl + -` | Acercar / alejar zoom |
| `Ctrl + 0` | Restablecer zoom |
| `F11` | Pantalla completa |
| `Tab` | Aumentar sangría |
| `Shift + Tab` | Disminuir sangría |

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

### Windows (x64 + arm64)

```bash
npm run build
```

En equipos arm64, agrega `--arm64` para generar paquetes ARM64: `vite build && electron-builder --win nsis msi portable --arm64`.

| Identificador Windows | Valor |
| --- | --- |
| ID de aplicación | `com.treeide.treeide` |
| Nombre del ejecutable | `Tree IDE` |
| Idiomas del instalador | Inglés (`en_US`), portugués (`pt_BR`) |
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
assets/                         # Iconos de la app
tests/                          # Pruebas Vitest
build/                          # Configuración del instalador NSIS
build-flatpak/                  # Empaquetado Flatpak
docs/                           # Changelog manual, config de idiomas, README traducidos
scripts/                        # Scripts de build y CI
.github/workflows/
|   windows-build.yml           # Build Windows (x64 + arm64)
|   linux-build.yml             # Build Linux (x64 + arm64 + Flatpak)
|   macos-build.yml             # Build macOS (arm64 DMG + ZIP)
|   release-finalize.yml        # Localizar changelogs y publicar release
```

## Licencia

Tree IDE está licenciado bajo la [MIT License](../LICENSE).

## Créditos

Desarrollado por [Mare](https://github.com/git-mare) y con la contribución de [Mark Elpher](https://github.com/markelpher) en la creación de la v2 de Tree IDE.