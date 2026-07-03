!include FileFunc.nsh
!include LogicLib.nsh
!include nsDialogs.nsh
!include WinMessages.nsh

!ifdef DISPLAY_LANG_SELECTOR
  !undef DISPLAY_LANG_SELECTOR
!endif


LangString treeIdeAdminRequired 1033 "$(^Caption) requires administrator privileges."
LangString treeIdeAdminRequired 1046 "$(^Caption) requer privilégios de administrador."
LangString treeIdeAdminRequired 3082 "$(^Caption) requiere privilegios de administrador."
LangString treeIdePowerRequired 1033 "$(^Caption) requires at least Power User privileges."
LangString treeIdePowerRequired 1046 "$(^Caption) requer pelo menos privilégios de usuário avançado."
LangString treeIdePowerRequired 3082 "$(^Caption) requiere al menos privilegios de usuario avanzado."
LangString treeIdeAllUsersNotPossible 1033 "Your user account does not have sufficient privileges to install $(^Name) for all users of this computer."
LangString treeIdeAllUsersNotPossible 1046 "Sua conta de usuário não tem privilégios suficientes para instalar $(^Name) para todos os usuários deste computador."
LangString treeIdeAllUsersNotPossible 3082 "Tu cuenta de usuario no tiene privilegios suficientes para instalar $(^Name) para todos los usuarios de este equipo."
LangString treeIdeMustRunAsAdmin 1033 "must run as administrator"
LangString treeIdeMustRunAsAdmin 1046 "requer execução como administrador"
LangString treeIdeMustRunAsAdmin 3082 "requiere ejecución como administrador"
LangString treeIdeLogonServiceNotRunning 1033 "The Secondary Logon service is not running, so elevation cannot continue."
LangString treeIdeLogonServiceNotRunning 1046 "O serviço Logon Secundário não está em execução, então a elevação não pode continuar."
LangString treeIdeLogonServiceNotRunning 3082 "El servicio Inicio de sesión secundario no se está ejecutando, por lo que la elevación no puede continuar."
LangString treeIdeUnableToElevate 1033 "Unable to elevate, error $0"
LangString treeIdeUnableToElevate 1046 "Não foi possível elevar privilégios, erro $0"
LangString treeIdeUnableToElevate 3082 "No se pudieron elevar los privilegios, error $0"
LangString treeIdeFileBusy 1033 "File is busy, aborting: $0"
LangString treeIdeFileBusy 1046 "O arquivo está em uso, abortando: $0"
LangString treeIdeFileBusy 3082 "El archivo está en uso, cancelando: $0"
LangString treeIdeCannotRenameInstallDir 1033 "Cannot rename $INSTDIR to $PLUGINSDIR\old-install."
LangString treeIdeCannotRenameInstallDir 1046 "Não foi possível renomear $INSTDIR para $PLUGINSDIR\old-install."
LangString treeIdeCannotRenameInstallDir 3082 "No se pudo cambiar el nombre de $INSTDIR a $PLUGINSDIR\old-install."

