# Guia de instalação do Tree IDE

[English](installation.md) · [Español](installation.es.md) · [README principal](../README.pt-BR.md)

Este guia explica como instalar, atualizar e desinstalar o Tree IDE em todos os sistemas e formatos suportados.

## Escolha o download correto

Baixe o Tree IDE pela página de Releases do GitHub:

```text
https://github.com/markelpher/TreeIDE-Deploy/releases
```

Escolha o arquivo compatível com seu sistema operacional e arquitetura.

| Sistema | Arquivo recomendado | Quando usar |
| --- | --- | --- |
| Windows x64 / ARM64 | `Tree-IDE-Setup-{version}-win-{arch}.exe` | Melhor opção para a maioria dos usuários |
| Windows x64 / ARM64 | `Tree-IDE-{version}-win-{arch}.msi` | Instalação gerenciada, TI ou ambiente corporativo |
| Windows x64 / ARM64 | `Tree-IDE-Portable-{version}-win-{arch}.exe` | Rodar sem instalar |
| Ubuntu, Debian, Linux Mint | `Tree-IDE-{version}-{arch}.deb` | Instalação nativa em distros baseadas em Debian |
| Fedora, RHEL, openSUSE | `Tree-IDE-{version}-{arch}.rpm` | Instalação nativa em distros baseadas em RPM |
| Maioria das distros Linux | `Tree-IDE-{version}-{arch}.AppImage` | App portátil sem instalação no sistema |
| Maioria das distros Linux | `Tree-IDE-{version}-{arch}.tar.gz` | Instalação portátil com launcher e atualização própria |
| Linux com Snap | `Tree-IDE-{version}-{arch}.snap` | Instalação Snap local |
| Linux com Flatpak | `Tree-IDE-{version}-{arch}.flatpak` | Bundle Flatpak local |
| macOS Apple Silicon | `Tree-IDE-{version}-macOS-arm64.dmg` | Instalação padrão do macOS |
| macOS Apple Silicon | `Tree-IDE-{version}-macOS-arm64.zip` | App macOS manual/portátil |

`{arch}` normalmente é `x64` para PCs Intel/AMD e `arm64` para dispositivos ARM.

## Windows

### Recomendado: instalador NSIS

1. Baixe `Tree-IDE-Setup-{version}-win-x64.exe` ou `Tree-IDE-Setup-{version}-win-arm64.exe`.
2. Dê dois cliques no instalador.
3. Se o Windows SmartScreen aparecer, clique em **Mais informações** e depois **Executar assim mesmo** somente se o arquivo veio da release oficial.
4. Escolha a pasta de instalação.
5. Finalize a instalação e abra o Tree IDE.

### MSI

Use MSI quando precisar de um pacote Windows Installer previsível.

```powershell
msiexec /i Tree-IDE-{version}-win-x64.msi
```

Instalação silenciosa:

```powershell
msiexec /i Tree-IDE-{version}-win-x64.msi /qn
```

### Portátil

1. Baixe `Tree-IDE-Portable-{version}-win-{arch}.exe`.
2. Mova o arquivo para uma pasta de apps portáteis.
3. Dê dois cliques para abrir o Tree IDE.

Builds portáteis não criam uma instalação normal no sistema.

### Atualizar no Windows

Builds instalados podem usar o atualizador interno:

1. Abra o Tree IDE.
2. Vá em **Configurações -> Atualizações**.
3. Clique em **Verificar atualizações**.
4. Baixe e instale quando solicitado.

No build portátil, baixe o novo `.exe` portátil e substitua o antigo.

### Desinstalar no Windows

Use **Configurações -> Aplicativos -> Aplicativos instalados -> Tree IDE -> Desinstalar**, ou rode o desinstalador da pasta de instalação.

## Linux

O Tree IDE oferece vários formatos porque cada distribuição Linux trata apps desktop de um jeito.

Se estiver em dúvida, use:

- `.deb` no Ubuntu, Debian, Linux Mint, Pop!_OS, Zorin OS.
- `.rpm` no Fedora, RHEL, Rocky Linux, AlmaLinux, openSUSE.
- `.AppImage` se quiser um app portátil.
- `.tar.gz` se quiser o caminho de atualização por launcher.

### Ubuntu, Debian, Linux Mint: DEB

Baixe:

```text
Tree-IDE-{version}-x64.deb
```

Instale pelo terminal:

```bash
sudo apt install ./Tree-IDE-{version}-x64.deb
```

Em ARM64:

```bash
sudo apt install ./Tree-IDE-{version}-arm64.deb
```

Evite depender da Ubuntu App Center para atualizar `.deb` local. Ela pode abrir o pacote, mas falhar ao atualizar um pacote local já instalado. O caminho confiável é instalar pelo terminal com `apt install ./arquivo.deb`.

Atualizar:

1. Abra o Tree IDE.
2. Vá em **Configurações -> Atualizações**.
3. Clique em **Verificar atualizações**.
4. O Tree IDE baixa o `.deb` correto.
5. O prompt de permissão do sistema aparece.
6. Confirme para o `apt` instalar a atualização.

Fallback manual:

```bash
sudo apt install ./Tree-IDE-{nova-versao}-x64.deb
```

Desinstalar:

```bash
sudo apt remove tree-ide
```

### Fedora, RHEL, Rocky Linux, openSUSE: RPM

Instalação em Fedora/RHEL:

```bash
sudo dnf install ./Tree-IDE-{version}-x64.rpm
```

Instalação em openSUSE:

