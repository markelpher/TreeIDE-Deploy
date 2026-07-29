<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## O que há de novo na v2.0.112

O Tree IDE v2 é uma reescrita completa e expansão do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A mesma ideia central — desenhe estruturas de pastas em texto simples, visualize-as em tempo real e gere projetos — agora com nova arquitetura, ferramentas aprimoradas e lançamentos exclusivos para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacotes
- **Escolhas explícitas de retenção de dados** — instalar manualmente sobre uma versão existente do Tree IDE ou desinstalar agora apresenta opções claras de Manter ou Excluir, com Manter selecionado por padrão
- **Instalador atento à primeira instalação** — a escolha de dados é ignorada quando não há perfil anterior do Tree IDE ou dados do atualizador, e não interrompe atualizações automáticas silenciosas
- **Fluxo de dados assistido e correto** — instalações manuais sobre uma versão existente e a desinstalação exibem as opções Manter/Excluir; atualizações silenciosas dentro do app ignoram o aviso e mantêm os dados
- **Boas-vindas de acordo com a escolha de dados** — o onboarding aparece para um perfil novo ou ao selecionar Excluir, enquanto Manter preserva o status do onboarding já concluído
- **Ação correta na conclusão do desinstalador** — a página final agora rotula o botão principal como Concluir em vez de Avançar em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade do Electron ASAR e carregamento restrito ao arquivo validado
- **Runtime Windows x64 enxuto** — ferramenta Squirrel removida e binários 7-Zip de outros sistemas ou arquiteturas (não Windows/não x64) eliminados dos arquivos distribuídos do aplicativo
- **Limpeza opcional completa** — excluir dados abrange preferências, cache, logs, sessão salva, pastas de perfil atuais e legados, além dos dados do atualizador

