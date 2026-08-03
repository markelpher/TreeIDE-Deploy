<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->

## Qué hay de nuevo en v2.0.114

Tree IDE v2 es una versión completely rehecha y expandida de la aplicación original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). La misma idea básica — diseñar estructuras de carpetas en texto plano, visualizarlas en tiempo real y generar proyectos — con una nueva arquitectura, herramientas más ricas y lanzamientos exclusivos para Windows.

### Agregado

#### Instalación, almacenamiento y protección de paquetes
- **Opciones de retención de datos explícitas** — instalar manualmente sobre una versión existente de Tree IDE y desinstalar ahora presentan opciones claras de Conservar o Eliminar, con Conservar seleccionada por defecto
- **Configuración de instalación sabia** — la elección de datos se omite cuando no existe un perfil de Tree IDE anterior ni datos de actualizador, y no interrumpe las actualizaciones automáticas silenciosas
- **Flujo de datos asistido correcto** — las instalaciones manuales sobre una versión existente y la desinstalación ahora muestran las opciones Conservar/Eliminar; las actualizaciones silenciosas en la aplicación omiten la solicitud y conservan los datos
- **Bienvenida después de la elección de datos** — la configuración inicial aparece para un perfil fresco o después de seleccionar Eliminar, mientras que seleccionar Conservar conserva el estado de configuración inicial completado
- **Acción de finalización del desinstalador correcta** — la página final ahora etiqueta su botón principal como Finalizar en lugar de Siguiente en inglés, portugués y español
- **Paquete de producción protegido** — el código de la aplicación sigue organizado en `app.asar`, ahora con validación de integridad y carga de ASAR de Electron restringida al archivo validado
- **Entorno de ejecución x64 de Windows optimizado** — se eliminaron las herramientas de cadena de herramientas de empaquetado Squirrel no utilizadas y los binarios de 7-Zip no Windows/no x64 de los archivos de la aplicación distribuidos
- **Limpieza opcional completa** — eliminar datos cubre preferencias, caché, registros, sesión guardada, carpetas de perfil actuales y heredadas, y datos de actualizador