!define MULTIUSER_INIT_TEXT_ADMINREQUIRED "$(treeIdeAdminRequired)"
!define MULTIUSER_INIT_TEXT_POWERREQUIRED "$(treeIdePowerRequired)"
!define MULTIUSER_INIT_TEXT_ALLUSERSNOTPOSSIBLE "$(treeIdeAllUsersNotPossible)"
LangString treeIdeDirText 1033 "Tree IDE will be installed in the following folder. To install in a different folder, click Browse and select another folder."
LangString treeIdeDirText 1046 "O Tree IDE será instalado na pasta a seguir. Para instalar em uma pasta diferente, clique em Procurar e selecione outra pasta."
LangString treeIdeDirText 3082 "Tree IDE se instalará en la siguiente carpeta. Para instalarlo en una carpeta diferente, haga clic en Examinar y seleccione otra carpeta."
LangString treeIdeDirDestination 1033 "Destination Folder"
LangString treeIdeDirDestination 1046 "Pasta de Destino"
LangString treeIdeDirDestination 3082 "Carpeta de Destino"
LangString treeIdeBrowseButton 1033 "Browse..."
LangString treeIdeBrowseButton 1046 "Procurar..."
LangString treeIdeBrowseButton 3082 "Examinar..."
LangString treeIdeDirBrowseDialog 1033 "Choose the installation folder"
LangString treeIdeDirBrowseDialog 1046 "Escolha a pasta de instalação"
LangString treeIdeDirBrowseDialog 3082 "Elija la carpeta de instalación"
LangString treeIdeDirectoryEmpty 1033 "Choose an installation folder to continue."
LangString treeIdeDirectoryEmpty 1046 "Escolha uma pasta de instalação para continuar."
LangString treeIdeDirectoryEmpty 3082 "Elija una carpeta de instalación para continuar."
LangString treeIdeSpaceRequired 1033 "Space required: "
LangString treeIdeSpaceRequired 1046 "Espaço necessário: "
LangString treeIdeSpaceRequired 3082 "Espacio requerido: "
LangString treeIdeSpaceAvailable 1033 "Space available: "
LangString treeIdeSpaceAvailable 1046 "Espaço disponível: "
LangString treeIdeSpaceAvailable 3082 "Espacio disponible: "
LangString treeIdeInstallFinishTitle 1033 "Completing Tree IDE Setup"
LangString treeIdeInstallFinishTitle 1046 "Completando a instalação do Tree IDE"
LangString treeIdeInstallFinishTitle 3082 "Completando la instalación de Tree IDE"
LangString treeIdeInstallFinishText 1033 "Tree IDE has been installed on your computer.$\r$\n$\r$\nClick Finish to close Setup."
LangString treeIdeInstallFinishText 1046 "O Tree IDE foi instalado no seu computador.$\r$\n$\r$\nClique em Concluir para fechar o instalador."
LangString treeIdeInstallFinishText 3082 "Tree IDE se ha instalado en su equipo.$\r$\n$\r$\nHaga clic en Terminar para cerrar el instalador."
LangString treeIdeInstallRunText 1033 "Run Tree IDE"
LangString treeIdeInstallRunText 1046 "Executar o Tree IDE"
LangString treeIdeInstallRunText 3082 "Ejecutar Tree IDE"
LangString treeIdeInstallFinishSubtitle 1033 "Tree IDE has been installed successfully."
LangString treeIdeInstallFinishSubtitle 1046 "O Tree IDE foi instalado com sucesso."
LangString treeIdeInstallFinishSubtitle 3082 "Tree IDE se ha instalado correctamente."
LangString treeIdeUninstallFinishTitle 1033 "Completing Tree IDE Uninstall"
LangString treeIdeUninstallFinishTitle 1046 "Completando a desinstalação do Tree IDE"
LangString treeIdeUninstallFinishTitle 3082 "Completando la desinstalación de Tree IDE"
LangString treeIdeUninstallFinishText 1033 "Tree IDE has been removed from your computer.$\r$\n$\r$\nClick Finish to close the uninstaller."
LangString treeIdeUninstallFinishText 1046 "O Tree IDE foi removido do seu computador.$\r$\n$\r$\nClique em Concluir para fechar o desinstalador."
LangString treeIdeUninstallFinishText 3082 "Tree IDE se ha eliminado de su equipo.$\r$\n$\r$\nHaga clic en Terminar para cerrar el desinstalador."
LangString treeIdeUninstallFinishSubtitle 1033 "Tree IDE has been removed successfully."
LangString treeIdeUninstallFinishSubtitle 1046 "O Tree IDE foi removido com sucesso."
LangString treeIdeUninstallFinishSubtitle 3082 "Tree IDE se ha eliminado correctamente."
LangString treeIdeFinishButton 1033 "Finish"
LangString treeIdeFinishButton 1046 "Concluir"
LangString treeIdeFinishButton 3082 "Terminar"
LangString cleanInstallIntro 1033 "Choose whether Tree IDE should keep your current settings or start fresh."
LangString cleanInstallIntro 1046 "Escolha se o Tree IDE deve manter suas configurações atuais ou começar do zero."
LangString cleanInstallIntro 3082 "Elija si Tree IDE debe conservar su configuración actual o empezar de cero."
LangString cleanInstallOption 1033 "Clean installation: remove Tree IDE settings, cache, logs, and update data for this Windows user."
LangString cleanInstallOption 1046 "Instalação limpa: remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
LangString cleanInstallOption 3082 "Instalación limpia: elimina la configuración, la caché, los registros y los datos de actualización de Tree IDE para este usuario de Windows."
LangString cleanInstallDetails 1033 "Running clean installation. Removing Tree IDE user data."
LangString cleanInstallDetails 1046 "Executando instalação limpa. Removendo dados do usuário do Tree IDE."
LangString cleanInstallDetails 3082 "Ejecutando instalación limpia. Eliminando datos de usuario de Tree IDE."
LangString treeIdeInstallWindowTitle 1033 "Tree IDE Setup"
LangString treeIdeInstallWindowTitle 1046 "Instalação do Tree IDE"
LangString treeIdeInstallWindowTitle 3082 "Instalación de Tree IDE"
LangString treeIdeUninstallWindowTitle 1033 "Tree IDE Uninstall"
LangString treeIdeUninstallWindowTitle 1046 "Desinstalação do Tree IDE"
LangString treeIdeUninstallWindowTitle 3082 "Desinstalación de Tree IDE"
LangString treeIdeDirTitle 1033 "Installation Folder"
LangString treeIdeDirTitle 1046 "Pasta de instalação"
LangString treeIdeDirTitle 3082 "Carpeta de instalación"
LangString treeIdeDirSubtitle 1033 "Choose the installation folder."
LangString treeIdeDirSubtitle 1046 "Escolha a pasta de instalação."
LangString treeIdeDirSubtitle 3082 "Elija la carpeta de instalación."
LangString treeIdeInstallingTitle 1033 "Installing"
LangString treeIdeInstallingTitle 1046 "Instalando"
LangString treeIdeInstallingTitle 3082 "Instalando"
LangString treeIdeInstallingSubtitle 1033 "Please wait while Tree IDE is being installed."
LangString treeIdeInstallingSubtitle 1046 "Aguarde enquanto o Tree IDE é instalado."
LangString treeIdeInstallingSubtitle 3082 "Espere mientras se instala Tree IDE."
LangString treeIdeUninstallingTitle 1033 "Uninstalling"
LangString treeIdeUninstallingTitle 1046 "Desinstalando"
LangString treeIdeUninstallingTitle 3082 "Desinstalando"
LangString treeIdeUninstallingSubtitle 1033 "Please wait while Tree IDE is being removed."
LangString treeIdeUninstallingSubtitle 1046 "Aguarde enquanto o Tree IDE é removido."
LangString treeIdeUninstallingSubtitle 3082 "Espere mientras se desinstala Tree IDE."
LangString treeIdeCleanInstallTitle 1033 "Clean Installation"
LangString treeIdeCleanInstallTitle 1046 "Instalação limpa"
LangString treeIdeCleanInstallTitle 3082 "Instalación limpia"
LangString treeIdeBackButton 1033 "< &Back"
LangString treeIdeBackButton 1046 "< &Voltar"
LangString treeIdeBackButton 3082 "< &Atrás"
LangString treeIdeNextButton 1033 "&Next >"
LangString treeIdeNextButton 1046 "&Próximo >"
LangString treeIdeNextButton 3082 "&Siguiente >"
LangString treeIdeCancelButton 1033 "Cancel"
LangString treeIdeCancelButton 1046 "Cancelar"
LangString treeIdeCancelButton 3082 "Cancelar"
LangString treeIdeUninstallProgressText 1033 "Removing Tree IDE from this computer..."
LangString treeIdeUninstallProgressText 1046 "Removendo o Tree IDE deste computador..."
LangString treeIdeUninstallProgressText 3082 "Eliminando Tree IDE de este equipo..."
LangString uninstallDataIntro 1033 "Choose whether Tree IDE should keep your user data after uninstalling."
LangString uninstallDataIntro 1046 "Escolha se o Tree IDE deve manter seus dados de usuário após a desinstalação."
LangString uninstallDataIntro 3082 "Elija si Tree IDE debe conservar sus datos de usuario después de desinstalar."
LangString uninstallDataOption 1033 "Remove Tree IDE settings, cache, logs, and update data for this Windows user."
LangString uninstallDataOption 1046 "Remover configurações, cache, logs e dados de atualização do Tree IDE para este usuário do Windows."
LangString uninstallDataOption 3082 "Eliminar la configuración, la caché, los registros y los datos de actualización de Tree IDE para este usuario de Windows."
LangString uninstallDataDetails 1033 "Removing Tree IDE user data."
LangString uninstallDataDetails 1046 "Removendo dados do usuário do Tree IDE."
LangString uninstallDataDetails 3082 "Eliminando datos de usuario de Tree IDE."
LangString treeIdeUninstallDataTitle 1033 "User Data"
LangString treeIdeUninstallDataTitle 1046 "Dados de usuário"
LangString treeIdeUninstallDataTitle 3082 "Datos de usuario"

