<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md -->

## O que há de novo na v2.0.106

Tree IDE v2 é uma reescrita completa e expansão do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Mesma ideia central — projetar estruturas de pastas em texto simples, visualizá-las em tempo real e gerar projetos — com uma nova arquitetura, ferramentas mais ricas e lançamentos apenas para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacotes
- **Escolhas explícitas de retenção de dados** — instalar manualmente sobre uma versão existente do Tree IDE e desinstalar agora apresentam opções claras de Manter ou Deletar, com Manter selecionado por padrão
- **Configuração ciente da primeira instalação** — a escolha de dados é pulada quando não existe um perfil ou dados de atualizador do Tree IDE anteriores e não interrompe atualizações automáticas silenciosas
- **Fluxo de dados assistido correto** — instalações manuais sobre uma versão existente e desinstalações agora exibem escolhas de Manter/Deletar; atualizações silenciosas no aplicativo pulam o prompt e mantêm os dados
- **Boas-vindas segue a escolha de dados** — o onboarding aparece para um perfil novo ou após selecionar Deletar, enquanto selecionar Manter preserva o estado de onboarding concluído
- **Ação de conclusão do desinstalador correta** — a página final agora rotula seu botão principal como Concluir em vez de Próximo em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade do Electron ASAR e carregamento restrito ao arquivo validado
- **Runtime Windows x64 enxuto** — removido o toolchain de empacotamento Squirrel não utilizado e os binários 7-Zip não-Windows/não-x64 dos arquivos do aplicativo distribuído
- **Limpeza opcional completa** — a exclusão de dados abrange preferências, cache, logs, sessão salva, pastas de perfil atual e legado, e dados do atualizador

#### Build Studio e saída de projeto
- **Build Studio** — fluxo de construção em tela cheia com visualização de árvore ao vivo, visualização de conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente exportar um ZIP junto com uma construção de pasta e incluir o arquivo `.tree` dentro do arquivo
- **Botão criar-com-ZIP ciente do conteúdo** — construções combinadas de pasta e ZIP agora rotulam a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta, ou Arquivos e Pastas seguidos de `+ ZIP`, com base na estrutura selecionada
- **Inspeção pré-construção** — escanear a pasta de destino em busca de estrutura existente, arquivos `.tree` ou ZIP antes de escrever
- **Tratamento de conflitos** — escolher ignorar ou sobrescrever quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e mais)
- **Marcadores i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos e criptografia
- **Compatibilidade com arquivos Tree IDE 1** — Tree IDE 1 identifica o formato de arquivo `.tree` de primeira geração usado pelo Tree IDE Legacy; arquivos UTF-8 sem cabeçalho originais permanecem legíveis com estilos de indentação de tabulação e `...`
- **Exportação ZIP** com proteção por senha AES-256 opcional via 7-Zip
- **Projetos `.tree` criptografados de alta resistência** — TREEIDE2 usa AES-256-GCM autenticado com Argon2id (256 MiB, 4 passes, 4 faixas), autentica seu cabeçalho criptográfico e mantém o formato original sem cabeçalho do Tree IDE Legacy legível como geração 1
- **Proteção explícita de `.tree`** — uma caixa de seleção dedicada habilita os campos de senha e confirmação, explica que a criptografia TREEIDE2 será aplicada e mostra o aviso de senha irrecuperável apenas enquanto a proteção estiver selecionada
- **Importação de arquivo** via diálogo de arquivo ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Prompts de senha** para arquivos ZIP criptografados e arquivos `.tree` criptografados
- **Carregar pasta como estrutura** — escanear um diretório existente e transformá-lo em texto de árvore editável

#### Modelos
- **19 modelos de início embutidos** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de modelos** — navegador em tela cheia com três colunas com abas embutidas e personalizadas, edição de estrutura inline e visualização de árvore ao vivo
- **Modelos personalizados** — criar em branco, importar do projeto atual, renomear, editar o conteúdo do arquivo inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar modelos personalizados compartilháveis (JSON `treeide-template` v1) via diálogos nativos de salvar/abrir ou exportação por linha na lista personalizada
- **Rodapé de modelos personalizados** — quando existem modelos personalizados: **Novo modelo**, **Do projeto atual** e **Importar .tree-template**; o estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Visualização por arquivo** — clicar em um arquivo na visualização da estrutura abre um painel de editor monoespaçado em largura total com distintivo de tipo de arquivo (mesmo layout de painel único para modelos embutidos e personalizados)
- **Busca de modelos** — filtrar modelos embutidos e personalizados enquanto você digita, com correspondência insensível a maiúsculas e acentos e feedback localizado de resultado vazio
- **Favoritos de modelos** — marcar modelos com uma estrela Lucide embutida localmente, navegá-los em uma aba Favoritos dedicada e manter a seleção entre sessões do aplicativo

