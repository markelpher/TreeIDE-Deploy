# Tree IDE

[Inglês](../README.md) · [Espanhol](README.es.md)

Um aplicativo desktop leve para projetar estruturas de projeto em texto, visualiza-las como uma arvore interativa e gerar pastas, arquivos iniciais e arquivos ZIP em poucos cliques.

![Tree IDE Interface](https://github.com/markelpher/TreeIDE-Deploy/blob/main/assets/preview.png)

## Funcionalidades

- **Visualizacao em arvore** — escreva uma estrutura em texto simples e veja o resultado instantaneamente
- **Geracao de projeto** — crie pastas e arquivos em um diretorio de saida selecionado
- **Exportacao ZIP e tar.gz** — empacote a estrutura atual apos a construcao ou sob demanda
- **Extracao de arquivos** — extraia ZIP, tar.gz, RAR e 7z via arrastar e soltar
- **Templates iniciais** — insira estruturas prontas para Node.js, React, Python, MVC e sites estaticos
- **Pre-visualizacao de arquivos** — inspecione o conteudo gerado antes de construir
- **Validacao** — detecte indentacao incorreta, nomes duplicados, caminhos invalidos e estruturas vazias antes de escrever os arquivos
- **Icones inteligentes** — icones contextuais para pastas comuns, linguagens de programacao, midia, arquivos e configuracao
- **Desfazer e refazer** — historico completo de undo e redo para edicao da arvore
- **Sessoes persistentes** — projetos sao salvos automaticamente no IndexedDB
- **Inglês, Portugues e Espanhol** — traducao integrada da interface com selecao de idioma no primeiro uso
- **Temas e configuracoes** — temas claro e escuro, selecao de pasta de saida e sessoes salvas automaticamente
- **Atualizador automatico** — verifique versoes no GitHub Releases, baixe atualizacoes no app e reinicie para instalar

## Sintaxe da Estrutura

O Tree IDE usa um formato simples baseado em indentacao. Use tabs ou grupos de quatro espacos para aninhar itens.

```text
meu-projeto/
    src/
        main.js
        utils.ts
    assets/
        logo.png
        preview.png
    README.md
    package.json
```

Pastas podem terminar com `/` para clareza. O Tree IDE tambem detecta pastas quando elas contem filhos aninhados.

## Fluxo de Trabalho

1. Escreva ou cole uma estrutura de projeto no editor
2. Revise a visualizacao em arvore e o painel de validacao
3. Escolha uma pasta de saida nas configuracoes
4. Clique em **Build** para criar a estrutura
5. Opcionalmente exporte a mesma estrutura como arquivo ZIP ou tar.gz

Voce tambem pode comecar pelo painel de Templates e personalizar a arvore gerada e o conteudo dos arquivos antes de construir.

## Atalhos do Teclado

| Atalho | Acao |
| --- | --- |
| `Ctrl + S` | Salvar projeto `.tree` atual |
| `Ctrl + Shift + S` | Salvar projeto como |
| `Ctrl + O` | Abrir projeto |
| `Ctrl + N` | Novo projeto |
| `Ctrl + R` | Recarregar app |
| `Ctrl + +` / `Ctrl + -` | Aumentar / diminuir zoom |
| `Ctrl + 0` | Resetar zoom |
| `F11` | Tela cheia |
| `Tab` | Aumentar indentacao |
| `Shift + Tab` | Diminuir indentacao |

## Desenvolvimento

Clone o repositorio e instale as dependencias:

```bash
git clone https://github.com/markelpher/TreeIDE-Deploy.git
cd TreeIDE-Deploy
npm install
```

Execute o app localmente:

```bash
npm start
```

Execute os testes:

```bash
npm test
```

### Windows (x64 + arm64)

```bash
npm run build
```

Em hosts arm64, adicione `--arm64` para gerar pacotes ARM64: `vite build && electron-builder --win nsis msi portable --arm64`.

| Identificador Windows | Valor |
| --- | --- |
| ID de aplicativo | `com.treeide.treeide` |
| Nome do executavel | `Tree IDE` |
| Idiomas do instalador | Ingles (`en_US`), Portugues (`pt_BR`), Espanhol (`es_ES`) |
| Metadados do atualizador | `latest.yml` (x64), `latest-arm64.yml` (arm64) |
| Workflow de CI | `Build Windows` — `.github/workflows/windows-build.yml` |
| Nomes dos artefatos na CI | `tree-ide-windows-x64`, `tree-ide-windows-arm64` |
| Arquivos de release (x64 / arm64) | `Tree-IDE-Setup-{version}-win-{arch}.exe` (NSIS), `Tree-IDE-{version}-win-{arch}.msi`, `Tree-IDE-Portable-{version}-win-{arch}.exe` |

### Linux (x64 + arm64)

```bash
vite build && electron-builder --linux AppImage deb snap
```

Em hosts arm64, adicione `--arm64` para gerar pacotes ARM64. Bundles Flatpak sao construidos separadamente na CI.

| Identificador Linux | Valor |
| --- | --- |
| ID de aplicativo | `com.treeide.treeide` |
| Entrada desktop | `com.treeide.treeide.desktop` |
| Categoria do app | `Development` |
| Metadados do atualizador | `latest-linux.yml` (x64), `latest-linux-arm64.yml` (arm64) |
| Workflow de CI | `Build Linux` — `.github/workflows/linux-build.yml` |
| Nomes dos artefatos na CI | `tree-ide-linux-x64`, `tree-ide-linux-arm64`, `tree-ide-linux-flatpak-x64`, `tree-ide-linux-flatpak-arm64` |
| Arquivos de release (x64) | `Tree-IDE-{version}-x64.AppImage`, `.deb`, `.snap`, `Tree-IDE-{version}-x86_64.flatpak` |
| Arquivos de release (arm64) | `Tree-IDE-{version}-arm64.AppImage`, `.deb`, `Tree-IDE-{version}-aarch64.flatpak` |

### macOS (Apple Silicon / arm64)

```bash
npm run build:mac
```

Macs Intel nao sao suportados.

| Identificador macOS | Valor |
| --- | --- |
| Bundle ID | `com.treeide.treeide` |
| Categoria do app | `public.app-category.developer-tools` |
| Metadados do atualizador | `latest-mac.yml` |
| Workflow de CI | `Build macOS` — `.github/workflows/macos-build.yml` |
| Nome do artefato na CI | `tree-ide-macos-arm64` |
| Arquivos de release | `Tree-IDE-{version}-macOS-arm64.dmg`, `Tree-IDE-{version}-macOS-arm64.zip` |

## Estrutura do Projeto

```text
src/
|-- main/                       # Processo principal Electron, IPC, projeto/arquivos
|-- preload/                    # API contextBridge exposta ao renderer
|-- renderer/
|   |-- index.html              # Ponto de entrada HTML
|   |-- main.js                 # Bootstrap do renderer
|   |-- modules/                # Editor, arvore, modais, build studio, abas, etc.
|   |-- data/                   # Conteudos padrao e templates iniciais
|   |-- css/                    # Estilos modulares
|   |-- fonts/                  # Fontes Inter e JetBrains Mono
|-- shared/                     # Helpers compartilhados, i18n, updater
assets/                         # Icones do app
tests/                          # Testes Vitest
build/                          # Configuracao do instalador NSIS
build-flatpak/                  # Empacotamento Flatpak
docs/                           # Changelog manual, config de idiomas, READMEs traduzidos
scripts/                        # Scripts de build e CI
.github/workflows/
|   windows-build.yml           # Build Windows (x64 + arm64)
|   linux-build.yml             # Build Linux (x64 + arm64 + Flatpak)
|   macos-build.yml             # Build macOS (arm64 DMG + ZIP)
|   release-finalize.yml        # Localizar changelogs e publicar release
```

## Licenca

Tree IDE e licenciado sob a [MIT License](LICENSE).

## Creditos

Desenvolvido por [Mare](https://github.com/git-mare) e contribuido por [Mark Elpher](https://github.com/markelpher) na criação da v2 do Tree IDE.
