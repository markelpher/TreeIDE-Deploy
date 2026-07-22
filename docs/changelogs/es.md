<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Qué hay de nuevo en v2.0.107

Tree IDE v2 es una reescritura completa y una expansión de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Mantiene la idea central: diseñar estructuras de carpetas en texto plano, verlas en tiempo real y generar proyectos, pero con una nueva arquitectura, herramientas más avanzadas y versiones exclusivas para Windows.

### Añadido

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas de retención de datos** — al instalar manualmente sobre una versión existente de Tree IDE o al desinstalar, ahora se muestran opciones claras de Conservar o Eliminar, con Conservar seleccionado por defecto
- **Instalador consciente de primera instalación** — la selección de datos se omite cuando no existen perfiles previos de Tree IDE ni información del actualizador, y no interrumpe actualizaciones automáticas silenciosas
- **Flujo de datos asistido correcto** — las instalaciones manuales sobre versiones existentes y la desinstalación muestran las opciones de Conservar/Eliminar; las actualizaciones silenciosas dentro de la app omiten el aviso y conservan los datos
- **Bienvenida según la elección de datos** — el proceso de incorporación aparece para perfiles nuevos o si se selecciona Eliminar; elegir Conservar mantiene el estado completado de la bienvenida
- **Acción correcta al finalizar el desinstalador** — la última página ahora etiqueta su botón principal como Finalizar en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación permanece en `app.asar`, ahora con validación de integridad Electron ASAR y carga restringida solo al archivo validado
- **Runtime optimizado para Windows x64** — se eliminó la cadena de herramientas Squirrel y los binarios de 7-Zip para sistemas distintos de Windows/x64, dejando solo los necesarios en los archivos distribuidos
- **Limpieza opcional completa** — al eliminar datos se incluyen preferencias, caché, registros, sesión guardada, carpetas de perfil (actuales y legadas) y datos del actualizador

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de compilación en pantalla completa con vista previa en árbol, vista previa de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear la estructura en disco, exportar solo un ZIP, o exportar únicamente un archivo de proyecto `.tree`
- **Salidas combinadas** — opcionalmente exporta un ZIP junto con una estructura de carpetas, e incluye el archivo `.tree` dentro del archivo ZIP
- **Botón crear-con-ZIP inteligente según contenido** — las compilaciones combinadas etiquetan la acción como Crear Archivo, Archivos, Carpeta, Carpetas, Archivo y Carpeta, o Archivos y Carpetas seguido de `+ ZIP`, según la estructura seleccionada
- **Inspección previa a la compilación** — escanea la carpeta destino en busca de estructuras existentes, archivos `.tree` o ZIP antes de escribir nuevos datos
- **Gestión de conflictos** — permite elegir entre omitir o sobrescribir si ya existen archivos o carpetas
- **Contenido inicial por defecto** para más de 68 tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, entre otros)
- **Marcadores de i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos comprimidos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 reconoce el formato `.tree` de primera generación usado por Tree IDE Legacy; los archivos originales UTF-8 sin encabezado siguen siendo legibles con estilos de tabulación y `...`
- **Exportación ZIP** con protección de contraseña AES-256 opcional, usando 7-Zip
- **Proyectos `.tree` altamente cifrados** — TREEIDE2 emplea AES-256-GCM autenticado con Argon2id (256 MiB, 4 rondas, 4 lanes), autentica su encabezado criptográfico y preserva el formato sin encabezado original de Tree IDE Legacy como generación 1
- **Protección explícita para archivos `.tree`** — con una casilla dedicada se activan los campos de contraseña y confirmación (deshabilitados por defecto), se explica que se aplicará el cifrado TREEIDE2, y la advertencia de contraseña irrecuperable solo aparece cuando la protección está marcada
- **Importación de archivos comprimidos** mediante diálogo o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` protegidos
- **Cargar carpeta como estructura** — escanea un directorio existente y lo convierte en texto de árbol editable

#### Plantillas
- **19 plantillas iniciales integradas** agrupadas por categoría:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas en pantalla completa con pestañas integradas y personalizadas, edición en línea de estructuras, y vista previa en árbol dinámica
- **Plantillas personalizadas** — crear en blanco, importar del proyecto actual, renombrar, editar contenido por archivo en línea, abrir en el editor principal, exportar o eliminar desde la misma pantalla
- **Archivos `.tree-template`** — exporta e importa plantillas personalizadas compartibles (JSON `treeide-template` v1) usando diálogos nativos de guardado/abrir o exportación por fila en la lista personalizada
- **Pie de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Desde el proyecto actual**, e **Importar .tree-template**; en estado vacío ofrece inicio en blanco, importación de proyecto y de archivo
- **Vista previa por archivo** — al hacer clic en un archivo en la vista de estructura, se abre un panel de editor monoespaciado de ancho completo con distintivo de tipo de archivo (mismo diseño para plantillas integradas y personalizadas)
- **Búsqueda de plantillas** — filtra plantillas integradas y personalizadas al escribir, con coincidencia insensible a mayúsculas y acentos, y retroalimentación localizada si no hay resultados
- **Favoritos de plantillas** — marca plantillas con una estrella Lucide local, navega por ellas en la pestaña de Favoritos dedicada y conserva la selección entre sesiones de la app

#### Paleta de comandos y accesibilidad
- **Paleta de comandos ampliada** — usa `Ctrl+Shift+P` para buscar entre 23 acciones, incluyendo Guardar todo, Deshacer, Rehacer, Nueva pestaña, pestaña siguiente/anterior de proyecto, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de, además de los ya existentes: proyecto, compilación, configuración, pantalla completa y reportar
- **Comandos sensibles al contexto** — las acciones de Guardar todo y pestaña de proyecto/archivo siguen visibles para que sean detectables, pero se desactivan cuando la sesión actual no puede ejecutarlas de forma segura
- **Flujo de comandos enfocado en teclado** — las flechas cambian el comando activo, Enter lo ejecuta, Escape cierra la paleta y el foco regresa al control anterior
- **Mejor soporte para lectores de pantalla** — nombres accesibles localizados, patrones semánticos de combobox/listbox/pestañas, seguimiento de elementos activos, conteo de resultados en vivo y anuncios de estado más claros en comandos y plantillas
- **Acciones accesibles en plantillas** — favoritos, renombrar, editar, exportar y eliminar presentan etiquetas localizadas y estado mediante `aria-pressed`, `aria-selected` y regiones en vivo

#### Rich Presence
- **Discord RPC listo para usar** — Tree IDE incluye su ID de aplicación pública de Discord, se conecta automáticamente al cliente de escritorio en ejecución, reporta el estado de conexión, reintenta tras desconexiones, y no requiere configuración del usuario
- **Estados de actividad específicos** — Editando estructura, Editando código, Editando texto, Viendo archivo, Explorando plantillas, Personalizando plantilla, Configuración y, según Build Studio, Creando archivo, archivos, carpeta, carpetas, archivo y carpeta, o archivos y carpetas; la opción Build Studio usa el mismo título y descripción dinámicos, mientras que las salidas `.tree` están disponibles para proyectos planos válidos y las exportaciones emplean un estado genérico Exportando archivo.
- **Estado de inactividad según el editor** — Presence inicia como Inactivo y solo reporta Editando estructura tras interactuar directamente en el editor; cinco minutos sin interacción retorna a Inactivo con icono de teclado
- **Tres niveles de privacidad** — Básico muestra solo Tree IDE, Actividad agrega la acción actual y Detallado puede mostrar el nombre del proyecto y tipo de archivo; nunca se comparten rutas ni contenido de archivos
- **Presence consciente de energía** — bloqueo y suspensión eliminan la actividad, mientras que desbloqueo y reanudación la restauran automáticamente
- **Presence localizada** — sigue el idioma de Tree IDE o permite elegir inglés, portugués o español independientemente; la configuración actualiza el RPC de inmediato y se mantiene entre sesiones
- **Alcance de localización explicado** — Discord recibe solo una actividad en el idioma seleccionado, por lo que cada espectador verá el idioma elegido por el publicador, no una traducción automática según el idioma de Discord del espectador

#### Editor, árbol y validación
- **Panel de validación** — tabulación incorrecta, nombres inválidos, duplicados y rutas inseguras o estructuras vacías; al hacer clic en una advertencia se salta a la línea correspondiente
- **Deshacer / rehacer** con hasta 100 estados históricos
- **Pestañas de múltiples proyectos** con indicadores de modificación, barra de pestañas desplazable y ordenación por arrastrar y soltar
- **Pestañas por archivo en proyectos** — edita contenido inicial antes de compilar y reordena archivos abiertos arrastrando, manteniendo activa la pestaña en uso
- **Sincronización de pestañas al eliminar archivos** — borrar archivos o cambiar extensiones en el editor de estructuras cierra todas las pestañas obsoletas, selecciona la más cercana válida y evita que el contenido eliminado reaparezca
- **Vista previa de Markdown en directo** para archivos `.md` en el panel de vista previa
- **Carpetas plegables** en la vista árbol
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter
- **Renombrado inteligente** al editar líneas del árbol
- **Sangría por bloque** con Tab y Shift+Tab, más retroceso inteligente para bloques de sangría
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivo) con layout persistente entre sesiones

#### Iconos y tipos de archivo
- **Iconos Lucide** incluidos localmente (sin dependencia de CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, comprimidos y multimedia
- **Más de 100 etiquetas de extensión** en el mapa de tipos de archivo

#### Interfaz y experiencia de primer uso
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida al primer uso** — diseño renovado con encabezado destacado, tarjetas de configuración agrupadas (General, Apariencia, Sesión) y un botón **Comenzar** fijo
- **Modal de configuración** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal Acerca de** con versión en vivo de la app (evolución de la pantalla de créditos de v1)
- **Diálogo de cambios no guardados** al cerrar proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y comprimidos
- **Fuentes incluidas** — Inter y JetBrains Mono

#### Diagnóstico y reportes en GitHub enfocados en privacidad
- **Formulario estructurado de reportes** — recopila título, descripción, pasos de reproducción y comportamiento esperado en campos localizados, autoexpandibles y con contador de caracteres
- **Selector de etiquetas del repositorio** — carga etiquetas actuales de GitHub con fallback offline, las muestra en el dropdown personalizado y añade la etiqueta seleccionada al prefijo del título, preseleccionándola en el borrador de GitHub
- **Borrador limpio y localizado** — abre GitHub automáticamente tras una demora visible, con título, secciones Markdown y etiqueta elegida ya llenos para revisión; clic o Enter/Espacio ocultan el aviso sin cambiar el temporizador, y el reporte nunca se envía automáticamente
- **Registros de ejecución actuales** — incluye solo registros de la sesión actual de la app, separados en procesos principal y renderizador, limitados a 256 KB y marcados con hora localizada de 12 horas, periodo del día y zona horaria
- **Paquete diagnóstico saneado** — elimina rutas locales, direcciones de email, IP y secretos de URL, excluyendo nombres y contenido de proyectos
- **Captura de pantalla opcional de Tree IDE** — sólo de la ventana actual de la app tras consentimiento explícito, nunca del escritorio ni otras ventanas
- **Adjuntos locales primero** — guarda el ZIP en la ruta elegida por el usuario sin abrir el explorador ni subirlo; registros y capturas permanecen locales hasta ser adjuntados manualmente
- **Modal de reporte más seguro** — seleccionar o arrastrar texto ya no cierra el diálogo, los campos se redimensionan automáticamente, contraste de temas sigue el resto de la app, y el formulario se reinicia tras éxito, Cancelar o cierre con el botón X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma al primer uso** en el flujo de bienvenida y configuración
- **Traducciones del proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener archivos de idioma sincronizados

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde `localStorage` legado
- **Guardado automático** de pestañas abiertas, contenido de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o empezar siempre en limpio

#### Actualizador automático y notas de lanzamiento
- **Actualizador automático integrado** — consulta GitHub Releases, descarga con progreso y reinicia para instalar
- **Canales de actualización estable y beta**
- **Notas de lanzamiento localizadas** en el modal de actualización (inglés, portugués y español)
- **Registro de cambios legible** — diálogo más amplio, **Qué hay de nuevo** expandido por defecto, área de desplazamiento dedicada, jerarquía de encabezados más clara y botones de acción fijos en el pie
- **Flujo manual de `docs/changelog.md`** — edita notas de lanzamiento en el repositorio; CI las traduce y publica el inglés en GitHub
- **Notas de lanzamiento divididas** — el modal muestra solo el registro de cambios; enlaces de navegación de idioma aparecen en `docs/changelog.md` y en la descripción del release en GitHub (apuntando a archivos legibles en `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es exclusivo de GitHub
- **Traducción por GitHub Models** — las notas en portugués y español se generan en CI mediante el API `models.github.ai`

#### Atajos de teclado
- **Atajos totalmente configurables** con interfaz de captura y acción para restaurar valores predeterminados
- Nuevos valores por defecto incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (compilar), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos de zoom del editor

#### Plataformas y distribución
- **Windows x64** — instalador NSIS y paquetes portátiles; instalador multilingüe (inglés, portugués y español)
- **Publicaciones en GitHub** generadas automáticamente tras tags de versión desde CI
- **Compilación del renderizador antes del empaquetado** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que cada instalador incluya el paquete de UI

#### Arquitectura, herramientas de desarrollo y calidad
- **Compilación de renderizador Vite** con recarga en caliente en desarrollo
- **Código base modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manejadores IPC divididos** para proyecto, actualizaciones y ciclo de vida de la app
- **API de `contextBridge` en preload** para un límite más seguro en el renderizador
- **Suite de pruebas Vitest** con mocks de Electron para ejecución en CI; helpers de registro de cambios y errores cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts npm
- **electron-reloader** para recarga en caliente del proceso principal en desarrollo
- **Exportar registros de error** al fallar, para facilitar depuración
- **`semver`** como dependencia directa para comparación fiable de versiones dentro de la app
