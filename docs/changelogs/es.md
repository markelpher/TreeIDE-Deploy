<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Novedades de la versión 2.0.106

Tree IDE v2 es una reescritura y ampliación completas de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Conserva la misma idea central —diseñar estructuras de carpetas en texto plano, previsualizarlas en tiempo real y generar proyectos—, ahora con una arquitectura nueva, herramientas más completas y versiones exclusivas para Windows.

### Novedades

#### Instalación, almacenamiento y protección del paquete
- **Opciones explícitas para conservar los datos** — al instalar manualmente sobre una versión existente de Tree IDE o desinstalarla, ahora se muestran claramente las opciones Conservar y Eliminar; Conservar está seleccionada de forma predeterminada
- **Instalador preparado para la primera instalación** — la elección sobre los datos se omite si no existe un perfil anterior de Tree IDE ni datos del actualizador, y no interrumpe las actualizaciones automáticas silenciosas
- **Flujo asistido de datos corregido** — las instalaciones manuales sobre una versión existente y las desinstalaciones ahora muestran las opciones Conservar/Eliminar; las actualizaciones silenciosas desde la aplicación omiten el aviso y conservan los datos
- **Pantalla de bienvenida acorde con la elección de datos** — la introducción aparece en un perfil nuevo o después de seleccionar Eliminar; si se selecciona Conservar, se mantiene el estado de introducción completada
- **Acción final correcta en el desinstalador** — el botón principal de la última página ahora dice Finalizar en vez de Siguiente en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación permanece organizado en `app.asar`, ahora con validación de integridad ASAR de Electron y carga restringida al archivo validado
- **Entorno de ejecución Windows x64 más ligero** — se eliminaron de la distribución las herramientas de empaquetado Squirrel que no se utilizaban y los binarios de 7-Zip destinados a otros sistemas y arquitecturas
- **Limpieza opcional completa** — la eliminación de datos incluye preferencias, caché, registros, sesión guardada, carpetas de perfil actuales y antiguas, y datos del actualizador

#### Build Studio y salida del proyecto
- **Build Studio** — proceso de creación a pantalla completa con previsualización del árbol en tiempo real, previsualización del contenido de cada archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear la estructura de carpetas en el disco, exportar solo un ZIP o exportar solo un archivo de proyecto `.tree`
- **Salidas combinadas** — permite exportar un ZIP junto con la creación de las carpetas e incluir el archivo `.tree` dentro del paquete comprimido
- **Botón de creación con ZIP adaptado al contenido** — al combinar carpetas y ZIP, la acción se denomina Crear archivo, Archivos, Carpeta, Carpetas, Archivo y carpeta o Archivos y carpetas, seguida de `+ ZIP`, según la estructura seleccionada
- **Inspección previa a la creación** — examina la carpeta de destino en busca de estructuras, archivos `.tree` o ZIP existentes antes de escribir los datos
- **Gestión de conflictos** — permite omitir o sobrescribir archivos y carpetas existentes
- **Contenido inicial predeterminado** para más de 68 tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y muchos más)
- **Marcadores de posición de i18n** en los archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos comprimidos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 identifica el formato `.tree` de primera generación utilizado por Tree IDE Legacy; los archivos UTF-8 originales sin cabecera siguen siendo compatibles tanto con tabulaciones como con `...` para la sangría
- **Exportación a ZIP** con protección opcional mediante contraseña AES-256 a través de 7-Zip
- **Proyectos `.tree` con cifrado robusto** — TREEIDE2 utiliza AES-256-GCM autenticado con Argon2id (256 MiB, 4 pasadas y 4 vías), autentica su cabecera criptográfica y mantiene compatible como generación 1 el formato original sin cabecera de Tree IDE Legacy
- **Protección explícita de archivos `.tree`** — una casilla específica habilita los campos de contraseña y confirmación, que de otro modo permanecen desactivados; además, explica que se aplicará el cifrado TREEIDE2 y solo muestra la advertencia de contraseña irrecuperable mientras la protección está seleccionada
- **Importación de archivos comprimidos** mediante el cuadro de diálogo o arrastrando y soltando: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitud de contraseña** para archivos ZIP y `.tree` cifrados
- **Cargar una carpeta como estructura** — examina un directorio existente y lo convierte en texto de árbol editable