Var TreeIdeIsFinishPage
!ifndef BUILD_UNINSTALLER
  !ifdef MUI_PAGE_CUSTOMFUNCTION_PRE
    !undef MUI_PAGE_CUSTOMFUNCTION_PRE
  !endif
  !ifdef MUI_PAGE_CUSTOMFUNCTION_SHOW
    !undef MUI_PAGE_CUSTOMFUNCTION_SHOW
  !endif

Var TreeIdeDirInput
Var TreeIdeSpaceRequiredLabel
Var TreeIdeSpaceAvailableLabel


Function TreeIdeInitSystemLanguage
  System::Call 'kernel32::GetUserDefaultUILanguage()i .r0'
  IntOp $1 $0 & 0x3FF
  ${If} $1 == 22
    StrCpy $LANGUAGE 1046
  ${ElseIf} $1 == 10
    StrCpy $LANGUAGE 3082
  ${ElseIf} $1 == 9
    StrCpy $LANGUAGE 1033
  ${Else}
    StrCpy $LANGUAGE 1033
  ${EndIf}
FunctionEnd

Function TreeIdeSetHeader
  Pop $R8
  Pop $R9
  GetDlgItem $R5 $HWNDPARENT 1037
  GetDlgItem $R6 $HWNDPARENT 1038
  SendMessage $R5 ${WM_SETTEXT} 0 "STR:$R8"
  SendMessage $R6 ${WM_SETTEXT} 0 "STR:$R9"
