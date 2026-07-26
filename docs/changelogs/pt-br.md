<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## Novidades na v2.0.109

Tree IDE v2 é uma reescrita completa e expansão do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A mesma ideia central — criar estruturas de pastas em texto simples, visualizar em tempo real e gerar projetos — com uma nova arquitetura, ferramentas mais avançadas e lançamentos exclusivos para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacotes
- **Escolhas explícitas de retenção de dados** — instalar manualmente sobre uma versão existente do Tree IDE e desinstalar agora apresentam opções claras de Manter ou Excluir os dados, com Manter selecionado por padrão
- **Instalador atento à primeira instalação** — a opção de dados é ignorada quando não existe nenhum perfil ou dados do atualizador do Tree IDE, e não interrompe atualizações automáticas silenciosas
- **Fluxo de dados assistido correto** — instalações manuais sobre uma versão existente e desinstalação exibem as opções de Manter/Excluir; atualizações silenciosas pelo app ignoram o prompt e mantêm os dados
- **Boas-vindas após escolha de dados** — o onboarding aparece para um perfil novo ou após selecionar Excluir, enquanto escolher Manter preserva o estado de onboarding já concluído
- **Ação correta ao concluir desinstalador** — a página final agora rotula o botão principal como Concluir ao invés de Avançar, em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece em `app.asar`, agora com validação de integridade Electron ASAR e carregamento restrito ao arquivo validado
- **Runtime enxuto do Windows x64** — removido o toolchain Squirrel não utilizado e binários do 7-Zip de outros sistemas ou arquiteturas do pacote distribuído
- **Limpeza opcional completa** — excluir os dados inclui preferências, cache, logs, sessão salva, pastas de perfil atual e legado e dados do atualizador

#### Build Studio e saída de projeto
- **Build Studio** — fluxo de build em tela cheia com visualização ao vivo da árvore, pré-visualização do conteúdo dos arquivos, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente, exportar um ZIP junto com o build de pasta e incluir o arquivo `.tree` dentro do arquivo ZIP
- **Botão de criar com ZIP sensível ao conteúdo** — builds combinados de pasta e ZIP agora rotulam a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta ou Arquivos e Pastas seguidos de `+ ZIP`, conforme a estrutura escolhida
- **Inspeção pré-build** — varredura da pasta de destino por estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolha entre ignorar ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e outros)
- **Espaços reservados de i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos compactados e criptografia
- **Compatibilidade com arquivos Tree IDE 1** — Tree IDE 1 reconhece o formato de arquivo `.tree` da primeira geração usado pelo Tree IDE Legacy; arquivos originais sem cabeçalho UTF-8 permanecem legíveis com indentação em tabulação ou `...`
- **Exportação ZIP** com proteção de senha AES-256 opcional via 7-Zip
- **Projetos `.tree` criptografados de alta segurança** — TREEIDE2 utiliza AES-256-GCM autenticado com Argon2id (256 MiB, 4 passes, 4 lanes), autentica seu cabeçalho criptográfico e mantém o formato original sem cabeçalho Tree IDE Legacy legível como geração 1
- **Proteção explícita de `.tree`** — caixa de seleção dedicada ativa os campos de senha e confirmação, explica que será aplicada a criptografia TREEIDE2, e mostra o aviso de senha irrecuperável apenas quando a proteção estiver selecionada
- **Importação de arquivos compactados** via diálogo ou arrastar-e-soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Prompt de senha** para arquivos ZIP e `.tree` criptografados
- **Carregar pasta como estrutura** — varre um diretório existente e transforma em texto editável da árvore

#### Templates
- **19 templates iniciais integrados** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de templates** — navegador de três colunas em tela cheia com abas embutidas, edição inline da estrutura e visualização da árvore em tempo real
- **Templates personalizados** — criar em branco, importar do projeto atual, renomear, editar conteúdo dos arquivos inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar templates personalizados compartilháveis (JSON `treeide-template` v1) via diálogos nativos de salvar/abrir ou por exportação de linha na lista de personalizados
- **Rodapé de templates personalizados** — quando houver templates: **Novo template**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Pré-visualização por arquivo** — clicar num arquivo na prévia da estrutura abre um painel editor monoespaçado em largura total, com badge do tipo de arquivo (mesmo layout para templates integrados e personalizados)
- **Busca de templates** — filtra templates integrados e personalizados conforme digita, com correspondência insensível a maiúsculas/minúsculas e acentos, além de feedback local sobre resultados vazios
- **Favoritos de templates** — marque com estrela Lucide embutida, navegue na aba Favoritos dedicada e mantenha os selecionados entre sessões do app

