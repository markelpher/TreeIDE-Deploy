<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Qué hay de nuevo en v2.0.112

Tree IDE v2 es una reescritura completa y expansión de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). La idea central se mantiene: diseña estructuras de carpetas en texto plano, prévisualízalas en tiempo real y genera proyectos, ahora con una arquitectura renovada, herramientas más completas y lanzamientos exclusivos para Windows.

### Añadido

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas para conservación de datos** — al instalar manualmente sobre una versión existente de Tree IDE o desinstalar ahora aparecen claras las opciones Conservar o Eliminar, con Conservar seleccionada por defecto
- **Instalación reconoce primera vez** — la opción de datos se omite si no existen perfiles anteriores de Tree IDE ni datos del actualizador, y no interrumpe las actualizaciones automáticas silenciosas
- **Flujo de datos asistido corregido** — las instalaciones manuales sobre una versión existente y la desinstalación ahora muestran las opciones Conservar/Eliminar; las actualizaciones silenciosas dentro de la app omiten el mensaje y conservan los datos
- **Bienvenida sigue la elección de datos** — la introducción se muestra para un perfil nuevo o tras elegir Eliminar, mientras que seleccionar Conservar preserva el estado de bienvenida completada
- **Acción correcta al finalizar el desinstalador** — la última página ahora etiqueta su botón principal como Finalizar en vez de Siguiente en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación se mantiene organizado en `app.asar`, ahora con validación de integridad Electron ASAR y carga restringida solo al archivo validado
- **Ejecución ligera en Windows x64** — se eliminaron la cadena de herramientas de empaquetado Squirrel no utilizada y los binarios de 7-Zip no correspondientes a Windows/x64 de los archivos distribuidos
- **Limpieza opcional completa** — al eliminar datos se cubren preferencias, caché, registros, sesión guardada, carpetas de perfil actual y legado, y datos del actualizador

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de compilación a pantalla completa con vista previa dinámica del árbol, previsualización de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear la estructura de carpetas en disco, exportar solo un ZIP o exportar solo un archivo de proyecto `.tree`
- **Salidas combinadas** — opcionalmente exporta un ZIP junto con la creación de carpetas, e incluye el archivo `.tree` dentro del archivo ZIP
- **Botón para crear con ZIP según el contenido** — la acción para carpetas+ZIP ahora se etiqueta como Crear Archivo, Archivos, Carpeta, Carpetas, Archivo y Carpeta, o Archivos y Carpetas seguidos de `+ ZIP`, según la estructura seleccionada
- **Inspección previa a la compilación** — escanea la carpeta destino para detectar estructura existente, archivos `.tree` o ZIP antes de escribir
- **Gestión de conflictos** — permite elegir entre omitir o sobrescribir cuando ya existen archivos o carpetas
- **Contenido inicial predeterminado** para más de 68 tipos de archivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Marcadores de i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos comprimidos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 identifica el formato de archivos `.tree` de primera generación usado por Tree IDE Legacy; los archivos originales en UTF-8 sin encabezados siguen siendo legibles con tabulaciones y el estilo de sangría `...`
- **Exportación ZIP** con protección opcional por contraseña AES-256 a través de 7-Zip
- **Proyectos `.tree` cifrados de alta seguridad** — TREEIDE2 emplea AES-256-GCM autenticado con Argon2id (256 MiB, 4 pasadas, 4 canales), autentica su encabezado criptográfico y permite leer el formato original sin encabezado de Tree IDE Legacy como generación 1
- **Protección explícita de archivos `.tree`** — una casilla específica activa los campos de contraseña y confirmación (inicialmente deshabilitados), explica que se aplicará el cifrado TREEIDE2 y muestra la advertencia de contraseña irrecuperable solo mientras se selecciona la protección
- **Importación de archivos comprimidos** mediante diálogo de archivos o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitudes de contraseña** para archivos ZIP y archivos `.tree` cifrados
- **Cargar carpeta como estructura** — analiza un directorio existente y lo convierte en texto de árbol editable

