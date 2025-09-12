# repar-AR
## UTN - FRD - Desarrollo de Software
Integrantes del grupo:
+ Costa Lautaro
+ Ponce Matias 
+ Nuñez Olmos Imanol
+ Caloso Lucio

## Documentación
Documento de desarrollo de [repar-AR](https://docs.google.com/document/d/1G2IEpyodNJPts4q46dArLpPztBHe5PBiio9R-SHHq9s/edit?usp=sharing).

Presentación del proyecto: [repar-AR Canvas Presentacion](https://www.canva.com/design/DAGmg2JA5QE/lCWQPSFfzHYiAkWrxTltdA/edit?utm_content=DAGmg2JA5QE&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## Creación entorno virtual
Estos son los paquetes en el entorno de Python que se usa:
|Paquete                |Versión                      |
|-----------------------|-----------------------------|
|asgiref				|3.8.1
|Django					|4.2
|djangorestframework	|3.16.0
|mysqlclient			|2.2.7
|sqlparse				|0.5.3
Para instalar el entorno virtual, ejecutar:
#### Linux
> crear_repar-venv.sh
#### Windows
> crear_repar-venv.bat

Puede pasar que no se instalen las mismas versiones. Comprobar compatibilidad con el proyecto.

## Base de datos
Una base de datos SQL. Pueden crearlas de cero o ejecutar el archivo en la consola de SQL:
> repar_arDB.sql

Van a tener que crear su usuario y contraseña para poder ingresar como **admin**.
Con este comando en la carpeta del proyecto (del backend):
~~~
python manage.py createsuperuser
~~~

.
