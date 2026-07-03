# Tree IDE

[Inglês](../README.md) · [Espanhol](README.es.md) · [Guia de instalação](installation/installation.pt-BR.md)

Aplicativo desktop leve para projetar estruturas de projeto em texto simples, visualizá-las como uma árvore interativa e gerar pastas, arquivos iniciais e arquivos compactados pelo **Build Studio**.

![Tree IDE Interface](https://github.com/markelpher/TreeIDE-Deploy/blob/main/assets/previews/preview-pt-BR.png)

O Tree IDE v2 é uma reescrita completa do [app original](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0). A mesma ideia central — desenhar estruturas de pastas em texto, visualizar ao vivo e gerar projetos — com arquitetura modular Vite + Electron, ferramentas mais ricas e releases focadas em Windows.

## Funcionalidades

### Editor e árvore
- **Visualização em árvore ao vivo** com conectores ASCII, ícones Lucide, pastas recolhíveis e destaque do arquivo ativo
- **Painel de validação** — indentação incorreta, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para ir à linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas multi-projeto** com indicadores de modificação, barra de abas rolável e reordenação por arrastar e soltar
- **Abas de pré-visualização por arquivo** — edite conteúdos iniciais antes de construir; pré-visualização Markdown ao vivo para arquivos `.md`
- **Indentação / desindentação em bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Navegação por teclado na árvore** — setas, Home, End e Enter
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, pré-visualização de arquivo) com layout persistido entre sessões

### Build Studio e saída
- **Build Studio** — fluxo de build em tela cheia com pré-visualização da árvore, conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas ZIP ou exportar apenas arquivo `.tree`
- **Saídas combinadas** — opcionalmente exportar ZIP junto com a pasta e incluir o arquivo `.tree` no arquivo
- **Inspeção pré-build** — verifica a pasta de destino por estrutura existente, `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolha pular ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para 68+ tipos de arquivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Placeholders i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

### Arquivos e criptografia
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` criptografados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importação de arquivos** via diálogo ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitação de senha** para ZIP criptografados e arquivos `.tree` protegidos
- **Carregar pasta como estrutura** — escaneia um diretório existente e transforma em texto editável

