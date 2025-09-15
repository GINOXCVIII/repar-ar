@echo off
:: Crear entorno virtual de Python para el TP repar-AR
:: Ejecutar en la carpeta donde quieras levantar el entorno virtual

python -m venv repar-venv

call repar-venv\Scripts\activate.bat

set paquetes="Django==4.2" "djangorestframework==3.16.0" "mysqlclient==2.2.7"

where python

for %%p in (%paquetes%) do (
    pip install %%~p
)

pip list

echo "Para activar el entorno virtual: "
echo "> repar-venv\Scripts\activate (CMD)"
echo "> .\repar-venv\Scripts\Activate.ps1 (Powershell)"

pause