#### Plantillas
- **19 plantillas iniciales integradas** agrupadas por categoría:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Pilas: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativas: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa, con pestañas para plantillas integradas y personalizadas, edición directa de la estructura y previsualización del árbol en tiempo real
- **Plantillas personalizadas** — crear una plantilla en blanco, importar el proyecto actual, cambiar el nombre, editar directamente el contenido de los archivos, abrirla en el editor principal, exportarla o eliminarla sin salir de la pantalla
- **Archivos `.tree-template`** — exportar e importar plantillas personalizadas que se pueden compartir (JSON `treeide-template` v1) mediante los cuadros de diálogo nativos para guardar y abrir, o desde la acción de exportación de cada fila de la lista personalizada
- **Pie de las plantillas personalizadas** — cuando existen plantillas personalizadas, muestra **Nueva plantilla**, **Desde el proyecto actual** e **Importar .tree-template**; cuando la lista está vacía, ofrece comenzar en blanco, importar un proyecto o importar un archivo
- **Previsualización por archivo** — al hacer clic en un archivo de la estructura se abre un panel de edición monoespaciado de ancho completo con el distintivo del tipo de archivo (el mismo diseño de panel único se utiliza en las plantillas integradas y personalizadas)
- **Búsqueda de plantillas** — filtra las plantillas integradas y personalizadas a medida que se escribe, sin distinguir entre mayúsculas, minúsculas ni acentos, y muestra un mensaje localizado cuando no hay resultados
- **Plantillas favoritas** — permite marcarlas con una estrella Lucide incluida localmente, consultarlas en una pestaña Favoritos específica y conservar la selección entre sesiones de la aplicación

#### Paleta de comandos y accesibilidad
- **Paleta de comandos ampliada** — utiliza `Ctrl+Shift+P` para buscar entre 23 acciones, incluidas Guardar todo, Deshacer, Rehacer, Nueva pestaña, pestaña de proyecto anterior/siguiente, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de, además de los comandos existentes de proyecto, creación, configuración, pantalla completa e informes
- **Comandos sensibles al contexto** — Guardar todo y las acciones de las pestañas de proyecto/archivo permanecen visibles para facilitar que se descubran, pero se desactivan cuando la sesión actual no puede ejecutarlas de forma segura
- **Flujo de comandos optimizado para el teclado** — las teclas de flecha cambian el comando activo, Intro lo ejecuta, Escape cierra la paleta y el foco vuelve al control anterior
- **Compatibilidad mejorada con lectores de pantalla** — nombres accesibles localizados, patrones semánticos de cuadro combinado, lista y pestaña, seguimiento del descendiente activo, recuentos de resultados en tiempo real y avisos de estado más claros en los comandos y las plantillas
- **Acciones de plantilla accesibles** — los controles para marcar como favorita, cambiar el nombre, editar, exportar y eliminar exponen etiquetas y estados localizados mediante `aria-pressed`, `aria-selected` y regiones dinámicas

#### Presencia enriquecida
- **RPC de Discord listo para usar** — Tree IDE incluye su identificador público de aplicación de Discord, se conecta automáticamente al cliente de escritorio en ejecución, informa del estado de la conexión, vuelve a intentarlo tras una desconexión y no requiere configuración por parte del usuario
- **Estados de actividad específicos** — Editando estructura, Editando código, Editando texto, Viendo archivo, Explorando plantillas, Personalizando plantilla, Configuración y los estados de creación Creando archivo, Creando archivos, Creando carpeta, Creando carpetas, Creando archivo y carpeta o Creando archivos y carpetas; la opción de Build Studio utiliza el mismo título y la misma descripción dinámicos, las salidas `.tree` siguen disponibles para proyectos planos válidos y las exportaciones usan el estado genérico Exportando archivo.
- **Estado inactivo vinculado al editor** — la Presencia comienza como Inactiva y solo muestra Editando estructura después de interactuar directamente con el editor de estructura; tras cinco minutos sin interacción, vuelve a Inactiva con un icono de teclado
- **Tres niveles de privacidad** — Básico solo muestra Tree IDE, Actividad añade la acción actual y Detallado también puede mostrar el nombre del proyecto y el tipo de archivo; nunca se comparten las rutas ni el contenido de los archivos
- **Presencia integrada con el estado de energía** — al bloquear o suspender el equipo se elimina la actividad; al desbloquearlo o reanudar la sesión se restaura automáticamente
- **Presencia localizada** — permite seguir el idioma de Tree IDE o elegir inglés, portugués o español de forma independiente; el ajuste actualiza el RPC de inmediato y se conserva entre sesiones
- **Alcance de la localización explicado** — Discord recibe una única actividad localizada, por lo que todos ven el idioma de Presencia seleccionado por quien la publica, en vez de una traducción basada en el idioma de Discord de cada persona

