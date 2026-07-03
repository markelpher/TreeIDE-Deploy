<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md -->

## Novidades na v2.0.82

O Tree IDE v2 é uma reescrita e expansão completa do aplicativo original ([Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0)). A mesma ideia central — criar estruturas de pastas em texto simples, visualizá-las ao vivo e gerar projetos — agora com uma nova arquitetura, ferramentas mais completas e releases multiplataforma.

### Adicionado

#### Build Studio e saída do projeto
- **Build Studio** — fluxo de build em tela cheia com prévia da árvore em tempo real, prévia de conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente exportar um ZIP junto com uma build em pasta e incluir o arquivo `.tree` dentro do arquivo compactado
- **Inspeção pré-build** — verifica a pasta de destino por estrutura existente, arquivos `.tree` ou ZIP antes de gravar
- **Tratamento de conflitos** — escolha entre ignorar ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Placeholders de i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}` etc.)

#### Arquivos compactados e criptografia
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` criptografados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importação de arquivos compactados** por seletor de arquivo ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitações de senha** para ZIPs criptografados e arquivos `.tree` criptografados
- **Carregar pasta como estrutura** — varre um diretório existente e o transforma em texto de árvore editável
- **Fallback Windows ARM64** para o 7-Zip quando binários nativos não estão disponíveis

#### Modelos
- **19 modelos iniciais embutidos** agrupados por categoria:
  - Frontend: HTML, HTML e CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de modelos** — navegador em tela cheia com três colunas, abas de modelos embutidos e personalizados, edição inline de estrutura e prévia da árvore ao vivo
- **Modelos personalizados** — crie do zero, importe do projeto atual, renomeie, edite conteúdo de arquivos inline, abra no editor principal, exporte ou exclua sem sair da tela
- **Arquivos `.tree-template`** — exporte e importe modelos personalizados compartilháveis (JSON `treeide-template` v1) via diálogos nativos de salvar/abrir ou exportação por linha na lista personalizada
- **Rodapé de modelos personalizados** — quando existem modelos personalizados: **Novo modelo**, **Do projeto atual** e **Importar .tree-template**; o estado vazio oferece começar do zero, importar projeto e importar arquivo
- **Prévia por arquivo** — clicar em um arquivo na prévia da estrutura abre um painel de editor monoespaçado em largura total com indicador de tipo de arquivo (mesmo layout de painel único para modelos embutidos e personalizados)

#### Editor, árvore e validação
- **Painel de validação** — indentação incorreta, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para ir até a linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas multiprojeto** com indicadores de modificação, barra rolável e reordenação por arrastar e soltar
- **Abas de prévia de arquivo por projeto** — edite o conteúdo inicial dos arquivos antes da build
- **Prévia Markdown ao vivo** para arquivos `.md` no painel de prévia de arquivo
- **Pastas recolhíveis** na prévia da árvore
- **Navegação por teclado na árvore** — setas, Home, End e Enter
- **Correspondência inteligente de renomeação de arquivos** quando linhas da árvore são editadas
- **Indentar / desindentar blocos** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, prévia de arquivo) com layout persistido entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide** embutidos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 rótulos de extensão** no mapa de tipos de arquivo

#### UI e primeira execução
- **Janela personalizada sem moldura** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout redesenhado com cabeçalho hero, cartões de configuração agrupados (Geral, Aparência, Sessão) e botão **Começar** fixo
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do app em tempo real (evolução da tela de créditos da v1)
- **Diálogo de alterações não salvas** ao fechar com projetos modificados
- **Overlay de arrastar e soltar** para arquivos `.tree` e compactados
- **Fontes embutidas** — Inter e JetBrains Mono

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** no fluxo de boas-vindas e nas configurações
- **Traduções do processo principal** para diálogos nativos e mensagens de erro
- Script **`npm run i18n:validate`** para manter arquivos de idioma sincronizados

#### Persistência de sessão
- **Armazenamento de sessão em IndexedDB** com migração automática do `localStorage` legado
- **Salvamento automático** de abas abertas, conteúdo de arquivos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão ao iniciar ou sempre iniciar limpo