#### Plantillas
- **19 plantillas iniciales integradas** agrupadas por categoría:
  - Frontend: HTML, HTML y CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de pantalla completa con tres columnas, pestañas para plantillas integradas y personalizadas, edición de estructura en línea y vista previa en vivo del árbol
- **Plantillas personalizadas** — crear en blanco, importar desde el proyecto actual, renombrar, editar contenidos por archivo en línea, abrir en el editor principal, exportar o eliminar sin salir de la pantalla
- **Archivos `.tree-template`** — exportar e importar plantillas personalizadas compartibles (JSON `treeide-template` v1) mediante diálogos nativos de guardar/abrir o exportación por fila en la lista personalizada
- **Pie de plantillas personalizadas** — si existen plantillas personalizadas: **Nueva plantilla**, **Desde proyecto actual** e **Importar .tree-template**; estado vacío ofrece comenzar en blanco, importar de proyecto e importar archivo
- **Vista previa por archivo** — al hacer clic en un archivo de la estructura aparece un panel de edición mono-espacio a ancho completo con distintivo de tipo de archivo (misma disposición de panel único para integradas y personalizadas)
- **Búsqueda de plantillas** — filtra plantillas integradas y personalizadas en tiempo real, sin distinguir mayúsculas/minúsculas ni tildes, y muestra comentarios localizados cuando no haya resultados
- **Favoritos de plantillas** — marca plantillas con una estrella Lucide incluida, navega en una pestaña de Favoritos dedicada y mantiene la selección entre sesiones de la app

#### Paleta de comandos y accesibilidad
- **Paleta de comandos ampliada** — usa `Ctrl+Shift+P` para buscar entre 23 acciones, agregando Guardar todo, Deshacer, Rehacer, Nueva pestaña, siguiente/anterior pestaña de proyecto, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de a los comandos ya existentes de proyecto, compilación, configuración, pantalla completa y reportes
- **Comandos contextuales** — Guardar todo y las acciones de pestañas de proyecto/archivo permanecen visibles para descubribilidad, pero están deshabilitadas cuando la sesión actual no puede ejecutarlas de forma segura
- **Flujo de comandos orientado al teclado** — flechas para cambiar de comando activo, Enter para ejecutar, Escape para cerrar la paleta y el enfoque regresa al control previo
- **Mejor soporte para lectores de pantalla** — nombres accesibles localizados, patrones semánticos combobox/listbox/tabs, seguimiento de elemento activo, conteo de resultados en vivo y avisos de estado más claros para comandos y plantillas
- **Acciones de plantilla accesibles** — controles para favorito, renombrar, editar, exportar y eliminar exponen etiquetas y estados localizados mediante `aria-pressed`, `aria-selected` y regiones en vivo

#### Rich Presence
- **Privacidad por defecto** — Discord Rich Presence ahora inicia desactivado, y su barra de estado, idioma y controles de privacidad no están disponibles hasta que el usuario habilita explícitamente la integración
- **RPC de Discord listo para usar** — Tree IDE incluye su ID de aplicación pública de Discord, se conecta automáticamente con el cliente de escritorio, informa el estado de la conexión, reintenta tras desconexiones y no requiere configuración por parte del usuario
- **Estados de actividad específicos** — Editando estructura, Editando código, Editando texto, Viendo archivo, Explorando plantillas, Personalizando plantilla, Configuración y, consciente de compilación, Creando archivo, Creando archivos, Creando carpeta, Creando carpetas, Creando archivo y carpeta, o Creando archivos y carpetas; la opción Build Studio usa el mismo título y descripción dinámicos, mientras que las salidas `.tree` están disponibles para proyectos planos válidos y las exportaciones usan un estado genérico Exportando archivo.
- **Estado inactivo sensible al editor** — la presencia empieza como Inactivo y solo informa Editando estructura tras interactuar directamente con el editor; cinco minutos de inactividad devuelven a Inactivo con un ícono de teclado
- **Tres niveles de privacidad** — Básico solo muestra Tree IDE, Actividad añade la acción actual, y Detallado puede mostrar también el nombre del proyecto y tipo de archivo; nunca se comparten rutas ni contenidos de archivos
- **Presence consciente de energía** — al bloquear o suspender se borra la actividad, al desbloquear o reanudar se restaura automáticamente
- **Presence localizada** — sigue el idioma de Tree IDE o permite elegir inglés, portugués o español de forma independiente; la configuración actualiza el RPC de inmediato y persiste entre sesiones
- **Explicación sobre el alcance de localización** — Discord recibe una sola cadena de actividad localizada, por lo que todos ven el idioma escogido por el usuario emisor en Presence, sin traducir dinámicamente al idioma de Discord del espectador

