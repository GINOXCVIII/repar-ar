"""
URL configuration for reparBackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

# from .views imports *

urlpatterns = [
    path('admin/', admin.site.urls),
]

"""
        path('api/zonas-geograficas', ZonaGeograficaView.as_view()),
        path('api/zonas-geograficas/<int:id>', ZonaGeograficaView.as_view()),
        
        'path(api/profesiones', ProfesionView.as_view()),
        'path(api/profesiones/<int:id>', ProfesionView.as_view()),
        
        path('api/estados', EstadoView.as_view()),
        path('api/estados/<int:id>', EstadoView.as_view()),
        
        path('api/contratadores', ContratadorView.as_view()),
        path('api/contratadores/<int:id>', ContratadorView.as_view()),
        
        path('api/trabajadores', TrabajadorView.as_view()),
        path('api/trabajadores/<int:id>', TrabajadorView.as_view()),
        
        path('api/trabajos', TrabajoView.as_view()),
        path('api/trabajos/<int:id>', TrabajoView.as_view()),
        
        path('api/postulaciones', PostulacionView.as_view()),
        path('api/postulaciones/<int:id>', PostulacionView.as_view()),
        
        path('api/calificaciones', CalificacionesView.as_view()), # Vista para mostrar todos los comentarios, de contratadores y de trabajadores
        
        path('api/calificaciones/calificaciones-trabajadores', CalificacionTrabajadorView.as_view()),
        path('api/calificaciones/calificaciones-trabajadores/<int:id>', CalificacionTrabajadorView.as_view()),
        
        path('api/calificaciones/calificaciones-contratadores', CalificacionContratadorView.as_view()),
        path('api/calificaciones/calificaciones-contratadores/<int:id>', CalificacionContratadorView.as_view()),
        
        path('api/profesiones-de-trabajadores', TrabajadoresProfesionView.as_view()),
        path('api/profesiones-de-trabajadores/<int:id>', TrabajadoresProfesionView.as_view()),
"""


