@echo off
chcp 65001 > nul
title Rust AutoBackup - Windows EXE Derleyici

echo ==========================================================
echo   Rust AutoBackup - Windows EXE Derleme Sihirbazi
echo ==========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-windows.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [HATA] Derleme sirasinda hata olustu. Lutfen ciktilari kontrol edin.
    pause
)
