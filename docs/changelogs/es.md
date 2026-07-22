<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Novedades en v2.0.108

Tree IDE v2 es una reescritura completa y expansión de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Mantiene la idea central — diseñar estructuras de carpetas en texto plano, previsualizarlas en tiempo real y generar proyectos — con una nueva arquitectura, herramientas más variadas y lanzamientos exclusivos para Windows.

### Agregado

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas para retención de datos** — instalar manualmente sobre una versión existente de Tree IDE o desinstalar ahora presenta opciones claras de Conservar o Eliminar, con Conservar seleccionado por defecto.
- **Configuración consciente de primera instalación** — se omite la elección de datos cuando no existe un perfil previo de Tree IDE ni datos del actualizador, y no interrumpe las actualizaciones automáticas silenciosas.
- **Flujo correcto de datos asistido** — las instalaciones manuales sobre una versión existente y la desinstalación muestran las opciones Conservar/Eliminar; las actualizaciones silenciosas dentro de la app omiten el aviso y conservan los datos.
- **Bienvenida acorde a la elección de datos** — el tutorial aparece para un perfil nuevo o al elegir Eliminar, mientras que seleccionar Conservar mantiene el estado de tutorial completado.
- **Acción correcta al finalizar el desinstalador** — la página final ahora etiqueta su botón principal como Finalizar en vez de Siguiente en inglés, portugués y español.
- **Paquete de producción protegido** — el código de la aplicación sigue organizado en `app.asar`, ahora con validación de integridad ASAR de Electron y carga restringida al archivo validado.
- **Runtime optimizado para Windows x64** — eliminado el toolchain Squirrel sin uso y los binarios de 7-Zip para sistemas distintos a Windows/x64 de los archivos distribuidos de la aplicación.
- **Limpieza opcional completa** — eliminar datos abarca preferencias, caché, registros, sesión guardada, carpetas de perfil actual y antiguo, y datos del actualizador.

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de construcción a pantalla completa con vista previa del árbol en vivo, previsualización por archivo, estadísticas y opciones de salida.
- **Tres modos de salida** — crear estructura de carpetas en el disco, exportar solo un ZIP o exportar solo un archivo de proyecto `.tree`.
- **Salidas combinadas** — opcionalmente exporta un ZIP junto con la construcción de carpetas e incluye el archivo `.tree` dentro del archivo ZIP.
- **Botón de crear con ZIP según contenido** — las construcciones combinadas de carpeta y ZIP etiquetan la acción como Crear Archivo, Archivos, Carpeta, Carpetas, Archivo y Carpeta, o Archivos y Carpetas seguido de `+ ZIP`, según la estructura seleccionada.
- **Inspección previa a la construcción** — escanea la carpeta destino para detectar estructuras existentes, archivos `.tree` o ZIP antes de escribir.
- **Manejo de conflictos** — permite elegir entre omitir o sobrescribir cuando existen archivos o carpetas previos.
- **Contenido inicial por defecto** para más de 68 tipos de archivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más).
- **Marcadores i18n** en los archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.).

#### Archivos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 detecta el formato de archivo `.tree` de primera generación usado por Tree IDE Legacy; los archivos UTF-8 sin encabezado originales siguen siendo legibles, tanto con tabulación como con el estilo `...` de indentación.
- **Exportación ZIP** con protección opcional de contraseña AES-256 a través de 7-Zip.
- **Proyectos `.tree` cifrados de alta resistencia** — TREEIDE2 usa AES-256-GCM autenticado con Argon2id (256 MiB, 4 ciclos, 4 canales), autentica su encabezado criptográfico y mantiene legible el formato original sin encabezado de Tree IDE Legacy como generación 1.
- **Protección explícita para `.tree`** — una casilla dedicada habilita los campos de contraseña y confirmación (inicialmente deshabilitados), explica que se aplicará el cifrado TREEIDE2 y muestra la advertencia de contraseña irrecuperable solo cuando se selecciona protección.
- **Importación de archivos comprimidos** mediante diálogo de archivo o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`.
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` cifrados.
- **Cargar carpeta como estructura** — analiza un directorio existente y lo convierte en texto de árbol editable.

