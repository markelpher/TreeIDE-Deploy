<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## Novidades na v2.0.110

Tree IDE v2 é uma reescrita completa e expansão do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A mesma ideia central — criar estruturas de pastas em texto simples, visualizar em tempo real e gerar projetos — com nova arquitetura, ferramentas mais avançadas e versões exclusivas para Windows.

### Adicionado

#### Instalação, armazenamento & proteção de pacote
- **Escolhas explícitas de retenção de dados** — instalar manualmente sobre uma versão existente do Tree IDE ou desinstalar agora apresenta opções claras de Manter ou Excluir, sendo Manter a opção padrão
- **Configuração sensível à primeira instalação** — a escolha de dados é ignorada quando não existe perfil anterior do Tree IDE ou dados do atualizador, e não interrompe atualizações automáticas silenciosas
- **Fluxo de dados assistido correto** — instalações manuais sobre uma versão existente e desinstalação exibem as opções Manter/Excluir; atualizações silenciosas dentro do app ignoram o aviso e mantêm os dados
- **Boas-vindas seguem a escolha de dados** — o onboarding aparece em um perfil novo ou após escolher Excluir, enquanto Manter preserva o estado de onboarding concluído
- **Ação correta ao concluir desinstalação** — a página final agora rotula seu botão principal como Concluir em vez de Avançar em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade do Electron ASAR e carregamento restrito ao arquivo validado
- **Runtime Windows x64 enxuto** — removida a cadeia de ferramentas Squirrel não utilizada e binários 7-Zip não-Windows/não-x64 dos arquivos distribuídos
- **Limpeza opcional completa** — a exclusão de dados abrange preferências, cache, logs, sessão salva, pastas de perfil atual e legado, além de dados do atualizador

