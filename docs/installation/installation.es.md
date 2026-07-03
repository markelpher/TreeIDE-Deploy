# Guía de instalación de Tree IDE

[English](installation.md) · [Português](installation.pt-BR.md) · [README principal](../README.es.md)

Esta guía explica cómo instalar, actualizar y desinstalar Tree IDE en todos los sistemas y formatos compatibles.

## Elige la descarga correcta

Descarga Tree IDE desde la página de Releases de GitHub:

```text
https://github.com/markelpher/TreeIDE-Deploy/releases
```

Elige el archivo que coincida con tu sistema operativo y arquitectura.

| Sistema | Archivo recomendado | Cuándo usarlo |
| --- | --- | --- |
| Windows x64 / ARM64 | `Tree-IDE-Setup-{version}-win-{arch}.exe` | Mejor opción para la mayoría de usuarios |
| Windows x64 / ARM64 | `Tree-IDE-{version}-win-{arch}.msi` | Instalación administrada, TI o entornos empresariales |
| Windows x64 / ARM64 | `Tree-IDE-Portable-{version}-win-{arch}.exe` | Ejecutar sin instalar |
| Ubuntu, Debian, Linux Mint | `Tree-IDE-{version}-{arch}.deb` | Instalación nativa en distribuciones basadas en Debian |
| Fedora, RHEL, openSUSE | `Tree-IDE-{version}-{arch}.rpm` | Instalación nativa en distribuciones basadas en RPM |
| Mayoría de distribuciones Linux | `Tree-IDE-{version}-{arch}.AppImage` | App portátil sin instalación del sistema |
| Mayoría de distribuciones Linux | `Tree-IDE-{version}-{arch}.tar.gz` | Instalación portátil con launcher y autoactualización |
| Linux con Snap | `Tree-IDE-{version}-{arch}.snap` | Instalación Snap local |
| Linux con Flatpak | `Tree-IDE-{version}-{arch}.flatpak` | Bundle Flatpak local |
| macOS Apple Silicon | `Tree-IDE-{version}-macOS-arm64.dmg` | Instalación estándar de macOS |
| macOS Apple Silicon | `Tree-IDE-{version}-macOS-arm64.zip` | App macOS manual/portable |

`{arch}` normalmente es `x64` para PCs Intel/AMD y `arm64` para dispositivos ARM.

## Windows

### Recomendado: instalador NSIS

1. Descarga `Tree-IDE-Setup-{version}-win-x64.exe` o `Tree-IDE-Setup-{version}-win-arm64.exe`.
2. Haz doble clic en el instalador.
3. Si aparece Windows SmartScreen, elige **Más información** y luego **Ejecutar de todas formas** solo si descargaste el archivo desde la release oficial.
4. Elige la carpeta de instalación.
5. Finaliza el instalador y abre Tree IDE.

### MSI

Usa MSI cuando necesites un paquete Windows Installer predecible.

```powershell
msiexec /i Tree-IDE-{version}-win-x64.msi
```

Instalación silenciosa:

```powershell
msiexec /i Tree-IDE-{version}-win-x64.msi /qn
```

### Portable

1. Descarga `Tree-IDE-Portable-{version}-win-{arch}.exe`.
2. Muévelo a una carpeta donde guardes apps portables.
3. Haz doble clic para abrir Tree IDE.

Las builds portables no crean una instalación normal del sistema.

### Actualizar en Windows

Las builds instaladas pueden usar el actualizador interno:

1. Abre Tree IDE.
2. Ve a **Configuración -> Actualizaciones**.
3. Haz clic en **Buscar actualizaciones**.
4. Descarga e instala cuando se solicite.

En builds portables, descarga el nuevo `.exe` portable y reemplaza el anterior.

### Desinstalar en Windows

Usa **Configuración -> Aplicaciones -> Aplicaciones instaladas -> Tree IDE -> Desinstalar**, o ejecuta el desinstalador desde la carpeta de instalación.

## Linux

Tree IDE ofrece varios formatos porque cada distribución Linux maneja apps de escritorio de forma distinta.

Si tienes dudas, usa:

- `.deb` en Ubuntu, Debian, Linux Mint, Pop!_OS, Zorin OS.
- `.rpm` en Fedora, RHEL, Rocky Linux, AlmaLinux, openSUSE.
- `.AppImage` si quieres una app portable.
- `.tar.gz` si quieres el flujo de actualización mediante launcher.

### Ubuntu, Debian, Linux Mint: DEB

Descarga:

```text
Tree-IDE-{version}-x64.deb
```

Instala desde la terminal:

```bash
sudo apt install ./Tree-IDE-{version}-x64.deb
```

En ARM64:

```bash
sudo apt install ./Tree-IDE-{version}-arm64.deb
```

No dependas de Ubuntu App Center para actualizar `.deb` locales. Puede abrir el paquete, pero fallar al actualizar un paquete local ya instalado. La forma confiable es terminal con `apt install ./archivo.deb`.

Actualizar:

1. Abre Tree IDE.
2. Ve a **Configuración -> Actualizaciones**.
3. Haz clic en **Buscar actualizaciones**.
4. Tree IDE descarga el `.deb` correcto.
5. Aparece el permiso del sistema.
6. Confirma para que `apt` instale la actualización.

Alternativa manual:

```bash
sudo apt install ./Tree-IDE-{nueva-version}-x64.deb
```

Desinstalar:

```bash
sudo apt remove tree-ide
```

### Fedora, RHEL, Rocky Linux, openSUSE: RPM

Instalación en Fedora/RHEL:

```bash
sudo dnf install ./Tree-IDE-{version}-x64.rpm
```

Instalación en openSUSE:

