<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md -->

[Português](https://github.com/markelpher/TreeIDE-Deploy/blob/main/docs/changelogs/pt.md) · [Español](https://github.com/markelpher/TreeIDE-Deploy/blob/main/docs/changelogs/es.md)

## O que há de novo na v2.0.83

Tree IDE v2 é uma reescrita completa e expansão do aplicativo original ([Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0)). Mesma ideia central — projetar estruturas de pastas em texto simples, visualizá-las ao vivo e gerar projetos — com uma nova arquitetura, ferramentas mais ricas e lançamentos multiplataforma.

### Adicionado

#### Estúdio de Construção & saída de projeto
- **Estúdio de Construção** — fluxo de construção em tela cheia com visualização de árvore ao vivo, visualização de conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — exportar opcionalmente um ZIP junto com uma construção de pasta e incluir o arquivo `.tree` dentro do arquivo
- **Inspeção pré-construção** — escanear a pasta de destino em busca de estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolher ignorar ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Marcadores i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos & criptografia
- **Exportação ZIP** com proteção por senha AES-256 opcional via 7-Zip
- **Projetos `.tree` criptografados** (formato TREEIDE1 / TREEIDE2, AES-256-GCM + scrypt)
- **Importação de arquivos** via diálogo de arquivo ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitações de senha** para arquivos ZIP criptografados e arquivos `.tree` criptografados
- **Carregar pasta como estrutura** — escanear um diretório existente e transformá-lo em texto de árvore editável
- **Fallback ARM64 do Windows** para 7-Zip quando binários nativos não estão disponíveis

#### Modelos
- **19 modelos iniciais embutidos** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Pilhas: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de modelos** — navegador de três colunas em tela cheia com abas embutidas e personalizadas, edição de estrutura inline e visualização de árvore ao vivo
- **Modelos personalizados** — criar em branco, importar do projeto atual, renomear, editar o conteúdo do arquivo inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar modelos personalizados compartilháveis (JSON `treeide-template` v1) via diálogos de salvar/abrir nativos ou exportação por linha na lista personalizada
- **Rodapé de modelos personalizados** — quando existem modelos personalizados: **Novo modelo**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Visualização por arquivo** — clicar em um arquivo na visualização da estrutura abre um painel de editor monoespaçado em largura total com badge de tipo de arquivo (mesmo layout de painel único para modelos embutidos e personalizados)

#### Editor, árvore & validação
- **Painel de validação** — má indentação, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para pular para a linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas de múltiplos projetos** com indicadores de modificação, uma barra de abas rolável e reordenação por arrastar e soltar
- **Abas de visualização de arquivos por projeto** — editar conteúdos de arquivos iniciais antes de construir
- **Visualização ao vivo de Markdown** para arquivos `.md` no painel de visualização de arquivos
- **Pastas colapsáveis** na visualização da árvore
- **Navegação por teclado na árvore** — teclas de seta, Início, Fim e Enter
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
- **Modal Sobre** com versão do aplicativo ao vivo (evoluído da tela de créditos v1)
- **Diálogo de alterações não salvas** ao fechar com projetos modificados
- **Sobreposição de arrastar e soltar** para arquivos `.tree` e arquivos compactados
- **Fontes agrupadas** — Inter e JetBrains Mono

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** no fluxo de boas-vindas e configurações
- **Traduções do processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de localidade em sincronia

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do `localStorage` legado
- **Autosave** de abas abertas, conteúdos de arquivos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão ao iniciar ou sempre começar limpa

#### Atualizador automático & notas de lançamento
- **Atualizador automático no aplicativo** — verificar Lançamentos do GitHub, baixar com progresso e reiniciar para instalar
- **Canais de atualização estáveis e beta**
- **Notas de lançamento localizadas** no modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais amplo, **O que há de novo** expandido por padrão, área de rolagem dedicada, hierarquia de cabeçalhos mais clara e botões de ação fixos no rodapé
- **Fluxo de trabalho manual `docs/changelog.md`** — editar notas de lançamento no repositório; CI as traduz para o aplicativo e publica em inglês no GitHub
- **Notas de lançamento divididas** — o modal de atualização do aplicativo mostra apenas o texto do changelog; links de navegação de localidade aparecem em `docs/changelog.md` e na descrição do lançamento do GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução de Modelos do GitHub** — notas de lançamento em português e espanhol são geradas em CI via API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com UI de captura e ação de restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas & distribuição
- **Windows** — instalador NSIS, MSI e builds portáteis para x64 e ARM64; instalador multilíngue (inglês, português e espanhol) com título de seletor de idioma localizado
- **Linux** — AppImage, deb e snap para x64 e ARM64; builds Flatpak (x86_64 e aarch64, runtime 25.08) com lançador `zypak-wrapper`
- **macOS** — DMG e ZIP para Apple Silicon (arm64)
- **Lançamentos do GitHub** publicados automaticamente em tags de versão a partir do CI
- **Construção do renderizador antes do empacotamento** — `beforePack` executa `vite build` e valida `dist/renderer/` para que cada instalador envie o pacote de UI

#### Arquitetura, ferramentas de desenvolvimento & qualidade
- **Construção do renderizador Vite** com substituição de módulo quente em desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manipuladores IPC divididos** para projeto, atualizações e ciclo de vida do aplicativo
- **API de pré-carregamento `contextBridge`** para uma fronteira de renderizador reforçada
- **Conjunto de testes Vitest** com simulações do Electron para execuções amigáveis ao CI; helpers de erro de changelog e atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para recarregamento quente do processo principal durante o desenvolvimento
- **Exportação de log de erro** em caso de falha para facilitar a depuração
- **`semver`** como uma dependência direta para comparação de versão confiável no aplicativo

### Alterado

- **Reescrita completa** do monólito v1 (`main.js`, `renderer.js`, `styles.css`) para uma arquitetura modular Vite + Electron
- **Fluxo de construção** — o botão **Construir** na barra de ferramentas agora abre o **Estúdio de Construção** em vez de escrever arquivos imediatamente
- **Temas** — modos claro e escuro, além de uma opção **Sistema** que segue o esquema de cores do SO
- **Tela de créditos** renomeada para **Sobre o Tree IDE** com informações de versão dinâmicas
- **Salvar / carregar** — carregador unificado para projetos `.tree`, arquivos compactados e pastas; suporta projetos criptografados e mapas de conteúdo de arquivos importados
- **Visualização da árvore** — conectores ASCII, ícones Lucide, botões de dobra e destaque de arquivo ativo substituem a visualização básica da árvore v1
- **Armazenamento de sessão** movido de `localStorage` para **IndexedDB** para suportar cargas de autosave maiores (abas + conteúdos de arquivos)
- **Distribuição** expandida de MSI apenas para Windows (v1) para CI multiplataforma com suporte ARM64, Flatpak e pacotes macOS
- **Electron** atualizado de v26 (v1) para v42 (v2)
- **Versionamento de lançamento** movido para lançamentos semânticos v2.x com geração automatizada de changelog multilíngue
- **Roteamento de notas de lançamento** — `en.md`, `pt.md` e `es.md` alimentam o atualizador no aplicativo; `github-release.md` alimenta o corpo do lançamento do GitHub com o link de comparação
- **Tela de modelos** — editor de estrutura e visualização da árvore usam uma divisão 50/50 no modo de edição personalizada; rótulo de visualização encurtado para **Visualização**; ação **Usar modelo** centralizada no rodapé do modal
- **Toasts de modelo personalizado** — dica de abrir no editor agora aponta para **Do projeto atual** em vez da ação de atualização por modelo removida
- **Barra de abas de visualização de arquivos** — abas de arquivos rolam em uma região dedicada ao lado do badge de tipo de arquivo e botão de fechar; removido o divisor vertical; altura da barra estável com rolagem de seta apenas (sem expansão de barra de rolagem ao passar o mouse)
- **Tipografia do editor de visualização de arquivos** — tamanho monoespaçado compartilhado com os visualizadores de arquivos do Estúdio de Construção e Modelos
- **Visualizações de README** — captura de tela principal fica sob `assets/previews/`; READMEs em português e espanhol usam imagens de visualização localizadas

### Corrigido

- **Ícones de linha personalizada de modelos** — ações de renomear, abrir no editor, exportar e excluir usam ícones Lucide agrupados (`type`, `file-code`, `download`, `trash-2`) em vez de recorrer ao glifo de arquivo genérico
- **Visualização de arquivos de modelos** — conteúdos de arquivos são renderizados em um painel de editor monoespaçado em largura total (não texto simples), correspondendo ao comportamento do modelo embutido; o painel de arquivos é limpo quando o editor de estrutura é esvaziado
- **Editor de estrutura de modelos** — Tab indenta na estrutura e áreas de texto de arquivo em vez de pular o foco para outros controles; a visualização da árvore é atualizada ao vivo enquanto se digita; a lista de modelos embutidos não deixa mais um espaço abaixo do último item quando o rodapé personalizado está oculto
- **Vínculos de modal de modelos** — ouvintes do editor de estrutura/arquivo se reanexam após a nova renderização da lista para que edições inline continuem funcionando
- **Tela em branco / preta após a instalação** — builds empacotados poderiam ser enviados sem `dist/renderer/` porque a saída da UI é ignorada pelo git; `electron-before-pack` agora constrói e verifica o renderizador antes de cada empacotamento `electron-builder`
- **Falhas na verificação de atualização** — erros localizados mais claros para problemas de rede, `latest*.yml` ausentes e lançamentos inacessíveis; toasts de erro duplicados removidos; erros desconhecidos do atualizador recorrem a uma mensagem traduzida em vez de inglês bruto
- **Nome da versão de lançamento no diálogo de atualização** — template `Tree IDE v${version}` do electron-builder é normalizado para a string de versão real no aplicativo
- **CI de lançamento (trabalho de tradução)** — migrado para `models.github.ai`; injeção de `latest*.yml` é executada no único fluxo de trabalho `Release Finalize` sem `npm install`
- **Portão de finalização de lançamento** — builds de plataforma publicam lançamentos em rascunho; cada trabalho de CI de plataforma verifica se Windows, Linux e macOS tiveram sucesso e só então despacha `Release Finalize` uma vez (o trabalho de despacho trata seu próprio fluxo de trabalho como concluído mesmo enquanto o GitHub ainda o marca como `in_progress`); a finalização publica `latest*.yml` localizados, Snap e ativos Flatpak; o aplicativo ignora atualizações até que notas de lançamento em inglês, português e espanhol estejam presentes
- **Empacotamento Flatpak** — corrigido caminho de staging do Electron, fontes do manifesto, diretório descompactado ARM64, ponto de entrada `zypak-wrapper` e patching do nome do desktop
- **Limpeza de cache do GitHub Actions** — corrigido `jq` comparando IDs de cache numéricos com strings, o que poderia excluir a entrada de cache que deveria ser mantida
- **CI do snap do Linux** — artefatos snap são construídos com `--publish never` para que o CI não exija credenciais da Snap Store; o arquivo `.snap` é anexado ao lançamento do GitHub durante `Release Finalize` (apenas x64)
- **Segurança de caminho** — parser e criador de árvore rejeitam caminhos de travessia e outros caminhos inseguros antes de escrever no disco
- **Validação de indentação** — tabs e espaços misturados são detectados e relatados no painel de validação
- **Nomes duplicados** — arquivos e pastas irmãos com o mesmo nome são sinalizados antes da construção
- **Validação de exportação criptografada** — senha e confirmação devem corresponder antes de criar arquivos ZIP ou `.tree` protegidos
- **Detecção de atualização** — apenas versões estritamente mais novas que a versão instalada são oferecidas
- **Renderização de notas de lançamento** — HTML em changelogs de atualização é sanitizado antes da exibição
- **Barra de abas de visualização de arquivos** — abas não se sobrepõem mais ao rótulo de tipo de arquivo ou interrompem o layout do editor quando muitos arquivos estão abertos
- **Editor de visualização de arquivos** — barra de rolagem e edição por teclado (Tab / Backspace) correspondem ao editor de estrutura principal; peso e tamanho da fonte agora correspondem ao visualizador de arquivos de Modelos
- **Nomeação de salvar / exportar** — saves e exports `.tree` usam o nome do projeto resolvido em vez de um genérico Sem Título
- **Persistência de modelos personalizados** — modelos personalizados são salvos automaticamente enquanto o modal de Modelos está aberto e restaurados do IndexedDB após a reinicialização
- **Construção do instalador NSIS do Windows** — strings em espanhol usam LCID **3082** (`SpanishInternational`, correspondendo ao `es_ES` do electron-builder); removidas as sobreposições redundantes `Spanish-1034.nsh` e `MUI_UNTEXT_*` em português para que `makensis -WX` não falhe mais em LangStrings duplicadas ou ausentes
- **Idioma do instalador NSIS do Windows** — seletor de idioma no assistente (inglês, português, espanhol) sem relançamento ou arquivos auxiliares temporários; **Próximo** avança imediatamente e diretório, progresso, finalização e páginas personalizadas aplicam títulos, descrições e botões traduzidos no momento da exibição via `SendMessage`
- **Idioma do desinstalador NSIS do Windows** — mesmo seletor de idioma no assistente; páginas de progresso e finalização seguem o idioma selecionado sem relançamento

### Removido

- **Layout monolítico de arquivo único** da v1 — substituído pela estrutura modular `src/` (funcionalidade preservada e expandida)
- **UI de construção em uma etapa** — substituída pelo Estúdio de Construção; a criação direta de pastas ainda está disponível dentro do estúdio
- **Empacotamento apenas MSI para Windows** como o único formato de distribuição — substituído por NSIS, MSI, portátil e artefatos Linux/macOS
