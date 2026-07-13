<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Novedades en v2.0.105

Tree IDE v2 es una reescritura completa y expansión de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). La misma idea central: diseñar estructuras de carpetas en texto plano, previsualizarlas en tiempo real y generar proyectos, con una nueva arquitectura, herramientas más ricas y lanzamientos solo para Windows.

### Agregado

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas de retención de datos** — instalar manualmente sobre una versión existente de Tree IDE y desinstalar ahora presentan opciones claras de Conservar o Eliminar, con Conservar seleccionada por defecto
- **Instalación consciente del primer uso** — la elección de datos se omite cuando no existe un perfil de Tree IDE anterior o datos de actualizador y no interrumpe las actualizaciones automáticas silenciosas
- **Flujo de datos asistido correcto** — las instalaciones manuales sobre una versión existente y la desinstalación ahora muestran opciones de Conservar/Eliminar; las actualizaciones silenciosas en la aplicación omiten el aviso y retienen los datos
- **La bienvenida sigue la elección de datos** — la incorporación aparece para un perfil nuevo o después de seleccionar Eliminar, mientras que seleccionar Conservar preserva el estado de incorporación completado
- **Acción de finalización del desinstalador correcta** — la página final ahora etiqueta su botón principal como Finalizar en lugar de Siguiente en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación permanece organizado en `app.asar`, ahora con validación de integridad de Electron ASAR y carga restringida al archivo validado
- **Runtime de Windows x64 optimizado** — se eliminaron la cadena de herramientas de empaquetado Squirrel no utilizada y los binarios de 7-Zip no Windows/no x64 de los archivos de aplicación distribuidos
- **Limpieza opcional completa** — eliminar datos abarca preferencias, caché, registros, sesión guardada, carpetas de perfil actuales y heredadas, y datos de actualizador

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de construcción a pantalla completa con previsualización de árbol en vivo, previsualización de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo un ZIP, o exportar solo un archivo de proyecto `.tree`
- **Salidas combinadas** — exportar opcionalmente un ZIP junto con una construcción de carpeta, e incluir el archivo `.tree` dentro del archivo
- **Inspección previa a la construcción** — escanear la carpeta de destino en busca de estructura existente, archivos `.tree` o ZIP antes de escribir
- **Manejo de conflictos** — elegir omitir o sobrescribir cuando los archivos o carpetas ya existen
- **Contenido inicial por defecto** para más de 68 tipos de archivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, y más)
- **Marcadores de posición i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos y cifrado
- **Exportación a ZIP** con protección de contraseña AES-256 opcional a través de 7-Zip
- **Proyectos `.tree` cifrados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importación de archivos** a través de diálogo de archivos o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, y `.7z`
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` cifrados
- **Cargar carpeta como estructura** — escanear un directorio existente y convertirlo en texto de árbol editable

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
- **Previsualización por archivo** — hacer clic en un archivo en la previsualización de la estructura abre un panel de editor monoespaciado de ancho completo con insignia de tipo de archivo (mismo diseño de un solo panel para plantillas integradas y personalizadas)

#### Editor, árbol y validación
- **Panel de validación** — mala indentación, nombres inválidos, hermanos duplicados, rutas inseguras y estructuras vacías; hacer clic en una advertencia para saltar a la línea
- **Deshacer / rehacer** con hasta 100 estados de historial
- **Pestañas de múltiples proyectos** con indicadores de modificación, una barra de pestañas desplazable y reordenamiento por arrastrar y soltar
- **Pestañas de previsualización de archivos por proyecto** — editar el contenido del archivo inicial antes de construir
- **Previsualización en vivo de Markdown** para archivos `.md` en el panel de previsualización de archivos
- **Carpetas colapsables** en la previsualización del árbol
- **Navegación por teclado en el árbol** — teclas de flecha, Inicio, Fin y Enter
- **Coincidencia de renombrado de archivos inteligente** cuando se editan líneas del árbol
- **Sangría de bloque / deshacer sangría** con Tab y Shift+Tab, además de retroceso inteligente para bloques de sangría
- **Zoom del editor** — `Ctrl++`, `Ctrl+-`, y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, previsualización de archivos) con diseño persistente a través de sesiones

#### Iconos y tipos de archivos
- **Iconos de Lucide** empaquetados localmente (sin dependencia de CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y medios
- **Más de 100 etiquetas de extensión de archivo** en el mapa de tipos de archivo

#### Interfaz de usuario y experiencia de primer uso
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida** en el primer uso — diseño rediseñado con encabezado destacado, tarjetas de configuración agrupadas (General, Apariencia, Sesión) y un botón **Comenzar** anclado
- **Modal de configuración** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal Acerca de** con versión de la aplicación en vivo (evolucionado de la pantalla de créditos de v1)
- **Diálogo de cambios no guardados** al cerrar con proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y archivos comprimidos
- **Fuentes empaquetadas** — Inter y JetBrains Mono

#### Diagnósticos centrados en la privacidad e informes de GitHub
- **Formulario de informe estructurado** — recopilar título del problema, descripción del problema, pasos de reproducción y comportamiento esperado en campos localizados y de crecimiento automático con contadores de caracteres
- **Selector de etiquetas de repositorio** — cargar las etiquetas actuales de GitHub con una opción de respaldo fuera de línea, mostrarlas en el menú desplegable personalizado de la aplicación, agregar la etiqueta seleccionada al prefijo del título y preseleccionarla en el borrador de GitHub
- **Borrador de problema localizado limpio** — abrir GitHub automáticamente después de un retraso visible de redirección con el título, secciones de Markdown y etiqueta seleccionada ya completadas para revisión; hacer clic en el aviso o presionar Enter/Espacio para ocultar la notificación sin cambiar el temporizador, y el problema nunca se envía automáticamente
- **Registros de ejecución actual** — incluir solo entradas de registro del último lanzamiento de la aplicación, separadas en secciones de proceso principal y renderizador, limitadas a 256 KB, y selladas con una hora localizada de 12 horas, período del día y zona horaria
- **Paquete de diagnóstico sanitizado** — redactar rutas locales, direcciones de correo electrónico, direcciones IP y secretos de URL mientras se excluyen nombres y contenidos de proyectos
- **Captura de pantalla opcional de Tree IDE** — capturar solo la ventana actual de la aplicación después de una opción explícita, nunca el escritorio u otras ventanas
- **Adjuntos locales primero** — guardar el ZIP en la ruta elegida por el usuario sin abrir el Explorador de Archivos o subirlo; los registros y capturas de pantalla permanecen locales hasta que se adjuntan manualmente
- **Modal de informe más seguro** — la selección de texto y el arrastre ya no desestiman el diálogo, los campos se redimensionan automáticamente, el contraste del tema claro/oscuro sigue el resto de la aplicación, y el formulario se restablece después de éxito, Cancelar o cerrar con el botón X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en el primer uso** en el flujo de bienvenida y configuraciones
- **Traducciones de proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener los archivos de localización sincronizados

#### Persistencia de sesión
- **Almacenamiento de sesión IndexedDB** con migración automática desde `localStorage` heredado
- **Guardado automático** de pestañas abiertas, contenidos de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o siempre comenzar limpio

#### Actualizador automático y notas de lanzamiento
- **Actualizador automático en la aplicación** — verificar lanzamientos de GitHub, descargar con progreso y reiniciar para instalar
- **Canales de actualización estables y beta**
- **Notas de lanzamiento localizadas** en el modal de actualización (inglés, portugués y español)
- **Registro de cambios de actualización legible** — diálogo más amplio, **Novedades** expandido por defecto, área de desplazamiento dedicada, jerarquía de encabezados más clara y botones de acción anclados en el pie de página
- **Flujo de trabajo manual `docs/changelog.md`** — editar notas de lanzamiento en el repositorio; CI las traduce para la aplicación y publica en inglés en GitHub
- **Notas de lanzamiento divididas** — el modal de actualización de la aplicación muestra solo el texto del registro de cambios; los enlaces de navegación de localización aparecen en `docs/changelog.md` y en la descripción del lanzamiento de GitHub (apuntando a archivos legibles en `docs/changelogs/`); el enlace de comparación (`Full Changelog`) es solo de GitHub
- **Traducción de Modelos de GitHub** — las notas de lanzamiento en portugués y español se generan en CI a través de la API `models.github.ai`

#### Atajos de teclado
- **Atajos completamente configurables** con interfaz de captura y acción de restaurar valores predeterminados
- Los nuevos valores predeterminados incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo), y atajos de zoom del editor

#### Plataformas y distribución
- **Windows x64** — paquetes de instalación NSIS y portátiles; instalador multilingüe (inglés, portugués y español)
- **Lanzamientos de GitHub** publicados automáticamente en etiquetas de versión desde CI
- **Construcción del renderizador antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que cada instalador envíe el paquete de UI

#### Arquitectura, herramientas de desarrollo y calidad
- **Construcción del renderizador Vite** con reemplazo de módulo en caliente en desarrollo
- **Código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/`, y 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Controladores IPC divididos** para proyecto, actualizaciones y ciclo de vida de la aplicación
- **API de precarga `contextBridge`** para un límite de renderizador endurecido
- **Suite de pruebas Vitest** con simulacros de Electron para ejecuciones amigables con CI; ayudantes de errores de registro de cambios y actualizador cubiertos por pruebas dedicadas
- **ESLint y Prettier** integrados en scripts de npm
- **electron-reloader** para recarga en caliente del proceso principal durante el desarrollo
- **Exportación de registros de errores** en caso de fallo para facilitar la depuración
- **`semver`** como una dependencia directa para una comparación de versiones confiable en la aplicación