#### Build Studio & saída de projeto
- **Build Studio** — fluxo de build em tela cheia com visualização do tree em tempo real, prévia dos conteúdos por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP, ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — exportar um ZIP junto com a build de pastas, incluindo o arquivo `.tree` dentro do arquivo ZIP
- **Botão de criação com ZIP sensível ao conteúdo** — builds combinadas de pasta e ZIP agora rotulam a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta, ou Arquivos e Pastas seguido de `+ ZIP`, conforme a estrutura selecionada
- **Inspeção pré-build** — escaneia a pasta de destino em busca de estrutura existente, arquivos `.tree` ou ZIP antes de gravar
- **Tratamento de conflitos** — escolha entre ignorar ou substituir quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e outros)
- **Placeholders de i18n** nos arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos & criptografia
- **Compatibilidade com arquivos do Tree IDE 1** — Tree IDE 1 reconhece o formato de arquivo `.tree` de primeira geração usado pelo Tree IDE Legacy; arquivos originais em UTF-8 sem cabeçalho continuam legíveis com estilos de indentação por tab ou `...`
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` criptografados de alta segurança** — TREEIDE2 utiliza AES-256-GCM autenticado com Argon2id (256 MiB, 4 passagens, 4 lanes), autentica o cabeçalho criptográfico e mantém o formato original sem cabeçalho do Tree IDE Legacy legível como geração 1
- **Proteção explícita do `.tree`** — checkbox dedicada ativa os campos de senha e confirmação, explica que será aplicada criptografia TREEIDE2 e exibe o aviso de senha irrecuperável apenas quando a proteção está selecionada
- **Importação de arquivos** via diálogo de arquivo ou arrastar-e-soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, e `.7z`
- **Avisos de senha** para arquivos ZIP criptografados e arquivos `.tree` criptografados
- **Carregar pasta como estrutura** — escaneia diretórios existentes e transforma-os em texto de árvore editável

#### Templates
- **19 templates iniciais integrados** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de templates** — navegador de três colunas em tela cheia com abas integradas e customizadas, edição de estrutura inline e preview do tree em tempo real
- **Templates customizados** — criar em branco, importar do projeto atual, renomear, editar conteúdo dos arquivos inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportação e importação de templates customizados compartilháveis (JSON `treeide-template` v1) via diálogos nativos de salvar/abrir ou exportação por linha na lista customizada
- **Rodapé de templates customizados** — ao existir templates customizados: **Novo template**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação do projeto e importação de arquivo
- **Pré-visualização por arquivo** — clicar em um arquivo no preview de estrutura abre painel editor monoespaçado em largura total, com badge do tipo de arquivo (mesma visualização de painel único para templates integrados e customizados)
- **Busca de template** — filtra templates integrados e customizados enquanto digita, com correspondência insensível a maiúsculas e acentos, e feedback localizado quando não há resultados
- **Favoritos de template** — marca templates com uma estrela Lucide incluída localmente, navega em uma aba dedicada de Favoritos e mantém a seleção entre sessões do app

#### Command Palette & acessibilidade
- **Command Palette expandida** — utilize `Ctrl+Shift+P` para buscar 23 ações, incluindo Salvar Tudo, Desfazer, Refazer, Nova Aba, próxima/anteior aba de projeto, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre — além dos comandos já existentes de projeto, build, configurações, tela cheia e relatórios
- **Comandos sensíveis ao contexto** — Salvar Tudo e ações de abas de projeto/arquivo permanecem visíveis para descoberta, mas são desabilitadas quando a sessão atual não pode executá-las com segurança
- **Fluxo de comando focado no teclado** — Teclas de seta mudam o comando ativo, Enter executa, Esc fecha o palette e o foco retorna ao controle anterior
- **Compatibilidade com leitores de tela aprimorada** — nomes acessíveis localizados, padrões semânticos de combobox/listbox/aba, rastreamento de descendente ativo, contagem de resultados ao vivo e anúncios de status mais claros nos comandos e templates
- **Ações de template acessíveis** — controles de favorito, renomear, editar, exportar e excluir expõem rótulos e estado localizados através de `aria-pressed`, `aria-selected` e regiões ao vivo

#### Rich Presence
- **Privacidade como padrão** — o Discord Rich Presence agora inicia desabilitado, e seus controles de status, idioma e privacidade permanecem inacessíveis até que o usuário ative explicitamente a integração
- **Discord RPC pronto para uso** — Tree IDE já traz seu ID de Aplicação pública do Discord, conecta automaticamente ao cliente desktop, informa o status de conexão, tenta reconectar após desconexões e não requer qualquer configuração do usuário
- **Estados de atividade específicos** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando Templates, Customizando Template, Configurações e estados de build: Criando Arquivo, Criando Arquivos, Criando Pasta, Criando Pastas, Criando Arquivo e Pasta ou Criando Arquivos e Pastas; a opção Build Studio utiliza o mesmo título e descrição dinâmicos, enquanto saídas `.tree` permanecem disponíveis para projetos planos válidos, e exportações usam o estado genérico Exportando Arquivo.
- **Estado de idle sensível ao editor** — Presence começa como Idle e só informa Editando Estrutura depois de interação direta com o editor de estrutura; cinco minutos sem interação retorna para Idle com ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade inclui a ação atual e Detalhado pode exibir o nome do projeto e tipo de arquivo; caminhos e conteúdos de arquivo nunca são compartilhados
- **Presence sensível a energia** — bloquear ou suspender limpa a atividade; desbloquear ou retomar restabelece automaticamente
- **Presence localizada** — segue o idioma do Tree IDE ou permite escolher entre inglês, português ou espanhol; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Escopo de localização explicado** — o Discord recebe um payload de atividade localizado, então todos visualizadores verão o idioma do Presence selecionado pelo publicador, não uma tradução automática baseada no idioma do Discord do visualizador

#### Editor, tree & validação
- **Painel de validação** — indentação incorreta, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para ir até a linha
- **Desfazer/Refazer** com até 100 estados históricos
- **Abas multi-projeto** com indicadores de modificação, barra de abas rolável e reordenação por arrastar-e-soltar
- **Abas de editor de arquivo por projeto** — edite conteúdos de arquivos iniciais antes de construir e reordene arquivos abertos por drag-and-drop, preservando a aba ativa
- **Sincronização de abas de arquivos apagados** — ao remover arquivos ou alterar extensões no editor de estrutura, todas as abas desses arquivos são fechadas, selecionando a aba válida mais próxima quando necessário e prevenindo retorno de conteúdo apagado
- **Prévia live de Markdown** para arquivos `.md` no painel de prévia
- **Pastas recolhíveis** no preview do tree
- **Navegação pelo teclado** no tree — setas, Home, End e Enter
- **Correspondência inteligente de renomeação de arquivos** ao editar linhas no tree
- **Indentação/recuo em bloco** com Tab e Shift+Tab, mais Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, tree, prévia de arquivos) com layout persistido entre sessões

#### Ícones & tipos de arquivo
- **Ícones Lucide** incluídos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 rótulos de extensão** no mapa de tipos de arquivo

#### Interface & experiência inicial
- **Janela customizada sem moldura** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout redesenhado com cabeçalho de destaque, cards de configuração agrupados (Geral, Aparência, Sessão) e botão **Começar** fixado
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do aplicativo ao vivo (evolução da tela de créditos v1)
- **Diálogo de mudanças não salvas** ao fechar com projetos modificados
- **Overlay de arrastar-e-soltar** para arquivos `.tree` e compactados
- **Fontes incluídas** — Inter e JetBrains Mono

#### Diagnóstico de privacidade & relatórios no GitHub
- **Formulário estruturado de relatório** — coleta título do problema, descrição, passos de reprodução e comportamento esperado em campos localizados que se expandem automaticamente, com contadores de caracteres
- **Seletor de rótulo do repositório** — carrega os rótulos atuais do GitHub com fallback offline, exibe-os no dropdown customizado do app, adiciona ao prefixo do título e já seleciona o rótulo no rascunho do GitHub
- **Rascunho de issue limpo e localizado** — abre o GitHub automaticamente após breve atraso de redirecionamento, com título, seções em Markdown e rótulo selecionado preenchidos para revisão; clicar no popup ou pressionar Enter/Espaço oculta o aviso sem alterar o timer, e o issue jamais é enviado automaticamente
- **Logs da execução atual** — inclui apenas entradas de log do último lançamento do app, separados em sessão principal e renderer, limitado a 256 KB, e carimbado com horário localizado em 12h, período e fuso horário
- **Pacote de diagnóstico sanitizado** — remove caminhos locais, emails, endereços IP e segredos de URLs, sempre ocultando nomes e conteúdos dos projetos
- **Captura de screenshots interativas** — após opt-in explícito, oculta o formulário de issue e captura região selecionada ou janela inteira; permite novas capturas com `Shift+P` mesmo com a toolbar flutuante recolhida, ocultando instruções e controles enquanto arrasta para não encobrir o conteúdo selecionado
- **Revisão de screenshots antes de salvar** — coleta até 10 capturas, abre miniaturas em tamanho real, permite remover imagens indesejadas e salva cada PNG retido no ZIP de diagnóstico local; desktop e outras janelas nunca são capturadas
- **Anexos locais como padrão** — salva o ZIP no caminho escolhido pelo usuário, sem abrir o Explorador de Arquivos ou fazer upload; logs e capturas permanecem locais até serem anexados manualmente
- **Modal de relatório mais seguro** — seleção de texto e arrastar não descartam o diálogo, campos expandem automaticamente, contraste claro/escuro acompanha o app e o formulário é resetado após sucesso, Cancelar ou fechar com o botão X

#### Internacionalização
- **Traduções da interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** durante o fluxo de boas-vindas e nas configurações
- **Traduções no processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de idiomas sincronizados

#### Persistência de sessão
- **Armazenamento da sessão em IndexedDB** com migração automática do legado `localStorage`
- **Salvamento automático** de abas abertas, conteúdos dos arquivos e nomes de projetos
- **Modos de sessão** — restaurar última sessão ao abrir ou sempre iniciar limpo

#### Autoatualização & notas de lançamento
- **Autoatualização dentro do app** — verifica lançamentos no GitHub, faz download com progresso e reinicia para instalar
- **Canais de atualização estável e beta**
- **Notas de lançamento localizadas** no modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais amplo, **Novidades** expandido por padrão, área de rolagem dedicada, hierarquia de títulos mais clara e botões de ação fixados no rodapé
- **Workflow manual `docs/changelog.md`** — notas de lançamento editadas no repositório; CI faz tradução para o app e publica em inglês no GitHub
- **Notas de lançamento divididas** — modal de atualização mostra apenas texto do changelog; links de navegação de idioma aparecem em `docs/changelog.md` e na descrição da release no GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução por GitHub Models** — notas de lançamento em português e espanhol geradas via API `models.github.ai` no CI

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com interface de captura e ação para restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas & distribuição
- **Windows x64** — instalador NSIS e pacotes Portable; instalador multilíngue (inglês, português e espanhol)
- **Lançamentos automáticos no GitHub** em tags de versão pelo CI
- **Build do renderer antes do pacote** — `beforePack` executa `vite build` e valida `dist/renderer/` para que todo instalador inclua o bundle da UI

#### Arquitetura, ferramentas de desenvolvimento & qualidade
- **Build do renderer com Vite** e hot module replacement em desenvolvimento
- **Código-base modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **ES Modules**, Node.js 24+, Electron 42
- **Handlers IPC separados** para projeto, atualizações e ciclo de vida do app
- **API de preload `contextBridge`** para segurança da interface de renderer
- **Suite de testes Vitest** com mocks Electron para execuções amigáveis ao CI; changelog e auxiliares de erro do atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados nos scripts npm
- **electron-reloader** para hot reload do processo principal durante desenvolvimento
- **Exportação de log de erros** em caso de crash para facilitar debugging
- **`semver`** como dependência direta para comparação confiável de versões dentro do app
