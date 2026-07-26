<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## Novidades na v2.0.111

Tree IDE v2 é uma reescrita e expansão total do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A mesma ideia central — desenhar estruturas de pastas em texto simples, visualizar em tempo real e gerar projetos — com nova arquitetura, ferramentas aprimoradas e versões disponíveis apenas para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacotes
- **Escolhas explícitas de retenção de dados** — instalar manualmente por cima de uma versão existente do Tree IDE e desinstalar agora apresentam opções claras de Manter ou Excluir, com Manter selecionado por padrão
- **Setup reconhecendo primeira instalação** — a escolha de dados é ignorada quando não existem perfis anteriores do Tree IDE ou dados do atualizador, e não interrompe atualizações automáticas silenciosas
- **Fluxo de dados auxiliado corretamente** — instalações manuais sobre uma versão existente e desinstalação exibem as opções Manter/Excluir; atualizações silenciosas feitas no app ignoram o prompt e preservam os dados
- **Boas-vindas seguem a escolha de dados** — introdução aparece ao criar um perfil novo ou após selecionar Excluir, enquanto escolher Manter preserva o estado de onboarding concluído
- **Ação correta ao finalizar desinstalação** — a página final agora rotula o botão principal como Concluir em vez de Avançar em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade Electron ASAR e carregamento restrito ao arquivo validado
- **Runtime enxuta para Windows x64** — removidos o encadeamento de empacotamento Squirrel não utilizado e os binários 7-Zip de outros sistemas/arquiteturas dos arquivos distribuídos
- **Limpeza opcional completa** — excluir dados cobre preferências, cache, logs, sessão salva, pastas de perfil atual e legado, além de dados do atualizador

