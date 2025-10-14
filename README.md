# repar-AR
## UTN - FRD - Desarrollo de Software
Integrantes del grupo:
+ Costa Lautaro
+ Ponce Matias 
+ Nuñez Olmos German Imanol
+ Calosso Cístola Lucio Valentín 

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

Para levantar el entorno virtual:
~~~
source repar-venv/bin/activate
~~~
#### Windows
> crear_repar-venv.bat

Para levantar el entorno virtual:
En **CMD**
~~~
repar-venv\Scripts\activate
~~~
En **Powershell**
~~~
.\repar-venv\Scripts\Activate.ps1
~~~

Si no, pueden usar python de un entorno global y no instalar el virtual.
Puede pasar que no se instalen las mismas versiones. Comprobar compatibilidad con el proyecto.

## Base de datos
Una base de datos SQL. 
Queries SQL disponibles en la carpeta [SQL_queries](https://github.com/GINOXCVIII/repar-ar/tree/main/SQL_queries)
Pueden crearlas de cero o ejecutar el archivo en la consola de SQL:
> repar_arDB.sql

La tabla de estados se completa con los datos disponibles en:
> repar_arDB-estado.sql

Las profesiones se cargan desde el archivo:
**COMPLETAR**

Van a tener que crear su usuario y contraseña para poder ingresar como **admin** (desde *localhost:8000/admin*).
Con este comando en la carpeta del proyecto (del backend):
~~~
python manage.py createsuperuser
~~~

.
