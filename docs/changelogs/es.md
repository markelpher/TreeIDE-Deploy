<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Qué hay de nuevo en v2.0.111

Tree IDE v2 es una reescritura completa y expansión de la app original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). La misma idea central — diseñar estructuras de carpetas en texto plano, previsualizarlas en tiempo real y generar proyectos — ahora con una nueva arquitectura, herramientas más completas y versiones disponibles solo para Windows.

### Añadido

#### Instalación, almacenamiento y protección de paquetes
- **Opciones explícitas para conservar datos** — al instalar manualmente sobre una versión existente de Tree IDE y al desinstalar, ahora se muestran opciones claras de Conservar o Eliminar, con Conservar seleccionado por defecto
- **Instalador detecta primera instalación** — se omite la elección de datos cuando no existe un perfil previo de Tree IDE ni datos del actualizador, y no interrumpe actualizaciones automáticas silenciosas
- **Flujo de datos asistido correcto** — instalaciones manuales sobre una versión existente y la desinstalación muestran las opciones de Conservar/Eliminar; las actualizaciones silenciosas dentro de la app omiten el aviso y conservan los datos
- **La bienvenida sigue la elección de datos** — el proceso de inicio se presenta al crear un perfil nuevo o tras seleccionar Eliminar, mientras elegir Conservar mantiene el estado de bienvenida completado
- **Acción final correcta en el desinstalador** — la última página ahora etiqueta el botón principal como Finalizar en inglés, portugués y español, en vez de Siguiente
- **Paquete de producción protegido** — el código de la aplicación permanece organizado en `app.asar`, ahora con validación de integridad de Electron ASAR y con la carga restringida al archivo validado
- **Runtime Windows x64 optimizado** — se eliminó el toolchain Squirrel no usado y los binarios de 7-Zip para sistemas distintos a Windows/x64 de los archivos distribuidos de la aplicación
- **Limpieza opcional completa** — al eliminar datos se incluyen preferencias, caché, registros, sesión guardada, carpetas de perfil actual y legado, y datos del actualizador

