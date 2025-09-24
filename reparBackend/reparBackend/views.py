# app/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

# Importamos todos los modelos y serializadores necesarios
from .models import (
    ZonaGeografica,
    Profesion,
    Estado,
    Contratador,
    Trabajador,
    Trabajo,
    Postulacion,
    CalificacionTrabajador,
    CalificacionContratador,
    TrabajadoresProfesion
)
from .serializers import (
    ZonaGeograficaSerializer,
    ProfesionSerializer,
    EstadoSerializer,
    ContratadorSerializer,
    TrabajadorSerializer,
    TrabajoSerializer,
    PostulacionSerializer,
    CalificacionTrabajadorSerializer,
    CalificacionContratadorSerializer,
    TrabajadoresProfesionSerializer
)


# --- Vistas CRUD explícitas para cada modelo ---

class ZonaGeograficaView(APIView):
    """ Gestiona el CRUD para Zonas Geográficas. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(ZonaGeografica, pk=id)
            serializer = ZonaGeograficaSerializer(item)
            return Response(serializer.data)
        items = ZonaGeografica.objects.all()
        serializer = ZonaGeograficaSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ZonaGeograficaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(ZonaGeografica, pk=id)
        serializer = ZonaGeograficaSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(ZonaGeografica, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfesionView(APIView):
    """ Gestiona el CRUD para Profesiones. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Profesion, pk=id)
            serializer = ProfesionSerializer(item)
            return Response(serializer.data)
        items = Profesion.objects.all()
        serializer = ProfesionSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProfesionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(Profesion, pk=id)
        serializer = ProfesionSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Profesion, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstadoView(APIView):
    """ Gestiona el CRUD para Estados. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Estado, pk=id)
            serializer = EstadoSerializer(item)
            return Response(serializer.data)
        items = Estado.objects.all()
        serializer = EstadoSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EstadoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(Estado, pk=id)
        serializer = EstadoSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Estado, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContratadorView(APIView):
    """ Gestiona el CRUD para Contratadores. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Contratador, pk=id)
            serializer = ContratadorSerializer(item)
            return Response(serializer.data)
        items = Contratador.objects.all()
        serializer = ContratadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ContratadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(Contratador, pk=id)
        serializer = ContratadorSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Contratador, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrabajadorView(APIView):
    """ Gestiona el CRUD para Trabajadores. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Trabajador, pk=id)
            serializer = TrabajadorSerializer(item)
            return Response(serializer.data)
        items = Trabajador.objects.all()
        serializer = TrabajadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TrabajadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(Trabajador, pk=id)
        serializer = TrabajadorSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Trabajador, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrabajoView(APIView):
    """ Gestiona el CRUD para Trabajos. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Trabajo, pk=id)
            serializer = TrabajoSerializer(item)
            return Response(serializer.data)
        items = Trabajo.objects.all()
        serializer = TrabajoSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TrabajoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(Trabajo, pk=id)
        serializer = TrabajoSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Trabajo, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostulacionView(APIView):
    """ Gestiona el CRUD para Postulaciones. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Postulacion, pk=id)
            serializer = PostulacionSerializer(item)
            return Response(serializer.data)
        items = Postulacion.objects.all()
        serializer = PostulacionSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostulacionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(Postulacion, pk=id)
        serializer = PostulacionSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Postulacion, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CalificacionTrabajadorView(APIView):
    """ Gestiona el CRUD para Calificaciones de Trabajadores. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(CalificacionTrabajador, pk=id)
            serializer = CalificacionTrabajadorSerializer(item)
            return Response(serializer.data)
        items = CalificacionTrabajador.objects.all()
        serializer = CalificacionTrabajadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CalificacionTrabajadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(CalificacionTrabajador, pk=id)
        serializer = CalificacionTrabajadorSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(CalificacionTrabajador, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CalificacionContratadorView(APIView):
    """ Gestiona el CRUD para Calificaciones de Contratadores. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(CalificacionContratador, pk=id)
            serializer = CalificacionContratadorSerializer(item)
            return Response(serializer.data)
        items = CalificacionContratador.objects.all()
        serializer = CalificacionContratadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CalificacionContratadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(CalificacionContratador, pk=id)
        serializer = CalificacionContratadorSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(CalificacionContratador, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrabajadoresProfesionView(APIView):
    """ Gestiona el CRUD para la relación Trabajador-Profesión. """
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(TrabajadoresProfesion, pk=id)
            serializer = TrabajadoresProfesionSerializer(item)
            return Response(serializer.data)
        items = TrabajadoresProfesion.objects.all()
        serializer = TrabajadoresProfesionSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TrabajadoresProfesionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(TrabajadoresProfesion, pk=id)
        serializer = TrabajadoresProfesionSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(TrabajadoresProfesion, pk=id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- Vista Especial ---

class CalificacionesView(APIView):
    """
    Vista de solo lectura para mostrar una lista combinada de todas
    las calificaciones (tanto de trabajadores como de contratadores).
    """
    def get(self, request):
        # Obtener y serializar calificaciones de trabajadores
        calif_trabajadores = CalificacionTrabajador.objects.all()
        serializer_trab = CalificacionTrabajadorSerializer(calif_trabajadores, many=True)

        # Obtener y serializar calificaciones de contratadores
        calif_contratadores = CalificacionContratador.objects.all()
        serializer_contr = CalificacionContratadorSerializer(calif_contratadores, many=True)

        # Combinar los datos en una sola respuesta
        datos_combinados = {
            'calificaciones_a_trabajadores': serializer_trab.data,
            'calificaciones_a_contratadores': serializer_contr.data
        }
        
        return Response(datos_combinados, status=status.HTTP_200_OK)