<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Novedades en v2.0.82

Tree IDE v2 es una reescritura y ampliación completa de la aplicación original ([Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0)). La misma idea central — diseñar estructuras de carpetas en texto simple, previsualizarlas en vivo y generar proyectos — ahora con una nueva arquitectura, herramientas más completas y releases multiplataforma.

### Añadido

#### Build Studio y salida del proyecto
- **Build Studio** — flujo de build en pantalla completa con vista previa del árbol en vivo, vista previa de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo un ZIP o exportar solo un archivo de proyecto `.tree`
- **Salidas combinadas** — opcionalmente exportar un ZIP junto con una build en carpeta e incluir el archivo `.tree` dentro del archivo comprimido
- **Inspección previa al build** — analiza la carpeta de destino en busca de una estructura existente, archivos `.tree` o ZIP antes de escribir
- **Manejo de conflictos** — elige omitir o sobrescribir cuando ya existen archivos o carpetas
- **Contenido inicial predeterminado** para más de 68 tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Placeholders de i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos comprimidos y cifrado
- **Exportación ZIP** con protección opcional por contraseña AES-256 mediante 7-Zip
- **Proyectos `.tree` cifrados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importación de archivos comprimidos** mediante selector de archivos o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitudes de contraseña** para ZIPs cifrados y archivos `.tree` cifrados
- **Cargar carpeta como estructura** — analiza un directorio existente y lo convierte en texto de árbol editable
- **Fallback de Windows ARM64** para 7-Zip cuando los binarios nativos no están disponibles

#### Modelos
- **19 modelos iniciales integrados** agrupados por categoría:
  - Frontend: HTML, HTML y CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de modelos** — navegador de pantalla completa con tres columnas, pestañas de integrados y personalizados, edición inline de estructura y vista previa del árbol en vivo
- **Modelos personalizados** — crea desde cero, importa desde el proyecto actual, renombra, edita contenido de archivos inline, abre en el editor principal, exporta o elimina sin salir de la pantalla
- **Archivos `.tree-template`** — exporta e importa modelos personalizados compartibles (JSON `treeide-template` v1) mediante diálogos nativos de guardar/abrir o exportación por fila en la lista personalizada
- **Pie de modelos personalizados** — cuando existen modelos personalizados: **Nuevo modelo**, **Del proyecto actual** e **Importar .tree-template**; el estado vacío ofrece empezar desde cero, importar proyecto e importar archivo
- **Vista previa por archivo** — al hacer clic en un archivo en la vista previa de estructura se abre un panel de editor monoespaciado de ancho completo con insignia de tipo de archivo (el mismo layout de panel único para modelos integrados y personalizados)

#### Editor, árbol y validación
- **Panel de validación** — indentación incorrecta, nombres inválidos, hermanos duplicados, rutas inseguras y estructuras vacías; haz clic en una advertencia para saltar a la línea
- **Deshacer / rehacer** con hasta 100 estados de historial
- **Pestañas multiproyecto** con indicadores de modificación, barra desplazable y reordenamiento por arrastrar y soltar
- **Pestañas de vista previa de archivo por proyecto** — edita el contenido inicial de los archivos antes del build
- **Vista previa Markdown en vivo** para archivos `.md` en el panel de vista previa de archivo
- **Carpetas plegables** en la vista previa del árbol
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter
- **Coincidencia inteligente de renombrado de archivos** cuando se editan líneas del árbol
- **Indentar / desindentar bloques** con Tab y Shift+Tab, además de Backspace inteligente para bloques de indentación
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivo) con layout persistido entre sesiones

#### Íconos y tipos de archivo
- **Íconos Lucide** integrados localmente (sin dependencia de CDN)
- **Íconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y multimedia
- **Más de 100 etiquetas de extensión** en el mapa de tipos de archivo

#### UI y primera ejecución
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida** en la primera ejecución — layout rediseñado con encabezado hero, tarjetas de configuración agrupadas (General, Apariencia, Sesión) y botón **Comenzar** fijo
- **Modal de configuración** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal Acerca de** con versión de la app en vivo (evolución de la pantalla de créditos de v1)
- **Diálogo de cambios sin guardar** al cerrar con proyectos modificados
- **Overlay de arrastrar y soltar** para archivos `.tree` y comprimidos
- **Fuentes integradas** — Inter y JetBrains Mono

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en la primera ejecución** en el flujo de bienvenida y la configuración
- **Traducciones del proceso principal** para diálogos nativos y mensajes de error
- Script **`npm run i18n:validate`** para mantener sincronizados los archivos de idioma

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde el `localStorage` heredado
- **Guardado automático** de pestañas abiertas, contenido de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o comenzar siempre limpio