#### Command Palette e acessibilidade
- **Command Palette expandida** — use `Ctrl+Shift+P` para buscar 23 ações, incluindo Salvar Tudo, Desfazer, Refazer, Nova Aba, próxima/anterior aba de projeto, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre, além das já existentes de projeto, build, configurações, tela cheia e reportar
- **Comandos sensíveis ao contexto** — Salvar Tudo e ações nas abas de projeto/arquivo permanecem visíveis para descoberta, mas ficam desabilitados quando a sessão não permite execução segura
- **Fluxo de comandos voltado para teclado** — setas alteram o comando ativo, Enter executa, Esc fecha a palette e o foco volta para o controle anterior
- **Suporte aprimorado para leitores de tela** — nomes acessíveis localizados, padrões semânticos de combobox/listbox/aba, rastreamento do elemento ativo, contagem de resultados em tempo real e anúncios de status mais claros entre comandos e templates
- **Ações acessíveis em templates** — controles de favorito, renomear, editar, exportar e excluir expõem etiquetas e estados localizados via `aria-pressed`, `aria-selected` e regiões ao vivo

#### Rich Presence
- **Privacidade por padrão** — Discord Rich Presence inicia desabilitado e seus controles de status, idioma e privacidade só ficam disponíveis após o usuário ativar a integração explicitamente
- **Discord RPC pronto para uso** — Tree IDE já inclui seu Application ID público do Discord, conecta automaticamente ao cliente desktop em execução, informa status de conexão, tenta reconectar após desconexão e não exige configuração do usuário
- **Estados de atividade específica** — Estruturando, Editando Código, Editando Texto, Visualizando Arquivo, Navegando Templates, Personalizando Template, Configurações e, baseado no Build Studio, Criando Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta ou Arquivos e Pastas; a opção Build Studio usa o mesmo título e descrição dinâmicos, enquanto saídas `.tree` ficam disponíveis para projetos válidos e exports usam um estado genérico Exportando Arquivo.
- **Estado ocioso sensível ao editor** — Presence inicia como Ocioso e só indica Estruturando após interação direta com o editor de estrutura; cinco minutos sem interação retorna a Ocioso com ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual e Detalhado pode mostrar nome do projeto e tipo de arquivo; caminhos e conteúdos de arquivos nunca são compartilhados
- **Presence sensível à energia** — bloqueio e suspensão limpam a atividade, desbloqueio e retomada restauram automaticamente
- **Presence localizado** — segue o idioma do Tree IDE ou permite escolher inglês, português ou espanhol independentemente; o ajuste atualiza o RPC imediatamente e persiste nas sessões
- **Escopo da localização explicado** — O Discord recebe um payload de atividade localizado, então todos veem o idioma selecionado pelo publicador do Presence e não uma tradução baseada na localidade do Discord do observador

#### Editor, árvore e validação
- **Painel de validação** — indentação ruim, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para ir à linha correspondente
- **Desfazer/refazer** com até 100 estados históricos
- **Abas de múltiplos projetos** com indicador de modificação, barra rolável e reordenação por arrastar-e-soltar
- **Abas de edição de arquivos por projeto** — edite conteúdo de arquivos iniciais antes do build e reordene arquivos abertos por drag and drop, mantendo a aba ativa
- **Sincronização de abas de arquivos excluídos** — ao remover arquivos ou alterar extensões no editor de estrutura, todas as abas de arquivos obsoletos são fechadas, seleciona a aba válida mais próxima quando necessário e previne o reaparecimento de conteúdo excluído
- **Visualização ao vivo de Markdown** para arquivos `.md` no painel de pré-visualização
- **Pastas colapsáveis** na prévia da árvore
- **Navegação da árvore via teclado** — setas, Home, End e Enter
- **Renomeação inteligente de arquivos** ao editar linhas da árvore
- **Recuo/bloqueio do bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, prévia de arquivos) com layout preservado entre sessões

#### Ícones e tipos de arquivos
- **Ícones Lucide** embutidos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 labels de extensão de arquivo** no mapa de tipos