#### Build Studio e saída de projetos
- **Build Studio** — fluxo de build em tela cheia com pré-visualização da árvore ao vivo, visualização de conteúdo por arquivo, estatísticas e opções de exportação
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas ZIP ou exportar apenas o arquivo de projeto `.tree`
- **Saídas combinadas** — exportação opcional de ZIP junto com build da pasta; pode incluir o arquivo `.tree` dentro do arquivo ZIP
- **Botão de criar com ZIP sensível ao conteúdo** — builds combinados de pasta e ZIP agora rotulam a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta, ou Arquivos e Pastas seguido de `+ ZIP`, conforme a estrutura selecionada
- **Inspeção pré-build** — escaneia a pasta de destino procurando estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolha entre pular ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e outros)
- **Placeholders i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos e criptografia
- **Compatibilidade com arquivos do Tree IDE 1** — Tree IDE 1 identifica o formato de arquivo `.tree` de primeira geração usado no Tree IDE Legacy; arquivos originais sem cabeçalho UTF-8 continuam legíveis com indentações em tabulação e `...`
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` criptografados de alta segurança** — TREEIDE2 utiliza AES-256-GCM autenticado com Argon2id (256 MiB, 4 passes, 4 lanes), autentica o cabeçalho criptográfico e mantém o formato sem cabeçalho original do Tree IDE Legacy legível como geração 1
- **Proteção explícita `.tree`** — uma checkbox dedicada habilita os campos de senha e confirmação, explica que será aplicada criptografia TREEIDE2, e exibe o aviso de senha irrecuperável apenas enquanto a proteção estiver selecionada
- **Importação de arquivos compactados** via diálogo de arquivos ou arrastar-e-soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Prompt de senha** para arquivos ZIP criptografados e arquivos `.tree` protegidos
- **Carregar pasta como estrutura** — transforma um diretório existente em texto de árvore editável

#### Templates
- **19 templates iniciais embutidos** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de templates** — browser em tela cheia com três colunas, abas embutidas e personalizadas, edição inline da estrutura e visualização ao vivo da árvore
- **Templates customizados** — crie em branco, importe do projeto atual, renomeie, edite conteúdos dos arquivos inline, abra no editor principal, exporte ou exclua sem sair da tela
- **Arquivos `.tree-template`** — exportação/importação de templates customizados compartilháveis (JSON `treeide-template` v1) via diálogos nativos de salvar/abrir ou exportação por linha na lista customizada
- **Rodapé de templates customizados** — quando há templates customizados: **Novo template**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Pré-visualização por arquivo** — ao clicar em um arquivo na prévia de estrutura, abre um editor painel monoespaçado de largura total com o selo de tipo de arquivo (mesmo layout de um painel para templates embutidos e customizados)
- **Busca em templates** — filtra templates embutidos e customizados conforme a digitação, com correspondência insensível a maiúsculas/minúsculas e acentos e feedback localizado para ausência de resultados
- **Favoritos de templates** — marque templates com uma estrela Lucide embutida, navegue na aba dedicada Favoritos e mantenha a seleção entre sessões do app

#### Command Palette e acessibilidade
- **Command Palette expandido** — use `Ctrl+Shift+P` para buscar 23 ações, adicionando Salvar Tudo, Desfazer, Refazer, Nova Aba, próximo/anterior aba de projeto, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre aos comandos existentes de projeto, build, configurações, tela cheia e relatórios
- **Comandos sensíveis ao contexto** — Salvar Tudo e ações de abas de projeto/arquivo permanecem visíveis para fácil descoberta, mas ficam desabilitadas quando não podem ser executadas de forma segura
- **Fluxo de comandos orientado por teclado** — teclas de seta mudam o comando ativo, Enter executa, Escape fecha o palette e o foco retorna ao controle anterior
- **Suporte aprimorado para leitores de tela** — nomes acessíveis localizados, padrões semânticos de combobox/listbox/aba, rastreio de descendente ativo, contagem ao vivo de resultados e anúncios de status mais claros em comandos e templates
- **Ações acessíveis de template** — controles de favoritar, renomear, editar, exportar e excluir expõem rótulos e estados localizados através de `aria-pressed`, `aria-selected` e regiões ao vivo

#### Rich Presence
- **Privacidade em primeiro lugar por padrão** — Discord Rich Presence agora começa desabilitado, e os controles de barra de status, idioma e privacidade permanecem indisponíveis até o usuário habilitar explicitamente a integração
- **Discord RPC pronto para uso** — Tree IDE acompanha seu ID de Aplicação Discord público, conecta automaticamente ao cliente desktop aberto, informa status da conexão, tenta reconectar após desconexão e não exige nenhuma configuração do usuário
- **Estados de atividade específicos** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando Templates, Personalizando Template, Configurações e build-aware Criando Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta ou Arquivos e Pastas; a opção Build Studio usa o mesmo título e descrição dinâmicos, enquanto saídas `.tree` permanecem disponíveis para projetos flat válidos e exportações usam o estado genérico Exportando Arquivo.
- **Estado inativo sensível ao editor** — a presença começa como Inativo e só informa Editando Estrutura após interação direta com o editor; cinco minutos sem interação retornam ao Inativo com ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual, e Detalhado pode mostrar o nome do projeto e tipo de arquivo; caminhos e conteúdos nunca são compartilhados
- **Rich Presence sensível à energia** — bloqueio e suspensão limpam a atividade; desbloquear e retomar restauram automaticamente
- **Presence localizada** — segue o idioma do Tree IDE ou permite escolher inglês, português ou espanhol independentemente; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Escopo de localização explicado** — o Discord recebe um payload de atividade localizado, então cada visualizador vê o idioma Presence selecionado pelo publicador, e não uma tradução baseada no idioma do Discord do visualizador

#### Editor, árvore e validação
- **Painel de validação** — indentação incorreta, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para ir à linha correspondente
- **Desfazer/refazer** com até 100 estados de histórico
- **Abas de projetos múltiplos** com indicadores de modificados, barra de abas rolável e reordenação por arrastar-e-soltar
- **Abas de arquivos por projeto** — edite conteúdo dos arquivos iniciais antes de buildar e reordene arquivos abertos com arrastar e soltar mantendo a aba ativa
- **Sincronização de abas de arquivos excluídos** — ao remover arquivos ou alterar extensões no editor de estrutura, todas as abas de arquivos obsoletas são fechadas, selecionando a aba válida mais próxima quando necessário e impedindo reaparecimento de conteúdo excluído
- **Pré-visualização Markdown ao vivo** para arquivos `.md` no painel de visualização de arquivos
- **Pastas colapsáveis** na visualização da árvore
- **Navegação da árvore pelo teclado** — setas, Home, End e Enter
- **Correspondência inteligente de renomeação de arquivos** ao editar linhas na árvore
- **Indentar/desindentar bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, pré-visualização de arquivo) com layout persistente entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide** incluídos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 extensões rotuladas** no mapa de tipos de arquivo

#### UI e experiência inicial
- **Janela personalizada sem moldura** com controles de minimizar, maximizar e fechar
- **Primeiro lançamento limpo** — o app permanece oculto até a restauração completa da interface na primeira renderização, enquanto os metadados da versão são carregados em segundo plano, evitando tela congelada de início
- **Barra de menus** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout redesenhado com header hero, cards de configurações agrupadas (Geral, Aparência, Sessão) e botão fixo **Comece Agora**
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do app ao vivo (evoluído da tela de créditos da v1)
- **Dialog de alterações não salvas** ao fechar com projetos modificados
- **Overlay de arrastar-e-soltar** para arquivos `.tree` e compactados
- **Fontes incluídas** — Inter e JetBrains Mono

#### Diagnóstico com privacidade e relatórios no GitHub
- **Formulário de relatório estruturado** — coleta título do problema, descrição, passos de reprodução e comportamento esperado em campos localizados, expandidos automaticamente, com contadores de caracteres
- **Seletor de label do repositório** — carrega labels atuais do GitHub com fallback offline, exibe no dropdown customizado do app, adiciona label selecionada ao prefixo do título e já pré-seleciona no draft do GitHub
- **Draft do problema limpo e localizado** — abre o GitHub automaticamente após breve atraso de redirecionamento, com título, seções Markdown e label já preenchidos para revisão; clicar no popup ou pressionar Enter/Espaço esconde o aviso sem alterar o timer, e o envio nunca ocorre automaticamente
- **Logs da execução atual** — inclui apenas entradas da última inicialização, separadas em seção do processo principal e da renderização, limite de 256 KB e carimbos com horário localizado em 12 horas, período do dia e fuso
- **Pacote diagnóstico sanitizado** — remove caminhos locais, e-mails, IPs e segredos em URLs, excluindo nomes e conteúdos de projetos
- **Captura de screenshots interativas** — após opt-in explícito, esconde o formulário e captura região selecionada ou janela completa, permite novas capturas com `Shift+P` mesmo com barra flutuante recolhida, e instrui a esconder controles e instruções ao arrastar para não cobrir conteúdo selecionado
- **Revisão das capturas antes de salvar** — permite até 10 capturas, abre miniaturas em tamanho real, remove imagens indesejadas, salva cada PNG retido no ZIP diagnóstico local; nunca captura desktop ou outras janelas
- **Anexos locais primeiro** — salva o ZIP no caminho escolhido sem abrir o Explorador ou fazer upload; logs e screenshots ficam locais até ser anexados manualmente
- **Modal de relatório mais seguro** — seleção de texto e arrastos não fecham mais o diálogo, campos se expandem automaticamente, contraste do tema claro/escuro segue o restante do app, e o formulário reseta após sucesso, cancelar ou fechamento pelo X

#### Internacionalização
- **Interface traduzida para inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** na introdução e nas configurações
- **Traduções do processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de idioma sincronizados

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do legado `localStorage`
- **Salvamento automático** de abas abertas, conteúdo dos arquivos e nomes de projetos
- **Modos de sessão** — restaurar última sessão ao iniciar ou sempre começar limpo

#### Auto-atualizador e notas de versão
- **Auto-atualizador no app** — consulta ao GitHub Releases, download com barra de progresso e reinício para instalar
- **Canais de atualização estável e beta**
- **Notas de versão localizadas** no modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais largo, **Novidades** expandido por padrão, área de rolagem dedicada, hierarquia de títulos mais clara e botões de ação fixados no rodapé
- **Workflow manual `docs/changelog.md`** — editar notas de versão no repositório; CI traduz para o app e publica inglês no GitHub
- **Notas de versão separadas** — o modal de atualização do app exibe apenas o texto do changelog; links de navegação de idioma aparecem em `docs/changelog.md` e na descrição da versão do GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução via GitHub Models** — notas de versão em português e espanhol geradas no CI via API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com interface de captura e ação de restaurar padrão
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom no editor

#### Plataformas e distribuição
- **Windows x64** — instalação NSIS e pacotes portáteis; instalador multilíngue (inglês, português e espanhol)
- **Releases no GitHub** publicadas automaticamente para tags de versão via CI
- **Build da interface antes de empacotar** — `beforePack` executa `vite build` e valida `dist/renderer/` para que cada instalador venha com o pacote UI completo

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Build da interface com Vite** e hot module replacement em desenvolvimento
- **Código modularizado** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **ES modules**, Node.js 24+, Electron 42
- **Handlers IPC separados** para projetos, atualizações e ciclo do app
- **API de preload `contextBridge`** para um boundary mais seguro na renderização
- **Testes automatizados com Vitest** e mocks Electron para execuções CI-friendly; changelog e helpers de erros de updater cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para hot reload do processo principal no desenvolvimento
- **Exportação de logs de erro** em caso de crash para facilitar debugging
- **`semver`** como dependência direta para comparação confiável de versões no app