#### Autoactualizador y notas de release
- **Autoactualizador dentro de la app** — consulta GitHub Releases, descarga con progreso y reinicia para instalar
- **Canales de actualización estable y beta**
- **Notas de release localizadas** en el modal de actualización (inglés, portugués y español)
- **Changelog de actualización legible** — diálogo más ancho, sección **Novedades** expandida por defecto, área de desplazamiento dedicada, jerarquía de títulos más clara y botones de acción fijados en el pie
- **Flujo manual `docs/changelog.md`** — edita las notas de release en el repositorio; la CI las traduce para la app y publica el inglés en GitHub
- **Notas de release separadas** — el modal de actualización de la app muestra solo el texto del changelog; los enlaces de navegación por idioma aparecen en `docs/changelog.md` y en la descripción de la release de GitHub (apuntando a los assets adjuntos `pt.md` / `es.md`); el enlace de comparación (`Full Changelog`) es exclusivo de GitHub
- **Traducción con GitHub Models** — las notas de release en portugués y español se generan en CI mediante la API `models.github.ai`

#### Atajos de teclado
- **Atajos totalmente configurables** con UI de captura y acción para restaurar valores predeterminados
- Nuevos valores predeterminados incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos de zoom del editor

#### Plataformas y distribución
- **Windows** — instalador NSIS, MSI y builds portables para x64 y ARM64; instalador multiidioma (inglés, portugués y español) con título localizado en el selector de idioma
- **Linux** — AppImage, deb y snap para x64 y ARM64; builds Flatpak (x86_64 y aarch64, runtime 25.08) con launcher `zypak-wrapper`
- **macOS** — DMG y ZIP para Apple Silicon (arm64)
- **GitHub Releases** publicadas automáticamente en tags de versión desde CI
- **Build del renderer antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que cada instalador incluya el bundle de UI

#### Arquitectura, herramientas de desarrollo y calidad
- **Build del renderer con Vite** y hot module replacement en desarrollo
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos CSS
- **ES modules**, Node.js 24+, Electron 42
- **Handlers IPC separados** para proyecto, actualizaciones y ciclo de vida de la app
- **API preload con `contextBridge`** para una frontera de renderer más reforzada
- **Suite de pruebas Vitest** con mocks de Electron para ejecuciones amigables con CI; helpers de changelog y errores del actualizador cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts npm
- **electron-reloader** para hot reload del proceso principal durante el desarrollo
- **Exportación de log de error** en caso de crash para facilitar la depuración
- **`semver`** como dependencia directa para comparación confiable de versiones dentro de la app

### Cambiado

- **Reescritura completa** desde el monolito de v1 (`main.js`, `renderer.js`, `styles.css`) hacia una arquitectura modular Vite + Electron
- **Flujo de build** — el botón **Build** de la barra de herramientas ahora abre **Build Studio** en lugar de escribir archivos inmediatamente
- **Temas** — modos claro y oscuro, además de la opción **Sistema**, que sigue el esquema de color del SO
- **Pantalla de créditos** renombrada a **Acerca de Tree IDE**, con información dinámica de versión
- **Guardar / cargar** — cargador unificado para proyectos `.tree`, archivos comprimidos y carpetas; soporta proyectos cifrados y mapas de contenido de archivos importados
- **Vista previa del árbol** — conectores ASCII, íconos Lucide, botones de plegado y resaltado del archivo activo reemplazan la vista básica de árbol de v1
- **Almacenamiento de sesión** movido de `localStorage` a **IndexedDB** para soportar cargas mayores de autoguardado (pestañas + contenido de archivos)
- **Distribución** ampliada desde solo MSI para Windows (v1) a CI multi-SO con soporte ARM64, Flatpak y paquetes macOS
- **Electron** actualizado de v26 (v1) a v42 (v2)
- **Versionado de release** movido a releases semánticas v2.x con generación automatizada de changelog multilingüe
- **Ruteo de notas de release** — `en.md`, `pt.md` y `es.md` alimentan el actualizador dentro de la app; `github-release.md` alimenta el cuerpo de la release de GitHub con el enlace de comparación
- **Pantalla de modelos** — editor de estructura y vista previa del árbol usan una división 50/50 en modo de edición personalizada; etiqueta de vista previa acortada a **Vista previa**; acción **Usar modelo** centrada en el pie de la modal
- **Toasts de modelos personalizados** — la sugerencia de abrir en el editor ahora apunta a **Del proyecto actual** en lugar de la acción eliminada de actualizar por modelo
- **Barra de pestañas de vista previa de archivo** — las pestañas de archivo se desplazan en una región dedicada junto a la insignia de tipo de archivo y el botón de cerrar; divisor vertical eliminado; altura estable de la barra con desplazamiento por flechas solamente (sin expansión de scrollbar al pasar el mouse)
- **Tipografía del editor de vista previa de archivo** — tamaño monoespaciado compartido con los visualizadores de archivo de Modelos y Build Studio
- **Vistas previas del README** — la captura principal vive en `assets/previews/`; los READMEs en portugués y español usan imágenes de vista previa localizadas

### Corregido