#### Plantillas
- **19 plantillas iniciales integradas** agrupadas por categoría:
  - Frontend: HTML, HTML y CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa con pestañas para plantillas integradas y personalizadas, edición en línea de la estructura y vista previa del árbol en vivo.
- **Plantillas personalizadas** — crear en blanco, importar del proyecto actual, renombrar, editar contenido de archivos en línea, abrir en el editor principal, exportar o eliminar sin salir de la pantalla.
- **Archivos `.tree-template`** — exportar e importar plantillas personalizables (JSON `treeide-template` v1) mediante los diálogos nativos de guardar/abrir o exportación por fila en la lista personalizada.
- **Pie de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Desde el proyecto actual** e **Importar .tree-template**; el estado vacío ofrece inicio en blanco, importación de proyecto e importación de archivo.
- **Previsualización por archivo** — al hacer clic en un archivo dentro de la vista previa de estructura se abre un panel de editor monoespaciado de ancho completo con distintivo de tipo de archivo (mismo diseño de panel único para plantillas integradas y personalizadas).
- **Búsqueda de plantillas** — filtra plantillas integradas y personalizadas mientras escribes, con coincidencia insensible a mayúsculas/minúsculas y acentos, además de retroalimentación localizada si no hay resultados.
- **Favoritos de plantillas** — marca plantillas con una estrella Lucide incluida localmente, navega en la pestaña dedicada de Favoritos y conserva la selección entre sesiones de la app.

#### Paleta de comandos y accesibilidad
- **Paleta de comandos expandida** — usa `Ctrl+Shift+P` para buscar 23 acciones, agregando Guardar todo, Deshacer, Rehacer, Nueva pestaña, pestaña de proyecto siguiente/anterior, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de, además de los comandos previos de proyecto, construcción, ajustes, pantalla completa y reportes.
- **Comandos contextuales** — Guardar todo y acciones de pestañas de proyecto/archivo permanecen visibles para su descubrimiento, pero se desactivan cuando la sesión actual no puede ejecutarlas de manera segura.
- **Flujo de comandos orientado al teclado** — las flechas cambian el comando activo, Enter lo ejecuta, Escape cierra la paleta y el enfoque regresa al control previo.
- **Mejor soporte para lectores de pantalla** — nombres accesibles localizados, patrones semánticos de combobox/listbox/pestañas, seguimiento de descendiente activo, conteo en vivo de resultados y anuncios de estado más claros en comandos y plantillas.
- **Acciones accesibles para plantillas** — controles de favorito, renombrar, editar, exportar y eliminar exponen etiquetas y estado localizados mediante `aria-pressed`, `aria-selected` y regiones en vivo.

#### Rich Presence
- **Discord RPC listo para usar** — Tree IDE incorpora su ID de aplicación pública de Discord, conecta automáticamente con el cliente de escritorio en ejecución, informa el estado de conexión, reintenta tras desconexiones y no requiere configuración del usuario.
- **Estados específicos de actividad** — Editando estructura, Editando código, Editando texto, Viendo archivo, Navegando plantillas, Personalizando plantilla, Ajustes y estados de construcción como Creando archivo, Creando archivos, Creando carpeta, Creando carpetas, Creando archivo y carpeta, o Creando archivos y carpetas; la opción Build Studio utiliza el mismo título y descripción dinámicos, mientras que las salidas `.tree` permanecen disponibles para proyectos planos válidos y las exportaciones usan un estado genérico de Exportando archivo.
- **Estado de inactividad detectado por el editor** — Presence inicia como Inactivo y solo reporta Editando estructura tras interacción directa con el editor de estructura; cinco minutos sin interacción regresa a Inactivo con ícono de teclado.
- **Tres niveles de privacidad** — Básico muestra solo Tree IDE, Actividad agrega la acción actual y Detallado puede mostrar el nombre del proyecto y tipo de archivo; nunca se comparten rutas ni contenidos de archivos.
- **Presence dependiente de energía** — bloquear y suspender borran la actividad, mientras que desbloquear y reanudar la restauran automáticamente.
- **Presence localizado** — sigue el idioma de Tree IDE o permite elegir inglés, portugués o español de forma independiente; el ajuste actualiza el RPC inmediatamente y persiste entre sesiones.
- **Explicación del alcance de localización** — Discord recibe solo un payload de actividad localizado, así que todos los espectadores ven el idioma de Presence elegido por el editor, no una traducción según el idioma local de Discord del espectador.