#### Editor, árbol y validación
- **Panel de validación** — detecta sangría incorrecta, nombres no válidos, elementos duplicados en el mismo nivel, rutas no seguras y estructuras vacías; al hacer clic en una advertencia se salta a la línea correspondiente
- **Deshacer y rehacer** con un historial de hasta 100 estados
- **Pestañas para varios proyectos** con indicadores de modificación, barra desplazable y reordenación mediante arrastrar y soltar
- **Pestañas de edición de archivos por proyecto** — permite editar el contenido inicial de los archivos antes de crearlos y reordenar los archivos abiertos mediante arrastrar y soltar sin cambiar la pestaña activa
- **Sincronización de pestañas de archivos eliminados** — al eliminar archivos o cambiar extensiones en el editor de estructura, ahora se cierran todas las pestañas obsoletas, se selecciona la pestaña válida más cercana cuando es necesario y se impide que vuelva a aparecer contenido eliminado
- **Previsualización de Markdown en tiempo real** para archivos `.md` en el panel de previsualización
- **Carpetas plegables** en la previsualización del árbol
- **Navegación del árbol con el teclado** — teclas de flecha, Inicio, Fin e Intro
- **Correspondencia inteligente al cambiar nombres de archivo** cuando se editan líneas del árbol
- **Aumentar o reducir la sangría de bloques** con Tab y Mayús+Tab, además de un Retroceso inteligente para bloques con sangría
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol y previsualización de archivos) cuyo diseño se conserva entre sesiones

#### Iconos y tipos de archivo
- **Iconos Lucide** incluidos localmente (sin depender de una CDN)
- **Iconos contextuales** para carpetas habituales, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y contenido multimedia
- **Más de 100 etiquetas de extensiones** en el mapa de tipos de archivo

#### Interfaz y experiencia del primer uso
- **Ventana personalizada sin marco** con controles para minimizar, maximizar y cerrar
- **Barra de menús** — Archivo, Editar, Ver, Ventana y Acerca de
- **Ventana de bienvenida** en el primer uso — diseño renovado con cabecera destacada, tarjetas de configuración agrupadas (General, Apariencia y Sesión) y botón **Comenzar** fijo
- **Ventana de configuración** con las pestañas General, Apariencia, Atajos y Actualizaciones
- **Ventana Acerca de** con la versión actual de la aplicación (evolución de la pantalla de créditos de la v1)
- **Cuadro de cambios sin guardar** al cerrar proyectos modificados
- **Capa para arrastrar y soltar** archivos `.tree` y archivos comprimidos
- **Fuentes incluidas** — Inter y JetBrains Mono

#### Diagnósticos centrados en la privacidad e informes de GitHub
- **Formulario de informe estructurado** — recopila el título y la descripción del problema, los pasos para reproducirlo y el comportamiento esperado en campos localizados que crecen automáticamente y muestran contadores de caracteres
- **Selector de etiquetas del repositorio** — carga las etiquetas actuales de GitHub con una alternativa para trabajar sin conexión, las muestra en el menú desplegable personalizado de la aplicación, añade la etiqueta seleccionada al prefijo del título y la preselecciona en el borrador de GitHub
- **Borrador de incidencia localizado y ordenado** — abre GitHub automáticamente tras un aviso visible de redirección, con el título, las secciones en Markdown y la etiqueta seleccionada ya rellenados para su revisión; hacer clic en el aviso o pulsar Intro/Espacio lo oculta sin modificar el temporizador, y la incidencia nunca se envía automáticamente
- **Registros de la ejecución actual** — incluye únicamente las entradas de registro del último inicio de la aplicación, separadas en secciones del proceso principal y del renderizador, limitadas a 256 KB y marcadas con hora localizada en formato de 12 horas, período del día y zona horaria
- **Paquete de diagnóstico protegido** — oculta rutas locales, direcciones de correo electrónico, direcciones IP y datos confidenciales de las URL, sin incluir nombres ni contenido de los proyectos
- **Captura de pantalla opcional de Tree IDE** — captura únicamente la ventana actual de la aplicación después de que el usuario lo autorice expresamente, nunca el escritorio ni otras ventanas
- **Archivos adjuntos conservados localmente** — guarda el ZIP en la ruta elegida por el usuario sin abrir el Explorador de archivos ni subirlo; los registros y las capturas permanecen en el equipo hasta que se adjuntan manualmente
- **Ventana de informe más segura** — seleccionar o arrastrar texto ya no cierra el cuadro, los campos cambian de tamaño automáticamente, el contraste de los temas claro y oscuro coincide con el resto de la aplicación y el formulario se restablece tras completarlo, al pulsar Cancelar o al cerrarlo con el botón X