```bash
sudo zypper install ./Tree-IDE-{version}-x64.rpm
```

Alternativa genérica:

```bash
sudo rpm -Uvh --replacepkgs ./Tree-IDE-{version}-x64.rpm
```

Actualizar:

1. Usa **Configuración -> Actualizaciones** dentro de Tree IDE.
2. Tree IDE descarga el `.rpm` correcto.
3. Inicia la instalación del paquete con permisos elevados.

Desinstalar:

```bash
sudo dnf remove tree-ide
```

o:

```bash
sudo zypper remove tree-ide
```

### AppImage

AppImage es portable y no requiere instalación.

1. Descarga `Tree-IDE-{version}-x64.AppImage`.
2. Dale permiso de ejecución:

```bash
chmod +x Tree-IDE-{version}-x64.AppImage
```

3. Ejecútalo:

```bash
./Tree-IDE-{version}-x64.AppImage
```

Actualizar:

Tree IDE puede reemplazar el AppImage actual cuando se ejecuta desde AppImage. Usa **Configuración -> Actualizaciones**.

Desinstalar:

Elimina el archivo `.AppImage`. Si creaste accesos de menú manualmente, elimínalos también.

### Instalación con launcher tar.gz

El paquete `.tar.gz` es la mejor opción Linux si quieres una instalación portable con actualización mediante launcher.

1. Descarga `Tree-IDE-{version}-x64.tar.gz`.
2. Extráelo:

```bash
mkdir -p ~/.local/share/tree-ide/manual
tar -xzf Tree-IDE-{version}-x64.tar.gz -C ~/.local/share/tree-ide/manual
```

3. Busca y ejecuta el launcher:

```bash
~/.local/share/tree-ide/manual/tree-ide-launcher
```

Según la estructura extraída, el launcher puede estar dentro de la carpeta extraída de Tree IDE.

Actualizar:

1. Inicia Tree IDE mediante `tree-ide-launcher`.
2. Usa **Configuración -> Actualizaciones**.
3. Tree IDE descarga el `.tar.gz` correcto.
4. El launcher extrae la nueva versión en una carpeta versionada y cambia el enlace `current`.

Este flujo no necesita permisos root.

Desinstalar:

```bash
rm -rf ~/.local/share/tree-ide
```

### Snap

Instalar un paquete Snap local:

```bash
sudo snap install --dangerous ./Tree-IDE-{version}-x64.snap
```

Actualizar un Snap local ya instalado:

```bash
sudo snap install --dangerous --amend ./Tree-IDE-{version}-x64.snap
```

Tree IDE usa el flujo con `--amend` al instalar actualizaciones descargadas.

Desinstalar:

```bash
sudo snap remove tree-ide
```

### Flatpak

Instalar un bundle Flatpak local:

```bash
flatpak install --user ./Tree-IDE-{version}-x86_64.flatpak
```

Instalación para todo el sistema:

```bash
sudo flatpak install ./Tree-IDE-{version}-x86_64.flatpak
```

Ejecutar:

```bash
flatpak run com.treeide.treeide
```

Actualizar/reinstalar un bundle Flatpak local:

```bash
flatpak install --reinstall ./Tree-IDE-{version}-x86_64.flatpak
```

Desinstalar:

```bash
flatpak uninstall com.treeide.treeide
```

## macOS

Tree IDE soporta Macs Apple Silicon (`arm64`). Los Macs Intel no son compatibles.

### DMG

1. Descarga `Tree-IDE-{version}-macOS-arm64.dmg`.
2. Abre el `.dmg`.
3. Arrastra **Tree IDE** a **Applications**.
4. Abre Tree IDE desde Applications.

Si macOS bloquea la app, abre **System Settings -> Privacy & Security** y permítela solo si la descargaste desde la release oficial.

### ZIP

1. Descarga `Tree-IDE-{version}-macOS-arm64.zip`.
2. Extráelo.
3. Mueve `Tree IDE.app` a Applications u otra carpeta.
4. Abre la app.

### Actualizar en macOS

Usa **Configuración -> Actualizaciones** dentro de Tree IDE. Si no está disponible, descarga el `.dmg` más reciente y reemplaza la app en Applications.

### Desinstalar en macOS

1. Cierra Tree IDE.
2. Elimina `Tree IDE.app` de Applications.
3. Opcional: elimina los datos de `~/Library/Application Support/Tree IDE`.

## Solución de problemas

### La app no inicia en Linux

Ejecútala desde una terminal para ver el error:

```bash
tree-ide
```

o, para AppImage:

```bash
./Tree-IDE-{version}-x64.AppImage
```

### Ubuntu abre el paquete en App Center

Usa la instalación por terminal:

```bash
sudo apt install ./Tree-IDE-{version}-x64.deb
```

Esto evita el problema de actualización de paquetes locales en App Center.

### No aparece el prompt de permiso durante la actualización

Instala `pkexec` o confirma que `sudo` esté disponible:

```bash
sudo apt install policykit-1
```

Luego intenta actualizar otra vez.

### Qué archivo Linux elegir

Regla rápida:

| Distribución | Elige |
| --- | --- |
| Ubuntu/Debian/Linux Mint | `.deb` |
| Fedora/RHEL/openSUSE | `.rpm` |
| Cualquier distro, sin instalar | `.AppImage` |
| Cualquier distro, mejor autoactualización | `.tar.gz` |
| Usuarios Snap | `.snap` |
| Usuarios Flatpak | `.flatpak` |

## Verificar la instalación

Abre Tree IDE y revisa **Configuración -> Actualizaciones** o **Acerca de Tree IDE**. La versión mostrada debe coincidir con la release instalada.