#### Editor, árbol y validación
- **Panel de validación** — identifica sangrías incorrectas, nombres inválidos, hermanos duplicados, rutas inseguras y estructuras vacías; haz clic en una advertencia para saltar a la línea
- **Deshacer/Rehacer** con hasta 100 estados de historial
- **Pestañas multiproyecto** con indicadores de cambio, barra desplazable y reordenamiento por arrastrar y soltar
- **Pestañas de archivos por proyecto** — edita contenidos iniciales antes de compilar y reordena archivos abiertos con arrastrar y soltar sin perder el enfoque de la pestaña activa
- **Sincronización de pestañas de archivos eliminados** — al eliminar un archivo o cambiar su extensión desde el editor de estructuras ahora se cierran todos los archivos antiguos, seleccionando la pestaña válida más cercana si es necesario y evitando que el contenido eliminado reaparezca
- **Vista previa dinámica de Markdown** en archivos `.md` en el panel de previsualización
- **Carpetas colapsables** en la vista previa del árbol
- **Navegación de árbol por teclado** — flechas, Inicio, Fin y Enter
- **Renombrado inteligente de archivos** al editar líneas del árbol
- **Sangría/desangría por bloques** con Tab y Shift+Tab, más Backspace inteligente para bloques de sangría
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivo) con disposición persistente entre sesiones

