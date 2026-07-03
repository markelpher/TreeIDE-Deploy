<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Novedades en v2.0.82

Tree IDE v2 es una reescritura completa y expansión de la aplicación original ([Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0)). La misma idea central: diseñar estructuras de carpetas en texto plano, previsualizarlas en vivo y generar proyectos, con una nueva arquitectura, herramientas más ricas y lanzamientos multiplataforma.

### Agregado

#### Estudio de construcción y salida de proyectos
- **Estudio de construcción** — flujo de construcción a pantalla completa con previsualización de árbol en vivo, previsualización de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo un ZIP, o exportar solo un archivo de proyecto `.tree`
- **Salidas combinadas** — exportar opcionalmente un ZIP junto con una construcción de carpeta, e incluir el archivo `.tree` dentro del archivo comprimido
- **Inspección previa a la construcción** — escanear la carpeta de destino en busca de estructuras existentes, archivos `.tree` o ZIP antes de escribir
- **Manejo de conflictos** — elegir omitir o sobrescribir cuando los archivos o carpetas ya existen
- **Contenido inicial predeterminado** para más de 68 tipos de archivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, y más)
- **Marcadores de posición i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos y encriptación
- **Exportación a ZIP** con protección por contraseña AES-256 opcional a través de 7-Zip
- **Proyectos `.tree` encriptados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importación de archivos** a través de diálogo de archivos o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, y `.7z`
- **Solicitudes de contraseña** para archivos ZIP encriptados y archivos `.tree` encriptados
- **Cargar carpeta como estructura** — escanear un directorio existente y convertirlo en texto de árbol editable
- **Fallback para Windows ARM64** para 7-Zip cuando los binarios nativos no están disponibles

#### Plantillas
- **19 plantillas de inicio integradas** agrupadas por categoría:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa con pestañas integradas y personalizadas, edición de estructura en línea y previsualización de árbol en vivo
- **Plantillas personalizadas** — crear en blanco, importar desde el proyecto actual, renombrar, editar el contenido del archivo en línea, abrir en el editor principal, exportar o eliminar sin salir de la pantalla
- **Archivos `.tree-template`** — exportar e importar plantillas personalizables compartibles (JSON `treeide-template` v1) a través de diálogos de guardar/abrir nativos o exportación por fila en la lista personalizada
- **Pie de página de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Desde el proyecto actual**, y **Importar .tree-template**; el estado vacío ofrece inicio en blanco, importación de proyecto y importación de archivo
- **Previsualización por archivo** — al hacer clic en un archivo en la previsualización de la estructura se abre un panel de editor de ancho completo con insignia de tipo de archivo (mismo diseño de un solo panel para plantillas integradas y personalizadas)

#### Editor, árbol y validación
- **Panel de validación** — mala indentación, nombres inválidos, hermanos duplicados, rutas inseguras y estructuras vacías; haz clic en una advertencia para saltar a la línea
- **Deshacer / rehacer** con hasta 100 estados de historial
- **Pestañas de múltiples proyectos** con indicadores de modificación, una barra de pestañas desplazable y reordenamiento por arrastrar y soltar
- **Pestañas de previsualización de archivos por proyecto** — editar el contenido de archivos de inicio antes de construir
- **Previsualización en vivo de Markdown** para archivos `.md` en el panel de previsualización de archivos
- **Carpetas colapsables** en la previsualización del árbol
- **Navegación por teclado en el árbol** — teclas de flecha, Inicio, Fin y Enter
- **Coincidencia inteligente de renombrado de archivos** cuando se editan líneas del árbol
- **Sangría de bloque / deshacer sangría** con Tab y Shift+Tab, además de retroceso inteligente para bloques de sangría
- **Zoom del editor** — `Ctrl++`, `Ctrl+-`, y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, previsualización de archivos) con diseño persistente a través de sesiones

