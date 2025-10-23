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

¡¡¡**PELIGRO:** NO USAR el archivo test_token_gen.py sin avisar!!!

