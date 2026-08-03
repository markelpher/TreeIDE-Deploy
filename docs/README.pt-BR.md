# Tree IDE

[Inglês](../README.md) · [Espanhol](README.es.md) · [Guia de instalação](installation/installation.pt-BR.md)

![Tree IDE Interface](https://github.com/markelpher/treeide-deploy/blob/main/assets/previews/preview-pt-BR.png)

O Tree IDE v2 é uma reescrita completa do [app original](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A mesma ideia central: desenhar estruturas de pastas em texto, visualizar em tempo real e gerar projetos. Com arquitetura modular Vite + Electron, ferramentas mais ricas e releases focadas em Windows.

## Funcionalidades

### Editor e árvore
- **Visualização em árvore em tempo real** com conectores ASCII, ícones Lucide, pastas recolhíveis e destaque do arquivo ativo
- **Painel de validação** — indentação incorreta, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para ir à linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas multi-projeto** com indicadores de modificação, barra de abas rolável e reordenação por arrastar e soltar
- **Abas do editor de arquivos por projeto** — edite conteúdos iniciais antes de construir, reordene abas arrastando e feche automaticamente as abas de arquivos excluídos; pré-visualização Markdown ao vivo para arquivos `.md`
- **Indentação / desindentação em bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Navegação por teclado na árvore** — setas, Home, End e Enter
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, pré-visualização de arquivo) com layout persistido entre sessões

### Build Studio e saída
- **Build Studio** — fluxo de build em tela cheia com pré-visualização da árvore, conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas ZIP ou exportar apenas arquivo `.tree`
- **Saídas combinadas** — opcionalmente exportar ZIP junto com a pasta e incluir o arquivo `.tree` no arquivo
- **Ação de build conforme o conteúdo** — ao criar uma estrutura com ZIP adicional, o botão informa se criará arquivo, arquivos, pasta, pastas ou uma combinação, seguido de `+ ZIP`
- **Inspeção pré-build** — verifica a pasta de destino por estrutura existente, `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolha pular ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para 68+ tipos de arquivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Placeholders i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

### Arquivos e criptografia
- **Compatibilidade com arquivos Tree IDE 1** — Tree IDE 1 é o formato de arquivo `.tree` de primeira geração usado pelo Tree IDE Legacy; seus arquivos em texto UTF-8 sem cabeçalho continuam totalmente compatíveis, incluindo indentação por tabulações ou `...`
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` com criptografia de alto padrão** — o TREEIDE2 usa AES-256-GCM autenticado com Argon2id (256 MiB, 4 passagens e 4 vias), enquanto os arquivos de texto simples do Tree IDE Legacy continuam compatíveis como formato de primeira geração
- **Argon2id pronto para Electron** — se o Argon2 nativo não estiver disponível, a derivação de chave usa WASM e continua gerando arquivos TREEIDE2 compatíveis
- **Recriptografia ao salvar** — projetos protegidos voltam a ser gravados como ciphertext TREEIDE2; o auto-save nunca sobrescreve um `.tree` criptografado com texto puro
- **Proteção explícita do `.tree` com senha** — os campos de senha permanecem visíveis, mas desabilitados até a proteção ser marcada; ao ativá-la, o aviso de senha irrecuperável aparece e os valores precisam coincidir antes de salvar
- **Importação de arquivos** via diálogo ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitação de senha** para ZIP criptografados e arquivos `.tree` protegidos
- **Carregar pasta como estrutura** — escaneia um diretório existente e transforma em texto editável

### Templates
- **19 templates iniciais integrados** — Frontend (HTML, React, Vite), Stacks (Node.js, MVC, Python, PHP), Systems (Go, Java, Kotlin, Rust, Ruby, Swift, Dart) e Native (C, C++, C#)
- **Tela de Templates** — navegador em tela cheia com três colunas, abas integradas e personalizadas, edição inline da estrutura e pré-visualização ao vivo
- **Pesquisa e favoritos de templates** — filtro sem distinção de acentos em templates integrados e personalizados, além de favoritos persistidos localmente com ícone de estrela incluído para uso offline
- **Templates personalizados** — criar em branco, importar do projeto atual, renomear, editar conteúdos inline, exportar ou excluir
- **Preview Markdown nos templates** — arquivos `.md` exibem o editor e o documento renderizado lado a lado, com atualização em tempo real durante a edição de templates personalizados
- **Arquivos `.tree-template`** — exportar e importar templates personalizados compartilháveis (JSON `treeide-template` v1)

### UI, i18n e sessão
- **Janela sem moldura personalizada** com minimizar, maximizar e fechar; barra de menu (Arquivo, Editar, Exibir, Janela, Sobre)
- **Modal de boas-vindas** no primeiro uso com seleção de idioma e configurações agrupadas
- **Temas** — claro, escuro e **Sistema** (segue o esquema de cores do SO)
- **Inglês, Português (pt-BR) e Espanhol** — traduções da interface e dos diálogos do processo principal
- **Relatórios de problemas estruturados** — preencha título da issue, descrição, passos para reproduzir e comportamento esperado em um formulário localizado e com campos autoajustáveis dentro do app
- **Integração com labels do GitHub** — escolha uma categoria na lista de labels de issues do repositório, exibida no idioma em uso no app
- **Diagnóstico com privacidade em primeiro lugar** — salve um ZIP local com metadados permitidos do sistema/app, erros sanitizados do renderer e logs limitados à execução atual; nomes e conteúdos de projetos ficam de fora
- **Capturas interativas somente do app** — após consentimento explícito, o formulário da issue dá lugar a um seletor de região no estilo Windows ou à captura da janela inteira do Tree IDE; use `Shift+P` mesmo com a barra recolhida, enquanto instruções e controles liberam a tela automaticamente durante a seleção; abra miniaturas em tamanho ampliado e remova imagens indesejadas antes de salvar até 10 capturas no ZIP local; a área de trabalho e outras janelas nunca são capturadas
- **Armazenamento de sessão em IndexedDB** com salvamento automático de abas abertas, conteúdos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão ao iniciar (incluindo rascunhos não salvos) ou sempre começar limpo
- **Sessão de projetos criptografados** — com restauração ativa, um `.tree` desbloqueado permanece nas abas abertas após reiniciar; fechar a aba remove o rascunho e reabrir o arquivo pede a senha de novo; senhas nunca são gravadas na sessão
- **Pilha de notificações** — as notificações mais recentes ficam no topo
- **Fontes incluídas** — Inter e JetBrains Mono; ícones Lucide locais (sem CDN)
- **Paleta de comandos** — use `Ctrl+Shift+P` para acessar 23 ações de projeto, edição, navegação entre abas, build, visualização, atualização e ajuda; comandos contextuais indisponíveis aparecem desabilitados, e ícones Lucide específicos para cada ação ficam disponíveis offline
- **Melhorias de acessibilidade** — rótulos localizados para leitores de tela, anúncios de resultados, listboxes e abas semânticas, foco visível e navegação por teclado nos fluxos de comandos e templates
- **Rich Presence opcional do Discord** — desativado por padrão, com opções dependentes bloqueadas até a ativação; estados localizados de editor/arquivo/templates/build/configurações, ícones dedicados por atividade e para inatividade, pausa ao bloquear ou suspender, reconexão e três níveis de privacidade

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
6. Opcionalmente proteja o arquivo `.tree` ou ZIP com senha

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
| `Ctrl + Shift + P` | Abrir Paleta de comandos |
| `Ctrl + Z` / `Ctrl + Y` | Desfazer / refazer |
| `Ctrl + T` | Nova aba |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | Próxima / aba anterior |
| `Ctrl + W` / `Ctrl + Shift + W` | Fechar aba de projeto / fechar aba de arquivo |
| `Ctrl + Q` | Sair do app |
| `Ctrl + R` | Recarregar app |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | Zoom in / out / resetar |
| `F11` | Tela cheia |
| `Tab` / `Shift + Tab` | Aumentar / diminuir indentação |

Atalhos são totalmente configuráveis em **Configurações → Atalhos**.

## Rich Presence

Abra **Configurações → Rich Presence** e ative o Rich Presence. A aplicação do Tree IDE no Discord já vem configurada, e o aplicativo do Discord para desktop precisa estar aberto. A Presence começa como Inativo e muda para Editando estrutura somente após uma interação direta com o editor de estrutura. Os estados contextuais abrangem visualização de arquivo, templates, configurações, criação de arquivo, arquivos, estrutura de pastas ou pastas e arquivos, além da exportação genérica de arquivo, sem revelar nomes, caminhos, formatos ou criptografia; cada grupo usa um ícone pequeno dedicado, mantendo o logotipo do Tree IDE como imagem principal.

Escolha a privacidade Básico, Atividade ou Detalhado; somente Detalhado pode incluir o nome do projeto e o tipo de arquivo. Caminhos e conteúdos nunca são enviados. Após cinco minutos sem interação, a Presence volta para Inativo com seu ícone de teclado. Ela é limpa enquanto o Windows está bloqueado ou suspenso e restaurada quando o dispositivo retorna.

O idioma da Presence segue o idioma do Tree IDE por padrão ou pode ser fixado separadamente em inglês, português ou espanhol. O Discord recebe um único texto localizado, portanto todos os observadores veem o idioma escolhido pelo usuário do Tree IDE, sem tradução automática conforme o idioma do Discord de cada observador. Desenvolvedores podem substituir o ID incluído com `TREEIDE_DISCORD_CLIENT_ID`.

Os PNGs contextuais da Presence são versionados em `assets/discord-presence/` e podem ser recriados com `scripts/generate-discord-presence-icons.ps1`.

## Desenvolvimento

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/markelpher/treeide-deploy.git
cd TreeIDE
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

### Windows (x64)

```bash
npm run build
```

Para um build explícito do Windows:

```bash
npm run build:win
```

O Tree IDE é exclusivo para Windows e suporta x64. Ele fornece pacotes NSIS e Portable. O instalador NSIS suporta instalação por usuário e atualizações automáticas silenciosas sem solicitação de administrador.

Os builds de produção mantêm o código do aplicativo organizado em um único pacote `app.asar` com validação de integridade. Os dados do perfil do Windows ficam separados do executável, como é esperado em aplicativos por usuário. Quando o Setup encontra dados de uma instalação anterior, uma instalação manual pergunta se deve mantê-los (opção segura e padrão) ou apagar configurações, cache, logs, sessão e dados de atualização. O desinstalador apresenta a mesma escolha explícita.

O instalador manual assistido e o desinstalador mostram as escolhas de dados. Atualizações silenciosas iniciadas dentro do app ignoram essas páginas e sempre mantêm os dados. A tela de boas-vindas aparece em um perfil novo ou depois de escolher apagar os dados, mas não quando os dados existentes são mantidos.

O desinstalador mantém o mesmo fluxo assistido e localizado até a ação final **Concluir**.

| Identificador Windows | Valor |
| --- | --- |
| Application ID | `com.treeide.treeide` |
| Nome do executável | `Tree IDE` |
| Tipos de instalador | Setup NSIS (x64), Portable (x64) |
| Idiomas do instalador | Inglês (`en_US`), Português (`pt_BR`), Espanhol (`es_ES`) |
| Metadados do atualizador | `latest.yml` (x64) |
| Workflow de CI | `Build Windows` — `.github/workflows/windows-build.yml` |
| Nome do artefato na CI | `tree-ide-windows-x64` |
| Arquivos de release | `Tree-IDE-Setup-{version}-win-x64.exe`, `Tree-IDE-Portable-{version}-win-x64.exe` |

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
|   previews/
|       preview.png             # Screenshots dos READMEs
|   discord-presence/           # PNGs contextuais versionados da Presence do Discord
|   icon.png                    # Ícones do app
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Testes Vitest
build/                          # Configuração do instalador NSIS
docs/
|   changelog.md                # Notas de release em inglês (editar antes do tag)
|   changelogs/
|       locales.json            # Config de idiomas para tradução na CI
|       pt-br.md                # Notas em português brasileiro (sobrescritas pelo Release Finalize)
|       es.md                   # Notas em espanhol (sobrescritas pelo Release Finalize)
|   README.pt-BR.md             # READMEs traduzidos
|   README.es.md
|   installation/
|       installation.md         # Guia de instalação em inglês
|       installation.pt-BR.md   # Guia de instalação em português
|       installation.es.md      # Guia de instalação em espanhol
scripts/                        # Scripts de build, changelog, CI e geração dos assets da Presence
.github/workflows/
|   windows-build.yml           # Build Windows x64 (NSIS + Portable)
|   release-finalize.yml        # Traduzir changelogs e publicar release
```

## Licença

Tree IDE é licenciado sob a [MIT License](../LICENSE).

## Créditos

Desenvolvido por [Mare](https://github.com/git-mare) e contribuído por [Mark Elpher](https://github.com/markelpher) na criação da v2 do Tree IDE.