FunctionEnd

Function TreeIdeRefreshWizardButtons
  GetDlgItem $R5 $HWNDPARENT 3
  GetDlgItem $R6 $HWNDPARENT 1
  GetDlgItem $R7 $HWNDPARENT 2
  SendMessage $R5 ${WM_SETTEXT} 0 "STR:$(treeIdeBackButton)"
  ${If} $TreeIdeIsFinishPage == "1"
    SendMessage $R6 ${WM_SETTEXT} 0 "STR:$(treeIdeFinishButton)"
  ${Else}
    SendMessage $R6 ${WM_SETTEXT} 0 "STR:$(treeIdeNextButton)"
  ${EndIf}
  SendMessage $R7 ${WM_SETTEXT} 0 "STR:$(treeIdeCancelButton)"
FunctionEnd

Function TreeIdeUpdateWindowTitle
  SendMessage $HWNDPARENT ${WM_SETTEXT} 0 "STR:$(treeIdeInstallWindowTitle)"
FunctionEnd

Function TreeIdeApplyPageTexts
  FindWindow $0 "#32770" "" $HWNDPARENT
  ${If} $0 == 0
    Return
  ${EndIf}

  ${If} $TreeIdeIsFinishPage == "1"
    Push "$(treeIdeInstallFinishSubtitle)"
    Push "$(treeIdeInstallFinishTitle)"
    Call TreeIdeSetHeader

    System::Call 'user32::FindWindowEx(p r0, p 0, t "Static", p 0) p .r1'
    System::Call 'user32::FindWindowEx(p r0, p r1, t "Static", p 0) p .r2'
    System::Call 'user32::FindWindowEx(p r0, p r2, t "Static", p 0) p .r3'
    System::Call 'user32::FindWindowEx(p r0, p 0, t "Button", p 0) p .r4'

    ${If} $1 != 0
      SendMessage $1 ${WM_SETTEXT} 0 "STR:$(treeIdeInstallFinishTitle)"
    ${EndIf}
    ${If} $2 != 0
      SendMessage $2 ${WM_SETTEXT} 0 "STR:$(treeIdeInstallFinishText)"
    ${EndIf}
    ${If} $3 != 0
      SendMessage $3 ${WM_SETTEXT} 0 "STR:$(treeIdeInstallFinishText)"
    ${EndIf}
    ${If} $4 != 0
      SendMessage $4 ${WM_SETTEXT} 0 "STR:$(treeIdeInstallRunText)"
    ${EndIf}
    Return
  ${EndIf}

  GetDlgItem $1 $0 1001
  ${If} $1 != 0
    Push "$(treeIdeDirSubtitle)"
    Push "$(treeIdeDirTitle)"
    Call TreeIdeSetHeader

    GetDlgItem $1 $0 1001
    ${If} $1 != 0
      SendMessage $1 ${WM_SETTEXT} 0 "STR:$(treeIdeBrowseButton)"
    ${EndIf}
    GetDlgItem $2 $0 1020
    ${If} $2 != 0
      SendMessage $2 ${WM_SETTEXT} 0 "STR:$(treeIdeDirDestination)"
    ${EndIf}
    GetDlgItem $2 $0 1006
    ${If} $2 != 0
      SendMessage $2 ${WM_SETTEXT} 0 "STR:$(treeIdeDirText)"
    ${EndIf}
    Return
  ${EndIf}

  GetDlgItem $1 $0 1004
  ${If} $1 != 0
    Push "$(treeIdeInstallingSubtitle)"
    Push "$(treeIdeInstallingTitle)"
    Call TreeIdeSetHeader
  ${EndIf}
