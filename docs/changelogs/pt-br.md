<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## Novidades na v2.0.108

Tree IDE v2 é uma reescrita completa e expansão do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Mesma ideia central — desenhar estruturas de pastas em texto simples, pré-visualizá-las em tempo real e gerar projetos — com nova arquitetura, ferramentas enriquecidas e versões exclusivas para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacotes
- **Escolhas explícitas de retenção de dados** — ao instalar manualmente sobre uma versão existente do Tree IDE ou desinstalar, agora aparecem opções claras de Manter ou Excluir, sendo Manter a selecionada por padrão
- **Instalação sensível ao primeiro uso** — a escolha de dados é pulada quando não existe perfil anterior do Tree IDE nem dados do atualizador, e não interrompe atualizações automáticas silenciosas
- **Fluxo de dados assistido corretamente** — instalações manuais sobre versão existente e desinstalação mostram as opções Manter/Excluir; atualizações silenciosas dentro do app pulam o aviso e preservam os dados
- **Boas-vindas seguem a escolha de dados** — onboarding aparece para perfil novo ou após selecionar Excluir; ao escolher Manter, o estado de onboarding concluído é preservado
- **Ação correta de finalização no desinstalador** — a página final agora rotula seu botão principal como Concluir em vez de Avançar em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação da integridade Electron ASAR e carregamento restrito ao arquivo validado
- **Runtime enxuto Windows x64** — removidas a cadeia de ferramentas Squirrel não utilizada e os binários do 7-Zip para outros sistemas/arquiteturas dos arquivos distribuídos do app
- **Limpeza opcional completa** — ao excluir dados, cobre preferências, cache, logs, sessão salva, pastas de perfil atual e legado e dados do atualizador

