!include LogicLib.nsh
!include nsDialogs.nsh

; Language picker (1033=en_US, 1046=pt_BR, 1034/3082=Spanish International)
!macro SPANISH_LANGSTRING NAME VALUE
  LangString ${NAME} 1034 "${VALUE}"
  LangString ${NAME} 3082 "${VALUE}"
!macroend

; Short "Español" in the picker — stock SpanishInternational.nsh skips LANGFILE names when these exist
!define LANGFILE_SpanishInternational_ENGLISHNAME "Spanish"
!define LANGFILE_SpanishInternational_NAME "Español"
!define LANGFILE_SpanishInternational_LANGDLL "Español"

LangString languagePageTitle 1033 "Installer Language"
LangString languagePageTitle 1046 "Idioma do instalador"
!insertmacro SPANISH_LANGSTRING languagePageTitle "Idioma del instalador"
LangString languagePageIntro 1033 "Please select a language."
LangString languagePageIntro 1046 "Selecione um idioma."
!insertmacro SPANISH_LANGSTRING languagePageIntro "Seleccione un idioma."

; Clean installation page
LangString cleanInstallIntro 1033 "Choose whether Tree IDE should keep your current settings or start fresh."
LangString cleanInstallIntro 1046 "Escolha se o Tree IDE deve manter suas configurações atuais ou começar do zero."
!insertmacro SPANISH_LANGSTRING cleanInstallIntro "Elige si Tree IDE debe conservar tu configuración actual o empezar de cero."
LangString cleanInstallOption 1033 "Clean installation: remove Tree IDE settings, cache, logs, and update data for this Windows user."
LangString cleanInstallOption 1046 "Instalação limpa: remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
!insertmacro SPANISH_LANGSTRING cleanInstallOption "Instalación limpia: eliminar configuración, caché, registros y datos de actualización de Tree IDE para este usuario de Windows."
LangString cleanInstallDetails 1033 "Running clean installation. Removing Tree IDE user data."
LangString cleanInstallDetails 1046 "Executando instalação limpa. Removendo dados do usuário do Tree IDE."
!insertmacro SPANISH_LANGSTRING cleanInstallDetails "Ejecutando instalación limpia. Eliminando datos de usuario de Tree IDE."

; Uninstaller welcome (MUI_WELCOMEPAGE_* — MUI_UNPAGE_WELCOME clears these itself)
LangString uninstWelcomeTitle 1033 "Tree IDE Uninstall"
LangString uninstWelcomeTitle 1046 "Desinstalação do Tree IDE"
!insertmacro SPANISH_LANGSTRING uninstWelcomeTitle "Desinstalación de Tree IDE"
LangString uninstWelcomeText 1033 "This wizard will guide you through uninstalling Tree IDE.$\r$\n$\r$\nClose Tree IDE if it is running before continuing."
LangString uninstWelcomeText 1046 "Este assistente irá guiá-lo pela desinstalação do Tree IDE.$\r$\n$\r$\nFeche o Tree IDE se estiver em execução antes de continuar."
!insertmacro SPANISH_LANGSTRING uninstWelcomeText "Este asistente le guiará en la desinstalación de Tree IDE.$\r$\n$\r$\nCierre Tree IDE si está en ejecución antes de continuar."

!ifndef BUILD_UNINSTALLER
Var CleanInstallCheckbox
Var CleanInstallRequested

!macro customHeader
  !define MUI_LANGDLL_WINDOWTITLE "$(languagePageTitle)"
  !define MUI_LANGDLL_INFO "$(languagePageIntro)"
!macroend

!macro customPageAfterChangeDir
  Page custom CleanInstallPageCreate CleanInstallPageLeave
!macroend

Function CleanInstallPageCreate
  nsDialogs::Create 1018
  Pop $0

  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 28u "$(cleanInstallIntro)"
  Pop $0

  ${NSD_CreateCheckbox} 0 38u 100% 24u "$(cleanInstallOption)"
  Pop $CleanInstallCheckbox

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
  DetailPrint "$(cleanInstallDetails)"

  ReadEnvStr $0 "APPDATA"
  ReadEnvStr $1 "LOCALAPPDATA"

  RMDir /r "$0\Tree IDE"
  RMDir /r "$0\tree-ide"
  RMDir /r "$1\Tree IDE"
  RMDir /r "$1\tree-ide"
  RMDir /r "$1\tree-ide-updater"
FunctionEnd
!else
!macro customUnWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "$(uninstWelcomeTitle)"
  !define MUI_WELCOMEPAGE_TEXT "$(uninstWelcomeText)"
  !insertmacro MUI_UNPAGE_WELCOME
!macroend
!endif