FunctionEnd
Function TreeIdeApplySpaceLabels
  FindWindow $0 "#32770" "" $HWNDPARENT
  ${If} $0 == 0
    Return
  ${EndIf}

  GetDlgItem $1 $0 1023
  ${If} $1 != 0
    SendMessage $1 ${WM_SETTEXT} 0 "STR:$(treeIdeSpaceRequired)"
  ${EndIf}

  GetDlgItem $2 $0 1024
  ${If} $2 != 0
    SendMessage $2 ${WM_SETTEXT} 0 "STR:$(treeIdeSpaceAvailable)"
  ${EndIf}
FunctionEnd
Function TreeIdeFinishPagePre
  StrCpy $TreeIdeIsFinishPage "1"
FunctionEnd

Function TreeIdeFinishPageShow
  nsDialogs::KillTimer /NOUNLOAD TreeIdeApplySpaceLabels
  Call TreeIdeUpdateWindowTitle
  Call TreeIdeRefreshWizardButtons
  Call TreeIdeApplyPageTexts
  StrCpy $TreeIdeIsFinishPage "0"
FunctionEnd

Function TreeIdeOnPageShow
  nsDialogs::KillTimer /NOUNLOAD TreeIdeApplySpaceLabels
  Call TreeIdeUpdateWindowTitle
  Call TreeIdeRefreshWizardButtons
  Call TreeIdeApplyPageTexts
  Call TreeIdeApplySpaceLabels
  ${NSD_CreateTimer} TreeIdeApplySpaceLabels 50
  StrCpy $TreeIdeIsFinishPage "0"
FunctionEnd


!macro preInit
  Call TreeIdeInitSystemLanguage
!macroend

!macro customInstallDirectoryPage
  PageEx custom
    PageCallbacks TreeIdeDirectoryPre TreeIdeDirectoryLeave
    Caption " "
  PageExEnd
!macroend

Function TreeIdeDirectorySetHeader
  Push "$(treeIdeDirSubtitle)"
  Push "$(treeIdeDirTitle)"
  Call TreeIdeSetHeader
FunctionEnd

Function TreeIdeFormatMb
  Exch $0
  ${If} $0 >= 1024
    IntOp $0 $0 / 1024
    StrCpy $0 "$0 GB"
  ${Else}
    StrCpy $0 "$0 MB"
  ${EndIf}
  Exch $0
FunctionEnd

Function TreeIdeDirectoryUpdateSpace
  ${NSD_GetText} $TreeIdeDirInput $INSTDIR

  StrCpy $0 ${ESTIMATED_SIZE}
  IntOp $0 $0 / 1024
  Push $0
  Call TreeIdeFormatMb
  Pop $0
  ${NSD_SetText} $TreeIdeSpaceRequiredLabel "$(treeIdeSpaceRequired)$0"

  ${GetRoot} "$INSTDIR" $1
  ${If} $1 == ""
    StrCpy $1 "$INSTDIR"
  ${EndIf}
  ${DriveSpace} "$1" "/D=F /S=M" $2
  ${If} ${Errors}
    ${NSD_SetText} $TreeIdeSpaceAvailableLabel "$(treeIdeSpaceAvailable)-"
  ${Else}
    Push $2
    Call TreeIdeFormatMb
    Pop $2
    ${NSD_SetText} $TreeIdeSpaceAvailableLabel "$(treeIdeSpaceAvailable)$2"
  ${EndIf}
