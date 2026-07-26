<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Qué hay de nuevo en v2.0.110

Tree IDE v2 es una reescritura completa y expansión de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). El mismo concepto principal — diseñar estructuras de carpetas en texto plano, previsualizarlas en tiempo real y generar proyectos — con una nueva arquitectura, herramientas más completas y versiones exclusivas para Windows.

### Agregado

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas de retención de datos** — al instalar manualmente sobre una versión existente de Tree IDE y al desinstalar, ahora se presentan las opciones claras de Conservar o Eliminar, con Conservar seleccionado por defecto
- **Instalador consciente de primera instalación** — la opción de datos se omite cuando no existe un perfil previo ni datos del actualizador de Tree IDE y no interrumpe las actualizaciones automáticas silenciosas
- **Flujo correcto de datos asistido** — las instalaciones manuales sobre una versión existente y la desinstalación ahora muestran las opciones Conservar/Eliminar; las actualizaciones silenciosas desde la app omiten el aviso y preservan los datos
- **Bienvenida según la elección de datos** — el onboarding aparece para un perfil nuevo o tras elegir Eliminar, mientras seleccionar Conservar mantiene el estado completo del onboarding
- **Acción correcta al finalizar el desinstalador** — la última página ahora denomina su botón principal como Finalizar en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación permanece organizado en `app.asar`, ahora con validación de integridad Electron ASAR y carga restringida al archivo validado
- **Runtime optimizado para Windows x64** — se eliminó la cadena de herramientas Squirrel sin uso y los binarios de 7-Zip para sistemas que no sean Windows/no-x64 de los archivos de distribución
- **Limpieza completa opcional** — eliminar datos abarca preferencias, caché, registros, sesión guardada, carpetas de perfil actual y legado, y datos del actualizador

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de construcción a pantalla completa con previsualización del árbol en vivo, vista previa de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear la estructura de carpetas en disco, exportar solo un ZIP, o exportar únicamente un archivo de proyecto `.tree`
- **Salidas combinadas** — opcionalmente exportar un ZIP junto a una compilación de carpetas y añadir el archivo `.tree` dentro del archivo comprimido
- **Botón de crear con ZIP según contenido** — las compilaciones combinadas de carpeta y ZIP ahora muestran la acción como Crear Archivo, Archivos, Carpeta, Carpetas, Archivo y Carpeta, o Archivos y Carpetas seguidos de `+ ZIP`, según la estructura seleccionada
- **Inspección previa a la compilación** — escanear la carpeta destino para detectar estructura existente, archivos `.tree` o ZIP antes de escribir
- **Gestión de conflictos** — elegir entre omitir o sobrescribir cuando ya existen archivos o carpetas
- **Contenido inicial por defecto** para más de 68 tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Marcadores de internacionalización** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos comprimidos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 identifica el formato de archivo `.tree` de primera generación usado por Tree IDE Legacy; los archivos UTF-8 originales sin encabezado siguen siendo legibles tanto con tabulación como con estilo de sangría `...`
- **Exportación ZIP** con protección opcional por contraseña AES-256 mediante 7-Zip
- **Proyectos `.tree` cifrados de alta seguridad** — TREEIDE2 utiliza AES-256-GCM autenticado con Argon2id (256 MiB, 4 pasadas, 4 canales), autentica su encabezado criptográfico y mantiene el formato original sin encabezado de Tree IDE Legacy como generación 1 legible
- **Protección explícita de `.tree`** — una casilla dedicada habilita los campos de contraseña y confirmación, explica que se aplicará el cifrado TREEIDE2 y muestra la advertencia de contraseña irrecuperable solo cuando se selecciona la protección
- **Importación de archivos comprimidos** mediante diálogo de archivos o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` protegidos
- **Cargar carpeta como estructura** — escanear un directorio existente y convertirlo en texto editable de árbol

#### Plantillas
- **19 plantillas iniciales integradas** agrupadas por categoría:
  - Frontend: HTML, HTML y CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa con pestañas integradas y personalizadas, edición de estructura en línea y previsualización de árbol en vivo
- **Plantillas personalizadas** — crear desde cero, importar desde el proyecto actual, renombrar, editar el contenido de archivos en línea, abrir en el editor principal, exportar o eliminar sin salir de la pantalla
- **Archivos `.tree-template`** — exportar e importar plantillas personalizables compartibles (`treeide-template` v1 en JSON) mediante diálogos nativos de guardar/abrir o exportación por fila en la lista de personalizadas
- **Pie de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Desde proyecto actual** y **Importar .tree-template**; el estado vacío ofrece inicio en blanco, importación de proyecto y de archivo
- **Vista previa por archivo** — al hacer clic en un archivo en la previsualización de estructura se abre un panel de edición monoespaciado de ancho completo con insignia de tipo de archivo (mismo diseño para plantillas integradas y personalizadas)
- **Búsqueda de plantillas** — filtrar plantillas integradas y personalizadas mientras escribes, con coincidencia insensible a mayúsculas y acentos y retroalimentación localizada para resultados vacíos
- **Favoritos de plantillas** — marcar plantillas con una estrella Lucide incluida localmente, navegarlas en una pestaña dedicada de Favoritos y mantener la selección a través de las sesiones de la app

#### Paleta de comandos y accesibilidad
- **Paleta de comandos expandida** — usa `Ctrl+Shift+P` para buscar entre 23 acciones, incluyendo Guardar todo, Deshacer, Rehacer, Nueva pestaña, siguiente/anterior pestaña de proyecto, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Sobre, además de los comandos existentes de proyecto, construcción, configuración, pantalla completa y reporte
- **Comandos sensibles al contexto** — Guardar todo y las acciones de pestañas de proyecto/archivo permanecen visibles para facilitar su descubrimiento pero se desactivan cuando la sesión actual no puede ejecutarlas de manera segura
- **Flujo de comandos orientado al teclado** — Flechas cambian el comando activo, Enter ejecuta, Escape cierra la paleta y el foco regresa al control anterior
- **Mejor soporte para lectores de pantalla** — nombres accesibles localizados, patrones semánticos de combobox/listbox/pestaña, seguimiento de descendientes activos, conteo en vivo de resultados y anuncios de estado más claros en comandos y plantillas
- **Acciones accesibles en plantillas** — controles de favorito, renombrar, editar, exportar y eliminar exponen etiquetas localizadas y estado mediante `aria-pressed`, `aria-selected` y regiones en vivo

#### Rich Presence
- **Privacidad por defecto** — Discord Rich Presence ahora comienza deshabilitado y su barra de estado, idioma y controles de privacidad permanecen ocultos hasta que el usuario habilita la integración explícitamente
- **Discord RPC listo para usar** — Tree IDE incluye su ID de aplicación pública de Discord, conecta automáticamente con el cliente de escritorio en ejecución, informa sobre el estado de la conexión, reintenta tras desconexiones y no requiere configuración por parte del usuario
- **Estados de actividad específicos** — Editing Structure, Editing Code, Editing Text, Viewing File, Browsing Templates, Customizing Template, Settings y estados de construcción como Creating File, Creating Files, Creating Folder, Creating Folders, Creating File and Folder o Creating Files and Folders; la opción Build Studio utiliza el mismo título y descripción dinámicos, mientras que las salidas `.tree` permanecen disponibles para proyectos planos válidos y las exportaciones usan un estado genérico Exporting File.
- **Estado inactivo según el editor** — Presence inicia como Inactivo y solo reporta Editing Structure tras interacción directa con el editor de estructura; cinco minutos sin interacción regresan a Inactivo con un ícono de teclado
- **Tres niveles de privacidad** — Básico solo muestra Tree IDE, Actividad añade la acción actual y Detallado puede mostrar el nombre del proyecto y tipo de archivo; nunca se comparten rutas ni contenidos de archivos
- **Presence consciente de energía** — bloqueos y suspensión limpian la actividad, mientras que desbloqueos y reinicio la restauran automáticamente
- **Presence localizado** — sigue el idioma de Tree IDE o puedes seleccionar inglés, portugués o español de forma independiente; la configuración actualiza el RPC de inmediato y persiste entre sesiones
- **Explicación del alcance de la localización** — Discord recibe una única carga de actividad localizada, así cada espectador ve el idioma seleccionado por el publicador para Presence en lugar de una traducción basada en la configuración de idioma de Discord del espectador

#### Editor, árbol y validación
- **Panel de validación** — mala sangría, nombres inválidos, duplicados entre hermanos, rutas inseguras y estructuras vacías; haz clic en una advertencia para saltar a la línea
- **Deshacer / rehacer** con hasta 100 estados de historial
- **Pestañas multi-proyecto** con indicadores de modificado, barra de pestañas desplazable y reorganización por arrastrar y soltar
- **Editor por pestañas de archivos en cada proyecto** — edita contenidos iniciales antes de construir y reordena archivos abiertos con arrastrar y soltar conservando la pestaña activa
- **Sincronización de pestaña de archivo eliminado** — al eliminar archivos o cambiar extensiones en el editor de estructura se cierran todas las pestañas de archivo obsoletas, se selecciona la pestaña válida más cercana cuando es necesario y se evita que reaparezca contenido eliminado
- **Vista previa de Markdown en vivo** para archivos `.md` en el panel de vista previa de archivos
- **Carpetas colapsables** en la previsualización del árbol
- **Navegación del árbol por teclado** — Flechas, Inicio, Fin y Enter
- **Coincidencia inteligente en renombrar archivos** al editar líneas del árbol
- **Sangría/bloque inteligente** con Tab y Shift+Tab, además de retroceso inteligente para bloques de sangría
- **Zoom en editor** — `Ctrl++`, `Ctrl+-`, y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivo) con disposición persistente entre sesiones

#### Iconos y tipos de archivo
- **Iconos Lucide** incluidos localmente (sin dependencia de CDN)
- **Íconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y multimedia
- **Más de 100 etiquetas de extensión de archivo** en el mapa de tipos de archivo

#### UI y experiencia inicial
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Sobre
- **Modal de bienvenida** al primer uso — diseño renovado con encabezado destacado, cartas de configuración agrupadas (General, Apariencia, Sesión) y botón de **Comenzar** anclado
- **Modal de configuración** con pestañas: General, Apariencia, Accesos directos y Actualizaciones
- **Modal sobre** con versión de la app en vivo (evolución de la pantalla de créditos v1)
- **Diálogo de cambios no guardados** al cerrar con proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y comprimidos
- **Fuentes incluidas** — Inter y JetBrains Mono

#### Diagnóstico orientado a privacidad y reportes en GitHub
- **Formulario de reporte estructurado** — recoge título del problema, descripción, pasos de reproducción y comportamiento esperado en campos localizados, auto-extensibles y con contadores de caracteres
- **Selector de etiqueta del repositorio** — carga etiquetas actuales de GitHub con modo offline alternativo, las muestra en el menú desplegable personalizado de la app, añade la etiqueta seleccionada al prefijo del título y la preselecciona en el borrador de GitHub
- **Borrador de informe localizado y limpio** — abre GitHub automáticamente tras un breve retraso visible de redirección con título, secciones Markdown y etiqueta seleccionada ya completadas para revisión; haz clic en el aviso o presiona Enter/Espacio para ocultar el aviso sin modificar el temporizador, y el informe nunca se envía automáticamente
- **Registros de ejecución actual** — incluye solo entradas desde el último inicio de la app, separadas en secciones de proceso principal y renderer, limitadas a 256 KB y con sello de tiempo con hora localizada en formato de 12 horas, periodo del día y zona horaria
- **Paquete diagnóstico sanitizado** — se eliminan rutas locales, correos electrónicos, direcciones IP y secretos de URL, excluyendo nombres y contenidos de proyectos
- **Capturas de pantalla interactivas** — tras consentimiento explícito, oculta el formulario de reporte y captura una región seleccionada o la ventana completa, permite seguir capturando con `Shift+P` aun cuando la barra flotante está colapsada y oculta automáticamente instrucciones y controles durante el arrastre para evitar que cubran el contenido seleccionado
- **Revisión de capturas antes de guardar** — permite reunir hasta 10 capturas, abrir vistas previas de tamaño completo, eliminar imágenes no deseadas y guardar cada PNG retenido al ZIP diagnóstico local; nunca se capturan escritorio ni otras ventanas
- **Adjuntos locales primero** — guarda el ZIP en la ubicación elegida sin abrir el explorador de archivos ni hacer subidas; registros y capturas permanecen locales hasta que se adjunten manualmente
- **Modal de reportes más segura** — seleccionar texto y arrastrar ya no cierra el diálogo, los campos se redimensionan automáticamente, el contraste en tema claro/oscuro sigue el resto de la app y el formulario se reinicia tras éxito, Cancelar o cierre mediante el botón X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en la primera ejecución** en el flujo de bienvenida y en la configuración
- **Traducciones en proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener los archivos de idioma sincronizados

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde `localStorage` legado
- **Autoguardado** de pestañas abiertas, contenidos de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre comenzar limpio

#### Actualizador automático y notas de versión
- **Actualizador automático en la app** — verifica GitHub Releases, descarga con progreso y reinicia para instalar
- **Canales de actualización estable y beta**
- **Notas de versión localizadas** en el modal de actualización (inglés, portugués y español)
- **Registro de cambios legible** — diálogo más amplio, **Novedades** expandido por defecto, área de desplazamiento dedicada, jerarquía de encabezados más clara y botones de acción anclados en el pie
- **Flujo manual `docs/changelog.md`** — editar notas de versión en el repositorio; CI las traduce para la app y publica la versión en inglés en GitHub
- **Notas de versión divididas** — el modal de actualización de la app muestra solo el registro de cambios; los enlaces de navegación de idiomas aparecen en `docs/changelog.md` y en la descripción del release en GitHub (apuntando a archivos legibles en `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es solo para GitHub
- **Traducción por GitHub Models** — las notas de versión en portugués y español se generan en CI a través de la API `models.github.ai`

#### Accesos directos de teclado
- **Accesos directos totalmente configurables** con interfaz de captura y acción para restaurar valores predeterminados
- Nuevos accesos predeterminados incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (compilar), `Ctrl+Z`/`Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab`/`Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y accesos para zoom de editor

#### Plataformas y distribución
- **Windows x64** — instalador NSIS y paquetes portables; instalador multilenguaje (inglés, portugués y español)
- **GitHub Releases** publicados automáticamente con etiquetas de versión desde CI
- **Compilación del renderer previa al empaquetado** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` así cada instalador incluye el paquete UI

#### Arquitectura, herramientas para desarrollo y calidad
- **Compilación de renderer con Vite** y recarga de módulos en caliente en desarrollo
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manejadores IPC divididos** para proyectos, actualizaciones y ciclo de vida de la app
- **API de preload `contextBridge`** para un límite reforzado en el renderer
- **Suite de pruebas con Vitest** y mocks de Electron para ejecuciones amigables con CI; helpers de registro de cambios y errores de actualización cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts npm
- **electron-reloader** para recarga en caliente del proceso principal durante el desarrollo
- **Exportación de registros de errores** tras fallos para facilitar la depuración
- **`semver`** como dependencia directa para comparación confiable de versiones en la app
