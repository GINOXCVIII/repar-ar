# repar-AR - Backend
Desarrollado con Django 4.2 en Python.

## Comandos de *manage.py-*

### Modelos y tablas en la base de datos
~~~
python manage.py makemigrations reparBackend
~~~

Reconoce cambios en los modelos y prepara la creación de nuevas tablas.

~~~
python manage.py migrate
~~~

Crea las tablas en la base de datos.
Utilizar estos dos comandos para crear la base de datos SQL *repar_arDB* .

### Superuser
~~~
python manage.py createsuperuser
~~~

Crea *superuser* en la base de datos con permisos sobre los datos.
Hay que completar el prompt:
- Username (leave blank to use '*USER*')
- Email address
- Password

### Correr servidor
~~~
python manage.py runserver
~~~

Corre el servidor en *localhost* en puerto *8000*

Fuente: [django-admin and manage.py](https://docs.djangoproject.com/en/5.2/ref/django-admin/)

## Acerca de el uso de Firebase
Este proyecto tiene una integración con Firebase para manejar el login/signin de los usuarios, y es necesario proveer una clave privada para autenticación.
Las claves pueden generarlas los miembros del proyecto **con acceso a la consola de Firebase** ([Firebase console](https://console.firebase.google.com/)).
Desde allí, dentro del proyecto de *repar-AR*, se dirigen a:

> *Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada*

Se descargará un archivo con el nombre ***repar-ar-firebase-xxxx.json***.
Este archivo se debe copiar en la carpeta *repar-ar/reparBackend/* (donde está *manage.py*) y se debe renombrar a ***repar-ar-clave.json***.

> repar-ar-firebase-xxxx.json --> ***repar-ar-clave.json***

Si no tenés acceso a la consola de Firebase ... bueno, no sé ...
