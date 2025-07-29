@echo off

REM Build each project in parallel windows
start /b cmd /c "cd /d %~dp0Order-Kiosk && npm run build"
start /b cmd /c "cd /d %~dp0Kitchen-Display-System && npm run build"
start /b cmd /c "cd /d %~dp0Dashboard && npm run build"

REM Wait for all builds to finish
REM (You can add a timeout or better sync method if needed)

REM Create Frontend folder
mkdir "%~dp0Frontend"

REM Remove old Frontend folders if they exist
rmdir /s /q "%~dp0Frontend\Order-Kiosk"
rmdir /s /q "%~dp0Frontend\Kitchen-Display-System"
rmdir /s /q "%~dp0Frontend\Dashboard"

REM Copy and rename dist folders
xcopy /E /I /Y "%~dp0Order-Kiosk\dist" "%~dp0Frontend\Order-Kiosk"
xcopy /E /I /Y "%~dp0Kitchen-Display-System\dist" "%~dp0Frontend\Kitchen-Display-System"
xcopy /E /I /Y "%~dp0Dashboard\dist" "%~dp0Frontend\Dashboard"

echo All builds done and dist folders copied.

