<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md -->

## O que há de novo na v2.0.90

Tree IDE v2 é uma reescrita completa e expansão do aplicativo original ([Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0)). Mesma ideia central — projetar estruturas de pastas em texto simples, visualizá-las ao vivo e gerar projetos — com uma nova arquitetura, ferramentas mais ricas e lançamentos apenas para Windows.

### Adicionado

#### Estúdio de Construção & saída de projeto
- **Estúdio de Construção** — fluxo de construção em tela cheia com visualização de árvore ao vivo, visualização de conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente exportar um ZIP junto com uma construção de pasta e incluir o arquivo `.tree` dentro do arquivo compactado
- **Inspeção pré-construção** — escanear a pasta de destino em busca de estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolher ignorar ou sobrescrever quando arquivos ou pastas já existirem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Marcadores i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos & criptografia
- **Exportação ZIP** com proteção por senha AES-256 opcional via 7-Zip
- **Projetos `.tree` criptografados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importação de arquivos** via diálogo de arquivos ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitações de senha** para arquivos ZIP criptografados e arquivos `.tree` criptografados
- **Carregar pasta como estrutura** — escanear um diretório existente e transformá-lo em texto de árvore editável
- **Fallback ARM64 do Windows** para 7-Zip quando binários nativos não estão disponíveis

#### Modelos
- **19 modelos iniciais embutidos** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Pilhas: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de modelos** — navegador em tela cheia com três colunas, abas embutidas e personalizadas, edição de estrutura inline e visualização de árvore ao vivo
- **Modelos personalizados** — criar em branco, importar do projeto atual, renomear, editar o conteúdo do arquivo inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar modelos personalizados compartilháveis (JSON `treeide-template` v1) via diálogos de salvar/abrir nativos ou exportação por linha na lista personalizada
- **Rodapé de modelos personalizados** — quando modelos personalizados existem: **Novo modelo**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Visualização por arquivo** — clicar em um arquivo na visualização da estrutura abre um painel de editor monoespaçado em largura total com distintivo de tipo de arquivo (mesmo layout de painel único para modelos embutidos e personalizados)

#### Editor, árvore & validação
- **Painel de validação** — má indentação, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para pular para a linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas de múltiplos projetos** com indicadores de modificação, uma barra de abas rolável e reordenação por arrastar e soltar
- **Abas de visualização de arquivos por projeto** — editar conteúdos de arquivos iniciais antes de construir
- **Visualização ao vivo de Markdown** para arquivos `.md` no painel de visualização de arquivos
- **Pastas colapsáveis** na visualização da árvore
- **Navegação por teclado na árvore** — teclas de seta, Home, End e Enter
- **Correspondência inteligente de renomeação de arquivos** quando linhas da árvore são editadas
- **Indentação / desindentação de bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, visualização de arquivos) com layout persistido entre sessões

#### Ícones & tipos de arquivos
- **Ícones Lucide** agrupados localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 rótulos de extensão de arquivo** no mapa de tipos de arquivo

#### UI & experiência de primeira execução
- **Janela sem moldura personalizada** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout redesenhado com cabeçalho hero, cartões de configuração agrupados (Geral, Aparência, Sessão) e um botão **Começar** fixo
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do aplicativo ao vivo (evoluído da tela de créditos da v1)
- **Diálogo de alterações não salvas** ao fechar com projetos modificados
- **Sobreposição de arrastar e soltar** para arquivos `.tree` e arquivos compactados
- **Fontes agrupadas** — Inter e JetBrains Mono

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** no fluxo de boas-vindas e configurações
- **Traduções do processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de localidade em sincronia

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do legado `localStorage`
- **Salvar automaticamente** abas abertas, conteúdos de arquivos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão ao iniciar ou sempre começar limpo

#### Atualizador automático & notas de lançamento
- **Atualizador automático no aplicativo** — verificar Lançamentos do GitHub, baixar com progresso e reiniciar para instalar
- **Canais de atualização estáveis e beta**
- **Notas de lançamento localizadas** no modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais amplo, **O que há de novo** expandido por padrão, área de rolagem dedicada, hierarquia de cabeçalhos mais clara e botões de ação fixos no rodapé
- **Fluxo de trabalho manual `docs/changelog.md`** — editar notas de lançamento no repositório; CI as traduz para o aplicativo e publica em inglês no GitHub
- **Notas de lançamento divididas** — modal de atualização do aplicativo mostra apenas o texto do changelog; links de navegação de localidade aparecem em `docs/changelog.md` e na descrição do lançamento do GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução de Modelos do GitHub** — notas de lançamento em português e espanhol são geradas em CI via API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com UI de captura e ação de restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas & distribuição
- **Windows** — instalador NSIS (x64 + ARM64), MSI e builds portáteis para x64; instalador multilíngue (inglês, português e espanhol) com título de seletor de idioma localizado
- **Windows (x64 + ARM64)** — Instalador NSIS para x64 e ARM64, Portable e MSI para x64; instalador multilíngue (inglês, português e espanhol)
- **Lançamentos do GitHub** publicados automaticamente em tags de versão a partir do CI
- **Construção do renderizador antes do empacotamento** — `beforePack` executa `vite build` e valida `dist/renderer/` para que cada instalador envie o pacote da UI

#### Arquitetura, ferramentas de desenvolvimento & qualidade
- **Construção do renderizador Vite** com substituição de módulo quente em desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manipuladores IPC divididos** para projeto, atualizações e ciclo de vida do aplicativo
- **API de pré-carregamento `contextBridge`** para uma fronteira de renderizador reforçada
- **Conjunto de testes Vitest** com simulações do Electron para execuções amigáveis ao CI; helpers de erro de changelog e atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados em scripts npm
- **electron-reloader** para recarregamento quente do processo principal durante o desenvolvimento
- **Exportação de log de erros** em caso de falha para facilitar a depuração
- **`semver`** como uma dependência direta para comparação de versão confiável no aplicativo
