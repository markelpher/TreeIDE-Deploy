!include LogicLib.nsh
!include nsDialogs.nsh

LangString languagePageTitle 1033 "Installer Language"
LangString languagePageTitle 1046 "Idioma do instalador"
LangString languagePageIntro 1033 "Please select a language."
LangString languagePageIntro 1046 "Selecione um idioma."
LangString languagePageNext 1033 "Next"
LangString languagePageNext 1046 "Avançar"
LangString languagePageCancel 1033 "Cancel"
LangString languagePageCancel 1046 "Cancelar"
LangString cleanInstallIntro 1033 "Choose whether Tree IDE should keep your current settings or start fresh."
LangString cleanInstallIntro 1046 "Escolha se o Tree IDE deve manter suas configurações atuais ou começar do zero."
LangString cleanInstallOption 1033 "Clean installation: remove Tree IDE settings, cache, logs, and update data for this Windows user."
LangString cleanInstallOption 1046 "Instalação limpa: remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
LangString cleanInstallDetails 1033 "Running clean installation. Removing Tree IDE user data."
LangString cleanInstallDetails 1046 "Executando instalação limpa. Removendo dados do usuário do Tree IDE."

!ifndef BUILD_UNINSTALLER
Var CleanInstallCheckbox
Var CleanInstallRequested

!macro customHeader
  !define MUI_LANGDLL_WINDOWTITLE "Installer language / Idioma do instalador"
  !define MUI_LANGDLL_INFO "Select a language. / Selecione um idioma."
!macroend

!macro customPageAfterChangeDir
  Page custom CleanInstallPageCreate CleanInstallPageLeave
!macroend

Function UpdateCleanInstallPageText
  ${If} $LANGUAGE == 1046
    ${NSD_SetText} $0 "Escolha se o Tree IDE deve manter suas configurações atuais ou começar do zero."
    ${NSD_SetText} $CleanInstallCheckbox "Instalação limpa: remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
  ${Else}
    ${NSD_SetText} $0 "Choose whether Tree IDE should keep your current settings or start fresh."
    ${NSD_SetText} $CleanInstallCheckbox "Clean installation: remove Tree IDE settings, cache, logs, and update data for this Windows user."
  ${EndIf}
FunctionEnd

Function CleanInstallPageCreate
  nsDialogs::Create 1018
  Pop $0

  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 28u ""
  Pop $0

  ${NSD_CreateCheckbox} 0 38u 100% 24u ""
  Pop $CleanInstallCheckbox
  Call UpdateCleanInstallPageText

  ${If} $CleanInstallRequested == "1"
    ${NSD_Check} $CleanInstallCheckbox
  ${EndIf}

  nsDialogs::Show
FunctionEnd

Function CleanInstallPageLeave
  ${NSD_GetState} $CleanInstallCheckbox $0

  ${If} $0 == ${BST_CHECKED}
    StrCpy $CleanInstallRequested "1"
    Call RemoveTreeIdeUserData
  ${Else}
    StrCpy $CleanInstallRequested "0"
  ${EndIf}
FunctionEnd

Function RemoveTreeIdeUserData
  ${If} $LANGUAGE == 1046
    DetailPrint "Executando instalação limpa. Removendo dados do usuário do Tree IDE."
  ${Else}
    DetailPrint "Running clean installation. Removing Tree IDE user data."
  ${EndIf}

  ReadEnvStr $0 "APPDATA"
  ReadEnvStr $1 "LOCALAPPDATA"

  RMDir /r "$0\Tree IDE"
  RMDir /r "$0\tree-ide"
  RMDir /r "$1\Tree IDE"
  RMDir /r "$1\tree-ide"
  RMDir /r "$1\tree-ide-updater"
FunctionEnd
!endif
