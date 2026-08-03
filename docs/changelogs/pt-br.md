<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->

## O que há de novo na v2.0.114

Tree IDE v2 é uma reescrita e expansão completa do aplicativo original [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). A mesma ideia central — projetar estruturas de pastas em texto puro, pré-visualizá-las em tempo real e gerar projetos — agora vem com uma nova arquitetura, ferramentas mais ricas e lançamentos exclusivos para Windows.

### Adicionado

#### Instalação, armazenamento e proteção de pacotes
- **Opções explícitas de retenção de dados** — a instalação manual sobre uma versão existente do Tree IDE e a desinstalação agora apresentam opções claras de Manter ou Excluir, com Manter selecionado por padrão
- **Configuração de instalação para primeiro uso** — a escolha de dados é omitida quando não existem perfis ou dados de atualização do Tree IDE anteriores, e não interrompe as atualizações automáticas silenciosas
- **Fluxo de dados auxiliado corretamente** — instalações manuais sobre uma versão existente e desinstalação agora exibem opções de Manter/Excluir; atualizações silenciosas dentro do aplicativo omitem o prompt e retêm os dados
- **Bem-vindo segue a escolha de dados** — o processo de boas-vindas aparece para um perfil fresco ou após selecionar Excluir, enquanto selecionar Manter preserva o estado de boas-vindas concluído
- **Ação de conclusão do desinstalador corrigida** — a página final agora rotula seu botão principal como Concluir em vez de Próximo em inglês, português e espanhol
- **Pacote de produção protegido** — o código do aplicativo permanece organizado em `app.asar`, agora com validação de integridade ASAR do Electron e carregamento restrito ao arquivo validado
- **Tempo de execução x64 do Windows leve** — removido a cadena de ferramentas de embalagem Squirrel não utilizada e binários 7-Zip não Windows/não x64 dos arquivos de aplicativo distribuídos
- **Limpeza completa opcional** — a exclusão de dados cobre preferências, cache, logs, sessão salva, pastas de perfil atuais e legadas, e dados de atualização