#### Internacionalización
- **Traducción de la interfaz al inglés, portugués (pt-BR) y español**
- **Selección de idioma durante el primer uso** en la pantalla de bienvenida y en la configuración
- **Traducciones del proceso principal** para cuadros de diálogo nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener sincronizados los archivos de idiomas

#### Persistencia de la sesión
- **Almacenamiento de la sesión en IndexedDB** con migración automática desde el `localStorage` antiguo
- **Guardado automático** de pestañas abiertas, contenido de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o empezar siempre sin datos anteriores

#### Actualizador automático y notas de la versión
- **Actualizador automático integrado** — comprueba los lanzamientos de GitHub, muestra el progreso de la descarga y reinicia la aplicación para instalar la actualización
- **Canales de actualización estable y beta**
- **Notas de la versión localizadas** en la ventana de actualización (inglés, portugués y español)
- **Registro de cambios legible** — cuadro más ancho, sección **Novedades** desplegada de forma predeterminada, área de desplazamiento específica, jerarquía de encabezados más clara y botones de acción fijos en el pie
- **Flujo manual mediante `docs/changelog.md`** — las notas de la versión se editan en el repositorio; la integración continua las traduce para la aplicación y publica la versión inglesa en GitHub
- **Notas de la versión separadas** — la ventana de actualización de la aplicación muestra solo el texto del registro de cambios; los enlaces a otros idiomas aparecen en `docs/changelog.md` y en la descripción del lanzamiento en GitHub (y apuntan a los archivos legibles de `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es exclusivo de GitHub
- **Traducción mediante GitHub Models** — las notas de la versión en portugués y español se generan en la integración continua a través de la API `models.github.ai`

#### Atajos de teclado
- **Atajos totalmente configurables** con una interfaz de captura y una acción para restaurar los valores predeterminados
- Los nuevos valores predeterminados incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (crear), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y los atajos de zoom del editor

#### Plataformas y distribución
- **Windows x64** — paquetes del instalador NSIS y de la versión portátil; instalador multilingüe (inglés, portugués y español)
- **Lanzamientos de GitHub** publicados automáticamente por la integración continua al crear etiquetas de versión
- **Compilación del renderizador antes del empaquetado** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para garantizar que todos los instaladores incluyan el paquete de la interfaz

#### Arquitectura, herramientas de desarrollo y calidad
- **Compilación del renderizador con Vite** y sustitución de módulos en tiempo real durante el desarrollo
- **Código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos CSS
- **Módulos ES**, Node.js 24+ y Electron 42
- **Controladores IPC separados** para proyectos, actualizaciones y ciclo de vida de la aplicación
- **API de precarga `contextBridge`** para reforzar el aislamiento del renderizador
- **Conjunto de pruebas Vitest** con simulaciones de Electron adecuadas para la integración continua; las funciones auxiliares de errores del registro de cambios y del actualizador cuentan con pruebas específicas
- **ESLint y Prettier** integrados en los scripts de npm
- **electron-reloader** para recargar automáticamente el proceso principal durante el desarrollo
- **Exportación del registro de errores** en caso de fallo para facilitar el diagnóstico
- **`semver`** como dependencia directa para comparar versiones de manera fiable dentro de la aplicación