#### Build Studio e saída de projetos
- **Build Studio** — fluxo de construção em tela cheia, com pré-visualização viva da árvore, pré-visualização por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP, ou apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente exporte um ZIP junto com a construção de pastas e inclua o arquivo `.tree` dentro do arquivo ZIP
- **Botão criar-com-ZIP sensível ao conteúdo** — construções combinadas de pasta e ZIP agora rotulam a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta ou Arquivos e Pastas seguido de `+ ZIP`, conforme a estrutura selecionada
- **Inspeção pré-construção** — escaneie a pasta alvo em busca de estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolha pular ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e outros)
- **Marcadores i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos compactados & criptografia
- **Compatibilidade com arquivos Tree IDE 1** — Tree IDE 1 reconhece o formato `.tree` de primeira geração usado pelo Tree IDE Legacy; arquivos UTF-8 originais sem cabeçalho continuam legíveis com estilos de indentação por tabulação e `...`
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` altamente criptografados** — TREEIDE2 utiliza AES-256-GCM autenticado com Argon2id (256 MiB, 4 passagens, 4 threads), autentica o cabeçalho criptográfico e mantém o formato original sem cabeçalho do Tree IDE Legacy legível como geração 1
- **Proteção explícita `.tree`** — uma caixa de seleção dedicada habilita os campos de senha e confirmação, explica que será aplicada criptografia TREEIDE2 e exibe o aviso de senha irrecuperável apenas enquanto a proteção está selecionada
- **Importação de arquivos compactados** vía diálogo de arquivos ou arraste-e-solte: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitação de senha** para arquivos ZIP e `.tree` criptografados
- **Carregar pasta como estrutura** — escaneie um diretório existente e transforme-o em texto editável de árvore

#### Templates
- **19 templates iniciais embutidos** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de templates** — navegação em três colunas, com abas embutidas (nativos e personalizados), edição de estrutura inline e preview vivo da árvore
- **Templates personalizados** — criar em branco, importar do projeto atual, renomear, editar conteúdo dos arquivos inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar templates customizáveis (JSON `treeide-template` v1) com diálogos nativos para salvar/abrir ou exportação individual por linha na lista personalizada
- **Rodapé para templates personalizados** — quando existem templates personalizados: **Novo template**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Pré-visualização por arquivo** — ao clicar em um arquivo na estrutura, abre-se um editor em painel de largura total, com badge de tipo de arquivo (mesmo layout para templates nativos e personalizados)
- **Busca de templates** — filtra templates nativos e personalizados enquanto digita, insensível a maiúsculas e acentos, com retorno localizado para resultados vazios
- **Favoritos de templates** — marque templates com estrela Lucide embutida localmente, navegue numa aba dedicada Favoritos e mantenha a seleção entre sessões do app

#### Command Palette e acessibilidade
- **Command Palette expandida** — use `Ctrl+Shift+P` para buscar entre 23 ações, incluindo Salvar Tudo, Desfazer, Refazer, Nova Aba, aba de projeto seguinte/anteriores, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre, além dos comandos já existentes de projeto, build, configurações, tela cheia e reportar
- **Comandos sensíveis ao contexto** — Salvar Tudo e ações de aba de projeto/arquivo permanecem visíveis para descoberta mas ficam desabilitadas quando a sessão atual não permite execução segura
- **Fluxo de comandos orientado pelo teclado** — setas mudam o comando ativo, Enter executa, Esc fecha o palette e o foco retorna ao controle anterior
- **Suporte aprimorado para leitores de tela** — nomes acessíveis localizados, padrões semânticos de combobox/listbox/tab, rastreamento de descendente ativo, contagem viva de resultados e anúncios de status mais claros nos comandos e templates
- **Ações acessíveis de templates** — controles de favorito, renomear, editar, exportar e excluir expõem labels localizados e estado por `aria-pressed`, `aria-selected` e regiões vivas

#### Rich Presence
- **RPC do Discord pronto para uso** — Tree IDE já acompanha seu ID de aplicação pública do Discord, conecta automaticamente ao cliente desktop em execução, reporta status de conexão, tenta novamente após desconexão e não exige configuração do usuário
- **Estados específicos de atividade** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando Templates, Personalizando Template, Configurações e estados de construção como Criando Arquivo, Criando Arquivos, Criando Pasta, Criando Pastas, Criando Arquivo e Pasta ou Criando Arquivos e Pastas; a opção Build Studio usa o mesmo título/descrição dinâmicos, enquanto saídas `.tree` ficam disponíveis para projetos válidos e exportações usam um estado genérico Exportando Arquivo.
- **Estado inativo sensível ao editor** — Presence inicia em Ocioso e só reporta Editando Estrutura após interação direta com o editor de estrutura; cinco minutos sem interação voltam ao Ocioso com ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual, e Detalhado pode mostrar também o nome do projeto e o tipo de arquivo; caminhos e conteúdos de arquivos nunca são compartilhados
- **Presence consciente de energia** — bloqueio e suspensão limpam a atividade, desbloqueio e retomada restauram automaticamente
- **Presence localizado** — segue o idioma do Tree IDE ou permite escolher inglês, português ou espanhol independentemente; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Escopo de localização explicado** — o Discord recebe apenas um payload de atividade localizado, então todo espectador vê o idioma Presence selecionado pelo editor, e não uma tradução segundo o idioma do Discord do espectador

#### Editor, árvore e validação
- **Painel de validação** — indentação ruim, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique no aviso para ir à linha correspondente
- **Desfazer/refazer** com até 100 estados de histórico
- **Abas de múltiplos projetos** com indicadores de modificação, barra de abas rolável e reordenação por arraste
- **Abas de edição de arquivos por projeto** — edite conteúdo inicial de arquivos antes de construir e reordene arquivos abertos via arraste sem perder o foco da aba ativa
- **Sincronização de abas de arquivos excluídos** — ao remover arquivos ou alterar extensões no editor de estrutura, todas as abas de arquivo inválidas são fechadas, a aba válida mais próxima é selecionada e conteúdo excluído não volta a aparecer
- **Preview ao vivo de Markdown** para arquivos `.md` no painel de preview de arquivos
- **Pastas colapsáveis** na pré-visualização da árvore
- **Navegação de árvore pelo teclado** — setas, Home, End e Enter
- **Renomeação inteligente de arquivos** ao editar linhas da árvore
- **Recuo e avanço em bloco** com Tab/Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, preview de arquivo) com layout preservado entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide** embutidos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 rótulos de extensões** no mapa de tipos de arquivos

#### UI e experiência inicial
- **Janela personalizada sem moldura** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** no primeiro uso — layout redesenhado com cabeçalho de destaque, cards de configuração agrupados (Geral, Aparência, Sessão) e botão fixado **Começar**
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do app ao vivo (evolução da tela de créditos da v1)
- **Diálogo de mudanças não salvas** ao fechar com projetos modificados
- **Overlay de arraste-e-solte** para arquivos `.tree` e compactados
- **Fontes embutidas** — Inter e JetBrains Mono

#### Diagnóstico privado e reports GitHub
- **Formulário estruturado de report** — coleta título, descrição do problema, passos para reprodução e comportamento esperado em campos localizados que crescem automaticamente e exibem contador de caracteres
- **Seletor de etiquetas do repositório** — carrega as etiquetas ativas do GitHub com fallback offline, exibe em dropdown personalizado do app, adiciona a etiqueta selecionada ao prefixo do título e pré-seleciona no rascunho do GitHub
- **Rascunho de issue limpo e localizado** — abre automaticamente o GitHub após um atraso visível, com título, seções Markdown e etiqueta já preenchidos para revisão; clique no popup ou pressione Enter/Espaço para esconder o aviso sem mudar o timer e o issue nunca é enviado automaticamente
- **Logs da execução atual** — inclui apenas entradas do último lançamento do app, separadas em logs de processo principal e renderizador, limite de 256 KB e carimbadas com horário, período do dia e fuso local, todos localizados
- **Pacote diagnóstico sanitizado** — oculta caminhos locais, e-mails, IPs e segredos de URLs, exclui nomes e conteúdo de projetos
- **Screenshot opcional do Tree IDE** — captura apenas a janela atual do app após confirmação explícita, nunca o desktop ou outras janelas
- **Anexos locais primeiro** — salva o ZIP no local escolhido pelo usuário sem abrir o Explorer ou fazer upload; logs e screenshots permanecem locais até serem anexados manualmente
- **Modal de report mais seguro** — seleção de texto e arraste não fecham mais o diálogo, campos se redimensionam automaticamente, contraste segue o tema do app e o formulário reinicia após sucesso, Cancelar ou ao fechar com o X

#### Internacionalização
- **Interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma no primeiro uso** e nas configurações
- **Traduções de processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de idiomas sincronizados

#### Persistência de sessão
- **Armazenamento da sessão em IndexedDB** com migração automática do legado `localStorage`
- **Auto-salvamento** de abas abertas, conteúdos de arquivos e nomes de projetos
- **Modos de sessão** — restaurar última sessão ao iniciar ou sempre começar limpo

#### Auto-atualização e notas de versão
- **Auto-atualizador embutido** — verifica Releases no GitHub, baixa com progresso e reinicia para instalar
- **Canais de atualização estável e beta**
- **Notas de versão localizadas** na modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais largo, **Novidades** expandido por padrão, área de rolagem dedicada, hierarquia de títulos clara e botões de ação fixos no rodapé
- **Workflow manual `docs/changelog.md`** — editar notas de versão no repositório; CI traduz para o app e publica em inglês no GitHub
- **Notas de versão separadas** — modal de atualização mostra apenas o changelog; links de navegação por idioma aparecem em `docs/changelog.md` e na descrição do release no GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução via GitHub Models** — notas de versão em português e espanhol são geradas automaticamente via API `models.github.ai` em CI

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com interface de captura e ação de restaurar padrão
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas e distribuição
- **Windows x64** — pacotes NSIS Setup e Portable; instalador multilíngue (inglês, português e espanhol)
- **Releases no GitHub** publicadas automaticamente em tags de versão via CI
- **Build do renderer antes de empacotar** — `beforePack` executa `vite build` e valida `dist/renderer/` para garantir que cada instalador inclua o bundle de UI

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Build do renderer usando Vite** e hot module replacement em desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos de CSS
- **ES modules**, Node.js 24+, Electron 42
- **Handlers IPC divididos** para projeto, atualizações e ciclo de vida do app
- **API de preload `contextBridge`** para reforçar a fronteira do renderizador
- **Vitest** com mocks Electron para execuções amigáveis ao CI; changelog e helpers de erro do updater cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para hot reload do processo principal em dev
- **Exportação de logs de erro** ao travar, facilitando o debug
- **`semver`** como dependência direta para comparação confiável de versões dentro do app