#### Build Studio & saída de projetos
- **Build Studio** — fluxo de build em tela cheia com visualização da árvore em tempo real, prévia de conteúdo por arquivo, estatísticas e opções de exportação
- **Três modos de saída** — criar estrutura de pastas no disco, exportar somente um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente exporte um ZIP junto com a build de pastas, incluindo o arquivo `.tree` dentro do arquivo compactado
- **Botão de criar ciente do conteúdo ao usar ZIP** — build combinando pasta e ZIP agora rotula a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta, ou Arquivos e Pastas seguido de `+ ZIP`, de acordo com a estrutura selecionada
- **Inspeção pré-build** — varre a pasta de destino buscando estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolha entre ignorar ou sobrescrever quando arquivos ou pastas já existirem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Placeholders de i18n** nos arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos compactados & criptografia
- **Compatibilidade com arquivos do Tree IDE 1** — Tree IDE 1 identifica o formato de arquivo `.tree` de primeira geração usado pelo Tree IDE Legacy; arquivos originais sem cabeçalho em UTF-8 continuam legíveis, com suporte à indentação por tabulação e por `...`
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` criptografados com alta resistência** — TREEIDE2 usa AES-256-GCM autenticado com Argon2id (256 MiB, 4 passagens, 4 lanes), autentica o cabeçalho criptográfico e mantém o formato original sem cabeçalho do Tree IDE Legacy legível como geração 1
- **Proteção explícita do `.tree`** — caixa de seleção dedicada permite os campos de senha e confirmação, explica que a criptografia TREEIDE2 será aplicada e exibe o aviso de senha irrecuperável apenas enquanto a proteção estiver selecionada
- **Importação de arquivos compactados** via diálogo de arquivos ou arrastar-e-soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Prompt de senha** para arquivos ZIP e `.tree` criptografados
- **Carregar pasta como estrutura** — varre um diretório existente e transforma-o em árvore editável em texto

#### Templates
- **19 templates iniciais integrados** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de Templates** — navegador em tela cheia dividido em três colunas, com abas para integrados e personalizados, edição de estrutura embutida e pré-visualização da árvore em tempo real
- **Templates personalizados** — crie em branco, importe do projeto atual, renomeie, edite conteúdo dos arquivos diretamente, abra no editor principal, exporte ou exclua sem sair da tela
- **Arquivos `.tree-template`** — exporte e importe templates personalizados compatilháveis (JSON `treeide-template` v1) usando diálogos nativos de salvar/abrir ou exportação linha a linha na lista de personalizados
- **Rodapé dos templates personalizados** — quando existirem templates personalizados: **Novo template**, **Do projeto atual** e **Importar .tree-template**; estado vazio oferece opções de começar em branco, importar de projeto ou arquivo
- **Pré-visualização por arquivo** — ao clicar em um arquivo na pré-visualização da estrutura, abre-se um painel editor monoespaçado de largura total com selo do tipo de arquivo (mesmo layout para templates integrados e personalizados)
- **Busca de templates** — filtre templates integrados e personalizados enquanto digita, com correspondência insensível a caixa e acento, e retorno localizado caso não haja resultados
- **Favoritos de templates** — marque templates com uma estrela Lucide inclusa localmente, navegue por eles em uma aba de Favoritos dedicada e mantenha a seleção entre sessões do app

#### Command Palette & acessibilidade
- **Palette de Comandos expandida** — use `Ctrl+Shift+P` para pesquisar 23 ações, incluindo Salvar Tudo, Desfazer, Refazer, Nova Aba, avançar/retroceder abas de projeto, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre, junto aos comandos já existentes de projeto, build, configurações, tela cheia e relatórios
- **Comandos contextuais** — Salvar Tudo e ações de abas de projeto/arquivo permanecem visíveis para fácil descoberta, mas ficam desativados quando a sessão atual não pode executá-las com segurança
- **Fluxo de comandos centrado no teclado** — teclas de seta alteram o comando ativo, Enter executa, Escape fecha a palette e o foco retorna ao controle anterior
- **Melhor suporte a leitores de tela** — nomes acessíveis localizados, padrões semânticos combobox/listbox/abas, rastreamento de item ativo, contagem de resultados ao vivo e anúncios de status mais claros em comandos e templates
- **Ações acessíveis em templates** — favorito, renomear, editar, exportar e excluir expõem rótulos e estado localizados via `aria-pressed`, `aria-selected` e regiões vivas

#### Rich Presence
- **Privacidade como padrão** — Discord Rich Presence agora inicia desabilitado, e sua barra de status, idioma e controles de privacidade ficam indisponíveis até que o usuário ative explicitamente a integração
- **Discord RPC pronto para uso** — o Tree IDE vem com seu ID de Aplicação Discord público, conecta automaticamente ao cliente desktop em execução, exibe status de conexão, tenta reconectar após desconexão e não exige configuração do usuário
- **Estados de atividade específicos** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando em Templates, Personalizando Template, Configurações e, sensível ao build, Criando Arquivo, Criando Arquivos, Criando Pasta, Criando Pastas, Criando Arquivo e Pasta, ou Criando Arquivos e Pastas; a opção Build Studio reutiliza o mesmo título e descrição dinâmicos, e saídas `.tree` permanecem disponíveis para projetos válidos de estrutura plana, com exportações usando um estado genérico Exportando Arquivo.
- **Estado ocioso ciente do editor** — a Presença começa como Ocioso e só relata Editando Estrutura após interação direta com o editor de estrutura; cinco minutos sem interação retornam para Ocioso com um ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual, e Detalhado pode também exibir nome do projeto e tipo de arquivo; caminhos e conteúdos de arquivos nunca são compartilhados
- **Presença sensível à energia** — bloquear e suspender limpam a atividade, enquanto desbloquear e retomar restauram automaticamente
- **Presença localizada** — acompanha o idioma do Tree IDE ou permite escolher entre inglês, português ou espanhol independentemente; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Escopo da localização explicado** — O Discord recebe um payload de atividade localizado, então todos os visualizadores veem o idioma de Presença escolhido pelo publicador, não uma tradução baseada no idioma do Discord do espectador

#### Editor, árvore e validação
- **Painel de validação** — indentação inválida, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique no aviso para pular para a linha correspondente
- **Desfazer/refazer** com até 100 estados no histórico
- **Abas de múltiplos projetos** com indicador de modificação, barra de abas rolável e reordenação por arrastar-e-soltar
- **Abas de editor de arquivos por projeto** — edite conteúdos iniciais dos arquivos antes de buildar e reordene os arquivos abertos arrastando, mantendo o foco na aba ativa
- **Sincronização de abas de arquivos excluídos** — ao remover arquivos ou alterar extensões na estrutura, todas as abas de arquivos órfãs são fechadas, selecionando a aba válida mais próxima quando necessário e evitando o reaparecimento de conteúdos excluídos
- **Pré-visualização Markdown ao vivo** para arquivos `.md` no painel de visualização de arquivos
- **Pastas recolhíveis** na árvore de visualização
- **Navegação por teclado na árvore** — setas, Home, End e Enter
- **Renomeação inteligente de arquivos** ao editar linhas da árvore
- **Indentar/desindentar bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, pré-visualização de arquivos) com layout persistente entre sessões

#### Ícones & tipos de arquivos
- **Ícones Lucide** inclusos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídias
- **Mais de 100 extensões mapeadas** no mapa de tipos de arquivos

#### UI & experiência inicial
- **Janela personalizada sem moldura** com controles de minimizar, maximizar e fechar
- **Primeiro lançamento limpo** — o app fica oculto até que a interface restaurada termine seu primeiro paint, enquanto os metadados online da versão são carregados em segundo plano, sem expor uma tela travada inicial
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de Boas-vindas** na primeira execução — layout reprojetado com cabeçalho hero, cartões de configuração agrupados (Geral, Aparência, Sessão) e botão **Começar** fixado
- **Modal de Configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do app ao vivo (evolução da tela de créditos da v1)
- **Diálogo de alterações não salvas** ao fechar com projetos modificados
- **Sobreposição de arrastar-e-soltar** para arquivos `.tree` e compactados
- **Fontes integradas** — Inter e JetBrains Mono

#### Diagnóstico privativo & relatórios no GitHub
- **Formulário estruturado de relatório** — coleta título, descrição do problema, passos para reproduzir e comportamento esperado em campos localizados, expansíveis automaticamente e com contador de caracteres
- **Seletor de label do repositório** — carrega os labels do GitHub com fallback offline, exibe-os no dropdown customizado do app, inclui a label selecionada no prefixo do título e já deixa o campo pré-selecionado no rascunho do GitHub
- **Rascunho limpo do problema localizado** — abre automaticamente o GitHub após um atraso visível com título, seções em Markdown e label selecionada já preenchidos para revisão; clique no popup ou pressione Enter/Espaço para esconder o aviso sem alterar o temporizador, e o problema nunca é enviado automaticamente
- **Logs da execução atual** — incluem apenas entradas do último início do app, separadas por processos principal e renderer, limitadas a 256 KB e carimbadas com horário localizado (12 horas), período do dia e fuso horário
- **Pacote de diagnóstico sanitizado** — oculta caminhos locais, e-mails, endereços IP e segredos de URLs, sem incluir nomes e conteúdos dos projetos
- **Capturas de tela interativas** — mediante aceite explícito, esconde o formulário de relatório e captura região selecionada ou a janela do app inteira, podendo tirar capturas seguidas com `Shift+P` mesmo com a barra flutuante recolhida; instruções e controles desaparecem durante o arraste para não obstruir o conteúdo selecionado
- **Revisão das capturas antes de salvar** — armazene até 10 capturas, veja miniaturas em tamanho real, remova imagens indesejadas e salve cada PNG mantido no ZIP local de diagnóstico; área de trabalho e outras janelas nunca são capturadas
- **Anexos primeiro no local** — salva o ZIP no caminho escolhido pelo usuário sem abrir o Explorer ou fazer upload; logs e capturas ficam locais até serem enviados manualmente
- **Modal de relatório mais seguro** — seleção de texto e arraste não fecham mais o diálogo, campos redimensionam automaticamente, contraste claro/escuro acompanha o restante do app e o formulário é limpo após sucesso, Cancelar ou fechar pelo botão X

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma no primeiro uso** no fluxo de boas-vindas e configurações
- **Traduções no processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter os arquivos de idioma sincronizados

#### Persistência de sessão
- **Armazenamento da sessão via IndexedDB** com migração automática do legado `localStorage`
- **Autosave** de abas abertas, conteúdos dos arquivos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão ao iniciar ou sempre começar limpo

#### Auto-atualização & notas de lançamento
- **Auto-atualizador dentro do app** — verifica lançamentos no GitHub, faz download com progresso e reinicia para instalar
- **Canais de atualização estável e beta**
- **Notas de lançamento localizadas** na janela de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais largo, **Novidades** expandido por padrão, área de rolagem dedicada, hierarquia de títulos mais clara e botões de ação fixados no rodapé
- **Workflow manual para `docs/changelog.md`** — edite as notas de lançamento no repositório; CI traduz para o app e publica em inglês no GitHub
- **Notas de lançamento separadas** — a janela de atualização do app mostra apenas o changelog; links para navegação por idioma aparecem em `docs/changelog.md` e na descrição da release no GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) pertence só ao GitHub
- **Tradução via GitHub Models** — notas de lançamento em português e espanhol geradas em CI pela API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com tela de captura e ação de restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas & distribuição
- **Windows x64** — instalador NSIS e pacotes portáteis; instalador multilíngue (inglês, português e espanhol)
- **Lançamentos no GitHub** publicados automaticamente a cada tag de versão via CI
- **Build do renderer antes do pacote** — o `beforePack` executa `vite build` e valida `dist/renderer/` para garantir que todo instalador inclua o bundle de UI

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Build do renderer com Vite** e hot module replacement em desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manipuladores IPC divididos** para projeto, atualizações e ciclo de vida do app
- **API preload `contextBridge`** para isolar e proteger os limites do renderer
- **Testes com Vitest** e mocks do Electron para execuções em CI; utilitários de changelog e erros do atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para hot reload do processo principal durante o desenvolvimento
- **Exportação de logs de erro** em caso de crash para facilitar depuração
- **`semver`** como dependência direta para comparação de versão confiável no app
