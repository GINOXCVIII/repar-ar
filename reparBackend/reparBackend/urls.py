from django.contrib import admin
from django.urls import path

from .views import (
    ZonaGeograficaView,
    ProfesionView,
    EstadoView,
    ContratadorView,
    TrabajadorView,
    TrabajoView,
    PostulacionView,
    CalificacionesView,
    CalificacionTrabajadorView,
    CalificacionContratadorView,
    TrabajadoresProfesionView,
    FirebaseLoginView, 
    FirebaseRegisterView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/zonas-geograficas/', ZonaGeograficaView.as_view(), name='zona-lista'),
    path('api/zonas-geograficas/<int:id>/', ZonaGeograficaView.as_view(), name='zona-detalle'),
    
    path('api/profesiones/', ProfesionView.as_view(), name='profesion-lista'),
    path('api/profesiones/<int:id>/', ProfesionView.as_view(), name='profesion-detalle'),
    
    path('api/estados/', EstadoView.as_view(), name='estado-lista'),
    path('api/estados/<int:id>/', EstadoView.as_view(), name='estado-detalle'),
    
    path('api/contratadores/', ContratadorView.as_view(), name='contratador-lista'),
    path('api/contratadores/<int:id>/', ContratadorView.as_view(), name='contratador-detalle'),
    
    path('api/trabajadores/', TrabajadorView.as_view(), name='trabajador-lista'),
    path('api/trabajadores/<int:id>/', TrabajadorView.as_view(), name='trabajador-detalle'),
    
    path('api/trabajos/', TrabajoView.as_view(), name='trabajo-lista'),
    path('api/trabajos/<int:id>/', TrabajoView.as_view(), name='trabajo-detalle'),
    
    path('api/postulaciones/', PostulacionView.as_view(), name='postulacion-lista'),
    path('api/postulaciones/<int:id>/', PostulacionView.as_view(), name='postulacion-detalle'),
    
    path('api/calificaciones/', CalificacionesView.as_view(), name='calificaciones-general'),
    
    path('api/calificaciones/calificaciones-trabajadores/', CalificacionTrabajadorView.as_view(), name='calif-trabajador-lista'),
    path('api/calificaciones/calificaciones-trabajadores/<int:id>/', CalificacionTrabajadorView.as_view(), name='calif-trabajador-detalle'),
    
    path('api/calificaciones/calificaciones-contratadores/', CalificacionContratadorView.as_view(), name='calif-contratador-lista'),
    path('api/calificaciones/calificaciones-contratadores/<int:id>/', CalificacionContratadorView.as_view(), name='calif-contratador-detalle'),
    
    path('api/profesiones-de-trabajadores/', TrabajadoresProfesionView.as_view(), name='trabajador-profesion-lista'),
    path('api/profesiones-de-trabajadores/<int:id>/', TrabajadoresProfesionView.as_view(), name='trabajador-profesion-detalle'),
    
    path('api/auth/firebase-login/', FirebaseLoginView.as_view(), name='firebase-login'),
    path('api/auth/firebase-register/', FirebaseRegisterView.as_view(), name='firebase-register'),
    
]