#### Atualizador automático e notas de release
- **Atualizador automático no app** — verifica GitHub Releases, baixa com progresso e reinicia para instalar
- **Canais de atualização estável e beta**
- **Notas de release localizadas** no modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais largo, seção **Novidades** expandida por padrão, área de rolagem dedicada, hierarquia de títulos mais clara e botões de ação fixos no rodapé
- **Fluxo manual `docs/changelog.md`** — edite as notas de release no repositório; a CI traduz para o app e publica o inglês no GitHub
- **Notas de release separadas** — o modal de atualização do app mostra apenas o texto do changelog; links de navegação por idioma aparecem em `docs/changelog.md` e na descrição da release do GitHub (apontando para os assets anexados `pt.md` / `es.md`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução com GitHub Models** — notas de release em português e espanhol são geradas na CI pela API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com UI de captura e ação para restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas e distribuição
- **Windows** — instalador NSIS, MSI e builds portáteis para x64 e ARM64; instalador multi-idioma (inglês, português e espanhol) com título localizado no seletor de idioma
- **Linux** — AppImage, deb e snap para x64 e ARM64; builds Flatpak (x86_64 e aarch64, runtime 25.08) com launcher `zypak-wrapper`
- **macOS** — DMG e ZIP para Apple Silicon (arm64)
- **GitHub Releases** publicadas automaticamente em tags de versão pela CI
- **Build do renderer antes do pacote** — `beforePack` executa `vite build` e valida `dist/renderer/` para que todo instalador inclua o bundle da UI

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Build do renderer com Vite** e hot module replacement em desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **ES modules**, Node.js 24+, Electron 42
- **Handlers IPC separados** para projeto, atualizações e ciclo de vida do app
- **API preload com `contextBridge`** para uma fronteira de renderer mais protegida
- **Suíte de testes Vitest** com mocks do Electron para execução amigável à CI; helpers de changelog e erros do atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para hot reload do processo principal durante o desenvolvimento
- **Exportação de log de erro** em caso de crash para facilitar depuração
- **`semver`** como dependência direta para comparação confiável de versões dentro do app

### Alterado

- **Reescrita completa** do monólito da v1 (`main.js`, `renderer.js`, `styles.css`) para uma arquitetura modular Vite + Electron
- **Fluxo de build** — o botão **Build** da barra de ferramentas agora abre o **Build Studio** em vez de gravar arquivos imediatamente
- **Temas** — modos claro e escuro, além da opção **Sistema**, que segue o esquema de cores do SO
- **Tela de créditos** renomeada para **Sobre o Tree IDE**, com informações dinâmicas de versão
- **Salvar / carregar** — carregador unificado para projetos `.tree`, arquivos compactados e pastas; suporta projetos criptografados e mapas de conteúdo de arquivos importados
- **Prévia da árvore** — conectores ASCII, ícones Lucide, botões de recolher e destaque do arquivo ativo substituem a visualização básica da v1
- **Armazenamento de sessão** movido de `localStorage` para **IndexedDB** para suportar cargas maiores de autosave (abas + conteúdo de arquivos)
- **Distribuição** expandida de apenas MSI para Windows (v1) para CI multi-SO com suporte ARM64, Flatpak e pacotes macOS
- **Electron** atualizado da v26 (v1) para v42 (v2)
- **Versionamento de release** movido para releases semânticas v2.x com geração automatizada de changelog multilíngue
- **Roteamento das notas de release** — `en.md`, `pt.md` e `es.md` alimentam o atualizador no app; `github-release.md` alimenta o corpo da release do GitHub com o link de comparação
- **Tela de modelos** — editor de estrutura e prévia da árvore usam divisão 50/50 no modo de edição personalizada; rótulo de prévia encurtado para **Prévia**; ação **Usar modelo** centralizada no rodapé da modal
- **Toasts de modelos personalizados** — dica de abrir no editor agora aponta para **Do projeto atual** em vez da ação removida de atualizar por modelo
- **Barra de abas de prévia de arquivo** — abas de arquivo rolam em uma região dedicada ao lado do indicador de tipo de arquivo e botão de fechar; divisor vertical removido; altura estável da barra com rolagem por setas apenas (sem expansão de scrollbar no hover)
- **Tipografia do editor de prévia de arquivo** — tamanho monoespaçado compartilhado com os visualizadores de arquivo dos Modelos e do Build Studio
- **Pré-visualizações do README** — screenshot principal fica em `assets/previews/`; READMEs em português e espanhol usam imagens de prévia localizadas

### Corrigido

- **Ícones de linhas de modelos personalizados** — ações de renomear, abrir no editor, exportar e excluir usam ícones Lucide embutidos (`type`, `file-code`, `download`, `trash-2`) em vez de cair no glifo genérico de arquivo
- **Prévia de arquivo dos modelos** — conteúdos de arquivo renderizam em um painel de editor monoespaçado em largura total (não texto simples), alinhado ao comportamento dos modelos embutidos; o painel de arquivo limpa quando o editor de estrutura é esvaziado
- **Editor de estrutura dos modelos** — Tab indenta nas textareas de estrutura e arquivo em vez de mover o foco para outros controles; prévia da árvore atualiza ao vivo durante a digitação; lista de modelos embutidos não deixa mais espaço abaixo do último item quando o rodapé personalizado está oculto
- **Bindings da modal de modelos** — listeners dos editores de estrutura/arquivo são reanexados após re-renderizações da lista para que edições inline continuem funcionando
- **Tela em branco / preta após instalar** — builds empacotadas podiam sair sem `dist/renderer/` porque a saída da UI é ignorada pelo git; `electron-before-pack` agora compila e verifica o renderer antes de cada pacote do `electron-builder`
- **Falhas na verificação de atualização** — erros mais claros e localizados para problemas de rede, `latest*.yml` ausente e releases inacessíveis; toasts de erro duplicados removidos; erros desconhecidos do atualizador caem para uma mensagem traduzida em vez de inglês bruto
- **Nome da release no diálogo de atualização** — o template `Tree IDE v${version}` do electron-builder é normalizado para a versão real no app
- **CI de release (job de tradução)** — migrada para `models.github.ai`; injeção em `latest*.yml` roda no fluxo único `Release Finalize` sem `npm install`
- **Gate do Release Finalize** — builds de plataforma publicam releases draft; cada job de CI de plataforma verifica se Windows, Linux e macOS terminaram com sucesso e só então dispara `Release Finalize` uma vez (o job de dispatch trata seu próprio workflow como concluído mesmo enquanto o GitHub ainda marca como `in_progress`); finalize publica `latest*.yml` localizados, Snap e assets Flatpak; o app ignora atualizações até que notas em inglês, português e espanhol estejam presentes
- **Empacotamento Flatpak** — corrigidos caminho de staging do Electron, fontes do manifesto, diretório unpacked ARM64, entrypoint `zypak-wrapper` e patch do nome do arquivo desktop
- **Limpeza de cache do GitHub Actions** — corrigido `jq` comparando IDs numéricos de cache com strings, o que podia excluir a entrada de cache que deveria ser mantida
- **CI do snap Linux** — artefatos snap são gerados com `--publish never`, então a CI não requer credenciais da Snap Store; o arquivo `.snap` é anexado à release do GitHub durante o `Release Finalize` (somente x64)
- **Segurança de caminhos** — parser e criador da árvore rejeitam traversal e outros caminhos inseguros antes de gravar no disco
- **Validação de indentação** — mistura de tabs e espaços é detectada e reportada no painel de validação
- **Nomes duplicados** — arquivos e pastas irmãos com o mesmo nome são sinalizados antes da build
- **Validação de exportação criptografada** — senha e confirmação precisam corresponder antes de criar ZIP ou arquivos `.tree` protegidos
- **Detecção de atualização** — apenas versões estritamente mais novas que a build instalada são oferecidas
- **Renderização das notas de release** — HTML nos changelogs de atualização é sanitizado antes da exibição
- **Barra de abas de prévia de arquivo** — abas não se sobrepõem mais ao rótulo de tipo de arquivo nem quebram o layout do editor quando muitos arquivos estão abertos
- **Editor de prévia de arquivo** — scrollbar e edição por teclado (Tab / Backspace) combinam com o editor principal de estrutura; peso e tamanho da fonte agora batem com o visualizador de arquivos dos Modelos
- **Nomes de salvar / exportar** — salvamentos e exportações `.tree` usam o nome resolvido do projeto em vez de um fallback Untitled genérico
- **Persistência de modelos personalizados** — modelos personalizados salvam automaticamente enquanto a modal de Modelos está aberta e restauram do IndexedDB após reiniciar
- **Build do instalador NSIS Windows** — strings em espanhol usam LCID **3082** (`SpanishInternational`, alinhado ao `es_ES` do electron-builder); removidos `Spanish-1034.nsh` redundante e overrides portugueses `MUI_UNTEXT_*` para que `makensis -WX` não falhe mais com LangStrings duplicadas ou ausentes
- **Idioma do instalador NSIS Windows** — seletor de idioma dentro do assistente (inglês, português, espanhol) sem relançar nem arquivos auxiliares temporários; **Próximo** avança imediatamente, e páginas de diretório, progresso, conclusão e páginas personalizadas aplicam títulos, descrições e botões traduzidos no momento da exibição via `SendMessage`
- **Idioma do desinstalador NSIS Windows** — mesmo seletor de idioma dentro do assistente; páginas de progresso e conclusão seguem o idioma selecionado sem relançar

### Removido

- **Layout monolítico de arquivo único** da v1 — substituído pela estrutura modular `src/` (funcionalidade preservada e expandida)
- **UI de build em uma etapa** — substituída pelo Build Studio; criação direta de pastas ainda está disponível dentro do studio
- **Empacotamento exclusivo Windows MSI** como único formato de distribuição — substituído por NSIS, MSI, portátil e artefatos Linux/macOS