- **Íconos de filas de modelos personalizados** — acciones de renombrar, abrir en editor, exportar y eliminar usan íconos Lucide integrados (`type`, `file-code`, `download`, `trash-2`) en lugar de caer en el glifo genérico de archivo
- **Vista previa de archivo de modelos** — los contenidos de archivo se renderizan en un panel de editor monoespaciado de ancho completo (no texto plano), alineado con el comportamiento de modelos integrados; el panel de archivo se limpia cuando el editor de estructura queda vacío
- **Editor de estructura de modelos** — Tab indenta en las textareas de estructura y archivo en lugar de mover el foco a otros controles; la vista previa del árbol se actualiza en vivo al escribir; la lista de modelos integrados ya no deja un espacio debajo del último elemento cuando el pie personalizado está oculto
- **Bindings de la modal de modelos** — los listeners de los editores de estructura/archivo se reanexan después de re-renderizados de la lista para que las ediciones inline sigan funcionando
- **Pantalla en blanco / negra después de instalar** — las builds empaquetadas podían salir sin `dist/renderer/` porque la salida de UI está ignorada por git; `electron-before-pack` ahora compila y verifica el renderer antes de cada paquete de `electron-builder`
- **Fallos al verificar actualizaciones** — errores más claros y localizados para problemas de red, `latest*.yml` faltante y releases inaccesibles; toasts de error duplicados eliminados; errores desconocidos del actualizador caen a un mensaje traducido en lugar de inglés crudo
- **Nombre de release en el diálogo de actualización** — la plantilla `Tree IDE v${version}` de electron-builder se normaliza a la versión real en la app
- **CI de release (job de traducción)** — migrada a `models.github.ai`; la inyección en `latest*.yml` corre en el flujo único `Release Finalize` sin `npm install`
- **Gate de Release Finalize** — las builds de plataforma publican releases draft; cada job de CI de plataforma verifica si Windows, Linux y macOS terminaron correctamente y solo entonces dispara `Release Finalize` una vez (el job de dispatch trata su propio workflow como terminado aunque GitHub todavía lo marque como `in_progress`); finalize publica `latest*.yml` localizados, Snap y assets Flatpak; la app ignora actualizaciones hasta que existan notas en inglés, portugués y español
- **Empaquetado Flatpak** — corregidos el path de staging de Electron, fuentes del manifiesto, directorio unpacked ARM64, entrypoint `zypak-wrapper` y parcheo del nombre del archivo desktop
- **Limpieza de caché de GitHub Actions** — corregido `jq` comparando IDs numéricos de caché con strings, lo que podía eliminar la entrada de caché que debía conservarse
- **CI de snap Linux** — los artefactos snap se generan con `--publish never`, por lo que la CI no requiere credenciales de Snap Store; el archivo `.snap` se adjunta a la release de GitHub durante `Release Finalize` (solo x64)
- **Seguridad de rutas** — el parser y creador de árbol rechazan traversal y otras rutas inseguras antes de escribir en disco
- **Validación de indentación** — mezcla de tabs y espacios se detecta e informa en el panel de validación
- **Nombres duplicados** — archivos y carpetas hermanas con el mismo nombre se señalan antes del build
- **Validación de exportación cifrada** — contraseña y confirmación deben coincidir antes de crear ZIP o archivos `.tree` protegidos
- **Detección de actualización** — solo se ofrecen versiones estrictamente más nuevas que la build instalada
- **Renderizado de notas de release** — HTML en changelogs de actualización se sanitiza antes de mostrarse
- **Barra de pestañas de vista previa de archivo** — las pestañas ya no se superponen a la etiqueta de tipo de archivo ni rompen el layout del editor cuando hay muchos archivos abiertos
- **Editor de vista previa de archivo** — scrollbar y edición por teclado (Tab / Backspace) coinciden con el editor principal de estructura; peso y tamaño de fuente ahora coinciden con el visualizador de archivos de Modelos
- **Nombres de guardado / exportación** — guardados y exportaciones `.tree` usan el nombre resuelto del proyecto en lugar de un fallback genérico Untitled
- **Persistencia de modelos personalizados** — los modelos personalizados se autoguardan mientras la modal de Modelos está abierta y se restauran desde IndexedDB después de reiniciar
- **Build del instalador NSIS Windows** — strings en español usan LCID **3082** (`SpanishInternational`, alineado con `es_ES` de electron-builder); eliminados `Spanish-1034.nsh` redundante y overrides portugueses `MUI_UNTEXT_*` para que `makensis -WX` ya no falle por LangStrings duplicadas o faltantes
- **Idioma del instalador NSIS Windows** — selector de idioma dentro del asistente (inglés, portugués, español) sin relanzar ni archivos auxiliares temporales; **Siguiente** avanza inmediatamente, y páginas de directorio, progreso, finalización y páginas personalizadas aplican títulos, descripciones y botones traducidos al mostrarse mediante `SendMessage`
- **Idioma del desinstalador NSIS Windows** — mismo selector de idioma dentro del asistente; páginas de progreso y finalización siguen el idioma seleccionado sin relanzar

### Eliminado

- **Layout monolítico de archivo único** de v1 — reemplazado por la estructura modular `src/` (funcionalidad preservada y ampliada)
- **UI de build de un paso** — sustituida por Build Studio; la creación directa de carpetas sigue disponible dentro del studio
- **Empaquetado exclusivo Windows MSI** como único formato de distribución — reemplazado por NSIS, MSI, portable y artefactos Linux/macOS