#### Editor, árbol y validación
- **Panel de validación** — mala indentación, nombres inválidos, duplicados entre hermanos, rutas no seguras y estructuras vacías; al hacer clic en una advertencia se salta a la línea.
- **Deshacer / rehacer** con hasta 100 estados de historial.
- **Pestañas de múltiples proyectos** con indicadores de modificación, barra de pestañas desplazable y reordenación por arrastrar y soltar.
- **Pestañas de editor de archivos por proyecto** — edita el contenido inicial de archivos antes de construir, y reordena archivos abiertos por arrastrar y soltar manteniendo la pestaña activa.
- **Sincronización de pestañas de archivos eliminados** — eliminar archivos o cambiar extensiones en el editor de estructura ahora cierra todas las pestañas obsoletas, selecciona la pestaña válida más cercana cuando es necesario y previene el reaparición de contenido eliminado.
- **Vista previa en vivo de Markdown** para archivos `.md` en el panel de vista previa de archivos.
- **Carpetas colapsables** en la vista previa del árbol.
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter.
- **Renombrado inteligente de archivos** al editar líneas del árbol.
- **Indentado / desindentado por bloque** con Tab y Shift+Tab, más retroceso inteligente (Backspace) para bloques de indentación.
- **Zoom en el editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`.
- **Paneles redimensionables** (editor, árbol, vista previa de archivos) con el diseño guardado entre sesiones.

#### Iconos y tipos de archivos
- **Iconos Lucide** incluidos localmente (sin dependencia de CDN).
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y multimedia.
- **Más de 100 etiquetas de extensiones de archivos** en el mapa de tipos de archivos.

#### Interfaz y primera experiencia de uso
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar.
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de.
- **Modal de bienvenida** en la primera ejecución — diseño renovado con encabezado destacado, tarjetas de configuración agrupadas (General, Apariencia, Sesión) y botón fijado de **Comenzar**.
- **Modal de ajustes** con pestañas: General, Apariencia, Atajos y Actualizaciones.
- **Modal de Acerca de** con versión de la aplicación en vivo (evolucionado de la pantalla de créditos de la v1).
- **Diálogo de cambios no guardados** al cerrar con proyectos modificados.
- **Superposición al arrastrar y soltar** para archivos `.tree` y archivos comprimidos.
- **Fuentes incluidas** — Inter y JetBrains Mono.

#### Diagnóstico orientado a privacidad y reportes de GitHub
- **Formulario estructurado de reporte** — recopila título del problema, descripción, pasos para reproducir y comportamiento esperado en campos localizados, auto-crecientes y con contador de caracteres.
- **Selector de etiqueta de repositorio** — carga etiquetas actuales de GitHub con respaldo offline, las muestra en el desplegable personalizado de la app, agrega la etiqueta seleccionada al prefijo del título y la preselecciona en el borrador de GitHub.
- **Borrador limpio y localizado del reporte** — abre GitHub automáticamente tras un breve retraso visible, con título, secciones en Markdown y etiqueta ya rellenados para revisión; al hacer clic en el aviso o pulsar Enter/Espacio se oculta la nota sin alterar el temporizador, y el reporte nunca se envía automáticamente.
- **Registros de ejecución actual** — solo incluye entradas de registro de la última ejecución de la app, separadas en secciones de proceso principal y renderizador, con límite de 256 KB y sello de hora localizada en formato de 12 horas, periodo del día y zona horaria.
- **Paquete de diagnóstico anonimizado** — oculta rutas locales, direcciones de correo, IPs y secretos de URLs, mientras excluye nombres y contenidos de proyecto.
- **Captura opcional de pantalla de Tree IDE** — solo captura la ventana actual de la app tras consentimiento explícito, nunca el escritorio ni otras ventanas.
- **Adjuntos orientados a local** — guarda el ZIP en la ruta elegida por el usuario sin abrir Explorer ni realizar cargas; los registros y capturas permanecen locales hasta que se adjuntan manualmente.
- **Modal de reporte más seguro** — al seleccionar y arrastrar texto ya no se cierra el diálogo, los campos se redimensionan automáticamente, el contraste tema claro/oscuro sigue el resto de la app y el formulario se reinicia tras éxito, Cancelar o cierre con el botón X.

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en primera ejecución** en el flujo de bienvenida y ajustes.
- **Traducciones de procesos principales** en diálogos nativos y mensajes de error.
- **Script `npm run i18n:validate`** para mantener los archivos de idiomas sincronizados.

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde `localStorage` heredado.
- **Guardado automático** de pestañas abiertas, archivos y nombres de proyectos.
- **Modos de sesión** — restaurar la última sesión al iniciar o empezar siempre en blanco.

#### Autoactualización y notas de versión
- **Actualizador automático en la app** — consulta los lanzamientos de GitHub, descarga con progreso y reinicia para instalar.
- **Canales de actualización estable y beta**
- **Notas de versión localizadas** en el modal de actualización (inglés, portugués y español).
- **Registro de cambios legible en actualizaciones** — diálogo más amplio, **Novedades** expandido por defecto, área de desplazamiento dedicada, jerarquía de encabezados más clara y botones de acción fijos en el pie.
- **Flujo manual de notas en `docs/changelog.md`** — edita notas en el repositorio; CI las traduce para la app y publica el inglés en GitHub.
- **Notas de versión divididas** — el modal de actualización en la app muestra solo el texto del changelog; los enlaces de navegación idiomática aparecen en `docs/changelog.md` y en la descripción del lanzamiento en GitHub (apuntando a archivos legibles en `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es exclusivo de GitHub.
- **Traducción por GitHub Models** — las notas en portugués y español se generan en CI usando la API `models.github.ai`.

