# proyecto_reparar/app/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

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

class ZonaGeograficaView(APIView):
    def get(self, request, pk=None):
        if pk:
            zona = get_object_or_404(ZonaGeografica, pk=pk)
            serializer = ZonaGeograficaSerializer(zona)
            return Response(serializer.data)
        else:
            zonas = ZonaGeografica.objects.all()
            serializer = ZonaGeograficaSerializer(zonas, many=True)
            return Response(serializer.data)

    def post(self, request):
        serializer = ZonaGeograficaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        zona = get_object_or_404(ZonaGeografica, pk=pk)
        serializer = ZonaGeograficaSerializer(zona, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        zona = get_object_or_404(ZonaGeografica, pk=pk)
        zona.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfesionView(APIView):
    def get(self, request, pk=None):
        if pk:
            item = get_object_or_404(Profesion, pk=pk)
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

    def patch(self, request, pk):
        item = get_object_or_404(Profesion, pk=pk)
        serializer = ProfesionSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = get_object_or_404(Profesion, pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrabajadorView(APIView):
    def get(self, request, pk=None):
        if pk:
            item = get_object_or_404(Trabajador, pk=pk)
            serializer = TrabajadorSerializer(item)
            return Response(serializer.data)
        items = Trabajador.objects.all()
        serializer = TrabajadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        # El serializador ya maneja la lógica de las claves foráneas
        serializer = TrabajadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        item = get_object_or_404(Trabajador, pk=pk)
        serializer = TrabajadorSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = get_object_or_404(Trabajador, pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
