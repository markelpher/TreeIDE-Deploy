<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## Novidades na v2.0.107

O Tree IDE v2 é uma reescrita completa e expansão do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Mantém o mesmo conceito central — desenhar estruturas de pastas em texto simples, visualizar em tempo real e gerar projetos — com nova arquitetura, ferramentas aprimoradas e versões exclusivas para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacote
- **Escolha explícita de retenção de dados** — instalar manualmente sobre uma versão existente do Tree IDE e desinstalar agora apresentam opções claras de Manter ou Apagar, sendo Manter selecionado por padrão
- **Setup detecta a primeira instalação** — a escolha de dados é ignorada quando não há perfil ou dados do atualizador anteriores do Tree IDE, sem interromper atualizações automáticas silenciosas
- **Fluxo de dados assistido corretamente** — instalações manuais sobre uma versão existente e a desinstalação mostram opções Manter/Apagar; atualizações silenciosas no aplicativo pulam o aviso e mantêm os dados
- **Boas-vindas seguem escolha de dados** — a orientação aparece para perfil novo ou após selecionar Apagar, enquanto ao escolher Manter o estado da orientação completada é preservado
- **Ação final correta no desinstalador** — a última página agora rotula o botão principal como Concluir em vez de Avançar em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade ASAR do Electron e carregamento restrito ao arquivo validado
- **Runtime Windows x64 enxuto** — removido o toolchain Squirrel não utilizado e os binários 7-Zip de outras plataformas dos arquivos distribuídos do aplicativo
- **Limpeza opcional completa** — a exclusão de dados cobre preferências, cache, logs, sessão salva, pastas de perfil atual e legado, além dos dados do atualizador

#### Build Studio e saída de projeto
- **Build Studio** — fluxo de build em tela cheia com pré-visualização ao vivo da árvore, prévia de conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — exportar ZIP junto com build de pasta opcionalmente e incluir o arquivo `.tree` dentro do arquivo ZIP
- **Botão de criar com ZIP sensível ao conteúdo** — builds combinados pasta + ZIP rotulam a ação conforme a estrutura selecionada: Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta, ou Arquivos e Pastas seguidos de `+ ZIP`
- **Inspeção antes do build** — escaneia a pasta de destino para estrutura existente, arquivos `.tree` ou ZIP antes de gravar
- **Tratamento de conflitos** — escolha pular ou sobrescrever quando já existirem arquivos ou pastas
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e outros)
- **Placeholders de i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos e criptografia
- **Compatibilidade com arquivos Tree IDE 1** — Tree IDE 1 identifica o formato `.tree` de primeira geração usado pelo Tree IDE Legacy; arquivos originais UTF-8 sem cabeçalho seguem legíveis tanto com indentação por tabulação quanto por `...`
- **Exportação ZIP** com proteção opcional por senha via AES-256 pelo 7-Zip
- **Projetos `.tree` altamente criptografados** — TREEIDE2 usa AES-256-GCM autenticado com Argon2id (256 MiB, 4 passes, 4 lanes), autentica o cabeçalho criptográfico e mantém o formato original Tree IDE Legacy legível como geração 1
- **Proteção explícita `.tree`** — checkbox dedicada ativa os campos de senha e confirmação, explica que será aplicada criptografia TREEIDE2 e mostra o alerta de senha irrecuperável apenas enquanto a proteção estiver ativa
- **Importação de arquivos** por diálogo ou arrastar & soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Aviso de senha** para arquivos ZIP e `.tree` criptografados
- **Carregar pasta como estrutura** — escaneia um diretório existente e converte em texto de árvore editável

#### Templates
- **19 modelos iniciais embutidos** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de templates** — navegador fullscreen em três colunas com abas de embutidos e personalizados, edição inline da estrutura e preview ao vivo
- **Templates personalizados** — criar em branco, importar do projeto atual, renomear, editar conteúdos inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar templates compartilháveis (JSON `treeide-template` v1) por dialogs nativos ou exportação por linha na lista personalizada
- **Rodapé de templates personalizados** — quando há templates personalizados: **Novo template**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Prévia por arquivo** — clicar em arquivo na prévia abre painel editor monoespaçado largura total com badge do tipo de arquivo (mesmo layout para embutidos e personalizados)
- **Busca de template** — filtra templates embutidos e personalizados enquanto digita, com correspondência case/acento-insensível e aviso de resultado vazio localizado
- **Favoritos de template** — marca templates com estrela Lucide local, navega pela aba Favoritos dedicada e mantém a seleção entre sessões do app

