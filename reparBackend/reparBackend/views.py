from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from firebase_admin import auth as firebase_auth
from django.db import transaction, IntegrityError
from django.db.models import Q

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
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError as e:
             return Response(
                {"error": f"No se puede eliminar la zona geográfica porque está siendo utilizada: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfesionView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Profesion, pk=id)
            serializer = ProfesionSerializer(item)
            return Response(serializer.data)
        items = Profesion.objects.all().order_by('nombre_profesion')
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
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError as e:
             return Response(
                {"error": f"No se puede eliminar la profesión porque está siendo utilizada: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EstadoView(APIView):
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
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError as e:
             return Response(
                {"error": f"No se puede eliminar el estado porque está siendo utilizado: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContratadorView(APIView):
    def get(self, request, id=None):
        firebase_uid = request.query_params.get('firebase_uid', None)

        if id:
            item = get_object_or_404(Contratador, pk=id)
            serializer = ContratadorSerializer(item)
            return Response(serializer.data)

        if firebase_uid:
            items = Contratador.objects.filter(uid_firebase=firebase_uid)
            item = items.first()
            if item:
                serializer = ContratadorSerializer(item)
                return Response(serializer.data)
            else:
                 return Response([], status=status.HTTP_200_OK)

        items = Contratador.objects.all()
        serializer = ContratadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        return Response({"error": "Use /api/auth/firebase-register/ para crear contratadores."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def patch(self, request, id):
        item = get_object_or_404(Contratador, pk=id)
        serializer = ContratadorSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Contratador, pk=id)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError as e:
             return Response(
                {"error": f"No se puede eliminar el contratador porque tiene datos asociados: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TrabajadorView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Trabajador, pk=id)
            serializer = TrabajadorSerializer(item)
            return Response(serializer.data)

        id_contratador = request.query_params.get('id_contratador')
        if id_contratador:
            try:
                items = Trabajador.objects.filter(id_contratador=int(id_contratador))
            except ValueError:
                 return Response({"error": "id_contratador debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            items = Trabajador.objects.all()

        serializer = TrabajadorSerializer(items, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        zona_data = data.pop('zona_geografica_trabajador_data', None)
        id_zona_trabajador = data.get('id_zona_geografica_trabajador')

        if zona_data:
            zona_serializer = ZonaGeograficaSerializer(data=zona_data)
            if zona_serializer.is_valid():
                zona = zona_serializer.save()
                id_zona_trabajador = zona.id_zona_geografica
            else:
                 return Response({"zona_errors": zona_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        elif not id_zona_trabajador:
             return Response({"error": "Se requiere 'id_zona_geografica_trabajador' o 'zona_geografica_trabajador_data'."}, status=status.HTTP_400_BAD_REQUEST)

        data['id_zona_geografica_trabajador'] = id_zona_trabajador

        serializer = TrabajadorSerializer(data=data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                return Response({"db_error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def patch(self, request, id):
        item = get_object_or_404(Trabajador, pk=id)
        data = request.data.copy()
        zona_data = data.pop('zona_geografica_trabajador_data', None)
        id_zona_trabajador = data.get('id_zona_geografica_trabajador', item.id_zona_geografica_trabajador_id)

        if zona_data:
             if item.id_zona_geografica_trabajador:
                  zona_serializer = ZonaGeograficaSerializer(item.id_zona_geografica_trabajador, data=zona_data, partial=True)
                  if zona_serializer.is_valid():
                       zona_serializer.save()
                       id_zona_trabajador = item.id_zona_geografica_trabajador_id
                  else:
                       return Response({"zona_errors": zona_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
             else:
                  zona_serializer = ZonaGeograficaSerializer(data=zona_data)
                  if zona_serializer.is_valid():
                       zona = zona_serializer.save()
                       id_zona_trabajador = zona.id_zona_geografica
                  else:
                       return Response({"zona_errors": zona_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data['id_zona_geografica_trabajador'] = id_zona_trabajador

        serializer = TrabajadorSerializer(item, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Trabajador, pk=id)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except IntegrityError as e:
             return Response({"error": f"No se puede eliminar el trabajador porque tiene datos asociados: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TrabajoView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Trabajo, pk=id)
            serializer = TrabajoSerializer(item)
            return Response(serializer.data)

        items = Trabajo.objects.select_related(
            'id_contratador',
            'id_trabajador',
            'id_profesion_requerida',
            'id_zona_geografica_trabajo',
            'id_estado'
        ).all().order_by('-fecha_creacion', '-id_trabajo')

        id_contratador = request.query_params.get('id_contratador', None)
        uid_firebase = request.query_params.get('uid_firebase', None)
        profesiones_str = request.query_params.get('profesiones', None)

        if profesiones_str:
            try:
                profesion_ids = [int(p_id.strip()) for p_id in profesiones_str.split(',') if p_id.strip().isdigit()]
                if profesion_ids:
                    items = items.filter(id_profesion_requerida__in=profesion_ids)
                else:
                     pass
            except ValueError:
                 return Response({"error": "El parámetro 'profesiones' debe ser una lista de IDs numéricos separados por comas."},
                                 status=status.HTTP_400_BAD_REQUEST)

        elif id_contratador:
            try:
                items = items.filter(id_contratador_id=int(id_contratador))
            except ValueError:
                items = Trabajo.objects.none()

        elif uid_firebase:
            contratador = Contratador.objects.filter(uid_firebase=uid_firebase).first()
            if contratador:
                items = items.filter(id_contratador_id=contratador.id_contratador)
            else:
                items = Trabajo.objects.none()

        serializer = TrabajoSerializer(items, many=True)
        return Response(serializer.data)


    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        zona_data = data.pop('zona_geografica_trabajo_data', None)
        id_zona_trabajo = data.get('id_zona_geografica_trabajo')

        if zona_data:
            try:
                zona_existente = ZonaGeografica.objects.get(
                    calle=zona_data.get('calle'),
                    ciudad=zona_data.get('ciudad'),
                    provincia=zona_data.get('provincia'),
                )
                id_zona_trabajo = zona_existente.id_zona_geografica
            except ZonaGeografica.DoesNotExist:
                zona_serializer = ZonaGeograficaSerializer(data=zona_data)
                if zona_serializer.is_valid():
                    zona = zona_serializer.save()
                    id_zona_trabajo = zona.id_zona_geografica
                else:
                    return Response({"zona_errors": zona_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        elif not id_zona_trabajo:
             return Response({"error": "Se requiere 'id_zona_geografica_trabajo' o 'zona_geografica_trabajo_data'."},
                            status=status.HTTP_400_BAD_REQUEST)

        data['id_zona_geografica_trabajo'] = id_zona_trabajo

        serializer = TrabajoSerializer(data=data)
        if serializer.is_valid():
            try:
                if 'id_estado' not in data:
                     data['id_estado'] = 1

                from django.utils import timezone
                if 'fecha_creacion' not in data:
                    data['fecha_creacion'] = timezone.now()

                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                return Response({"db_error": f"Error de integridad: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def patch(self, request, id):
        item = get_object_or_404(Trabajo, pk=id)
        data = request.data.copy()
        zona_data = data.pop('zona_geografica_trabajo_data', None)
        id_zona_trabajo = data.get('id_zona_geografica_trabajo', item.id_zona_geografica_trabajo_id)

        if zona_data:
            if item.id_zona_geografica_trabajo:
                 zona_serializer = ZonaGeograficaSerializer(item.id_zona_geografica_trabajo, data=zona_data, partial=True)
                 if zona_serializer.is_valid():
                      zona_serializer.save()
                      id_zona_trabajo = item.id_zona_geografica_trabajo_id
                 else:
                      return Response({"zona_errors": zona_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            else:
                 zona_serializer = ZonaGeograficaSerializer(data=zona_data)
                 if zona_serializer.is_valid():
                      zona = zona_serializer.save()
                      id_zona_trabajo = zona.id_zona_geografica
                 else:
                      return Response({"zona_errors": zona_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data['id_zona_geografica_trabajo'] = id_zona_trabajo

        serializer = TrabajoSerializer(item, data=data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data)
            except IntegrityError as e:
                 return Response({"db_error": f"Error de integridad: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(Trabajo, pk=id)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado al eliminar el trabajo: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PostulacionView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(Postulacion, pk=id)
            serializer = PostulacionSerializer(item)
            return Response(serializer.data)

        items = Postulacion.objects.select_related(
            'id_trabajo', 'id_trabajador', 'id_trabajo__id_contratador', 'id_trabajador__id_contratador'
        ).all().order_by('-fecha_postulacion')

        id_trabajo = request.query_params.get('id_trabajo')
        if id_trabajo:
            try:
                items = items.filter(id_trabajo=int(id_trabajo))
            except ValueError:
                 return Response({"error": "id_trabajo debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        id_trabajador = request.query_params.get('id_trabajador')
        if id_trabajador:
             try:
                items = items.filter(id_trabajador=int(id_trabajador))
             except ValueError:
                 return Response({"error": "id_trabajador debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PostulacionSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostulacionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                 return Response({"db_error": f"Error de integridad: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
         return Response({"error": "Método PATCH no permitido para postulaciones."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def delete(self, request, id):
        item = get_object_or_404(Postulacion, pk=id)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
             return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CalificacionTrabajadorView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(CalificacionTrabajador, pk=id)
            serializer = CalificacionTrabajadorSerializer(item)
            return Response(serializer.data)

        items = CalificacionTrabajador.objects.select_related(
            'id_contratador', 'id_trabajador', 'id_trabajo'
        ).all().order_by('-fecha_calificacion')

        id_trabajador = request.query_params.get('id_trabajador')
        if id_trabajador:
            try:
                items = items.filter(id_trabajador=int(id_trabajador))
            except ValueError:
                 return Response({"error": "id_trabajador debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CalificacionTrabajadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CalificacionTrabajadorSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                 return Response({"db_error": f"Error de integridad: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        return Response({"error": "Método PATCH no permitido para calificaciones."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def delete(self, request, id):
        return Response({"error": "Método DELETE no permitido para calificaciones."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class CalificacionContratadorView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(CalificacionContratador, pk=id)
            serializer = CalificacionContratadorSerializer(item)
            return Response(serializer.data)

        items = CalificacionContratador.objects.select_related(
             'id_contratador', 'id_trabajador', 'id_trabajo'
        ).all().order_by('-fecha_calificacion')

        id_contratador = request.query_params.get('id_contratador')
        if id_contratador:
             try:
                items = items.filter(id_contratador=int(id_contratador))
             except ValueError:
                 return Response({"error": "id_contratador debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CalificacionContratadorSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CalificacionContratadorSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                 return Response({"db_error": f"Error de integridad: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        return Response({"error": "Método PATCH no permitido para calificaciones."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def delete(self, request, id):
        return Response({"error": "Método DELETE no permitido para calificaciones."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class TrabajadoresProfesionView(APIView):
    def get(self, request, id=None):
        if id:
            item = get_object_or_404(TrabajadoresProfesion.objects.select_related('id_trabajador', 'id_profesion'), pk=id)
            serializer = TrabajadoresProfesionSerializer(item)
            return Response(serializer.data)

        items = TrabajadoresProfesion.objects.select_related('id_trabajador', 'id_profesion').all()

        id_trabajador = request.query_params.get('id_trabajador')
        if id_trabajador:
            try:
                items = items.filter(id_trabajador=int(id_trabajador))
            except ValueError:
                 return Response({"error": "id_trabajador debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        id_profesion = request.query_params.get('id_profesion')
        if id_profesion:
            try:
                items = items.filter(id_profesion=int(id_profesion))
            except ValueError:
                return Response({"error": "id_profesion debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

        items = items.order_by('id_profesion__nombre_profesion')

        serializer = TrabajadoresProfesionSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TrabajadoresProfesionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                if 'UNIQUE constraint' in str(e) or 'Duplicate entry' in str(e):
                    return Response({"error": "Este trabajador ya tiene asignada esta profesión."}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"db_error": f"Error de integridad: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        item = get_object_or_404(TrabajadoresProfesion, pk=id)
        allowed_updates = {'matricula'}
        update_data = {k: v for k, v in request.data.items() if k in allowed_updates}

        if not update_data:
             return Response({"error": "Solo se permite actualizar la matrícula."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TrabajadoresProfesionSerializer(item, data=update_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        item = get_object_or_404(TrabajadoresProfesion, pk=id)
        try:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
             return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CalificacionesView(APIView):
    def get(self, request):
        calif_trabajadores = CalificacionTrabajador.objects.select_related(
             'id_contratador', 'id_trabajador', 'id_trabajo'
        ).all().order_by('-fecha_calificacion')[:20]
        serializer_trab = CalificacionTrabajadorSerializer(calif_trabajadores, many=True)

        calif_contratadores = CalificacionContratador.objects.select_related(
             'id_contratador', 'id_trabajador', 'id_trabajo'
        ).all().order_by('-fecha_calificacion')[:20]
        serializer_contr = CalificacionContratadorSerializer(calif_contratadores, many=True)

        datos_combinados = {
            'calificaciones_a_trabajadores': serializer_trab.data,
            'calificaciones_a_contratadores': serializer_contr.data
        }

        return Response(datos_combinados, status=status.HTTP_200_OK)




class FirebaseLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Falta el token ID de Firebase."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token.get('uid')
            email_firebase = decoded_token.get('email')

            if not uid:
                 raise ValueError("Token inválido o no contiene UID.")

            contratador = Contratador.objects.filter(uid_firebase=uid).first()

            if contratador:
                serializer = ContratadorSerializer(contratador)
                data = serializer.data
                data['registrado'] = True
                return Response(data, status=status.HTTP_200_OK)
            else:
                return Response({
                    "registrado": False,
                    "mensaje": "Usuario autenticado vía Firebase pero necesita completar el registro local.",
                    "uid_firebase": uid,
                    "email_firebase": email_firebase
                }, status=status.HTTP_200_OK)

        except ValueError as e:
             return Response({"error": f"Error verificando token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(f"Error inesperado en FirebaseLoginView: {e}")
            return Response({"error": "Ocurrió un error en el servidor durante la autenticación."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FirebaseRegisterView(APIView):
    @transaction.atomic
    def post(self, request):
        data = request.data
        uid_firebase = data.get('uid_firebase')
        zona_data = data.get('zona_geografica')


        if not uid_firebase:
            return Response({"error": "Falta el 'uid_firebase'."}, status=status.HTTP_400_BAD_REQUEST)
        if not zona_data or not all(k in zona_data for k in ('calle', 'ciudad', 'provincia')):
             return Response({"error": "Faltan datos completos de 'zona_geografica' (calle, ciudad, provincia)."}, status=status.HTTP_400_BAD_REQUEST)

        required_fields = ['nombre', 'apellido', 'email_contratador', 'telefono_contratador', 'dni']
        if not all(field in data for field in required_fields):
             return Response({"error": f"Faltan campos requeridos: {', '.join(required_fields)}"}, status=status.HTTP_400_BAD_REQUEST)



        if Contratador.objects.filter(uid_firebase=uid_firebase).exists():
            return Response({"error": "Ya existe un usuario registrado con este identificador de Firebase."}, status=status.HTTP_400_BAD_REQUEST)

        try:

            zona, created = ZonaGeografica.objects.get_or_create(
                calle=zona_data['calle'],
                ciudad=zona_data['ciudad'],
                provincia=zona_data['provincia'],
            )
            zona_id = zona.id_zona_geografica
        except IntegrityError as e:
             print(f"Error en get_or_create ZonaGeografica: {e}")
             return Response({"error": "No se pudo crear o encontrar la zona geográfica."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
             print(f"Error inesperado con ZonaGeografica: {e}")
             return Response({"error": "Error procesando la dirección."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        contratador_data = {
            "uid_firebase": uid_firebase,
            "nombre": data.get("nombre"),
            "apellido": data.get("apellido"),
            "email_contratador": data.get("email_contratador"),
            "telefono_contratador": data.get("telefono_contratador"),
            "dni": data.get("dni"),
            "id_zona_geografica_contratador": zona_id
        }

        contratador_serializer = ContratadorSerializer(data=contratador_data)
        if contratador_serializer.is_valid():
            try:
                contratador = contratador_serializer.save()
                return Response({
                    "mensaje": "Usuario registrado y perfil creado con éxito.",
                    "contratador": ContratadorSerializer(contratador).data,
                }, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                 print(f"IntegrityError al guardar Contratador: {e}")
                 return Response({"error": "Error al guardar el perfil, posible duplicado inesperado."}, status=status.HTTP_400_BAD_REQUEST)
        else:

            return Response(contratador_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

