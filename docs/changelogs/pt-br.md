<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## O que há de novo na v2.0.106

O Tree IDE v2 foi totalmente reescrito e ampliado a partir do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A ideia central permanece a mesma — projetar estruturas de pastas em texto simples, visualizá-las em tempo real e gerar projetos — agora com uma nova arquitetura, recursos mais avançados e versões exclusivas para Windows.

### Novidades

#### Instalação, armazenamento e proteção de pacotes
- **Opções explícitas de retenção de dados** — a instalação manual sobre uma versão existente do Tree IDE e a desinstalação agora apresentam as opções Manter e Apagar com clareza; Manter vem selecionada por padrão
- **Instalador preparado para a primeira instalação** — a escolha sobre os dados é omitida quando não há perfil anterior nem dados do atualizador do Tree IDE e não interrompe as atualizações automáticas silenciosas
- **Fluxo assistido de dados corrigido** — instalações manuais sobre uma versão existente e desinstalações agora exibem as opções Manter/Apagar; atualizações silenciosas feitas pelo aplicativo não exibem o aviso e preservam os dados
- **Boas-vindas de acordo com a escolha dos dados** — a apresentação inicial aparece em perfis novos ou após selecionar Apagar; selecionar Manter preserva o estado de apresentação já concluída
- **Ação final correta no desinstalador** — o botão principal da última página agora exibe Concluir em vez de Próximo em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade do Electron ASAR e carregamento restrito ao arquivo validado
- **Ambiente de execução Windows x64 mais enxuto** — a cadeia de ferramentas de empacotamento Squirrel não utilizada e os binários do 7-Zip destinados a outros sistemas e arquiteturas foram removidos da distribuição
- **Limpeza opcional completa** — a exclusão de dados abrange preferências, cache, logs, sessão salva, pastas dos perfis atual e antigo e dados do atualizador

#### Build Studio e saída de projeto
- **Build Studio** — fluxo de criação em tela cheia com visualização da árvore em tempo real, prévia do conteúdo de cada arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pastas no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — permite exportar um ZIP junto com a criação das pastas e incluir o arquivo `.tree` dentro do pacote compactado
- **Botão de criação com ZIP adaptado ao conteúdo** — ao combinar a criação de pastas com um ZIP, a ação passa a se chamar Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta ou Arquivos e Pastas, seguida de `+ ZIP`, conforme a estrutura selecionada
- **Inspeção antes da criação** — verifica a pasta de destino em busca de estruturas, arquivos `.tree` ou ZIP existentes antes de gravar os dados
- **Tratamento de conflitos** — permite ignorar ou sobrescrever arquivos e pastas existentes
- **Conteúdo inicial padrão** para mais de 68 tipos de arquivo (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte e outros)
- **Espaços reservados de i18n** nos arquivos gerados (`{hello}`, `{lang}`, `{projectName}` etc.)

#### Arquivos compactados e criptografia
- **Compatibilidade com arquivos do Tree IDE 1** — Tree IDE 1 designa o formato `.tree` de primeira geração usado pelo Tree IDE Legacy; os arquivos UTF-8 originais sem cabeçalho continuam legíveis com indentação por tabulação ou por `...`
- **Exportação ZIP** com proteção opcional por senha AES-256 via 7-Zip
- **Projetos `.tree` com criptografia robusta** — o TREEIDE2 usa AES-256-GCM autenticado com Argon2id (256 MiB, 4 passagens, 4 vias), autentica o próprio cabeçalho criptográfico e mantém o formato original sem cabeçalho do Tree IDE Legacy legível como geração 1
- **Proteção explícita de `.tree`** — uma caixa de seleção dedicada habilita os campos de senha e confirmação, explica que a criptografia TREEIDE2 será aplicada e mostra o aviso de senha irrecuperável apenas enquanto a proteção estiver selecionada
- **Importação de arquivos compactados** pela caixa de diálogo ou por arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Solicitações de senha** para arquivos ZIP e `.tree` criptografados
- **Carregar pasta como estrutura** — analisa um diretório existente e o transforma em texto de árvore editável