FunctionEnd

Function TreeIdeDirectoryBrowse
  Pop $0
  nsDialogs::SelectFolderDialog "$(treeIdeDirBrowseDialog)" "$INSTDIR"
  Pop $0
  ${If} $0 != error
  ${AndIf} $0 != ""
    StrCpy $INSTDIR $0
    ${NSD_SetText} $TreeIdeDirInput "$INSTDIR"
    Call TreeIdeDirectoryUpdateSpace
  ${EndIf}
FunctionEnd

Function TreeIdeDirectoryOnChange
  Pop $0
  Call TreeIdeDirectoryUpdateSpace
FunctionEnd

Function TreeIdeDirectoryPre
  Call TreeIdeUpdateWindowTitle
  Call TreeIdeRefreshWizardButtons
  Call TreeIdeDirectorySetHeader

  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0u 0u 300u 32u "$(treeIdeDirText)"
  Pop $0

  ${NSD_CreateGroupBox} 0u 44u 300u 58u "$(treeIdeDirDestination)"
  Pop $0

  ${NSD_CreateDirRequest} 4u 68u 218u 13u "$INSTDIR"
  Pop $TreeIdeDirInput
  ${NSD_OnChange} $TreeIdeDirInput TreeIdeDirectoryOnChange

  ${NSD_CreateBrowseButton} 230u 67u 64u 15u "$(treeIdeBrowseButton)"
  Pop $0
  ${NSD_OnClick} $0 TreeIdeDirectoryBrowse

  ${NSD_CreateLabel} 0u 114u 300u 10u ""
  Pop $TreeIdeSpaceRequiredLabel
  ${NSD_CreateLabel} 0u 128u 300u 10u ""
  Pop $TreeIdeSpaceAvailableLabel
  Call TreeIdeDirectoryUpdateSpace

  nsDialogs::Show
FunctionEnd

Function TreeIdeDirectoryLeave
  ${NSD_GetText} $TreeIdeDirInput $INSTDIR
  ${If} $INSTDIR == ""
    MessageBox MB_ICONEXCLAMATION|MB_OK "$(treeIdeDirectoryEmpty)"
    Abort
  ${EndIf}
FunctionEnd
Var CleanInstallCheckbox
Var CleanInstallRequested

!macro customPageAfterChangeDir
  PageEx custom
    PageCallbacks TreeIdeCleanInstallPre TreeIdeCleanInstallLeave
    Caption " "
  PageExEnd
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW TreeIdeOnPageShow
!macroend

!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "$(treeIdeInstallFinishTitle)"
  !define MUI_FINISHPAGE_TEXT "$(treeIdeInstallFinishText)"
  !define MUI_FINISHPAGE_BUTTON "$(treeIdeFinishButton)"
  !define MUI_FINISHPAGE_RUN_TEXT "$(treeIdeInstallRunText)"
  !define MUI_PAGE_CUSTOMFUNCTION_PRE TreeIdeFinishPagePre
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW TreeIdeFinishPageShow
  Function StartApp
    ${if} ${isUpdated}
      StrCpy $1 "--updated"
    ${else}
      StrCpy $1 ""
    ${endif}
    ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
  FunctionEnd
  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_FUNCTION "StartApp"
  !insertmacro MUI_PAGE_FINISH
!macroend

Function TreeIdeCleanInstallSetHeader
  Push "$(cleanInstallIntro)"
  Push "$(treeIdeCleanInstallTitle)"
  Call TreeIdeSetHeader
FunctionEnd