#### Build Studio e saída de projeto
- **Build Studio** — fluxo de build em tela cheia com pré-visualização de árvore ao vivo, pré-visualização de conteúdo por arquivo, estatísticas e opções de saída
- **Três modos de saída** — criar estrutura de pasta no disco, exportar apenas um ZIP ou exportar apenas um arquivo de projeto `.tree`
- **Saídas combinadas** — opcionalmente exportar um ZIP junto com uma compilação de pasta e incluir o arquivo `.tree` dentro do arquivo ZIP
- **Botão criar-com-ZIP sensível ao conteúdo** — compilações combinadas de pasta e ZIP agora rotulam a ação como Criar Arquivo, Arquivos, Pasta, Pastas, Arquivo e Pasta, ou Arquivos e Pastas seguido de `+ ZIP`, com base na estrutura selecionada
- **Inspeção prévia à compilação** — varrer a pasta de destino em busca de estrutura existente, arquivos `.tree` ou ZIP antes de gravar
- **Tratamento de conflitos** — escolher ignorar ou substituir quando arquivos ou pastas já existem
- **Conteúdo inicial padrão** para 68+ tipos de arquivos (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, etc.)
- **Placeholders de i18n** em arquivos gerados (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Arquivos e criptografia
- **Compatibilidade com arquivo Tree IDE 1** — Tree IDE 1 identifica o formato de arquivo `.tree` de primeira geração usado pelo Tree IDE Legacy; arquivos originais sem cabeçalho em UTF-8 permanecem legíveis com estilos de indentação de tabulação e `...`
- **Exportação de ZIP** com proteção por senha AES-256 opcional via 7-Zip
- **Projetos `.tree` criptografados de alta resistência** — TREEIDE2 usa AES-256-GCM autenticado com Argon2id (256 MiB, 4 passos, 4 faixas), autentica seu cabeçalho criptográfico e mantém o formato de arquivo sem cabeçalho original do Tree IDE Legacy legível como geração 1
- **Proteção explícita de `.tree`** — uma caixa de seleção dedicada habilita os campos de senha e confirmação desabilitados, explica que a criptografia TREEIDE2 será aplicada e mostra o aviso de senha irrecuperável apenas enquanto a proteção é selecionada
- **Importação de arquivos** via diálogo de arquivos ou arrastar e soltar: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar` e `.7z`
- **Prompts de senha** para arquivos ZIP criptografados e arquivos `.tree` criptografados
- **Carregar pasta como estrutura** — varrer um diretório existente e transformá-lo em texto de árvore editável

#### Modelos
- **19 modelos de inicialização incorporados** agrupados por categoria:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Pilhas: Node.js, MVC, Python, PHP
  - Sistemas: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Nativos: C, C++, C#
- **Tela de modelos** — navegador de três colunas em tela cheia com guias incorporados e personalizados, edição de estrutura inline e pré-visualização de árvore ao vivo
- **Modelos personalizados** — criar em branco, importar do projeto atual, renomear, editar conteúdo de arquivo inline, abrir no editor principal, exportar ou excluir sem sair da tela
- **Arquivos `.tree-template`** — exportar e importar modelos personalizados compartilháveis (JSON `treeide-template` v1) via diálogos de salvar/abrir nativos ou exportação por linha na lista personalizada
- **Rodapé de modelos personalizados** — quando existem modelos personalizados: **Novo modelo**, **Do projeto atual** e **Importar `.tree-template`**; estado vazio oferece início em branco, importação de projeto e importação de arquivo
- **Pré-visualização de arquivo por arquivo** — clicar em um arquivo na pré-visualização de estrutura abre um painel de editor de largura total com badge de tipo de arquivo (mesmo layout de uma única janela para modelos incorporados e personalizados)
- **Pesquisa de modelos** — filtrar modelos incorporados e personalizados à medida que digita, com correspondência insensível a maiúsculas e acentos e feedback de resultado vazio localizado
- **Modelos favoritos** — marcar modelos com uma estrela Lucide localmente embutida, navegar por eles em uma guia Favoritos dedicada e manter a seleção entre sessões do aplicativo

#### Paleta de comandos e acessibilidade
- **Paleta de comandos expandida** — use `Ctrl+Shift+P` para pesquisar 23 ações, adicionando Salvar Tudo, Desfazer, Refazer, Nova Guia, guias de projeto/arquivo anteriores e posteriores, fechar guia de projeto/arquivo, Recarregar, controles de zoom, Verificar Atualizações e Sobre ao projeto, compilação, configurações, tela cheia e comandos de relatório existentes
- **Comandos sensíveis ao contexto** — Salvar Tudo e ações de guia de projeto/arquivo permanecem visíveis para descoberta, mas são desabilitadas quando a sessão atual não pode executá-las com segurança
- **Fluxo de comandos de teclado** — Teclas de seta alteram o comando ativo, Enter executa, Escape fecha a paleta e o foco retorna ao controle anterior
- **Suporte a leitor de tela aprimorado** — nomes acessíveis localizados, padrões de combobox/listbox/tab semânticos, acompanhamento de ascendente ativo, contagens de resultados ao vivo e anúncios de status mais claros em comandos e modelos
- **Ações de modelos acessíveis** — favoritos, renomear, editar, exportar e excluir controles expõem rótulos e estado localizados por meio de `aria-pressed`, `aria-selected` e regiões ao vivo

#### Presença rica
- **Configuração de privacidade por padrão** — Presença Rica do Discord agora começa desabilitada, e sua barra de status, idioma e controles de privacidade permanecem indisponíveis até que o usuário habilite explicitamente a integração
- **RPC do Discord pronto para uso** — Tree IDE é distribuído com seu ID de aplicativo do Discord público, se conecta automaticamente ao cliente de desktop em execução, relata o status de conexão, retenta após desconexões e não requer configuração do usuário
- **Estados de atividade específicos** — Editando Estrutura, Editando Código, Editando Texto, Visualizando Arquivo, Navegando Modelos, Personalizando Modelo, Configurações e crie arquivos awareness — Opção de Estúdio de Compilação usa o mesmo título e descrição dinâmicos; saídas `.tree` permanecem disponíveis para projetos planos válidos e exports usam um estado de Exportação de Arquivo genérico
- **Estado de inatividade sensível ao editor** — Presença começa como Inativo e relata apenas Editando Estrutura após interação direta com o editor de estrutura; cinco minutos sem interação retornam ao Inativo com um ícone de teclado
- **Três níveis de privacidade** — Básico mostra apenas Tree IDE, Atividade adiciona a ação atual e Detalhado pode mostrar o nome do projeto e o tipo de arquivo; caminhos de arquivos e conteúdos nunca são compartilhados
- **Presença sensível à energia** — trava e suspensão limpam a atividade, enquanto desbloqueio e reativação a restauram automaticamente
- **Presença localizada** — siga o idioma do Tree IDE ou escolha Inglês, Português (Brasil) ou Espanhol independentemente; a configuração atualiza a RPC imediatamente e persiste entre sessões
- **Escopo de localização explicado** — o Discord recebe uma carga útil de atividade localizada, then todos os visualizadores veem a linguagem de Presença selecionada pelo publicador em vez de uma tradução baseada na localização do Discord do visualizador

#### Editor, árvore e validação
- **Painel de validação** — indentação ruim, nomes inválidos, irmãos duplicados, caminhos inseguros e estruturas vazias; clique em um aviso para pular para a linha
- **Desfazer / refazer** com até 100 estados de histórico
- **Guias de projeto múltiplos** com indicadores de alterados, uma barra de guias com rolagem e reordenar arrastando e soltando
- **Guias de editor de arquivo por projeto** — edite conteúdos de arquivo inicial antes da compilação e reordene arquivos abertos com arrastar e soltar mientras preserve a guia ativa
- **Sincronização de guias de arquivos excluídos** — remover arquivos ou alterar extensões no editor de estrutura agora fecha todas as guias de arquivo obsoletas, seleciona a guia válida mais próxima quando necessário e impede que conteúdo excluído reapareça
- **Pré-visualização de Markdown ao vivo** para arquivos `.md` no painel de pré-visualização de arquivo
- **Pastas collapsíveis** na pré-visualização da árvore
- **Navegação de teclado na árvore** — teclas de seta, Home, End e Enter
- **Renomeação inteligente de arquivo correspondente** quando linhas de árvore são editadas
- **Indentar/bloco desindentar** com Tab e Shift+Tab, mais Backspace inteligente para blocos de indentação
- **Zoom do editor** — `Ctrl++`, `Ctrl+-` e `Ctrl+0`
- **Painéis dimensionáveis** (editor, árvore, pré-visualização de arquivo) com layout persistente entre sessões

#### Ícones e tipos de arquivo
- **Ícones Lucide** embutidos localmente (nenhuma dependência de CDN)
- **Ícones contextuais** para pastas comuns, linguagens de programação, Docker, arquivos de configuração, arquivos e mídia
- **100+ rótulos de extensão de arquivo** na mapa de tipo de arquivo

#### IU e experiência de primeira execução
- **Janela sem moldura personalizada** com controles de minimizar, maximizar e fechar
- **Lançamento de primeira instalação limpo** — o aplicativo permanece oculto até que a interface restaurada termine sua primeira pintura, enquanto os metadados de lançamento online são carregados em segundo plano em vez de expor uma tela de inicialização congelada
- **Barra de menu** — Arquivo, Editar, Exibir, Janela e Sobre
- **Modal de boas-vindas** na primeira execução — layout redesenhado com cabeçalho de herói, cartões de configuração agrupados (Geral, Aparência, Sessão) e um botão **Iniciar** fixado
- **Modal de configurações** com guias: Geral, Aparência, Atalhos e Atualizações
- **Modal Sobre** com versão do aplicativo ao vivo (evoluiu da tela de créditos v1)
- **Diálogo de alterações não salvas** ao fechar com projetos alterados
- **Sobreposição de arrastar e soltar** para arquivos `.tree` e arquivos
- **Fontes embutidas** — Inter e JetBrains Mono

#### Diagnósticos de privacidade e relatórios do GitHub
- **Formulário de relatório estruturado** — coletar título do problema, descrição do problema, etapas de reprodução e comportamento esperado em campos localizados, auto-expandindo com contadores de caracteres
- **Seletor de rótulo do repositório** — carregar rótulos GitHub atuais com fallback off-line, exibir traduzidos para o idioma do aplicativo, adicionar o rótulo selecionado ao prefixo do título e pré-selecionar no rascunho do GitHub
- **Rascunho de problema limpo e localizado** — abrir o GitHub automaticamente após um atraso de redirecionamento visível com título, seções Markdown, e rótulo selecionado já preenchidos para revisão; clique no aviso ou pressione Enter/Space para ocultá-lo sem alterar o temporizador, e o problema nunca é enviado automaticamente
- **Logs de execução atuais** — incluem apenas entradas de log da última execução do aplicativo, separadas em seções de processo principal e renderizador, limitadas a 256 KB e carimbadas com um tempo de 12 horas localizado, período do dia e fuso horário
- **Pacote de diagnóstico sanitizado** — mascarar caminhos locais, endereços de e-mail, endereços IP e segredos de URL, excluindo nomes e conteúdos de projeto
- **Capturas de tela interativas** — após opt-in explícito, oculte o formulário de problema e capture uma região selecionada ou a janela do aplicativo completa, continue pegando capturas de tela com `Shift+P` mesmo quando a barra de ferramentas flutuante está contraída, e oculte automaticamente instruções e controles enquanto arrasta para que não cubram o conteúdo selecionado
- **Revisão de captura de tela antes de salvar** — coletar até 10 capturas, abrir visualizações em miniatura em tamanho completo, remover imagens indesejadas e gravar cada imagem PNG retida no ZIP de diagnóstico local; a área de trabalho e outras janelas nunca são capturadas
- **Anexos locais** — salvar o ZIP no caminho escolhido pelo usuário sem abrir o Explorador de Arquivos ou fazer upload; logs e capturas de tela permanecem locais até serem anexados manualmente
- **Modal de relatório mais seguro** — seleção de texto e arrastar não despedem mais o diálogo, campos redimensionam automaticamente, o tema claro/escuro segue o restante do aplicativo e o formulário é reiniciado após sucesso, Cancelar ou fechar com o botão X

#### Internacionalização
- **Traduções de interface em inglês, português (pt-BR) e espanhol**
- **Seleção de idioma na execução inicial e configurações**
- **Traduções de processos principais** para diálogos nativos e mensagens de erro
- **Script `npm run i18n:validate`** para manter arquivos de localização sincronizados

#### Persistência de sessão
-
