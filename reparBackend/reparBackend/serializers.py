"""
Created on Fri Sep 12 17:18:34 2025

@author: imano-oh
"""

from rest_framework import serializers

from .models import CalificacionContratador, CalificacionTrabajador, Contratador, Estado, Postulacion, Profesion, Trabajador, TrabajadoresProfesion, Trabajo, ZonaGeografica

# ----------------------------------------------------------

class ZonaGeograficaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaGeografica
        fields = '__all__'


class ProfesionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profesion
        fields = '__all__'

        
class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = '__all__' 


class ContratadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contratador
        # fields = 'all'
        fields = ('id_contratador', 'id_zona_geografica_contratador', 'nombre', 'apellido', 
                  'email_contratador', 'telefono_contratador', 'dni', 'uid_firebase', 'zona_geografica_contratador')

    zona_geografica_contratador = serializers.SerializerMethodField()

    # id_zona_geografica_contratador = serializers.IntegerField(write_only=True)
    id_zona_geografica_contratador = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    def get_zona_geografica_contratador(self, obj):
        zona_geografica_contratador = obj.id_zona_geografica_contratador
        return ZonaGeograficaSerializer(zona_geografica_contratador).data

    def create(self, validated_data):
        id_zona_geografica_contratador = validated_data.pop('id_zona_geografica_contratador', None)
        uid_firebase = validated_data.pop('uid_firebase', None) 

        # Crear usando sufijos _id en FKs para evitar asignaciones incorrectas
        create_kwargs = {}
        if id_zona_geografica_contratador is not None:
            create_kwargs['id_zona_geografica_contratador_id'] = id_zona_geografica_contratador
        if uid_firebase is not None:
            create_kwargs['uid_firebase'] = uid_firebase

        contratador = Contratador.objects.create(
            **create_kwargs,
            **validated_data
        )
        return contratador

    def update(self, instance, validated_data):
        id_zona_geografica_contratador = validated_data.pop('id_zona_geografica_contratador', None)
        uid_firebase = validated_data.pop('uid_firebase', None) 

        # Actualiza todos los campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if id_zona_geografica_contratador is not None:
            instance.id_zona_geografica_contratador_id = id_zona_geografica_contratador

        if uid_firebase is not None:
            instance.uid_firebase = uid_firebase

        instance.save()

        return instance
        

class TrabajadorSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Trabajador
        fields = ('id_trabajador', 'id_contratador', 'id_zona_geografica_trabajador', 
                  'telefono_trabajador', 'mail_trabajador', 
                  'contratador', 'zona_geografica_trabajador'
                  )
        
    contratador = serializers.SerializerMethodField()
    zona_geografica_trabajador = serializers.SerializerMethodField()
        
    id_contratador = serializers.IntegerField(write_only=True)
    id_zona_geografica_trabajador = serializers.IntegerField(write_only=True)
    
    def get_contratador(self, obj):
        contratador = obj.id_contratador
        return ContratadorSerializer(contratador).data
    
    def get_zona_geografica_trabajador(self, obj):
        zona_geografica_trabajador = obj.id_zona_geografica_trabajador
        return ZonaGeograficaSerializer(zona_geografica_trabajador).data
    
    def create(self, validated_data):
        id_contratador = validated_data.pop('id_contratador')
        id_zona_geografica_trabajador = validated_data.pop('id_zona_geografica_trabajador')
        
        trabajador = Trabajador.objects.create(
            # CAMBIO CLAVE: Se asigna el ID al campo FK con el sufijo _id
            id_contratador_id = id_contratador,
            id_zona_geografica_trabajador_id = id_zona_geografica_trabajador,
            **validated_data
            )
            
        return trabajador
    
    def update(self, instance, validated_data):
        id_contratador = validated_data.pop('id_contratador', None)
        id_zona_geografica_trabajador = validated_data.pop('id_zona_geografica_trabajador', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_contratador is not None:
            # CAMBIO CLAVE: Se asigna el ID al campo FK con el sufijo _id
            instance.id_contratador_id = id_contratador
            
        if id_zona_geografica_trabajador is not None:
            # CAMBIO CLAVE: Se asigna el ID al campo FK con el sufijo _id
            instance.id_zona_geografica_trabajador_id = id_zona_geografica_trabajador
            
        instance.save()
        
        return instance


class TrabajadoresProfesionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = TrabajadoresProfesion
        fields = ('id_trabajador_profesion', 'id_trabajador', 'id_profesion', 'matricula',
                  'trabajador', 'profesion')
        
    trabajador = serializers.SerializerMethodField()
    profesion = serializers.SerializerMethodField()
        
    id_trabajador = serializers.IntegerField(write_only=True)
    id_profesion = serializers.IntegerField(write_only=True)
    
    def get_trabajador(self, obj):
        trabajador = obj.id_trabajador
        return TrabajadorSerializer(trabajador).data
    
    def get_profesion(self, obj):
        profesion = obj.id_profesion
        return ProfesionSerializer(profesion).data
    
    def create(self, validated_data):
        id_trabajador = validated_data.pop('id_trabajador')
        id_profesion = validated_data.pop('id_profesion')
        
        trabajador_profesion = TrabajadoresProfesion.objects.create(
            id_trabajador_id = id_trabajador,
            id_profesion_id = id_profesion,
            **validated_data
            )
            
        return trabajador_profesion
    
    def update(self, instance, validated_data):
        id_trabajador = validated_data.pop('id_trabajador', None)
        id_profesion = validated_data.pop('id_profesion', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_trabajador is not None:
            instance.id_trabajador_id = id_trabajador
            
        if id_profesion is not None:
            instance.id_profesion_id = id_profesion
            
        instance.save()
        
        return instance
    
class TrabajoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Trabajo
        fields = ('id_trabajo', 'id_contratador', 'id_trabajador', 'id_profesion_requerida', 'id_zona_geografica_trabajo', 'id_estado',
                  'titulo', 'descripcion', 'fecha_creacion', 'fecha_inicio', 'fecha_fin',
                  'contratador', 'trabajador', 'profesion_requerida', 'zona_geografica_trabajo', 'estado')
        
    contratador = serializers.SerializerMethodField()
    trabajador = serializers.SerializerMethodField()
    profesion_requerida = serializers.SerializerMethodField()
    zona_geografica_trabajo = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
        
    id_contratador = serializers.IntegerField(write_only=True)
    id_trabajador = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    id_profesion_requerida = serializers.IntegerField(write_only=True)
    id_zona_geografica_trabajo = serializers.IntegerField(write_only=True)
    id_estado = serializers.IntegerField(write_only=True)
        
    def get_contratador(self, obj):
        contratador = obj.id_contratador
        return ContratadorSerializer(contratador).data
    
    def get_trabajador(self, obj):
        trabajador = obj.id_trabajador
        return TrabajadorSerializer(trabajador).data
    
    def get_profesion_requerida(self, obj):
        profesion_requerida = obj.id_profesion_requerida
        return ProfesionSerializer(profesion_requerida).data
    
    def get_zona_geografica_trabajo(self, obj):
        zona_geografica_trabajo = obj.id_zona_geografica_trabajo
        return ZonaGeograficaSerializer(zona_geografica_trabajo).data
    
    def get_estado(self, obj):
        estado = obj.id_estado
        return EstadoSerializer(estado).data

    def create(self, validated_data):
        id_contratador = validated_data.pop('id_contratador')
        id_profesion_requerida = validated_data.pop('id_profesion_requerida')
        id_zona_geografica_trabajo = validated_data.pop('id_zona_geografica_trabajo')
        id_estado = validated_data.pop('id_estado')
        
        trabajo = Trabajo.objects.create(
            id_contratador_id = id_contratador,
            id_profesion_requerida_id = id_profesion_requerida,
            id_zona_geografica_trabajo_id = id_zona_geografica_trabajo, 
            id_estado_id = id_estado,
            **validated_data
            )
            
        return trabajo
    
    def update(self, instance, validated_data):
        id_contratador = validated_data.pop('id_contratador', None)
        id_trabajador = validated_data.pop('id_trabajador', None)
        id_profesion_requerida = validated_data.pop('id_profesion_requerida', None)
        id_zona_geografica_trabajo = validated_data.pop('id_zona_geografica_trabajo', None)
        id_estado = validated_data.pop('id_estado', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_contratador is not None:
            instance.id_contratador_id = id_contratador
            
        if id_trabajador is not None:
            instance.id_trabajador_id = id_trabajador
            
        if id_profesion_requerida is not None:
            instance.id_profesion_requerida_id = id_profesion_requerida
            
        if id_zona_geografica_trabajo is not None:
            instance.id_zona_geografica_trabajo_id = id_zona_geografica_trabajo
            
        if id_estado is not None:
            instance.id_estado_id = id_estado
            
        instance.save()
        
        return instance     
    

class PostulacionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Postulacion
        fields = ('id_postulacion', 'id_trabajo', 'id_trabajador', 'fecha_postulacion',
                  'trabajo', 'trabajador'
                  )
        
    trabajo = serializers.SerializerMethodField()
    trabajador = serializers.SerializerMethodField()
        
    id_trabajo = serializers.IntegerField(write_only=True)
    id_trabajador = serializers.IntegerField(write_only=True)
    
    def get_trabajo(self, obj):
        trabajo = obj.id_trabajo
        return TrabajoSerializer(trabajo).data
    
    def get_trabajador(self, obj):
        trabajador = obj.id_trabajador
        return TrabajadorSerializer(trabajador).data
    
    def create(self, validated_data):
        id_trabajo = validated_data.pop('id_trabajo')
        id_trabajador = validated_data.pop('id_trabajador')
        
        postulacion = Postulacion.objects.create(
            id_trabajo_id = id_trabajo,
            id_trabajador_id = id_trabajador,
            **validated_data
            )
            
        return postulacion
    
    def update(self, instance, validated_data):
        id_trabajo = validated_data.pop('id_trabajo', None)
        id_trabajador = validated_data.pop('id_trabajador', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_trabajo is not None:
            instance.id_trabajo_id = id_trabajo
            
        if id_trabajador is not None:
            instance.id_trabajador_id = id_trabajador
            
        instance.save()
        
        return instance
    
class CalificacionTrabajadorSerializer(serializers.ModelSerializer):
    id_contratador = ContratadorSerializer(read_only=True)
    id_trabajador = TrabajadorSerializer(read_only=True)
    id_trabajo = TrabajoSerializer(read_only=True)

    class Meta:
        model = CalificacionTrabajador
        fields = '__all__'

class CalificacionContratadorSerializer(serializers.ModelSerializer):
    id_contratador = ContratadorSerializer(read_only=True)
    id_trabajador = TrabajadorSerializer(read_only=True)
    id_trabajo = TrabajoSerializer(read_only=True)

    class Meta:
        model = CalificacionContratador
        fields = '__all__'