Function TreeIdeCleanInstallPre
  Call TreeIdeCleanInstallSetHeader
  Call TreeIdeRefreshWizardButtons

  nsDialogs::Create 1018
  Pop $0

  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateCheckbox} 0u 11u 10u 10u ""
  Pop $CleanInstallCheckbox

  ${NSD_CreateLabel} 15u 8u 285u 40u "$(cleanInstallOption)"
  Pop $0
  ${NSD_OnClick} $0 TreeIdeCleanInstallToggle

  ${If} $CleanInstallRequested == "1"
    ${NSD_Check} $CleanInstallCheckbox
  ${EndIf}

  nsDialogs::Show
FunctionEnd


Function TreeIdeCleanInstallToggle
  Pop $0
  ${NSD_GetState} $CleanInstallCheckbox $1
  ${If} $1 == ${BST_CHECKED}
    ${NSD_Uncheck} $CleanInstallCheckbox
  ${Else}
    ${NSD_Check} $CleanInstallCheckbox
  ${EndIf}
FunctionEnd
Function TreeIdeCleanInstallLeave
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
  !ifdef MUI_PAGE_CUSTOMFUNCTION_PRE
    !undef MUI_PAGE_CUSTOMFUNCTION_PRE
  !endif
  !ifdef MUI_PAGE_CUSTOMFUNCTION_SHOW
    !undef MUI_PAGE_CUSTOMFUNCTION_SHOW
  !endif

Function un.TreeIdeInitSystemLanguage
  System::Call 'kernel32::GetUserDefaultUILanguage()i .r0'
  IntOp $1 $0 & 0x3FF
  ${If} $1 == 22
    StrCpy $LANGUAGE 1046
  ${ElseIf} $1 == 10
    StrCpy $LANGUAGE 3082
  ${ElseIf} $1 == 9
    StrCpy $LANGUAGE 1033
  ${Else}
    StrCpy $LANGUAGE 1033
  ${EndIf}
FunctionEnd

Function un.TreeIdeSetHeader
  Pop $R8
  Pop $R9
  GetDlgItem $R5 $HWNDPARENT 1037
  GetDlgItem $R6 $HWNDPARENT 1038
  SendMessage $R5 ${WM_SETTEXT} 0 "STR:$R8"
  SendMessage $R6 ${WM_SETTEXT} 0 "STR:$R9"
FunctionEnd

Function un.TreeIdeRefreshWizardButtons
  GetDlgItem $R5 $HWNDPARENT 3
  GetDlgItem $R6 $HWNDPARENT 1
  GetDlgItem $R7 $HWNDPARENT 2
  SendMessage $R5 ${WM_SETTEXT} 0 "STR:$(treeIdeBackButton)"
  ${If} $TreeIdeIsFinishPage == "1"
    SendMessage $R6 ${WM_SETTEXT} 0 "STR:$(treeIdeFinishButton)"
  ${Else}
    SendMessage $R6 ${WM_SETTEXT} 0 "STR:$(treeIdeNextButton)"
  ${EndIf}
  SendMessage $R7 ${WM_SETTEXT} 0 "STR:$(treeIdeCancelButton)"
FunctionEnd

Function un.TreeIdeApplyPageTexts
  FindWindow $0 "#32770" "" $HWNDPARENT
  ${If} $0 == 0
    Return
  ${EndIf}

  ${If} $TreeIdeIsFinishPage == "1"
    Push "$(treeIdeUninstallFinishSubtitle)"
    Push "$(treeIdeUninstallFinishTitle)"
    Call un.TreeIdeSetHeader

    System::Call 'user32::FindWindowEx(p r0, p 0, t "Static", p 0) p .r1'
    System::Call 'user32::FindWindowEx(p r0, p r1, t "Static", p 0) p .r2'
    System::Call 'user32::FindWindowEx(p r0, p r2, t "Static", p 0) p .r3'

    ${If} $1 != 0
      SendMessage $1 ${WM_SETTEXT} 0 "STR:$(treeIdeUninstallFinishTitle)"
    ${EndIf}
    ${If} $2 != 0
      SendMessage $2 ${WM_SETTEXT} 0 "STR:$(treeIdeUninstallFinishText)"
    ${EndIf}
    ${If} $3 != 0
      SendMessage $3 ${WM_SETTEXT} 0 "STR:$(treeIdeUninstallFinishText)"
    ${EndIf}
    Return
  ${EndIf}

  GetDlgItem $1 $0 1004
  ${If} $1 != 0
    Push "$(treeIdeUninstallingSubtitle)"
    Push "$(treeIdeUninstallingTitle)"
    Call un.TreeIdeSetHeader
    SendMessage $1 ${WM_SETTEXT} 0 "STR:$(treeIdeUninstallProgressText)"
  ${EndIf}
