<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Novedades en v2.0.109

Tree IDE v2 es una reescritura completa y ampliación de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). El mismo concepto central — diseñar estructuras de carpetas en texto plano, previsualizarlas en tiempo real y generar proyectos — con una nueva arquitectura, herramientas más avanzadas y versiones exclusivas para Windows.

### Añadido

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas para conservar datos** — al instalar manualmente sobre una versión existente de Tree IDE o desinstalar, se presentan opciones claras para Conservar o Eliminar, con Conservar seleccionado por defecto
- **Instalador detecta primera instalación** — la elección de datos se omite cuando no existe un perfil o datos de actualizador previos de Tree IDE y no interrumpe las actualizaciones automáticas silenciosas
- **Flujo de datos asistido correctamente** — al instalar manualmente sobre una versión existente y al desinstalar se muestran las opciones Conservar/Eliminar; las actualizaciones silenciosas desde la app omiten el aviso y conservan los datos
- **La bienvenida sigue la elección de datos** — el proceso de introducción aparece para un perfil nuevo o tras elegir Eliminar, mientras que al seleccionar Conservar se mantiene el estado completado de la introducción
- **Acción final correcta en el desinstalador** — la página final ahora etiqueta su botón principal como Finalizar en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación sigue organizado en `app.asar`, ahora con validación de integridad ASAR de Electron y carga restringida al archivo verificado
- **Runtime de Windows x64 optimizado** — se eliminó la cadena de herramientas Squirrel no utilizada y los binarios de 7-Zip para sistemas no Windows/no x64 de los archivos distribuidos de la aplicación
- **Limpieza opcional completa** — al eliminar datos se borran preferencias, caché, registros, sesión guardada, carpetas de perfil actuales y legadas, y datos del actualizador

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de construcción en pantalla completa con vista previa del árbol en vivo, previsualización de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo un ZIP, o exportar solo un archivo de proyecto `.tree`
- **Salidas combinadas** — opcionalmente exportar un ZIP junto con una construcción de carpeta, e incluir el archivo `.tree` dentro del archivo ZIP
- **Botón crear-con-ZIP sensible al contenido** — las construcciones combinadas de carpeta y ZIP ahora muestran la acción como Crear Archivo, Archivos, Carpeta, Carpetas, Archivo y Carpeta, o Archivos y Carpetas seguido de `+ ZIP`, según la estructura seleccionada
- **Inspección previa a la construcción** — escanea la carpeta objetivo buscando estructuras existentes, archivos `.tree` o ZIP antes de escribir
- **Manejo de conflictos** — permite elegir omitir o sobrescribir cuando ya existen archivos o carpetas
- **Contenido inicial predeterminado** para más de 68 tipos de archivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Marcadores i18n** en los archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 identifica el formato de archivo `.tree` de primera generación usado por Tree IDE Legacy; los archivos originales sin encabezado en UTF-8 siguen siendo legibles con estilos de tabulación y `...`
- **Exportación ZIP** con protección opcional por contraseña AES-256 vía 7-Zip
- **Proyectos `.tree` cifrados de alta seguridad** — TREEIDE2 usa cifrado autenticado AES-256-GCM con Argon2id (256 MiB, 4 pasadas, 4 canales), autentica su encabezado criptográfico y mantiene el formato de Tree IDE Legacy sin encabezado legible como generación 1
- **Protección explícita de `.tree`** — una casilla dedicada habilita los campos de contraseña y confirmación (que de otro modo están deshabilitados), explica que se aplicará el cifrado TREEIDE2 y muestra la advertencia de contraseña irrecuperable solo cuando la protección está seleccionada
- **Importación de archivos comprimidos** mediante cuadro de diálogo o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` cifrados
- **Cargar carpeta como estructura** — escanea un directorio existente y lo convierte en texto de árbol editable

#### Plantillas
- **19 plantillas iniciales integradas** agrupadas por categoría:
  - Frontend: HTML, HTML y CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa con pestañas integradas y personalizadas, edición de estructura en línea y vista previa dinámica del árbol
- **Plantillas personalizadas** — crea en blanco, importa desde el proyecto actual, renombra, edita contenidos de archivos en línea, abre en el editor principal, exporta o elimina sin salir de la pantalla
- **Archivos `.tree-template`** — exporta e importa plantillas personalizadas para compartir (JSON `treeide-template` v1) usando los diálogos nativos de guardar/abrir o exporta por fila en la lista personalizada
- **Pie de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Desde el proyecto actual** e **Importar .tree-template**; el estado vacío ofrece inicio en blanco, importación de proyecto y de archivo
- **Previsualización por archivo** — al hacer clic en un archivo en la vista previa de estructura se abre un panel editor monoespaciado de ancho completo con distintivo de tipo de archivo (misma disposición de panel único para plantillas integradas y personalizadas)
- **Búsqueda de plantillas** — filtra plantillas integradas y personalizadas mientras escribes, con coincidencia insensible a mayúsculas y acentos y retroalimentación localizada cuando no hay resultados
- **Favoritos de plantillas** — marca plantillas con una estrella Lucide incluida localmente, navega por ellas en una pestaña dedicada de Favoritos y mantiene la selección entre sesiones

#### Palette de comandos y accesibilidad
- **Palette de comandos ampliada** — usa `Ctrl+Shift+P` para buscar 23 acciones, sumando Guardar Todo, Deshacer, Rehacer, Nueva pestaña, pestañas de proyecto siguiente/anterior, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de a los comandos existentes de proyecto, construcción, configuración, pantalla completa y reporte
- **Comandos contextualizados** — Guardar Todo y acciones de pestaña de proyecto/archivo permanecen visibles para facilitar su descubrimiento, pero están deshabilitadas cuando la sesión actual no puede ejecutarlas de forma segura
- **Flujo de comandos orientado al teclado** — las flechas cambian el comando activo, Enter lo ejecuta, Escape cierra el palette y el foco regresa al control anterior
- **Mejor soporte para lectores de pantalla** — nombres accesibles localizados, patrones semánticos de combobox/listbox/pestaña, seguimiento activo de descendiente, conteos de resultados en tiempo real y anuncios de estado más claros en comandos y plantillas
- **Acciones accesibles en plantillas** — los controles de favorito, renombrar, editar, exportar y eliminar exponen etiquetas y estado localizados mediante `aria-pressed`, `aria-selected` y regiones en vivo

#### Rich Presence
- **Privacidad por defecto** — Discord Rich Presence ahora inicia deshabilitado y la barra de estado, idioma y controles de privacidad permanecen inaccesibles hasta que el usuario habilite explícitamente la integración
- **Discord RPC listo para usar** — Tree IDE se entrega con su ID de aplicación pública de Discord, se conecta automáticamente al cliente de escritorio que se esté ejecutando, informa el estado de conexión, reintenta tras desconexiones y no requiere configuración por parte del usuario
- **Estados de actividad específicos** — Editando estructura, Editando código, Editando texto, Viendo archivo, Navegando plantillas, Personalizando plantilla, Configuración y creación con conocimiento de construcción como Creando archivo, Creando archivos, Creando carpeta, Creando carpetas, Creando archivo y carpeta o Creando archivos y carpetas; la opción Build Studio usa el mismo título y descripción dinámicos, mientras que las salidas `.tree` están disponibles para proyectos planos válidos y las exportaciones usan un estado genérico Exportando archivo.
- **Estado inactivo sensible al editor** — la presencia inicia como Inactivo y solo informa Editando estructura tras interactuar directamente con el editor de estructuras; cinco minutos sin interacción regresan a Inactivo con un icono de teclado
- **Tres niveles de privacidad** — Básico muestra solo Tree IDE, Actividad añade la acción actual y Detallado puede mostrar también el nombre del proyecto y tipo de archivo; nunca se comparten rutas ni contenidos de archivos
- **Presencia consciente del consumo energético** — bloquear y suspender limpian la actividad, mientras que desbloquear y reanudar la restauran automáticamente
- **Presencia localizada** — sigue el idioma de Tree IDE o elige inglés, portugués o español de manera independiente; el ajuste actualiza el RPC inmediatamente y persiste entre sesiones
- **Alcance de la localización explicado** — Discord recibe una sola carga de actividad localizada, así que cada espectador ve el idioma de presencia seleccionado por el editor, no una traducción según el idioma de Discord del espectador

#### Editor, árbol y validación
- **Panel de validación** — mala indentación, nombres no válidos, duplicados entre hermanos, rutas inseguras y estructuras vacías; haz clic en una advertencia para saltar a la línea
- **Deshacer / rehacer** con hasta 100 estados en el historial
- **Pestañas de múltiples proyectos** con indicadores de modificación, barra de pestañas desplazable y reordenación por arrastrar y soltar
- **Pestañas de editor de archivos por proyecto** — permite editar contenido inicial del archivo antes de construir y reordenar archivos abiertos arrastrando y soltando sin perder el enfoque activo
- **Sincronización con pestañas de archivos eliminados** — eliminar archivos o cambiar extensiones desde el editor de estructura ahora cierra toda pestaña de archivo obsoleta, selecciona la pestaña válida más cercana si es necesario y evita que el contenido eliminado reaparezca
- **Vista previa en vivo de Markdown** para archivos `.md` en el panel de previsualización de archivos
- **Carpetas plegables** en la vista previa del árbol
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter
- **Renombrado inteligente de archivos** al editar líneas del árbol
- **Indentación/bloque inteligente** con Tab y Shift+Tab, además de Backspace inteligente para bloques de indentación
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, previsualización de archivos) con disposición guardada entre sesiones

#### Iconos y tipos de archivos
- **Iconos Lucide** incluidos localmente (sin dependencia CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y medios
- **Más de 100 etiquetas de extensión de archivos** en el mapeo de tipos de archivo

#### Interfaz y experiencia de primer uso
- **Ventana personalizada sin bordes** con controles de minimizar, maximizar y cerrar
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida** en primer uso — diseño renovado con encabezado principal, tarjetas de ajustes agrupadas (General, Apariencia, Sesión) y botón fijo **Comenzar**
- **Modal de configuración** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal Acerca de** con versión de la aplicación en vivo (evolución de la pantalla de créditos v1)
- **Diálogo de cambios no guardados** al cerrar con proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y archivos comprimidos
- **Fuentes incluidas** — Inter y JetBrains Mono

#### Diagnóstico y reportes en GitHub enfocados en privacidad
- **Formulario de reporte estructurado** — recopila título del problema, descripción, pasos de reproducción y comportamiento esperado en campos localizados, que se expanden automáticamente y con contador de caracteres
- **Selector de etiquetas de repositorio** — carga las etiquetas actuales de GitHub con opción offline, las muestra en el desplegable personalizado de la app, añade la etiqueta seleccionada al prefijo del título y la preselecciona en el borrador de GitHub
- **Borrador limpio y localizado del reporte** — abre GitHub automáticamente después de una demora visible al redireccionar, con el título, secciones Markdown y etiqueta elegida ya rellenadas para revisión; haz clic en el aviso o presiona Enter/Espacio para ocultarlo sin cambiar el temporizador, y el reporte nunca se envía automáticamente
- **Registros de ejecución actual** — incluyen solo entradas de registro desde el último inicio de la app, separadas en secciones de proceso principal y renderer, limitadas a 256 KB y marcadas con hora local de 12 horas, periodo del día y zona horaria localizadas
- **Paquete de diagnóstico sanitizado** — elimina rutas locales, direcciones de email, IPs y secretos de URLs, y excluye nombres y contenidos de proyectos
- **Captura de pantalla interactiva** — tras optar explícitamente, oculta el formulario de reporte y captura una región seleccionada o la ventana completa; permite seguir capturando con `Shift+P` incluso cuando la barra flotante está colapsada y oculta instrucciones y controles al arrastrar para que no cubran el contenido seleccionado
- **Revisión de capturas antes de guardar** — permite hasta 10 capturas, abre vistas previas en miniatura a tamaño completo, elimina imágenes no deseadas y escribe cada PNG retenido en el ZIP local de diagnóstico; nunca se captura el escritorio ni otras ventanas
- **Adjuntos locales primero** — guarda el ZIP en la ruta elegida por el usuario sin abrir el explorador de archivos ni subirlo; registros y capturas permanecen locales hasta adjuntarlos manualmente
- **Modal de reporte más seguro** — seleccionar texto y arrastrar ya no cierra el diálogo, los campos se expanden automáticamente, el contraste sigue el tema general de la app y el formulario se reinicia después de éxito, Cancelar o cerrar con el botón X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en el primer uso** en el flujo de bienvenida y ajustes
- **Traducciones en el proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener sincronizados los archivos de idioma

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde `localStorage` legado
- **Guardado automático** de pestañas abiertas, contenido de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre empezar limpio

#### Auto-actualizador y notas de lanzamiento
- **Auto-actualizador en la app** — verifica lanzamientos en GitHub, descarga con progreso y reinicia para instalar
- **Canales de actualización estable y beta**
- **Notas de lanzamiento localizadas** en el modal de actualización (inglés, portugués y español)
- **Registro de actualizaciones legible** — diálogo más ancho, **Novedades** expandido por defecto, área de desplazamiento dedicada, jerarquía clara de encabezados y botones de acción fijos en el pie
- **Flujo manual de `docs/changelog.md`** — edita notas de lanzamiento en el repositorio; CI las traduce para la app y publica el inglés en GitHub
- **Notas de lanzamiento divididas** — el modal de actualización en la app muestra solo el texto del registro; los enlaces de navegación de idioma aparecen en `docs/changelog.md` y en la descripción del lanzamiento de GitHub (apuntando a archivos legibles en `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es solo de GitHub
- **Traducción por GitHub Models** — las notas de lanzamiento en portugués y español se generan en CI a través de la API `models.github.ai`

#### Atajos de teclado
- **Atajos totalmente configurables** con interfaz para capturarlos y acción para restaurar valores predeterminados
- Nuevos valores por defecto incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos de zoom del editor

#### Plataformas y distribución
- **Windows x64** — instalador NSIS y paquetes portátiles; instalador multilenguaje (inglés, portugués y español)
- **Lanzamientos en GitHub** publicados automáticamente al marcar versiones desde CI
- **Build de renderer antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que cada instalador incluya el bundle de interfaz

#### Arquitectura, herramientas de desarrollo y calidad
- **Build de renderer con Vite** y recarga de módulos en caliente en desarrollo
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos de CSS
- **ES modules**, Node.js 24+, Electron 42
- **Manejadores IPC divididos** para proyecto, actualizaciones y ciclo de vida de la app
- **API de `contextBridge` en preload** para una separación reforzada entre procesos
- **Pruebas con Vitest** con mocks de Electron para ejecuciones en CI; asistentes de registro de cambios y errores cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts npm
- **electron-reloader** para recarga en caliente del proceso principal durante desarrollo
- **Exportación de registro de errores** al producir un crash para facilitar depuración
- **`semver`** como dependencia directa para comparación de versiones confiable dentro de la app