#### Estudio de compilación y salida de proyectos
- **Estudio de compilación** — flujo de compilación a pantalla completa con vista previa en vivo del árbol, vista previa de contenido por archivo, estadísticas y opciones de salida
- **Tres modos de salida** — crear estructura de carpeta en disco, exportar un ZIP solo o exportar un archivo de proyecto `.tree` solo
- **Salidas combinadas** — exportar un ZIP junto con una compilación de carpeta y incluir el archivo `.tree` dentro del archivo
- **Botón Crear con ZIP que comprende el contenido** — las compilaciones de carpetas y ZIP combinadas ahora etiquetan la acción como Crear archivo, Archivos, Carpeta, Carpetas, Archivo y carpeta, o Archivos y carpetas seguidos de `+ ZIP`, en función de la estructura seleccionada
- **Inspección previa a la compilación** — escanear la carpeta de destino en busca de estructura existente, archivos `.tree` o ZIP antes de escribir
- **Control de conflictos** — elegir omitir o sobrescribir cuando ya existen archivos o carpetas
- **Contenido de inicio predeterminado** para 68+ tipos de archivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, etc.)
- **Marcadores de internacionalización** en los archivos generados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archivos y cifrado
- **Compatibilidad con archivos de Tree IDE 1** — Tree IDE 1 identifica el formato de archivo `.tree` de primera generación utilizado por Tree IDE Legacy; los archivos originales sin encabezado en UTF-8 siguen siendo legibles con ambos estilos de sangría de pestañas y `...`
- **Exportación de ZIP** con protección de contraseña AES-256 opcional a través de 7-Zip
- **Proyectos `.tree` cifrados de alta resistencia** — TREEIDE2 usa AES-256-GCM autenticado con Argon2id (256 MiB, 4 pasadas, 4 carriles), autentica su encabezado criptográfico y mantiene el formato de archivo sin encabezado de Tree IDE Legacy original como generación 1
- **Protección de `.tree` explícita** — una casilla de verificación dedicada habilita los campos de contraseña y confirmación deshabilitados, explica que se aplicará el cifrado TREEIDE2 y muestra la advertencia de contraseña no recuperable solo mientras la protección está seleccionada
- **Importación de archivo** a través del diálogo de archivo o arrastre y soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` y `.7z`
- **Solicitudes de contraseña** para archivos ZIP cifrados y archivos `.tree` cifrados
- **Cargar carpeta como estructura** — escanear un directorio existente y convertirlo en texto de árbol editable

#### Plantillas
- **19 plantillas de inicio integradas** agrupadas por categoría:
  - Frontend: HTML, HTML y CSS, HTML/CSS/JS, React, Vite + React
  - Pilas: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativos: C, C++, C#
- **Pantalla de plantillas** — navegador de tres columnas a pantalla completa con pestañas integradas y personalizadas, edición de estructura en línea y vista previa en vivo del árbol
- **Plantillas personalizadas** — crear en blanco, importar desde el proyecto actual, cambiar nombre, editar contenido de archivo en línea, abrir en el editor principal, exportar o eliminar sin abandonar la pantalla
- **Archivos de plantilla `.tree-template`** — exportar e importar plantillas personalizadas compartibles (JSON `treeide-template` v1) a través de diálogos de guardar/abrir nativos o exportar por fila en la lista personalizada
- **Pie de página de plantillas personalizadas** — cuando existen plantillas personalizadas: **Nueva plantilla**, **Desde proyecto actual** e **Importar `.tree-template`**; el estado vacío ofrece inicio en blanco, importación de proyecto e importación de archivo
- **Vista previa de archivo por archivo** — hacer clic en un archivo en la vista previa de la estructura abre un panel de editor de ancho completo con badges de tipo de archivo (diseño de panel único para plantillas integradas y personalizadas)
- **Búsqueda de plantillas** — filtrar plantillas integradas y personalizadas a medida que escribe, con coincidencia insensible a mayúsculas yacentes y comentarios y comentarios localizados para resultados vacíos
- **Plantillas favoritas** — marcar plantillas con una estrella Lucide empaquetada localmente, navegar por ellas en una pestaña de favoritos dedicada y mantener la selección entre sesiones de la aplicación

#### Paleta de comandos y accesibilidad
- **Paleta de comandos expandida** — usar `Ctrl+Shift+P` para buscar 23 acciones, agregando Guardar todo, Deshacer, Rehacer, Nueva pestaña, pestaña de proyecto siguiente/anterior, cerrar pestaña de proyecto/archivo, Recargar, controles de zoom, Buscar actualizaciones y Acerca de las acciones de proyecto, compilación, configuración, pantalla completa y informes existentes
- **Comandos contextualmente conscientes** — Guardar todo y las acciones de la pestaña del proyecto/archivo siguen siendo visibles para la descubribilidad pero se deshabilitan cuando la sesión actual no puede ejecutarlos de manera segura
- **Flujo de comandos de teclado primero** — las teclas de flecha cambiar el comando activo, Enter lo ejecuta, Escape cierra la paleta y el foco regresa al control anterior
- **Soporte mejorado de lector de pantalla** — nombres de acceso localizados, patrones de combobox/listbox/tab semánticos, seguimiento de ascendiente activo, recuentos de resultados en vivo y anuncios de estado más claros en comandos y plantillas
- **Acciones de plantilla accesibles** — controles de favorito, cambiar nombre, editar, exportar y eliminar exponen etiquetas y estado localizados a través de `aria-pressed`, `aria-selected` y regiones en vivo

#### Presencia rica
- **Privacidad por defecto** — la presencia rica de Discord ahora comienza deshabilitada, y su barra de estado, idioma y controles de privacidad siguen siendo inaccesibles hasta que el usuario habilite explícitamente la integración
- **RPC de Discord listo para usar** — Tree IDE se envía con su ID de aplicación de Discord público, se conecta automáticamente al cliente de escritorio en ejecución, informa el estado de conexión, vuelve a intentarlo después de desconexiones y no requiere configuración del usuario
- **Estados de actividad específicos** — Edición de estructura, Edición de código, Edición de texto, Visualización de archivo, Navegación de plantillas, Personalización de plantilla, Configuración y estados de creación de archivo conscientes de la compilación; la opción de Estudio de compilación utiliza el mismo título y descripción dinámicos, mientras que las salidas `.tree` siguen siendo disponibles para proyectos planos válidos y las exportaciones utilizan un solo estado de exportación de archivo genérico.
- **Estado de inactividad consciente del editor** — la presencia comienza como Inactivo y solo informa Edición de estructura después de la interacción directa con el editor de estructura; cinco minutos sin interacción regresan a Inactivo con un icono de teclado
- **Tres niveles de privacidad** — Básico muestra solo Tree IDE, Actividad agrega la acción actual y Detallado también puede mostrar el nombre del proyecto y el tipo de archivo; las rutas de archivos y el contenido nunca se comparten
- **Presencia consciente de energía** — bloquear y suspender borran la actividad, mientras que desbloquear y reanudar la restauran automáticamente
- **Presencia localizada** — seguir el idioma de Tree IDE o elegir inglés, portugués o español de forma independiente; la configuración actualiza el RPC inmediatamente y persiste entre sesiones
- **Alcance de presencia explicado** — Discord recibe una carga útil de actividad localizada, por lo que cada espectador ve la carga útil de presencia seleccionada por el publicador en lugar de una traducción basada en la configuración regional de Discord del espectador

#### Editor, árbol y validación
- **Panel de validación** — sangría incorrecta, nombres inválidos, hermanos duplicados, rutas no seguras y estructuras vacías; hacer clic en una advertencia salta a la línea
- **Deshacer / rehacer** con hasta 100 estados de historia
- **Pestañas de proyectos múltiples** con indicadores de modificación, barra de pestañas desplazable y reordenar con arrastre y soltar
- **Pestañas de editores de archivos por proyecto** — editar los contenidos de los archivos de inicio antes de la compilación y reorganizar los archivos abiertos con arrastre y soltar mientras se mantiene la pestaña activa
- **Sincronización de pestaña de archivo eliminado** — eliminar archivos o cambiar extensiones en el editor de estructura ahora cierra cada pestaña de archivo obsoleta, selecciona la pestaña válida más cercana cuando sea necesario y evita que el contenido eliminado reaparezca
- **Vista previa en vivo de Markdown** para archivos `.md` en el panel de vista previa de archivos
- **Carpetas plegables** en la vista previa del árbol
- **Navegación del teclado del árbol** — teclas de flecha, Inicio, Fin y Enter
- **Coincidencia de nombre de archivo inteligente** cuando las líneas del árbol se editan
- **Sangría de bloque / desindentación** con Tabulador y Mayús+Tabulador, más Backspace inteligente para bloques de sangría
- **Zoom del editor** — `Ctrl++`, `Ctrl+-` y `Ctrl+0`
- **Paneles redimensionables** (editor, árbol, vista previa de archivos) con diseño persistente entre sesiones

#### Iconos y tipos de archivos
- **Iconos de Lucide** empaquetados localmente (no dependen de CDN)
- **Iconos contextuales** para carpetas comunes, lenguajes de programación, Docker, archivos de configuración, archivos y multimedia
- **Etiquetas de extensiones de archivo de 100+** en el mapa de tipo de archivo

#### Interfaz de usuario y experiencia de primera ejecución
- **Ventana sin marco personalizada** con controles de minimizar, maximizar y cerrar
- **Lanzamiento de instalación limpia** — la aplicación permanece oculta hasta que la interfaz restaurada ha terminado su primera pintura, mientras se carga los metadatos de la versión en línea en segundo plano en lugar de exponer una pantalla de inicio congelada
- **Barra de menú** — Archivo, Editar, Ver, Ventana y Acerca de
- **Modal de bienvenida** en la primera ejecución — diseño de layout rehecho con encabezado de héroe, tarjetas de configuración agrupadas (General, Apariencia, Sesión) y un botón **Empezar** anclado
- **Modal de configuración** con pestañas: General, Apariencia, Accesos directos y Actualizaciones
- **Modal de Acerca de** con la versión de la aplicación en vivo (evolucionada de la pantalla de créditos de v1)
- **Diálogo de cambios no guardados** al cerrar con proyectos modificados
- **Superficie de arrastre y soltar** para archivos `.tree` y archivos
- **Fuentes empaquetadas** — Inter y JetBrains Mono

#### Diagnósticos de privacidad y informes de GitHub
- **Formulario de informe estructurado** — recopilar título del problema, descripción del problema, paso de reproducción y comportamiento esperado en campos localizados, autoampliables con contadores de caracteres
- **Selector de etiquetas de repositorio** — cargar las etiquetas de GitHub actuales con un estado de desconexión, mostrarlas traducidas al idioma de la aplicación, agregar la etiqueta seleccionada al prefijo del título y preseleccionarla en el borrador de GitHub
- **Borrador de problema localizado limpio** — abrir GitHub automáticamente después de un retraso de redirección visible con el título, secciones de Markdown y etiqueta seleccionada ya rellenada para revisión; hacer clic en el pop-up o presionar Entrar/Espacio para ocultar el aviso sin cambiar el temporizador, y el problema nunca se envía automáticamente
- **Registros de ejecución actual** — incluir solo entradas de registro de la última ejecución de la aplicación, separadas en secciones de proceso principal y procesador, limitadas a 256 KB y marcadas con una marca de tiempo de hora localizada de 12 horas, día y zona horaria
- **Paquete de diagnóstico saneado** — ocultar rutas locales, direcciones de correo electrónico, direcciones IP y secretos de URL mientras se excluyen nombres y contenidos de proyectos
- **Capturas de pantalla interactivas** — después de la participación explícita, ocultar el formulario de problema y capturar una región seleccionada o la ventana de la aplicación completa, seguir tomando capturas de pantalla con `Shift+P` incluso cuando la barra de herramientas flotante está colapsada, y automáticamente ocultar instrucciones y controles mientras se arrastra para que no puedan cubrir el contenido seleccionado
- **Revisión de captura de pantalla antes de guardar** — recopilar hasta 10 capturas, abrir vistas previas de tamaño completo, eliminar imágenes no deseadas y escribir cada imagen retenida PNG en el archivo ZIP de diagnóstico local; la escritorio y otras ventanas nunca se capturan
- **Archivos adjuntos locales primero** — guardar el ZIP en la ruta elegida por el usuario sin abrir el Explorador de archivos o cargarlo; los registros y capturas de pantalla permanecen locales hasta que se adjuntan manualmente
- **Modal de informe seguro** — la selección de texto y el arrastre ya no descartan el diálogo, los campos se redimensionan automáticamente, el contraste de tema claro/oscuro sigue el resto de la aplicación y el formulario se restablece después del éxito, Cancelar o cerrar con el botón X

#### Internacionalización
- **Traducciones de interfaz en inglés, portugués (pt-BR) y español**
- **Selección de idioma en la primera ejecución** en el flujo de bienvenida y configuración
- **Traducciones de proceso principal** para diálogos y mensajes de error nativos
- **Script `npm run i18n:validate`** para mantener los archivos de idioma en sincronización

#### Persistencia de sesión
- **Almacenamiento de sesión IndexedDB** con migración automática desde el almacenamiento de `localStorage` heredado