#### Iconos y tipos de archivo
- **Iconos Lucide** empaquetados localmente (sin dependencia de CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y medios
- **Más de 100 etiquetas de extensión de archivo** en el mapa de tipos de archivo

#### Interfaz de usuario y experiencia de primer uso
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida** en el primer uso — diseño rediseñado con encabezado destacado, tarjetas de configuración agrupadas (General, Apariencia, Sesión) y un botón **Comenzar** fijado
- **Modal de configuración** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal Acerca de** con versión de la aplicación en vivo (evolucionado de la pantalla de créditos v1)
- **Diálogo de cambios no guardados** al cerrar con proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y archivos comprimidos
- **Fuentes empaquetadas** — Inter y JetBrains Mono

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en el primer uso** en el flujo de bienvenida y configuraciones
- **Traducciones del proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener los archivos de localización sincronizados

#### Persistencia de sesión
- **Almacenamiento de sesión IndexedDB** con migración automática desde `localStorage` legado
- **Guardado automático** de pestañas abiertas, contenidos de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre comenzar limpio

#### Actualizador automático y notas de lanzamiento
- **Actualizador automático en la aplicación** — verificar lanzamientos de GitHub, descargar con progreso y reiniciar para instalar
- **Canales de actualización estables y beta**
- **Notas de lanzamiento localizadas** en el modal de actualización (inglés, portugués y español)
- **Registro de cambios de actualización legible** — diálogo más amplio, **Novedades** expandido por defecto, área de desplazamiento dedicada, jerarquía de encabezados más clara y botones de acción fijados en el pie de página
- **Flujo de trabajo manual `docs/changelog.md`** — editar notas de lanzamiento en el repositorio; CI las traduce para la aplicación y publica en inglés en GitHub
- **Notas de lanzamiento divididas** — el modal de actualización de la aplicación muestra solo el texto del registro de cambios; los enlaces de navegación de localización aparecen en `docs/changelog.md` y en la descripción del lanzamiento de GitHub (apuntando a los activos adjuntos `pt.md` / `es.md`); el enlace de comparación (`Full Changelog`) es solo de GitHub
- **Traducción de modelos de GitHub** — las notas de lanzamiento en portugués y español se generan en CI a través de la API `models.github.ai`

#### Atajos de teclado
- **Atajos completamente configurables** con interfaz de captura y acción de restaurar valores predeterminados
- Los nuevos valores predeterminados incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos de zoom del editor

#### Plataformas y distribución
- **Windows** — instalador NSIS, MSI y versiones portátiles para x64 y ARM64; instalador multilingüe (inglés, portugués y español) con título de selector de idioma localizado
- **Linux** — AppImage, deb y snap para x64 y ARM64; versiones Flatpak (x86_64 y aarch64, runtime 25.08) con lanzador `zypak-wrapper`
- **macOS** — DMG y ZIP para Apple Silicon (arm64)
- **Lanzamientos de GitHub** publicados automáticamente en etiquetas de versión desde CI
- **Construcción del renderizador antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que cada instalador incluya el paquete de UI

#### Arquitectura, herramientas de desarrollo y calidad
- **Construcción del renderizador Vite** con reemplazo de módulo en caliente en desarrollo
- **Código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/`, y 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manejadores IPC divididos** para proyecto, actualizaciones y ciclo de vida de la aplicación
- **API de precarga `contextBridge`** para un límite de renderizador endurecido
- **Suite de pruebas Vitest** con simulacros de Electron para ejecuciones amigables con CI; ayudantes de errores de registro de cambios y actualizador cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts de npm
- **electron-reloader** para recarga en caliente del proceso principal durante el desarrollo
- **Exportación de registro de errores** en caso de fallo para facilitar la depuración
- **`semver`** como dependencia directa para comparación de versiones confiable en la aplicación

### Cambiado

- **Reescritura completa** del monolito v1 (`main.js`, `renderer.js`, `styles.css`) a una arquitectura modular Vite + Electron
- **Flujo de construcción** — el botón **Construir** de la barra de herramientas ahora abre **Estudio de construcción** en lugar de escribir archivos inmediatamente
- **Temas** — modos claro y oscuro más una opción **Sistema** que sigue el esquema de color del SO
- **Pantalla de créditos** renombrada a **Acerca de Tree IDE** con información de versión dinámica
- **Guardar / cargar** — cargador unificado para proyectos `.tree`, archivos comprimidos y carpetas; soporta proyectos encriptados y mapas de contenido de archivos importados
- **Previsualización del árbol** — conectores ASCII, iconos Lucide, botones de plegado y resaltado de archivo activo reemplazan la vista de árbol básica v1
- **Almacenamiento de sesión** movido de `localStorage` a **IndexedDB** para soportar cargas de guardado automático más grandes (pestañas + contenidos de archivos)
- **Distribución** expandida de solo MSI para Windows (v1) a CI multiplataforma con soporte para ARM64, Flatpak y paquetes de macOS
- **Electron** actualizado de v26 (v1) a v42 (v2)
- **Versionado de lanzamientos** movido a lanzamientos semánticos v2.x con generación automatizada de registros de cambios multilingües
- **Enrutamiento de notas de lanzamiento** — `en.md`, `pt.md`, y `es.md` alimentan el actualizador en la aplicación; `github-release.md` alimenta el cuerpo del lanzamiento de GitHub con el enlace de comparación
- **Pantalla de plantillas** — el editor de estructura y la previsualización del árbol utilizan una división 50/50 en modo de edición personalizada; etiqueta de previsualización acortada a **Previsualización**; acción **Usar plantilla** centrada en el pie de modal
- **Toasts de plantillas personalizadas** — la sugerencia de abrir en el editor ahora apunta a **Desde el proyecto actual** en lugar de la acción de actualización por plantilla eliminada
- **Barra de pestañas de previsualización de archivos** — las pestañas de archivos se desplazan en una región dedicada junto a la etiqueta de tipo de archivo y el botón de cerrar; se eliminó el divisor vertical; altura de barra estable con desplazamiento por flecha solamente (sin expansión de barra de desplazamiento al pasar el ratón)
- **Tipografía del editor de previsualización de archivos** — tamaño monoespaciado compartido con las vistas de archivos de Plantillas y Estudio de Construcción
- **Previsualizaciones de README** — la captura de pantalla principal se encuentra bajo `assets/previews/`; los README en portugués y español utilizan imágenes de previsualización localizadas

### Corregido

- **Iconos de fila personalizada de plantillas** — las acciones de renombrar, abrir en el editor, exportar y eliminar utilizan iconos Lucide empaquetados (`type`, `file-code`, `download`, `trash-2`) en lugar de recurrir al glifo de archivo genérico
- **Previsualización de archivos de plantillas** — los contenidos de los archivos se renderizan en un panel de editor monoespaciado de ancho completo (no texto plano), coincidiendo con el comportamiento de la plantilla integrada; el panel de archivos se limpia cuando el editor de estructura se vacía
- **Editor de estructura de plantillas** — Tab indenta en la estructura y áreas de texto de archivos en lugar de saltar el enfoque a otros controles; la previsualización del árbol se actualiza en vivo mientras se escribe; la lista de plantillas integradas ya no deja un espacio debajo del último elemento cuando el pie de página personalizado está oculto
- **Vínculos de modal de plantillas** — los oyentes del editor de estructura/archivo se vuelven a adjuntar después de que la lista se vuelve a renderizar para que las ediciones en línea sigan funcionando
- **Pantalla en blanco / negra después de la instalación** — las versiones empaquetadas podrían enviarse sin `dist/renderer/` porque la salida de UI está ignorada por git; `electron-before-pack` ahora construye y verifica el renderizador antes de cada empaquetado de `electron-builder`
- **Fallas en la verificación de actualizaciones** — errores localizados más claros para problemas de red, falta de `latest*.yml`, y lanzamientos inaccesibles; se eliminaron los toast de error duplicados; errores desconocidos del actualizador recurren a un mensaje traducido en lugar de inglés sin procesar
- **Nombre de lanzamiento en el diálogo de actualización** — la plantilla `Tree IDE v${version}` de electron-builder se normaliza a la cadena de versión real en la aplicación
- **CI de lanzamiento (trabajo de traducción)** — migrado a `models.github.ai`; la inyección de `latest*.yml` se ejecuta en el único flujo de trabajo `Release Finalize` sin `npm install`
- **Puerta de finalización de lanzamiento** — las construcciones de plataforma publican lanzamientos borradores; cada trabajo de CI de plataforma verifica si Windows, Linux y macOS han tenido éxito y solo entonces despacha `Release Finalize` una vez (el trabajo de despacho trata su propio flujo de trabajo como terminado incluso mientras GitHub aún lo marca como `in_progress`); la finalización publica `latest*.yml` localizados, activos de Snap y Flatpak; la aplicación ignora actualizaciones hasta que las notas de lanzamiento en inglés, portugués y español estén presentes
- **Empaquetado de Flatpak** — corregido el camino de staging de Electron, fuentes de manifiesto, directorio descomprimido de ARM64, punto de entrada `zypak-wrapper`, y parcheo del nombre de archivo de escritorio
- **Limpieza de caché de GitHub Actions** — corregido `jq` comparando IDs de caché numéricos con cadenas, lo que podría eliminar la entrada de caché que se debía mantener
- **CI de snap en Linux** — los artefactos de snap se construyen con `--publish never` para que CI no requiera credenciales de Snap Store; el archivo `.snap` se adjunta al lanzamiento de GitHub durante `Release Finalize` (solo x64)
- **Seguridad de ruta** — el analizador y creador de árbol rechazan la travesía y otras rutas inseguras antes de escribir en disco
- **Validación de indentación** — se detectan y reportan tabulaciones y espacios mezclados en el panel de validación
- **Nombres duplicados** — archivos y carpetas hermanos con el mismo nombre son señalados antes de la construcción
- **Validación de exportación encriptada** — la contraseña y la confirmación deben coincidir antes de crear archivos ZIP o `.tree` protegidos
- **Detección de actualizaciones** — solo se ofrecen versiones estrictamente más nuevas que la construcción instalada
- **Renderización de notas de lanzamiento** — HTML en registros de cambios de actualización se sanitiza antes de la visualización
- **Barra de pestañas de previsualización de archivos** — las pestañas ya no se superponen a la etiqueta de tipo de archivo ni interrumpen el diseño del editor cuando hay muchos archivos abiertos
- **Editor de previsualización de archivos** — la barra de desplazamiento y la edición por teclado (Tab / Retroceso) coinciden con el editor de estructura principal; el peso y tamaño de la fuente ahora coinciden con la vista de archivos de Plantillas
- **Nomenclatura de guardar / exportar** — los guardados y exportaciones `.tree` utilizan el nombre de proyecto resuelto en lugar de un genérico Sin título
- **Persistencia de plantillas personalizadas** — las plantillas personalizadas se guardan automáticamente mientras el modal de Plantillas está abierto y se restauran desde IndexedDB después del reinicio
- **Construcción del instalador NSIS para Windows** — las cadenas en español utilizan LCID **3082** (`SpanishInternational`, coincidiendo con `es_ES` de electron-builder); se eliminaron los redundantes `Spanish-1034.nsh` y las sobreescrituras de `MUI_UNTEXT_*` en portugués para que `makensis -WX` ya no falle por LangStrings duplicados o faltantes
- **Idioma del instalador NSIS para Windows** — selector de idioma en el asistente (inglés, portugués, español) sin reinicio o archivos temporales auxiliares; **Siguiente** avanza inmediatamente y las páginas de directorio, progreso, finalización y personalizadas aplican títulos, descripciones y botones traducidos en el momento de la visualización
- **Idioma del desinstalador NSIS para Windows** — mismo selector de idioma en el asistente; las páginas de progreso y finalización siguen el idioma seleccionado sin reinicio

### Eliminado

- **Diseño monolítico de un solo archivo** de v1 — reemplazado por la estructura modular `src/` (funcionalidad preservada y expandida)
- **Interfaz de usuario de construcción de un solo paso** — sustituida por el Estudio de Construcción; la creación directa de carpetas sigue estando disponible dentro del estudio
- **Empaquetado solo para Windows MSI** como el único formato de distribución — reemplazado por NSIS, MSI, portátil y artefactos de Linux/macOS