#### Atajos de teclado
- **Atajos completamente configurables** con interfaz de captura y acción para restaurar valores por defecto.
- Nuevos valores por defecto incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos de zoom del editor.

#### Plataformas y distribución
- **Windows x64** — instalador NSIS y paquetes portátiles; instalador multilenguaje (inglés, portugués y español).
- **Lanzamientos en GitHub** publicados automáticamente al crear etiquetas de versión desde CI.
- **Construcción de renderizador antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que cada instalador incluya el paquete de UI.

#### Arquitectura, herramientas de desarrollo y calidad
- **Renderizador Vite** con reemplazo en caliente de módulos en desarrollo.
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos de CSS.
- **Módulos ES**, Node.js 24+, Electron 42.
- **Manejadores IPC divididos** para proyecto, actualizaciones y ciclo de vida de la app.
- **API de preload `contextBridge`** para un límite de renderizador endurecido.
- **Suite de pruebas Vitest** con mocks de Electron para ejecuciones compatibles con CI; los ayudantes de changelog y errores del actualizador cubiertos por pruebas dedicadas.
- **ESLint y Prettier** integrados en los scripts npm.
- **electron-reloader** para recarga en caliente de procesos principales durante desarrollo.
- **Exportación de registro de errores** al fallar para facilitar depuración.
- **`semver`** como dependencia directa para comparación confiable de versiones en la app.