#### Paleta de Comandos e acessibilidade
- **Paleta de Comandos Expandida** — use `Ctrl+Shift+P` para pesquisar 23 ações, adicionando Salvar Tudo, Desfazer, Refazer, Nova Aba, aba de projeto anterior/próximo, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre aos comandos existentes de projeto, construção, configurações, tela cheia e relatórios
- **Comandos cientes do contexto** — Salvar Tudo e ações de aba de projeto/arquivo permanecem visíveis para descoberta, mas estão desativadas quando a sessão atual não pode executá-las com segurança
- **Fluxo de comando priorizando o teclado** — As teclas de seta mudam o comando ativo, Enter o executa, Escape fecha a paleta e o foco retorna ao controle anterior
- **Suporte melhorado para leitores de tela** — nomes acessíveis localizados, padrões semânticos de combobox/listbox/aba, rastreamento de descendentes ativos, contagens de resultados ao vivo e anúncios de status mais claros em comandos e modelos
- **Ações de modelo acessíveis** — controles de favorito, renomear, editar, exportar e excluir expõem rótulos localizados e estado através de `aria-pressed`, `aria-selected` e regiões ao vivo

#### Presença Rica
- **RPC do Discord pronto para uso** — Tree IDE é fornecido com seu ID de Aplicativo Discord público, conecta-se automaticamente ao cliente de desktop em execução, relata o status da conexão, tenta novamente após desconexões e não requer configuração do usuário
- **Estados de atividade específicos** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando em Modelos, Personalizando Modelo, Configurações e estados de criação ciente da construção Criando Arquivo, Criando Arquivos, Criando Pasta, Criando Pastas, Criando Arquivo e Pasta, ou Criando Arquivos e Pastas; a opção Build Studio usa o mesmo título dinâmico e descrição, enquanto as saídas `.tree` permanecem disponíveis para projetos planos válidos e exportações usam um estado genérico Exportando Arquivo.
- **Estado ocioso ciente do editor** — A Presença começa como Ociosa e só relata Editando Estrutura após interação direta com o editor de estrutura; cinco minutos sem interação retorna a Ociosa com um ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual e Detalhado pode também mostrar o nome do projeto e tipo de arquivo; caminhos e conteúdos de arquivos nunca são compartilhados
- **Presença ciente de energia** — bloquear e suspender limpam a atividade, enquanto desbloquear e retomar a restauram automaticamente
- **Presença localizada** — seguir o idioma do Tree IDE ou escolher inglês, português ou espanhol de forma independente; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Escopo de localização explicado** — O Discord recebe uma carga de atividade localizada, então cada visualizador vê o idioma de Presença selecionado pelo publicador em vez de uma tradução baseada no local do Discord do visualizador

#### Editor, árvore e validação
- **Painel de validação** — má indentação, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para pular para a linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas de múltiplos projetos** com indicadores de modificação, uma barra de abas rolável e reordenação por arrastar e soltar
- **Abas de editor de arquivo por projeto** — editar conteúdos de arquivos iniciais antes de construir e reordenar arquivos abertos com arrastar e soltar enquanto preserva a aba ativa
- **Sincronização de abas de arquivos excluídos** — remover arquivos ou mudar extensões no editor de estrutura agora fecha cada aba de arquivo obsoleta, seleciona a aba válida mais próxima quando necessário e impede que conteúdos excluídos reapareçam
- **Visualização ao vivo de Markdown** para arquivos `.md` no painel de visualização de arquivos
- **Pastas colapsáveis** na visualização da árvore
- **Navegação por teclado na árvore** — teclas de seta, Início, Fim e Enter
- **Correspondência inteligente de renomeação de arquivos** quando linhas da árvore são editadas
- **Indentação / desindentação de bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, visualização de arquivos) com layout persistido entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide** agrupados localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 rótulos de extensão de arquivo** no mapa de tipos de arquivo

#### UI e experiência de primeira execução
- **Janela sem moldura personalizada** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout redesenhado com cabeçalho hero, cartões de configuração agrupados (Geral, Aparência, Sessão) e um botão **Começar** fixo
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do aplicativo ao vivo (evoluído da tela de créditos v1)
- **Diálogo de alterações não salvas** ao fechar com projetos modificados
- **Sobreposição de arrastar e soltar** para arquivos `.tree` e arquivos compactados
- **Fontes agrupadas** — Inter e JetBrains Mono