#### UI e experiência inicial
- **Janela customizada sem moldura** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas na primeira execução** — layout redesenhado com header de destaque, cartões de configuração agrupados (Geral, Aparência, Sessão) e botão fixo **Começar**
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do app ao vivo (evolução da tela de créditos do v1)
- **Aviso de alterações não salvas** ao fechar projetos modificados
- **Overlay de arrastar-e-soltar** para arquivos `.tree` e compactados
- **Fontes inclusas** — Inter e JetBrains Mono

#### Diagnósticos de privacidade e relatórios no GitHub
- **Formulário de relatório estruturado** — coleta título, descrição do problema, passos de reprodução e comportamento esperado em campos localizados crescentes, com contadores de caracteres
- **Seletor de label do repositório** — carrega labels atuais do GitHub com fallback offline, exibe em dropdown customizado do app, adiciona o label ao prefixo do título e pré-seleciona no rascunho do GitHub
- **Rascunho limpo e localizado de issue** — abre o GitHub automaticamente após atraso visível com título, seções em Markdown e label já preenchidos para revisão; clique no popup ou pressione Enter/Espaço para ocultar o aviso sem alterar o timer, e o issue nunca é enviado automaticamente
- **Logs da execução atual** — inclui apenas logs do último lançamento do app, separados entre processo principal e renderer, limite de 256 KB e data/hora localizada em 12h, período e fuso horário
- **Pacote diagnóstico sanitizado** — oculta caminhos locais, e-mails, IPs e segredos de URLs, excluindo nomes e conteúdos de projeto
- **Captura de screenshots interativas** — após opt-in explícito, oculta o formulário e captura região selecionada ou janela inteira, permite tirar várias capturas com `Shift+P` mesmo com barra flutuante recolhida e oculta instruções e controles ao arrastar para não cobrir o conteúdo
- **Revisão das capturas antes de salvar** — permite até 10 imagens, abre prévias em tamanho real, remove indesejadas e grava PNGs selecionados no ZIP diagnóstico local; desktop e outras janelas nunca são capturados
- **Anexos locais** — salva o ZIP no caminho escolhido sem abrir o Explorer ou fazer upload; logs e screenshots permanecem locais até anexar manualmente
- **Modal de relatório mais seguro** — seleção de texto e arrastar não fecham o diálogo, campos são redimensionados automaticamente, o contraste segue o tema do app e o formulário é resetado após sucesso, Cancelar ou fechar com X

#### Internacionalização
- **Traduções da interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** no fluxo de boas-vindas e configurações
- **Traduções no processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de idioma sincronizados

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do `localStorage` legado
- **Salvamento automático** de abas abertas, conteúdos dos arquivos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão na inicialização ou sempre começar limpo

#### Autoatualização e notas de versão
- **Autoatualizador integrado** — verifica Releases do GitHub, baixa com progresso e reinicia para instalar
- **Canais de atualização estável e beta**
- **Notas de versão localizadas** na modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais amplo, seção **Novidades** expandida por padrão, área de rolagem dedicada, hierarquia de títulos melhorada e botões de ação fixados no rodapé
- **Fluxo manual de `docs/changelog.md`** — notas de versão editadas no repositório; CI traduz para o app e publica em inglês no GitHub
- **Notas de versão separadas** — modal de atualização do app mostra apenas o changelog; links de navegação de idioma aparecem em `docs/changelog.md` e na descrição do release no GitHub (apontando para arquivos legíveis em `docs/changelogs/`); link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução com GitHub Models** — notas em português e espanhol geradas em CI via API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com interface de captura e ação de restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas e distribuição
- **Windows x64** — instalador NSIS e pacotes portáteis; instalador multilíngue (inglês, português e espanhol)
- **Releases no GitHub** publicados automaticamente em tags de versão pelo CI
- **Build do renderer antes do empacotamento** — `beforePack` roda `vite build` e valida `dist/renderer/`, garantindo que todo instalador inclua o bundle da UI

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Build do renderer com Vite** e hot module replacement no desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Handlers IPC separados** para projeto, atualizações e ciclo de vida do app
- **API preload `contextBridge`** para fronteira reforçada do renderer
- **Testes Vitest** com mocks do Electron para execuções amigáveis ao CI; funções de changelog e mensagens de erro do updater cobertas por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para hot reload do processo principal durante o desenvolvimento
- **Exportação de logs de erro** ao ocorrer crash para facilitar debug
- **`semver`** como dependência direta para comparação confiável das versões no app