```bash
sudo zypper install ./Tree-IDE-{version}-x64.rpm
```

Fallback genérico:

```bash
sudo rpm -Uvh --replacepkgs ./Tree-IDE-{version}-x64.rpm
```

Atualizar:

1. Use **Configurações -> Atualizações** dentro do Tree IDE.
2. O Tree IDE baixa o `.rpm` correto.
3. Ele inicia a instalação do pacote com permissões elevadas.

Desinstalar:

```bash
sudo dnf remove tree-ide
```

ou:

```bash
sudo zypper remove tree-ide
```

### AppImage

AppImage é portátil e não precisa de instalação.

1. Baixe `Tree-IDE-{version}-x64.AppImage`.
2. Torne executável:

```bash
chmod +x Tree-IDE-{version}-x64.AppImage
```

3. Execute:

```bash
./Tree-IDE-{version}-x64.AppImage
```

Atualizar:

O Tree IDE pode substituir o AppImage atual quando está rodando por AppImage. Use **Configurações -> Atualizações**.

Desinstalar:

Apague o arquivo `.AppImage`. Se você criou atalhos manualmente, remova-os também.

### Instalação por launcher tar.gz

O `.tar.gz` é a melhor opção Linux se você quer instalação portátil com atualização pelo launcher.

1. Baixe `Tree-IDE-{version}-x64.tar.gz`.
2. Extraia:

```bash
mkdir -p ~/.local/share/tree-ide/manual
tar -xzf Tree-IDE-{version}-x64.tar.gz -C ~/.local/share/tree-ide/manual
```

3. Encontre e rode o launcher:

```bash
~/.local/share/tree-ide/manual/tree-ide-launcher
```

Dependendo da estrutura extraída, o launcher pode estar dentro da pasta extraída do Tree IDE.

Atualizar:

1. Inicie o Tree IDE pelo `tree-ide-launcher`.
2. Use **Configurações -> Atualizações**.
3. O Tree IDE baixa o `.tar.gz` correto.
4. O launcher extrai a nova versão em uma pasta versionada e troca o link `current`.

Esse caminho não precisa de root.

Desinstalar:

```bash
rm -rf ~/.local/share/tree-ide
```

### Snap

Instalar pacote Snap local:

```bash
sudo snap install --dangerous ./Tree-IDE-{version}-x64.snap
```

Atualizar Snap local já instalado:

```bash
sudo snap install --dangerous --amend ./Tree-IDE-{version}-x64.snap
```

O Tree IDE usa esse fluxo com `--amend` ao instalar updates baixados.

Desinstalar:

```bash
sudo snap remove tree-ide
```

### Flatpak

Instalar bundle Flatpak local:

```bash
flatpak install --user ./Tree-IDE-{version}-x86_64.flatpak
```

Instalação para todo o sistema:

```bash
sudo flatpak install ./Tree-IDE-{version}-x86_64.flatpak
```

Executar:

```bash
flatpak run com.treeide.treeide
```

Atualizar/reinstalar bundle Flatpak local:

```bash
flatpak install --reinstall ./Tree-IDE-{version}-x86_64.flatpak
```

Desinstalar:

```bash
flatpak uninstall com.treeide.treeide
```

## macOS

O Tree IDE suporta Macs Apple Silicon (`arm64`). Macs Intel não são suportados.

### DMG

1. Baixe `Tree-IDE-{version}-macOS-arm64.dmg`.
2. Abra o `.dmg`.
3. Arraste **Tree IDE** para **Applications**.
4. Abra o Tree IDE pela pasta Applications.

Se o macOS bloquear o app, abra **System Settings -> Privacy & Security** e permita somente se o arquivo veio da release oficial.

### ZIP

1. Baixe `Tree-IDE-{version}-macOS-arm64.zip`.
2. Extraia.
3. Mova `Tree IDE.app` para Applications ou outra pasta.
4. Abra o app.

### Atualizar no macOS

Use **Configurações -> Atualizações** dentro do Tree IDE. Se não estiver disponível, baixe o `.dmg` mais recente e substitua o app em Applications.

### Desinstalar no macOS

1. Feche o Tree IDE.
2. Apague `Tree IDE.app` de Applications.
3. Opcional: remova os dados em `~/Library/Application Support/Tree IDE`.

## Solução de problemas

### O app não inicia no Linux

Rode pelo terminal para ver o erro:

```bash
tree-ide
```

ou, no AppImage:

```bash
./Tree-IDE-{version}-x64.AppImage
```

### Ubuntu abre o pacote na App Center

Use instalação pelo terminal:

```bash
sudo apt install ./Tree-IDE-{version}-x64.deb
```

Isso evita o problema de update de pacote local na App Center.

### O prompt de permissão não aparece durante update

Instale `pkexec` ou confirme que `sudo` está disponível:

```bash
sudo apt install policykit-1
```

Depois tente atualizar novamente.

### Qual arquivo Linux eu escolho?

Regra rápida:

| Distribuição | Escolha |
| --- | --- |
| Ubuntu/Debian/Linux Mint | `.deb` |
| Fedora/RHEL/openSUSE | `.rpm` |
| Qualquer distro, sem instalar | `.AppImage` |
| Qualquer distro, melhor auto-update | `.tar.gz` |
| Usuários Snap | `.snap` |
| Usuários Flatpak | `.flatpak` |

## Verificar a instalação

Abra o Tree IDE e confira **Configurações -> Atualizações** ou **Sobre o Tree IDE**. A versão exibida deve bater com a release instalada.