#### Diagnósticos com foco em privacidade e relatórios do GitHub
- **Formulário de relatório estruturado** — coletar título do problema, descrição do problema, etapas de reprodução e comportamento esperado em campos localizados e de crescimento automático com contadores de caracteres
- **Seletor de rótulo de repositório** — carregar os rótulos atuais do GitHub com uma alternativa offline, exibi-los no dropdown personalizado do aplicativo, adicionar o rótulo selecionado ao prefixo do título e pré-selecioná-lo no rascunho do GitHub
- **Rascunho de problema localizado limpo** — abrir o GitHub automaticamente após um atraso de redirecionamento visível com o título, seções Markdown e rótulo selecionado já preenchidos para revisão; clique no popup ou pressione Enter/Space para ocultar o aviso sem alterar o temporizador, e o problema nunca é enviado automaticamente
- **Logs de execução atual** — incluir apenas entradas de log da última execução do aplicativo, separadas em seções de processo principal e renderizador, limitadas a 256 KB e carimbadas com um horário localizado de 12 horas, período do dia e fuso horário
- **Pacote de diagnóstico sanitizado** — redigir caminhos locais, endereços de e-mail, endereços IP e segredos de URL enquanto exclui nomes e conteúdos de projetos
- **Captura de tela opcional do Tree IDE** — capturar apenas a janela atual do aplicativo após opt-in explícito, nunca a área de trabalho ou outras janelas
- **Anexos locais primeiro** — salvar o ZIP no caminho escolhido pelo usuário sem abrir o File Explorer ou fazer upload; logs e capturas de tela permanecem locais até serem anexados manualmente
- **Modal de relatório mais seguro** — a seleção de texto e arrastar não descartam mais o diálogo, os campos redimensionam automaticamente, o contraste do tema claro/escuro segue o restante do aplicativo e o formulário é redefinido após sucesso, Cancelar ou fechar com o botão X

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** no fluxo de boas-vindas e configurações
- **Traduções de processo principal** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter os arquivos de localidade em sincronia

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do `localStorage` legado
- **Autosave** de abas abertas, conteúdos de arquivos e nomes de projetos
- **Modos de sessão** — restaurar a última sessão na inicialização ou sempre começar limpa

#### Atualizador automático e notas de lançamento
- **Atualizador automático no aplicativo** — verificar Lançamentos do GitHub, baixar com progresso e reiniciar para instalar
- **Canais de atualização estáveis e beta**
- **Notas de lançamento localizadas** no modal de atualização (inglês, português e espanhol)
- **Changelog de atualização legível** — diálogo mais amplo, **O que há de novo** expandido por padrão, área de rolagem dedicada, hierarquia de cabeçalhos mais clara e botões de ação fixados no rodapé
- **Fluxo de trabalho manual `docs/changelog.md`** — editar notas de lançamento no repositório; CI as traduz para o aplicativo e publica em inglês no GitHub
- **Notas de lançamento divididas** — o modal de atualização do aplicativo mostra apenas o texto do changelog; links de navegação de localidade aparecem em `docs/changelog.md` e na descrição de lançamento do GitHub (apontando para arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução de Modelos do GitHub** — notas de lançamento em português e espanhol são geradas no CI via API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com UI de captura e ação de restaurar padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas e distribuição
- **Windows x64** — pacotes de instalação NSIS e Portáteis; instalador multilíngue (inglês, português e espanhol)
- **Lançamentos do GitHub** publicados automaticamente em tags de versão do CI
- **Construção do renderizador antes do empacotamento** — `beforePack` executa `vite build` e valida `dist/renderer/` para que cada instalador envie o pacote de UI

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Construção do renderizador Vite** com substituição de módulo quente em desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **Módulos ES**, Node.js 24+, Electron 42
- **Manipuladores IPC divididos** para projeto, atualizações e ciclo de vida do aplicativo
- **API de preload `contextBridge`** para uma fronteira de renderizador endurecida
- **Conjunto de testes Vitest** com simulações do Electron para execuções amigáveis ao CI; helpers de erro de changelog e atualizador cobertos por testes dedicados
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para recarregamento quente do processo principal durante o desenvolvimento
- **Exportação de log de erro** em caso de falha para facilitar a depuração
- **`semver`** como uma dependência direta para comparação de versão confiável no aplicativo
