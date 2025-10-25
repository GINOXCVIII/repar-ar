# app/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from firebase_admin import auth as firebase_auth
from django.db import transaction

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
        # Soporta /api/contratadores/?firebase_uid=XXXXX
        firebase_uid = request.query_params.get('firebase_uid', None)

        if id:
            item = get_object_or_404(Contratador, pk=id)
            serializer = ContratadorSerializer(item)
            return Response(serializer.data)

        if firebase_uid:
            items = Contratador.objects.filter(uid_firebase=firebase_uid)
            serializer = ContratadorSerializer(items, many=True)
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
        """
        items = Trabajador.objects.all()
        serializer = TrabajadorSerializer(items, many=True)
        return Response(serializer.data)
        """
        
        id_contratador = request.query_params.get('id_contratador')
        if id_contratador:
            items = Trabajador.objects.filter(id_contratador=id_contratador)
        else:
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
        # Si piden un id específico, devolvemos ese
        if id:
            item = get_object_or_404(Trabajo, pk=id)
            serializer = TrabajoSerializer(item)
            return Response(serializer.data)

        # Soporta filtros:
        # - ?id_contratador=NN   -> devuelve todos los trabajos de ese contratador
        # - ?uid_firebase=XXX    -> busca el contratador por uid y devuelve sus trabajos
        id_contratador = request.query_params.get('id_contratador', None)
        uid_firebase = request.query_params.get('uid_firebase', None)

        items = Trabajo.objects.all().order_by('-id_trabajo')

        if id_contratador:
            try:
                items = items.filter(id_contratador_id=int(id_contratador))
            except ValueError:
                # si no es un entero, devolvemos vacio
                items = Trabajo.objects.none()

        elif uid_firebase:
            # Buscar contratador por uid_firebase
            contratador = Contratador.objects.filter(uid_firebase=uid_firebase).first()
            if contratador:
                items = items.filter(id_contratador_id=contratador.id_contratador)
            else:
                items = Trabajo.objects.none()

        serializer = TrabajoSerializer(items, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data
        zona_data = data.pop('zona_geografica_trabajo_data', None) 
        id_zona_trabajo = data.get('id_zona_geografica_trabajo') # Puede contener el ID de la zona del contratador (el fallback)
        
        # Buscar/Crear (si se enviaron datos nuevos)
        if zona_data:
            try:
                zona_existente = ZonaGeografica.objects.get(
                    calle=zona_data.get('calle'),
                    ciudad=zona_data.get('ciudad'),
                    provincia=zona_data.get('provincia'),
                )
                # Si existe
                id_zona_trabajo = zona_existente.id_zona_geografica
            except ZonaGeografica.DoesNotExist:
                # Si no, crear
                zona_serializer = ZonaGeograficaSerializer(data=zona_data)
                if not zona_serializer.is_valid():
                    # Si falla la validación de la zona, revertimos la transacción
                    transaction.set_rollback(True)
                    return Response(zona_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                zona = zona_serializer.save()
                id_zona_trabajo = zona.id_zona_geografica
        
        # Validar la Zona
        if not id_zona_trabajo:
            # Esto es una validación de seguridad si el frontend falló en el fallback
            return Response({"error": "Falta id_zona_geografica_trabajo y no se proporcionó una zona nueva para crear."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Asignar el ID
        data['id_zona_geografica_trabajo'] = id_zona_trabajo
        
        # Crear el Trabajo
        serializer = TrabajoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Si falla la validación del trabajo, revertimos la transacción
        transaction.set_rollback(True)
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
        
        """
        items = Postulacion.objects.all()
        serializer = PostulacionSerializer(items, many=True)
        return Response(serializer.data)
        """
        
        id_trabajo = request.query_params.get('id_trabajo')
        if id_trabajo:
            items = Postulacion.objects.filter(id_trabajo=id_trabajo)
        else:
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
        
        """
        items = CalificacionTrabajador.objects.all()
        serializer = CalificacionTrabajadorSerializer(items, many=True)
        return Response(serializer.data)
        """
        
        id_trabajador = request.query_params.get('id_trabajador')
        # print("SUSUME TOMORROW ", id_trabajador)
        if id_trabajador:
            items = CalificacionTrabajador.objects.filter(id_trabajador=id_trabajador)
        else:
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
        
        """
        items = CalificacionContratador.objects.all()
        serializer = CalificacionContratadorSerializer(items, many=True)
        return Response(serializer.data)
        """
        
        id_contratador = request.query_params.get('id_contratador')
        # print("SUSUME TOMORROW ", id_trabajador)
        if id_contratador:
            items = CalificacionContratador.objects.filter(id_contratador=id_contratador)
        else:
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
    
# Vistas de autenticacion de usuarios

class FirebaseLoginView(APIView):
    """
    Verifica el token de Firebase.
    Si el usuario ya está registrado en Contratador, lo devuelve.
    Si no, informa que es un nuevo usuario que debe completar sus datos.
    """
    def post(self, request):
        token = request.data.get('token')

        if not token:
            return Response({"error": "Falta el token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded = firebase_auth.verify_id_token(token)
            uid = decoded.get('uid')
            email_firebase = decoded.get('email')

            contratador = Contratador.objects.filter(uid_firebase=uid).first()

            if contratador:
                data = ContratadorSerializer(contratador).data
                data['registrado'] = True
                return Response(data, status=status.HTTP_200_OK)

            # No existe aún en la base
            return Response({
                "registrado": False,
                "mensaje": "Usuario autenticado pero sin registro en la base.",
                "uid_firebase": uid,
                "email_firebase": email_firebase
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class FirebaseRegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        data = request.data
        uid_firebase = data.get('uid_firebase')
        zona_data = data.get('zona_geografica')

        if not uid_firebase:
            return Response({"error": "Falta uid_firebase"}, status=status.HTTP_400_BAD_REQUEST)
        if not zona_data:
            return Response({"error": "Faltan datos de zona_geografica"}, status=status.HTTP_400_BAD_REQUEST)

        # Evitar duplicados
        if Contratador.objects.filter(uid_firebase=uid_firebase).exists():
            return Response({"error": "Ya existe un contratador con ese uid_firebase"}, status=status.HTTP_400_BAD_REQUEST)

        # Crear zona geográfica primero
        zona_serializer = ZonaGeograficaSerializer(data=zona_data)
        if not zona_serializer.is_valid():
            return Response(zona_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        zona = zona_serializer.save()

        # Crear contratador asociado
        contratador_data = {
            "uid_firebase": uid_firebase,
            "nombre": data.get("nombre"),
            "apellido": data.get("apellido"),
            "email_contratador": data.get("email_contratador"),
            "telefono_contratador": data.get("telefono_contratador"),
            "dni": data.get("dni"),
            "id_zona_geografica_contratador": zona.id_zona_geografica
        }

        contratador_serializer = ContratadorSerializer(data=contratador_data)
        if not contratador_serializer.is_valid():
            transaction.set_rollback(True)
            return Response(contratador_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        contratador = contratador_serializer.save()

        return Response({
            "mensaje": "Datos cargados con éxito.",
            "contratador": ContratadorSerializer(contratador).data,
            "zona_geografica": ZonaGeograficaSerializer(zona).data
        }, status=status.HTTP_201_CREATED)