FunctionEnd
Function un.TreeIdeUpdateWindowTitle
  SendMessage $HWNDPARENT ${WM_SETTEXT} 0 "STR:$(treeIdeUninstallWindowTitle)"
FunctionEnd

Function un.TreeIdeFinishPagePre
  StrCpy $TreeIdeIsFinishPage "1"
FunctionEnd

Function un.TreeIdeFinishPageShow
  Call un.TreeIdeUpdateWindowTitle
  Call un.TreeIdeRefreshWizardButtons
  Call un.TreeIdeApplyPageTexts
  StrCpy $TreeIdeIsFinishPage "0"
FunctionEnd

Function un.TreeIdeOnPageShow
  Call un.TreeIdeUpdateWindowTitle
  Call un.TreeIdeRefreshWizardButtons
  Call un.TreeIdeApplyPageTexts
  StrCpy $TreeIdeIsFinishPage "0"
FunctionEnd


Var UninstallDataCheckbox
Var UninstallDataRequested

!macro customUnWelcomePage
  PageEx un.custom
    PageCallbacks un.TreeIdeDataPre un.TreeIdeDataLeave
    Caption " "
  PageExEnd
!macroend

Function un.TreeIdeDataSetHeader
  Push "$(uninstallDataIntro)"
  Push "$(treeIdeUninstallDataTitle)"
  Call un.TreeIdeSetHeader
FunctionEnd

Function un.TreeIdeDataPre
  Call un.TreeIdeUpdateWindowTitle
  Call un.TreeIdeRefreshWizardButtons
  Call un.TreeIdeDataSetHeader

  nsDialogs::Create 1018
  Pop $0

  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateCheckbox} 0u 11u 10u 10u ""
  Pop $UninstallDataCheckbox

  ${NSD_CreateLabel} 15u 8u 285u 40u "$(uninstallDataOption)"
  Pop $0
  ${NSD_OnClick} $0 un.TreeIdeDataToggle

  ${If} $UninstallDataRequested == "1"
    ${NSD_Check} $UninstallDataCheckbox
  ${EndIf}

  nsDialogs::Show
FunctionEnd

Function un.TreeIdeDataToggle
  Pop $0
  ${NSD_GetState} $UninstallDataCheckbox $1
  ${If} $1 == ${BST_CHECKED}
    ${NSD_Uncheck} $UninstallDataCheckbox
  ${Else}
    ${NSD_Check} $UninstallDataCheckbox
  ${EndIf}
FunctionEnd
Function un.TreeIdeDataLeave
  ${NSD_GetState} $UninstallDataCheckbox $0

  ${If} $0 == ${BST_CHECKED}
    StrCpy $UninstallDataRequested "1"
  ${Else}
    StrCpy $UninstallDataRequested "0"
  ${EndIf}
FunctionEnd

Function un.RemoveTreeIdeUserData
  DetailPrint "$(uninstallDataDetails)"

  ReadEnvStr $0 "APPDATA"
  ReadEnvStr $1 "LOCALAPPDATA"

  RMDir /r "$0\Tree IDE"
  RMDir /r "$0\tree-ide"
  RMDir /r "$1\Tree IDE"
  RMDir /r "$1\tree-ide"
  RMDir /r "$1\tree-ide-updater"
FunctionEnd

!macro customUnInstall
  ${If} $UninstallDataRequested == "1"
    Call un.RemoveTreeIdeUserData
  ${EndIf}
!macroend
!macro customUnInit
  StrCpy $UninstallDataRequested "0"
  Call un.TreeIdeInitSystemLanguage
!macroend

!macro customUninstallPage
  !define MUI_FINISHPAGE_TITLE "$(treeIdeUninstallFinishTitle)"
  !define MUI_FINISHPAGE_TEXT "$(treeIdeUninstallFinishText)"
  !define MUI_FINISHPAGE_BUTTON "$(treeIdeFinishButton)"
  !define MUI_PAGE_CUSTOMFUNCTION_PRE un.TreeIdeFinishPagePre
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW un.TreeIdeFinishPageShow
!macroend

!endif







