@echo off
set GITLEAKS_PATH=%USERPROFILE%\scoop\apps\gitleaks\current\gitleaks.exe

if exist "%GITLEAKS_PATH%" (
    "%GITLEAKS_PATH%" %*
) else (
    echo Gitleaks not found - install with: scoop install gitleaks
    exit /b 1
)