#### Iconos y tipos de archivo
- **Iconos Lucide** incluidos localmente (sin dependencia de CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y multimedia
- **Más de 100 etiquetas de extensión** en el mapeo de tipos de archivo

#### Interfaz y experiencia inicial
- **Ventana personalizada sin marco** con controles para minimizar, maximizar y cerrar
- **Inicio limpio en la primera ejecución** — la app permanece oculta hasta que termina de pintar la interfaz restaurada; la información de lanzamiento se carga en segundo plano para evitar mostrar una pantalla congelada al inicio
- **Barra de menús** — Archivo, Edición, Vista, Ventana y Acerca de
- **Modal de bienvenida** al primer inicio — diseño renovado con cabecera destacada, tarjetas agrupadas de configuración (General, Apariencia, Sesión) y botón anclado **Empezar**
- **Modal de configuración** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal de información** con versión activa en vivo (evolución de la pantalla de créditos de la v1)
- **Diálogo por cambios sin guardar** al cerrar con proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y archivos comprimidos
- **Fuentes incluidas** — Inter y JetBrains Mono

#### Diagnóstico privado y reportes en GitHub
- **Formulario estructurado de reportes** — recoge título, descripción del problema, pasos para reproducir y comportamiento esperado en campos localizados, expansibles automáticamente y con contador de caracteres
- **Selector de etiquetas del repositorio** — carga las etiquetas actuales de GitHub con opción offline, las muestra en un menú propio, añade la etiqueta seleccionada al prefijo del título y la preselecciona en el borrador de GitHub
- **Borrador de reporte limpio y localizado** — abre GitHub automáticamente tras una visible demora, con título, secciones en Markdown y etiqueta ya listos para revisión; clic en el aviso o presionar Enter/Espacio oculta el mensaje sin modificar el temporizador, y nunca se envía automáticamente
- **Registros de ejecución actual** — solo incluye entradas desde el último inicio, separadas en secciones de proceso principal y de render, máxima de 256 KB, y sellados con hora, periodo del día y zona horaria localizados en formato de 12 horas
- **Paquete diagnóstico anonimizado** — oculta rutas locales, correos electrónicos, direcciones IP y claves de URLs sin incluir nombres ni contenidos de proyectos
- **Capturas de pantalla interactivas** — tras consentimiento explícito, oculta el formulario y permite capturar una región o la ventana completa, seguir tomando capturas con `Shift+P` incluso con la barra flotante colapsada y ocultar automáticamente instrucciones y controles durante la selección para que no cubran el contenido elegido
- **Revisión de capturas antes de guardar** — permite hasta 10 capturas, abrir vistas previas tamaño completo, eliminar imágenes no deseadas y guardar cada PNG retenido en el ZIP de diagnóstico local; nunca se capturan el escritorio ni otras ventanas
- **Adjuntos locales por defecto** — guarda el ZIP en el destino elegido por el usuario sin abrir el Explorador ni subirlo; los registros y capturas se mantienen locales hasta adjuntarlos manualmente
- **Modal de reporte más seguro** — seleccionar texto o arrastrar ya no cierra el diálogo, los campos se redimensionan automáticamente, el contraste de tema claro/oscuro respeta la app, y el formulario se reinicia tras éxito, Cancelar o cerrar con la X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma al primer inicio** en la bienvenida y en configuración
- **Traducciones en el proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener archivos de idioma sincronizados

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde `localStorage` heredado
- **Guardado automático** de pestañas abiertas, contenidos de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre empezar en blanco

#### Auto-actualizador y notas de versión
- **Auto-actualizador integrado en la app** — revisa lanzamientos en GitHub, descarga con progreso y reinicia para instalar
- **Canales de actualización estables y beta**
- **Notas de versión localizadas** en el modal de actualización (inglés, portugués y español)
- **Changelog de actualización legible** — diálogo más ancho, **Qué hay de nuevo** expandido por defecto, zona de desplazamiento dedicada, jerarquía de títulos clara y botones de acción anclados en el pie
- **Flujo manual `docs/changelog.md`** — edita notas de versión en el repositorio; CI las traduce para la app y publica el inglés en GitHub
- **Notas de versión divididas** — el modal de actualización muestra solo el texto del changelog; los enlaces de navegación aparecen en `docs/changelog.md` y en la descripción del lanzamiento de GitHub (a archivos legibles en `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es solo de GitHub
- **Traducción con GitHub Models** — las notas de versión en portugués y español se generan en CI mediante la API `models.github.ai`

#### Atajos de teclado
- **Atajos completamente configurables** con interfaz para captura y acción de restaurar por defecto
- Nuevos atajos incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (compilar), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos para zoom del editor

#### Plataformas y distribución
- **Windows x64** — paquetes instalador NSIS y portátiles; instalador multilingüe (inglés, portugués y español)
- **Publicación automática en GitHub Releases** con cada etiqueta de versión desde CI
- **Compilación del renderer antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que todo instalador distribuido incluya el paquete de UI

#### Arquitectura, herramientas de desarrollo y calidad
- **Renderer con Vite** y recarga modular en desarrollo
- **Código modularizado** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos CSS
- **Módulos ES**, Node.js 24+ y Electron 42
- **Manejadores de IPC separados** para proyecto, actualizaciones y ciclo de vida de la app
- **API `contextBridge` en preload** para frontera reforzada del renderer
- **Suite de pruebas con Vitest** usando mocks de Electron, apta para CI; helpers de changelog y errores del actualizador cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts de npm
- **electron-reloader** para recarga activa del main en desarrollo
- **Exportación de registros de error** en caso de fallo, para facilitar la depuración
- **`semver`** como dependencia directa para comparación confiable de versiones en la app
