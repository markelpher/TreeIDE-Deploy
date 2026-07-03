# Guia de instalação do Tree IDE

[English](installation.md) · [Español](installation.es.md) · [README principal](../README.pt-BR.md)

O Tree IDE publica pacotes oficiais para Windows x64 e Windows ARM64. É um aplicativo exclusivo para Windows. NSIS, Portable e MSI estão disponíveis para ambas as arquiteturas.

## Escolha o download correto

Baixe o Tree IDE pela página de Releases do GitHub:

```text
https://github.com/markelpher/TreeIDE-Deploy/releases
```

Escolha um destes arquivos:

| Sistema | Arquivo | Observação |
| --- | --- | --- |
| Windows x64 | `Tree-IDE-Setup-{version}-win-x64.exe` | Recomendado (NSIS, suporta atualizações automáticas) |
| Windows x64 Portable | `Tree-IDE-Portable-{version}-win-x64.exe` | Não instala, executa diretamente |
| Windows x64 MSI | `Tree-IDE-{version}-win-x64.msi` | Instalador alternativo |
| Windows ARM64 | `Tree-IDE-Setup-{version}-win-arm64.exe` | NSIS para dispositivos ARM |
| Windows ARM64 Portable | `Tree-IDE-Portable-{version}-win-arm64.exe` | Não instala, executa diretamente |
| Windows ARM64 MSI | `Tree-IDE-{version}-win-arm64.msi` | Instalador alternativo |

## Instalar no Windows

1. Baixe o arquivo correto para o seu processador (x64 ou ARM64) para NSIS (recomendado, suporta atualizações automáticas), Portable ou MSI.
2. Dê dois cliques no instalador (Setup ou MSI) ou execute diretamente o Portable .exe.
3. Se o Windows SmartScreen aparecer, clique em **Mais informações** e depois em **Executar assim mesmo** somente se o arquivo veio da release oficial.
4. Aguarde a instalação terminar (ou apenas inicie o Portable).
5. Abra o Tree IDE pelo menu Iniciar, atalho da área de trabalho ou o executável portable.

O instalador NSIS é por usuário e instala no perfil do usuário atual do Windows, normalmente dentro de `%LocalAppData%\Programs`. Ele não deve pedir permissão de administrador para instalação normal nem para updates automáticos.

## Atualizações automáticas

O Tree IDE usa o canal do instalador Windows NSIS para atualizar automaticamente.

1. O Tree IDE verifica no GitHub Releases se existe uma versão finalizada mais nova.
2. Quando houver update, o app baixa em segundo plano o instalador NSIS correto para x64 ou ARM64.
3. Quando o download terminar, o Tree IDE fecha, instala silenciosamente e reabre automaticamente.

Use sempre o instalador `Tree-IDE-Setup-{version}-win-{arch}.exe`. Pacotes MSI e portable não fazem parte do canal de atualização automática.

## Desinstalar

Use **Configurações -> Aplicativos -> Aplicativos instalados -> Tree IDE -> Desinstalar**, ou execute o desinstalador na pasta de instalação do Tree IDE.

## Solução de problemas

### O Windows pede permissão de administrador

Instale a build `Tree-IDE-Setup-{version}-win-{arch}.exe` mais recente para a sua arquitetura. As builds atuais estão configuradas como instalação por usuário e não devem pedir administrador durante instalação/update normal.

Se uma versão antiga instalada para todos os usuários já estava na máquina, desinstale-a primeiro pelas Configurações do Windows e depois instale o novo setup por usuário.

### O update não reabriu o app

Abra o Tree IDE manualmente pelo menu Iniciar e confira a versão em **Sobre o Tree IDE**. Se a versão não mudou, baixe o `Tree-IDE-Setup-{version}-win-{arch}.exe` mais recente no GitHub Releases e execute uma vez.