#### Palette de comandos e acessibilidade
- **Palette de comandos expandida** — use `Ctrl+Shift+P` para buscar 23 ações, incluindo Salvar Tudo, Desfazer, Refazer, Nova Aba, próxima/anterior aba de projeto, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre além dos comandos existentes de projeto, build, configurações, tela cheia e relatórios
- **Comandos dependentes do contexto** — Salvar Tudo e ações de abas aparecem sempre para facilitar descoberta, mas ficam desativados quando a sessão atual não permite execução segura
- **Fluxo de comandos para teclado** — setas mudam o comando ativo, Enter executa, Esc fecha o palette e o foco retorna ao controle anterior
- **Suporte aprimorado para leitores de tela** — nomes acessíveis localizados, padrões semânticos de combobox/listbox/aba, rastreamento de item ativo, contagem ao vivo de resultados e anúncios de status mais claros por comandos e templates
- **Ações acessíveis de template** — controles de favorito, renomear, editar, exportar e excluir expõem rótulos e estado localizados via `aria-pressed`, `aria-selected` e regiões vivas

#### Rich Presence
- **Discord RPC pronto para uso** — Tree IDE vem com Application ID público do Discord, conecta automaticamente ao cliente desktop, reporta status, tenta reconectar após desconexões e não exige configuração do usuário
- **Estados específicos de atividade** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando Templates, Customizando Template, Configurações, e estados de criar arquivo/pasta conforme Build Studio: Criando Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta ou Arquivos e Pastas; a opção Build Studio usa o mesmo título dinâmico e descrição, enquanto expor `.tree` para projetos válidos e exportações utilizam estado genérico Exportando Arquivo.
- **Estado idle sensível ao editor** — Presence inicia em Idle e só reporta Editando Estrutura após interação direta; cinco minutos sem interação retornam ao Idle com ícone de teclado
- **Três níveis de privacidade** — Básico mostra só Tree IDE, Atividade inclui ação atual, e Detalhado pode exibir nome do projeto e tipo de arquivo; caminhos e conteúdos nunca são compartilhados
- **Presence com consciência de energia** — bloquear e suspender limpam a atividade, desbloquear e retomar restauram automaticamente
- **Presence localizada** — acompanha idioma do Tree IDE ou permite English, Portuguese ou Spanish independentemente; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Explicação do escopo de localização** — O Discord recebe apenas um payload de atividade localizado, então todos os espectadores veem o idioma Presence selecionado pelo publicador, não uma tradução baseada no idioma do Discord do espectador