### Templates
- **19 templates iniciais integrados** — Frontend (HTML, React, Vite), Stacks (Node.js, MVC, Python, PHP), Systems (Go, Java, Kotlin, Rust, Ruby, Swift, Dart) e Native (C, C++, C#)
- **Tela de Templates** — navegador em tela cheia com três colunas, abas integradas e personalizadas, edição inline da estrutura e pré-visualização ao vivo
- **Templates personalizados** — criar em branco, importar do projeto atual, renomear, editar conteúdos inline, exportar ou excluir
- **Arquivos `.tree-template`** — exportar e importar templates personalizados compartilháveis (JSON `treeide-template` v1)

### UI, i18n e sessão
- **Janela sem moldura personalizada** com minimizar, maximizar e fechar; barra de menu (Arquivo, Editar, Exibir, Janela, Sobre)
- **Modal de boas-vindas** no primeiro uso com seleção de idioma e configurações agrupadas
- **Temas** — claro, escuro e **Sistema** (segue o esquema de cores do SO)
- **Inglês, Português (pt-BR) e Espanhol** — traduções da interface e dos diálogos do processo principal
- **Armazenamento de sessão em IndexedDB** com salvamento automático de abas abertas, conteúdos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão ao iniciar ou sempre começar limpo
- **Fontes incluídas** — Inter e JetBrains Mono; ícones Lucide locais (sem CDN)

### Atualizador automático
- **Atualizador no app** — verifica GitHub Releases, baixa com progresso e reinicia para instalar
- **Canais estável e beta**
- **Notas de release localizadas** no modal de atualização (inglês, português e espanhol)
- Edite as notas em `docs/changelog.md`; a CI traduz para o app e publica o inglês no GitHub

## Sintaxe da Estrutura

O Tree IDE usa um formato simples baseado em indentação. Use tabs ou grupos de quatro espaços para aninhar itens.

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

Pastas podem terminar com `/` para clareza. O Tree IDE também detecta pastas quando elas contêm filhos aninhados.

## Fluxo de Trabalho

1. Escreva ou cole uma estrutura de projeto no editor (ou comece pelos **Templates**)
2. Revise a visualização em árvore e o painel de validação
3. Personalize conteúdos iniciais nas abas de pré-visualização, se necessário
4. Clique em **Build** para abrir o **Build Studio**
5. Escolha o modo de saída (pasta, ZIP, `.tree` ou combinado) e confirme o caminho de destino
6. Opcionalmente salve o projeto como `.tree` ou exporte um arquivo criptografado

Você também pode abrir projetos `.tree`, arquivos compactados ou pastas via arrastar e soltar ou **Arquivo → Abrir**.

## Atalhos do Teclado

| Atalho | Ação |
| --- | --- |
| `Ctrl + N` | Novo projeto |
| `Ctrl + O` | Abrir projeto |
| `Ctrl + S` | Salvar projeto `.tree` atual |
| `Ctrl + Shift + S` | Salvar projeto como |
| `Ctrl + Alt + S` | Salvar todos os projetos |
| `Ctrl + B` | Abrir Build Studio |
| `Ctrl + Z` / `Ctrl + Y` | Desfazer / refazer |
| `Ctrl + T` | Nova aba |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | Próxima / aba anterior |
| `Ctrl + W` / `Ctrl + Shift + W` | Fechar aba / fechar todas |
| `Ctrl + Q` | Sair do app |
| `Ctrl + R` | Recarregar app |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | Zoom in / out / resetar |
| `F11` | Tela cheia |
| `Tab` / `Shift + Tab` | Aumentar / diminuir indentação |

Atalhos são totalmente configuráveis em **Configurações → Atalhos**.

## Desenvolvimento

Clone o repositório e instale as dependências:

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

Valide os arquivos de idioma:

```bash
npm run i18n:validate
```

Compilação:

### Windows (x64 + ARM64)

```bash
npm run build
```

Para builds explícitos por arquitetura:

```bash
npm run build:win
npm run build:win:arm64
```

O Tree IDE é exclusivo para Windows. Ele fornece o instalador NSIS para x64 e ARM64, além de Portable e MSI para x64. O instalador NSIS suporta instalação por usuário e atualizações automáticas silenciosas sem solicitação de administrador.

| Identificador Windows | Valor |
| --- | --- |
| Application ID | `com.treeide.treeide` |
| Nome do executável | `Tree IDE` |
| Tipos de instalador | Setup NSIS (x64 + ARM64), Portable (x64), MSI (x64) |
| Idiomas do instalador | Inglês (`en_US`), Português (`pt_BR`), Espanhol (`es_ES`) |
| Metadados do atualizador | `latest.yml` (x64), `latest-arm64.yml` (ARM64) |
| Workflow de CI | `Build Windows` — `.github/workflows/windows-build.yml` |
| Nomes dos artefatos na CI | `tree-ide-windows-x64`, `tree-ide-windows-arm64` |
| Arquivos de release | `Tree-IDE-Setup-{version}-win-{arch}.exe` (x64/ARM64), `Tree-IDE-Portable-{version}-win-x64.exe`, `Tree-IDE-{version}-win-x64.msi` |

## Estrutura do Projeto

```text
src/
|-- main/                       # Processo principal Electron, IPC, projeto/arquivos
|-- preload/                    # API contextBridge exposta ao renderer
|-- renderer/
|   |-- index.html              # Ponto de entrada HTML
|   |-- main.js                 # Bootstrap do renderer
|   |-- modules/                # Editor, árvore, modais, build studio, abas, etc.
|   |-- data/                   # Conteúdos padrão e templates iniciais
|   |-- css/                    # Estilos modulares
|   |-- fonts/                  # Fontes Inter e JetBrains Mono
|-- shared/                     # Helpers compartilhados, i18n, updater
assets/
|   preview/
|       preview.png             # Screenshots dos READMEs
|   icon.png                    # Ícones do app
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Testes Vitest
build/                          # Configuração do instalador NSIS
docs/
|   changelog.md                # Notas de release em inglês (editar antes do tag)
|   changelogs/
|       locales.json            # Config de idiomas para tradução na CI
|       pt.md                   # Notas em português (sobrescritas pelo Release Finalize)
|       es.md                   # Notas em espanhol (sobrescritas pelo Release Finalize)
|   README.pt-BR.md             # READMEs traduzidos
|   README.es.md
|   installation/
|       installation.md         # Guia de instalação em inglês
|       installation.pt-BR.md   # Guia de instalação em português
|       installation.es.md      # Guia de instalação em espanhol
scripts/                        # Scripts de build, changelog e CI
.github/workflows/
|   windows-build.yml           # Build Windows (x64 + ARM64)
|   release-finalize.yml        # Traduzir changelogs e publicar release
```

## Licença

Tree IDE é licenciado sob a [MIT License](../LICENSE).

## Créditos

Desenvolvido por [Mare](https://github.com/git-mare) e contribuído por [Mark Elpher](https://github.com/markelpher) na criação da v2 do Tree IDE.