#### Modelos
- **19 modelos iniciais integrados** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativo: C, C++, C#
- **Tela de modelos** — navegador em tela cheia com três colunas, abas de modelos integrados e personalizados, edição direta da estrutura e visualização da árvore em tempo real
- **Modelos personalizados** — criar um modelo em branco, importar o projeto atual, renomear, editar diretamente o conteúdo dos arquivos, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — permite exportar e importar modelos personalizados compartilháveis (JSON `treeide-template` v1) pelas caixas de diálogo nativas de salvar e abrir ou pela ação de exportação de cada item da lista personalizada
- **Rodapé dos modelos personalizados** — quando há modelos personalizados, exibe **Novo modelo**, **Do projeto atual** e **Importar .tree-template**; quando a lista está vazia, oferece as opções de começar em branco, importar um projeto ou importar um arquivo
- **Visualização por arquivo** — clicar em um arquivo na visualização da estrutura abre um painel de edição monoespaçado em largura total com a identificação do tipo de arquivo (o mesmo layout de painel único é usado nos modelos integrados e personalizados)
- **Busca de modelos** — filtra modelos integrados e personalizados conforme o usuário digita, ignorando diferenças entre maiúsculas, minúsculas e acentos e exibindo uma mensagem localizada quando não há resultados
- **Modelos favoritos** — permite marcar modelos com uma estrela Lucide incluída localmente, acessá-los em uma aba Favoritos exclusiva e preservar a seleção entre as sessões do aplicativo

#### Paleta de comandos e acessibilidade
- **Paleta de comandos ampliada** — use `Ctrl+Shift+P` para pesquisar entre 23 ações, incluindo Salvar Tudo, Desfazer, Refazer, Nova Aba, aba de projeto anterior/próxima, fechar aba de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre, além dos comandos existentes de projeto, criação, configurações, tela cheia e relatórios
- **Comandos sensíveis ao contexto** — Salvar Tudo e as ações das abas de projeto/arquivo permanecem visíveis para facilitar sua descoberta, mas ficam desativadas quando não podem ser executadas com segurança na sessão atual
- **Fluxo de comandos otimizado para o teclado** — as teclas de seta mudam o comando ativo, Enter o executa, Escape fecha a paleta e o foco retorna ao controle anterior
- **Suporte aprimorado a leitores de tela** — nomes acessíveis localizados, padrões semânticos de caixa de combinação, lista e aba, acompanhamento do descendente ativo, contagem de resultados em tempo real e anúncios de status mais claros nos comandos e modelos
- **Ações de modelo acessíveis** — os controles para favoritar, renomear, editar, exportar e excluir expõem rótulos e estados traduzidos por meio de `aria-pressed`, `aria-selected` e regiões dinâmicas

#### Rich Presence
- **RPC do Discord pronto para uso** — o Tree IDE inclui o ID público de seu aplicativo do Discord, conecta-se automaticamente ao cliente para desktop em execução, informa o status da conexão, tenta se reconectar após desconexões e não exige configuração do usuário
- **Estados de atividade específicos** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando em Modelos, Personalizando Modelo, Configurações e os estados de criação Criando Arquivo, Criando Arquivos, Criando Pasta, Criando Pastas, Criando Arquivo e Pasta ou Criando Arquivos e Pastas; a opção do Build Studio usa o mesmo título e a mesma descrição dinâmicos, as saídas `.tree` continuam disponíveis para projetos planos válidos e as exportações usam o estado genérico Exportando Arquivo.
- **Estado inativo vinculado ao editor** — o Rich Presence começa como Inativo e só informa Editando estrutura após uma interação direta com o editor de estrutura; depois de cinco minutos sem interação, volta a Inativo com um ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual e Detalhado pode também mostrar o nome do projeto e tipo de arquivo; caminhos e conteúdos de arquivos nunca são compartilhados
- **Rich Presence integrado ao estado de energia** — bloquear ou suspender o computador remove a atividade; desbloquear ou retomar a sessão restaura-a automaticamente
- **Rich Presence traduzido** — permite seguir o idioma do Tree IDE ou escolher inglês, português ou espanhol de forma independente; a configuração atualiza o RPC imediatamente e persiste entre sessões
- **Escopo da tradução explicado** — o Discord recebe uma única atividade traduzida; por isso, todos veem o idioma do Rich Presence escolhido por quem a publica, e não uma tradução baseada no idioma do Discord de cada pessoa

