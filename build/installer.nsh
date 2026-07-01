!include LogicLib.nsh
!include nsDialogs.nsh

LangString languagePageTitle 1033 "Installer Language"
LangString languagePageTitle 1046 "Idioma do instalador"
LangString languagePageTitle 3082 "Idioma del instalador"
LangString languagePageIntro 1033 "Please select a language."
LangString languagePageIntro 1046 "Selecione um idioma."
LangString languagePageIntro 3082 "Seleccione un idioma."
LangString languagePageNext 1033 "Next"
LangString languagePageNext 1046 "Avançar"
LangString languagePageNext 3082 "Siguiente"
LangString languagePageCancel 1033 "Cancel"
LangString languagePageCancel 1046 "Cancelar"
LangString languagePageCancel 3082 "Cancelar"
LangString cleanInstallIntro 1033 "Choose whether Tree IDE should keep your current settings or start fresh."
LangString cleanInstallIntro 1046 "Escolha se o Tree IDE deve manter suas configurações atuais ou começar do zero."
LangString cleanInstallIntro 3082 "Elige si Tree IDE debe conservar tu configuración actual o empezar de cero."
LangString cleanInstallOption 1033 "Clean installation: remove Tree IDE settings, cache, logs, and update data for this Windows user."
LangString cleanInstallOption 1046 "Instalação limpa: remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
LangString cleanInstallOption 3082 "Instalación limpia: eliminar configuración, caché, registros y datos de actualización de Tree IDE para este usuario de Windows."
LangString cleanInstallDetails 1033 "Running clean installation. Removing Tree IDE user data."
LangString cleanInstallDetails 1046 "Executando instalação limpa. Removendo dados do usuário do Tree IDE."
LangString cleanInstallDetails 3082 "Ejecutando instalación limpia. Eliminando datos de usuario de Tree IDE."

!ifndef BUILD_UNINSTALLER
Var CleanInstallCheckbox
Var CleanInstallRequested

!macro customHeader
  !define MUI_LANGDLL_WINDOWTITLE "Installer language / Idioma del instalador / Idioma do instalador"
  !define MUI_LANGDLL_INFO "Select a language. / Seleccione un idioma. / Selecione um idioma."
!macroend

!macro customPageAfterChangeDir
  Page custom CleanInstallPageCreate CleanInstallPageLeave
!macroend

Function UpdateCleanInstallPageText
  ${If} $LANGUAGE == 1046
    ${NSD_SetText} $0 "Escolha se o Tree IDE deve manter suas configurações atuais ou começar do zero."
    ${NSD_SetText} $CleanInstallCheckbox "Instalação limpa: remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
  ${ElseIf} $LANGUAGE == 3082
    ${NSD_SetText} $0 "Elige si Tree IDE debe conservar tu configuración actual o empezar de cero."
    ${NSD_SetText} $CleanInstallCheckbox "Instalación limpia: eliminar configuración, caché, registros y datos de actualización de Tree IDE para este usuario de Windows."
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
  ${ElseIf} $LANGUAGE == 3082
    DetailPrint "Ejecutando instalación limpia. Eliminando datos de usuario de Tree IDE."
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