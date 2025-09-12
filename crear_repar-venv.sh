#!/bin/bash
# Crear entorno virtual de Python para el TP repar-AR
# Ejecutar en la carpeta donde crear la raíz donde va a levantarse el entorno virtual
# Otorgar permisos necesarios para ejecutar

python3 -m venv repar-venv

source repar-venv/bin/activate

paquetes=("Django==4.2" "djangorestframework==3.16.0" "mysqlclient==2.2.7")

which python
which python3

for paq in ${paquetes[*]}
do
    pip install $paq
done

pip list