#### Editor, árvore e validação
- **Painel de validação** — identifica indentação incorreta, nomes inválidos, itens duplicados no mesmo nível, caminhos inseguros e estruturas vazias; clique em um aviso para ir até a linha correspondente
- **Desfazer / refazer** com até 100 estados de histórico
- **Abas de múltiplos projetos** com indicadores de modificação, uma barra de abas rolável e reordenação por arrastar e soltar
- **Abas de edição de arquivos por projeto** — permitem editar o conteúdo inicial dos arquivos antes da criação e reordenar os arquivos abertos por meio de arrastar e soltar sem alterar a aba ativa
- **Sincronização das abas de arquivos excluídos** — remover arquivos ou alterar extensões no editor de estrutura agora fecha todas as abas obsoletas, seleciona a aba válida mais próxima quando necessário e impede que conteúdos excluídos reapareçam
- **Visualização de Markdown em tempo real** para arquivos `.md` no painel de prévia dos arquivos
- **Pastas recolhíveis** na visualização da árvore
- **Navegação por teclado na árvore** — teclas de seta, Início, Fim e Enter
- **Correspondência inteligente ao renomear arquivos** quando as linhas da árvore são editadas
- **Indentação / desindentação de bloco** com Tab e Shift+Tab, além de Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis redimensionáveis** (editor, árvore, visualização de arquivos) com layout persistido entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide** incluídos localmente (sem dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos compactados e mídia
- **Mais de 100 rótulos de extensões** no mapa de tipos de arquivo

#### Interface e experiência na primeira execução
- **Janela sem moldura personalizada** com controles de minimizar, maximizar e fechar
- **Barra de menu** — Arquivo, Editar, Visualizar, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout reformulado com cabeçalho de destaque, cartões de configuração agrupados (Geral, Aparência, Sessão) e um botão **Começar** fixo
- **Modal de configurações** com abas: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com a versão atual do aplicativo (evolução da tela de créditos da v1)
- **Caixa de diálogo de alterações não salvas** ao fechar projetos modificados
- **Sobreposição de arrastar e soltar** para arquivos `.tree` e arquivos compactados
- **Fontes incluídas** — Inter e JetBrains Mono

#### Diagnósticos com foco em privacidade e relatórios do GitHub
- **Formulário de relatório estruturado** — reúne o título e a descrição do problema, as etapas para reproduzi-lo e o comportamento esperado em campos traduzidos que crescem automaticamente e exibem contadores de caracteres
- **Seletor de rótulos do repositório** — carrega os rótulos atuais do GitHub com uma alternativa para uso offline, exibe-os no menu suspenso personalizado do aplicativo, adiciona o rótulo selecionado ao prefixo do título e o pré-seleciona no rascunho do GitHub
- **Rascunho de relato traduzido e organizado** — abre o GitHub automaticamente após um aviso visível de redirecionamento, com o título, as seções em Markdown e o rótulo selecionado já preenchidos para revisão; clicar no aviso ou pressionar Enter/Espaço o oculta sem alterar o temporizador, e o relato nunca é enviado automaticamente
- **Logs da execução atual** — incluem somente as entradas da última inicialização do aplicativo, separadas em seções do processo principal e do renderizador, limitadas a 256 KB e registradas com horário no formato de 12 horas, período do dia e fuso horário localizados
- **Pacote de diagnóstico protegido** — oculta caminhos locais, endereços de e-mail, endereços IP e dados sigilosos de URLs, sem incluir nomes nem conteúdo dos projetos
- **Captura de tela opcional do Tree IDE** — captura somente a janela atual do aplicativo após o consentimento explícito do usuário, nunca a área de trabalho nem outras janelas
- **Anexos mantidos localmente** — salva o ZIP no caminho escolhido pelo usuário sem abrir o Explorador de Arquivos nem enviá-lo; logs e capturas de tela permanecem locais até serem anexados manualmente
- **Modal de relatório mais seguro** — selecionar ou arrastar texto não fecha mais a caixa de diálogo, os campos são redimensionados automaticamente, o contraste dos temas claro e escuro acompanha o restante do aplicativo e o formulário é redefinido após o sucesso, ao clicar em Cancelar ou ao fechá-lo pelo botão X

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na primeira execução** no fluxo de boas-vindas e configurações
- **Traduções do processo principal** para caixas de diálogo nativas e mensagens de erro
- **Script `npm run i18n:validate`** para manter sincronizados os arquivos de idiomas

#### Persistência de sessão
- **Armazenamento de sessão IndexedDB** com migração automática do `localStorage` legado
- **Salvamento automático** de abas abertas, conteúdo dos arquivos e nomes dos projetos
- **Modos de sessão** — restaura a última sessão ao iniciar ou sempre começa sem dados anteriores

#### Atualizador automático e notas de lançamento
- **Atualizador automático integrado** — verifica os lançamentos do GitHub, exibe o progresso do download e reinicia o aplicativo para instalar a atualização
- **Canais de atualização estável e beta**
- **Notas de lançamento localizadas** no modal de atualização (inglês, português e espanhol)
- **Histórico de alterações legível** — caixa de diálogo mais ampla, seção **O que há de novo** expandida por padrão, área de rolagem exclusiva, hierarquia de títulos mais clara e botões de ação fixados no rodapé
- **Fluxo de trabalho manual com `docs/changelog.md`** — as notas de lançamento são editadas no repositório; a CI as traduz para o aplicativo e publica a versão em inglês no GitHub
- **Notas de lançamento separadas** — o modal de atualização do aplicativo mostra apenas o texto do histórico de alterações; os links para outros idiomas aparecem em `docs/changelog.md` e na descrição do lançamento no GitHub (apontando para os arquivos legíveis em `docs/changelogs/`); o link de comparação (`Full Changelog`) é exclusivo do GitHub
- **Tradução pelo GitHub Models** — as notas de lançamento em português e espanhol são geradas pela CI por meio da API `models.github.ai`

#### Atalhos de teclado
- **Atalhos totalmente configuráveis** com uma interface de captura e uma ação para restaurar os padrões
- Novos padrões incluem `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (construir), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (salvar tudo) e atalhos de zoom do editor

#### Plataformas e distribuição
- **Windows x64** — pacotes do instalador NSIS e da versão portátil; instalador multilíngue (inglês, português e espanhol)
- **Lançamentos do GitHub** publicados automaticamente pela CI ao criar tags de versão
- **Compilação do renderizador antes do empacotamento** — `beforePack` executa `vite build` e valida `dist/renderer/` para garantir que todos os instaladores incluam o pacote da interface

#### Arquitetura, ferramentas de desenvolvimento e qualidade
- **Compilação do renderizador com Vite** e substituição de módulos em tempo real durante o desenvolvimento
- **Base de código modular** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/` e 20 módulos CSS
- **Módulos ES**, Node.js 24+ e Electron 42
- **Manipuladores de IPC separados** para projetos, atualizações e ciclo de vida do aplicativo
- **API de pré-carregamento `contextBridge`** para reforçar o isolamento do renderizador
- **Conjunto de testes Vitest** com simulações do Electron adequadas à CI; funções auxiliares de erro do changelog e do atualizador são cobertas por testes específicos
- **ESLint e Prettier** integrados aos scripts npm
- **electron-reloader** para recarregar automaticamente o processo principal durante o desenvolvimento
- **Exportação do log de erros** em caso de falha para facilitar a depuração
- **`semver`** como dependência direta para comparar versões de maneira confiável no aplicativo