#### Build Studio y salida de proyectos
- **Build Studio** — flujo de construcción a pantalla completa con previsualización en vivo del árbol, previsualización de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpetas en disco, exportar solo ZIP, o exportar solo archivo de proyecto `.tree`
- **Salidas combinadas** — opción de exportar ZIP junto con la construcción de carpetas y de incluir el archivo `.tree` dentro del ZIP
- **Botón de creación consciente del contenido y ZIP** — las construcciones combinadas de carpeta y ZIP ahora etiquetan la acción como Crear Archivo, Archivos, Carpeta, Carpetas, Archivo y Carpeta, o Archivos y Carpetas seguido de `+ ZIP`, según la estructura seleccionada
- **Inspección previa a la construcción** — escanea la carpeta destino para detectar estructura existente, archivos `.tree` o ZIP antes de escribir
- **Gestión de conflictos** — permite elegir entre omitir o sobrescribir cuando archivos o carpetas ya existen
- **Contenido inicial predeterminado** para más de 68 tipos de archivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte y más)
- **Marcadores i18n** en archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos y cifrado
- **Compatibilidad con archivos Tree IDE 1** — Tree IDE 1 reconoce el formato `.tree` de primera generación utilizado por Tree IDE Legacy; los archivos UTF-8 originales sin encabezado siguen siendo legibles con estilos de tabulación y `...`
- **Exportación ZIP** con protección opcional por contraseña AES-256 a través de 7-Zip
- **Proyectos `.tree` cifrados de alta seguridad** — TREEIDE2 emplea AES-256-GCM autenticado con Argon2id (256 MiB, 4 ciclos, 4 canales), autentica su encabezado criptográfico y mantiene legible el formato original sin encabezado como generación 1
- **Protección explícita de archivos `.tree`** — una casilla dedicada habilita los campos de contraseña y confirmación (habitualmente desactivados), explica que se aplicará el cifrado TREEIDE2 y muestra la advertencia de contraseña irrecuperable solo al seleccionar la protección
- **Importación de archivos comprimidos** mediante diálogo o arrastrar y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, y `.7z`
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` cifrados
- **Cargar carpeta como estructura** — analiza un directorio existente y lo transforma en texto editable del árbol

#### Plantillas
- **19 plantillas de inicio integradas** agrupadas por categoría:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa con pestañas para integradas y personalizadas, edición en línea de estructura y previsualización en vivo del árbol
- **Plantillas personalizadas** — crear en blanco, importar del proyecto actual, renombrar, editar contenido de archivos en línea, abrir en el editor principal, exportar o eliminar sin salir de la pantalla
- **Archivos `.tree-template`** — exportar e importar plantillas personalizadas compartibles (`treeide-template` v1 en JSON) mediante diálogos nativos o exportación por fila en la lista de personalizadas
- **Pie de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Del proyecto actual**, e **Importar .tree-template**; el estado vacío ofrece inicio en blanco, importación de proyecto y de archivos
- **Previsualización por archivo** — al hacer clic en un archivo en la previsualización de estructura se abre un panel de editor monoespaciado a pantalla completa con distintivo del tipo de archivo (mismo formato para plantillas integradas y personalizadas)
- **Búsqueda de plantillas** — filtra plantillas integradas y personalizadas al escribir, con coincidencia insensible a mayúsculas y acentos, y mensajes localizados para resultados vacíos
- **Favoritos de plantillas** — marca plantillas con una estrella Lucide incluida localmente, explora los favoritos en una pestaña dedicada y conserva la selección entre sesiones de la aplicación

#### Paleta de comandos y accesibilidad
- **Paleta de comandos ampliada** — usa `Ctrl+Shift+P` para buscar entre 23 acciones, agregando Guardar todo, Deshacer, Rehacer, Nueva pestaña, pestaña de proyecto siguiente/anterior, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de, además de los comandos existentes de proyecto, construcción, ajustes, pantalla completa y reportes
- **Comandos según contexto** — Guardar todo y acciones de pestaña de proyecto/archivo permanecen visibles para descubrimiento, pero están desactivadas cuando la sesión actual no puede ejecutarlas de forma segura
- **Flujo de comandos con teclado** — flechas cambian el comando activo, Enter lo ejecuta, Escape cierra la paleta y el enfoque vuelve al control anterior
- **Mejor soporte para lectores de pantalla** — nombres accesibles localizados, patrones semánticos de combobox/listbox/pestañas, seguimiento de descendiente activo, conteo en vivo de resultados y anuncios de estado más claros en comandos y plantillas
- **Acciones accesibles de plantillas** — controles de favorito, renombrar, editar, exportar y eliminar exponen etiquetas y estados localizados usando `aria-pressed`, `aria-selected` y regiones en vivo

#### Rich Presence
- **Privacidad por defecto** — Discord Rich Presence ahora inicia desactivado, y su barra de estado, idioma y controles de privacidad no se muestran hasta que el usuario habilita explícitamente la integración
- **Discord RPC listo para usar** — Tree IDE incluye su ID de aplicación pública de Discord, conecta automáticamente al cliente de escritorio, reporta estado de conexión, reintenta tras desconexiones y no requiere configuración del usuario
- **Estados de actividad específicos** — Editando estructura, Editando código, Editando texto, Viendo archivo, Explorando plantillas, Personalizando plantilla, Configuración y, según construcción, Creando archivo, Creando archivos, Creando carpeta, Creando carpetas, Creando archivo y carpeta, o Creando archivos y carpetas; la opción en Build Studio usa el mismo título y descripción dinámica, mientras las salidas `.tree` quedan disponibles para proyectos válidos y las exportaciones emplean un estado genérico Exportando archivo.
- **Estado de inactividad según editor** — Presence inicia como Inactivo y solo reporta Editando estructura tras interactuar directamente con el editor de estructura; cinco minutos sin interacción retornan a Inactivo con un icono de teclado
- **Tres niveles de privacidad** — Básico solo muestra Tree IDE, Actividad agrega la acción actual, y Detallado puede también mostrar el nombre del proyecto y tipo de archivo; nunca se comparten rutas ni contenidos de archivos
- **Presence consciente de energía** — bloqueo y suspensión borran la actividad, mientras desbloqueo y reanudación la restauran automáticamente
- **Presence localizado** — sigue el idioma de Tree IDE o permite elegir inglés, portugués o español de forma independiente; el ajuste actualiza el RPC de inmediato y se conserva entre sesiones
- **Explicación del alcance de localización** — Discord recibe una carga de actividad localizada, por lo que todos los espectadores ven el idioma de Presence seleccionado por quien publica, no una traducción según el idioma de Discord del espectador

#### Editor, árbol y validación
- **Panel de validación** — identifica mala indentación, nombres inválidos, duplicados, rutas inseguras y estructuras vacías; haz clic en una advertencia para saltar a la línea
- **Deshacer / rehacer** con hasta 100 estados en historial
- **Pestañas para múltiples proyectos** con indicadores de modificación, barra de pestañas desplazable y reordenación por arrastrar y soltar
- **Pestañas de editor de archivos por proyecto** — edita el contenido inicial de archivos antes de construir y reordena archivos abiertos por arrastrar y soltar sin perder la pestaña activa
- **Sincronización de pestañas para archivos eliminados** — eliminar archivos o cambiar extensiones en el editor de estructura ahora cierra todas las pestañas obsoletas, selecciona la pestaña válida más cercana cuando es necesario y evita que contenido eliminado reaparezca
- **Previsualización en vivo de Markdown** para archivos `.md` en el panel de previsualización
- **Carpetas colapsables** en la previsualización del árbol
- **Navegación por teclado en el árbol** — flechas, Home, End y Enter
- **Coincidencia inteligente al renombrar archivos** cuando se editan líneas en el árbol
- **Indentación / desindentación por bloque** con Tab y Shift+Tab, más Backspace inteligente para bloques de indentación
- **Zoom de editor** — `Ctrl++`, `Ctrl+-`, y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, previsualización de archivos) cuyo diseño se conserva entre sesiones

#### Iconos y tipos de archivo
- **Iconos Lucide** incluidos localmente (sin dependencia de CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos comprimidos y multimedia
- **Más de 100 extensiones con etiquetas** en el mapa de tipos de archivo

#### Interfaz y experiencia inicial
- **Ventana personalizada sin marco** con controles de minimizar, maximizar y cerrar
- **Inicio limpio tras primera instalación** — la app permanece oculta hasta que se restaura y pinta la interfaz, mientras la metadata de la versión carga en segundo plano y se evita mostrar una pantalla congelada
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida** en el primer inicio — diseño renovado con encabezado destacado, tarjetas de ajustes agrupadas (General, Apariencia, Sesión) y botón fijo **Empezar**
- **Modal de ajustes** con pestañas: General, Apariencia, Atajos y Actualizaciones
- **Modal de Acerca de** con versión en vivo de la app (evoluciona desde la pantalla de créditos de v1)
- **Diálogo de cambios sin guardar** al cerrar con proyectos modificados
- **Superposición de arrastrar y soltar** para archivos `.tree` y archivos comprimidos
- **Fuentes incluidas** — Inter y JetBrains Mono

#### Diagnósticos orientados a privacidad y reportes en GitHub
- **Formulario estructurado de reporte** — recopila título del problema, descripción, pasos de reproducción y comportamiento esperado en campos localizados, expansibles automáticamente y con contador de caracteres
- **Selector de etiquetas del repositorio** — carga las etiquetas actuales de GitHub con respaldo offline, las muestra en el menú personalizado de la app, agrega la etiqueta seleccionada al título y la preselecciona en el borrador en GitHub
- **Borrador limpio y localizado de problemas** — abre GitHub automáticamente tras un visible retardo, con título, secciones en Markdown y etiqueta elegida ya listos para revisión; haz clic en el aviso o presiona Enter/Espacio para ocultar el mensaje sin alterar el temporizador, y el problema nunca se envía automáticamente
- **Registros de ejecución actual** — incluye solo entradas del último inicio de la aplicación, separando proceso principal y renderer, limitados a 256 KB y marcados con hora localizada de 12 horas, periodo del día y zona horaria
- **Paquete diagnóstico saneado** — protege rutas locales, correos electrónicos, direcciones IP y secretos de URLs, y excluye nombres y contenidos de proyectos
- **Capturas de pantalla interactivas** — tras autorización, oculta el formulario y permite capturar una región o la ventana completa, sigue capturando con `Shift+P` incluso si la barra flotante está colapsada y oculta instrucciones y controles al arrastrar para evitar que cubran el área seleccionada
- **Revisión de capturas antes de guardar** — permite hasta 10 capturas, abre miniaturas a tamaño completo, elimina imágenes no deseadas y guarda cada PNG en el ZIP diagnóstico local; nunca se capturan el escritorio ni otras ventanas
- **Adjuntos locales primero** — guarda el ZIP en la ubicación elegida por el usuario, sin abrir el explorador ni subir archivos; los registros y capturas permanecen locales hasta que se adjunten manualmente
- **Modal de reporte más seguro** — seleccionar texto y arrastrar ya no cierra el diálogo, los campos se ajustan automáticamente, el contraste de temas claro/oscuro sigue el resto de la app y el formulario se reinicia tras éxito, Cancelar o cerrar con X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en primer inicio** en el flujo de bienvenida y ajustes
- **Traducciones en proceso principal** para diálogos nativos y mensajes de error
- **Script `npm run i18n:validate`** para mantener archivos locales sincronizados

#### Persistencia de sesión
- **Almacenamiento de sesión en IndexedDB** con migración automática desde el antiguo `localStorage`
- **Guardado automático** de pestañas abiertas, contenidos de archivos y nombres de proyectos
- **Modos de sesión** — restaurar la última sesión al iniciar o comenzar siempre en limpio

#### Actualizador automático y notas de versión
- **Actualizador automático integrado** — consulta GitHub Releases, descarga con progreso y reinicia para instalar
- **Canales de actualización estable y beta**
- **Notas de versión localizadas** en el modal de actualización (inglés, portugués y español)
- **Changelog de actualización legible** — diálogo más amplio, **Novedades** expandido por defecto, área de desplazamiento dedicada, jerarquía de títulos más clara y botones de acción fijos en el pie
- **Flujo manual para `docs/changelog.md`** — edita las notas de versión en el repositorio; CI las traduce para la app y publica inglés en GitHub
- **Notas de versión divididas** — el modal de actualización de la app muestra solo el changelog; los enlaces de navegación de idiomas aparecen en `docs/changelog.md` y la descripción de la versión en GitHub (apuntando a archivos legibles en `docs/changelogs/`); el enlace para comparar (`Full Changelog`) es solo para GitHub
- **Traducción con GitHub Models** — las notas de versión en portugués y español se generan en CI vía la API `models.github.ai`

#### Atajos de teclado
- **Atajos totalmente configurables** con interfaz para capturarlos y acción para restaurar predeterminados
- Nuevos atajos predeterminados incluyen `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (guardar todo) y atajos de zoom de editor

#### Plataformas y distribución
- **Windows x64** — instalador NSIS y paquetes portables; instalador multilingüe (inglés, portugués y español)
- **Releases en GitHub** publicados automáticamente en versiones mediante CI
- **Construcción del renderer antes de empaquetar** — `beforePack` ejecuta `vite build` y valida `dist/renderer/` para que todos los instaladores incluyan el paquete UI

#### Arquitectura, herramientas de desarrollo y calidad
- **Build de renderer con Vite** y recarga de módulos en desarrollo
- **Código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` y 20 módulos CSS
- **ES modules**, Node.js 24+, Electron 42
- **Handlers IPC divididos** para proyecto, actualizaciones y ciclo de vida de la app
- **API preload `contextBridge`** para proteger el límite del renderer
- **Test suite con Vitest** y mocks de Electron para ejecuciones amigables con CI; helpers de changelog y errores del updater cubiertos por tests dedicados
- **ESLint y Prettier** integrados en los scripts npm
- **electron-reloader** para hot reload del proceso principal en desarrollo
- **Exportación de registro de errores** en caso de crash para facilitar la depuración
- **`semver`** como dependencia directa para comparación fiable de versiones en la app