#### Editor, árvore e validação
- **Painel de validação** — má indentação, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique no aviso para pular direto à linha
- **Desfazer/refazer** com até 100 estados de histórico
- **Abas multi-projeto** com indicador de modificação, barra de abas rolável e reordenação por arrastar e soltar
- **Abas de editor por projeto** — edite o conteúdo inicial antes do build e reordene arquivos abertos via drag & drop mantendo a aba ativa
- **Sincronização de abas de arquivos excluídos** — remover arquivos ou alterar extensões na árvore fecha todas as abas antigas, seleciona a mais próxima válida se necessário e evita conteúdo excluído reaparecer
- **Prévia ao vivo de Markdown** para arquivos `.md` no painel de prévia
- **Pastas colapsáveis** na visualização da árvore
- **Navegação por teclado na árvore** — setas, Home, End e Enter
- **Renomeação inteligente de arquivos** ao editar linhas na árvore
- **Indentação/recuo em bloco** com Tab e Shift+Tab, mais Backspace inteligente para blocos de indentação
- **Zoom no editor** — `Ctrl++`, `Ctrl+-`, e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, prévia de arquivo) com layout persistido entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide embutidos** (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 labels de extensão** no mapa de tipos de arquivo

#### UI e experiência inicial
- **Janela personalizada sem bordas** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas na primeira execução** — layout redesenhado com cabeçalho hero, cartões de configuração agrupados (Geral, Aparência, Sessão) e botão fixado **Comece Agora**
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão ao vivo do app (evolução da tela de créditos da v1)
- **Dialog de alterações não salvas** ao fechar com projetos modificados
- **Overlay de arrastar e soltar** para arquivos `.tree` e compactados
- **Fontes inclusas** — Inter e JetBrains Mono

#### Diagnósticos orientados à privacidade e relatórios no GitHub
- **Formulário estruturado de relatório** — coleta título do problema, descrição, passos de reprodução e comportamento esperado em campos localizados, expansíveis automaticamente e com contadores de caracteres
- **Seletor de label do repositório** — carrega labels atuais do GitHub com fallback offline, exibe elas no dropdown customizado do app, adiciona label selecionado ao prefixo do título e pré-seleciona na minuta do GitHub
- **Minuta de issue localizada e limpa** — abre o GitHub automaticamente após um atraso visível no redirecionamento, com título, seções Markdown e label já preenchidos para revisão; clique no popup ou pressione Enter/Espaço para fechar o aviso sem alterar o timer; o issue nunca é enviado automaticamente
- **Logs somente da execução atual** — inclui só entradas da última inicialização do app, separados por processo principal e renderer, limitados a 256 KB, com horário localizado, período do dia e fuso horário
- **Pacote de diagnóstico sanitizado** — remove caminhos locais, e-mails, IPs e segredos de URLs, sem incluir nome ou conteúdo de projetos
- **Screenshot opcional do Tree IDE** — captura apenas a janela do app após opt-in explícito, nunca a área de trabalho nem outras janelas
- **Anexos orientados para local** — salva ZIP no caminho escolhido pelo usuário sem abrir o Explorer ou enviar nada; logs e screenshots ficam locais até serem anexados manualmente
- **Modal de relatório mais seguro** — seleção de texto e arraste não fecham mais a janela, campos se expandem automaticamente, contraste segue tema claro/escuro do app e o formulário reinicia ao concluir, cancelar ou fechar pelo X

#### Internacionalização
- **Traduções da interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** na orientação inicial e nas configurações
- **Traduções no processo principal** para dialogs nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de idiomas sincronizados

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do legado `localStorage`
- **Salvamento automático** de abas abertas, conteúdos e nomes de projeto
- **Modos de sessão** — restaurar última sessão ao abrir ou sempre iniciar limpo

#### Auto-atualizador e notas de versão
- **Auto-atualizador dentro do app** — busca Releases no GitHub, baixa com progresso e reinicia para instalar
- **Canais de atualização estável e beta**
- **Notas de versão localizadas** na janela de atualização (inglês, português e espanhol)
- **Changelog legível na atualização** — janela mais larga, **Novidades** expandido por padrão, área de rolagem dedicada, hierarquia de títulos mais clara e botões de ação fixados no rodapé
- **Workflow manual `docs/changelog.md`** — edite notas de versão no repositório; CI traduz para o app e publica inglês no GitHub
- **Notas de versão separadas** — modal de atualização mostra só o changelog; links de navegação de idioma aparecem em `docs/changelog.md` e na descrição da release no GitHub (apontando para arquivos em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução GitHub Models** — notas em português e espanhol geradas no CI via API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com captura e ação de restaurar padrão
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z`/`Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab`/`Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas e distribuição
- **Windows x64** — pacotes NSIS Setup e Portable; instalador multilíngue (inglês, português e espanhol)
- **Releases no GitHub** publicadas automaticamente em tags de versão via CI
- **Build renderer antes de empacotar** — `beforePack` executa `vite build` e valida `dist/renderer/`, garantindo que cada instalador contenha o bundle de UI

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Build Vite** da renderer com hot module replacement em desenvolvimento
- **Código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **ES modules**, Node.js 24+, Electron 42
- **Handlers IPC separados** para projeto, atualizações e ciclo de vida do app
- **API preload `contextBridge`** para reforçar limites da renderer
- **Suite de testes Vitest** com mocks de Electron para execução em CI; changelog e helpers de erro do atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para hot reload do processo principal em desenvolvimento
- **Exportação de log de erro** em caso de crash para facilitar depuração
- **`semver`** como dependência direta para comparação confiável de versões no app
