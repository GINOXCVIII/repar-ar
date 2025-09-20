#!/usr/bin/env python3
# -*- coding: utf-8 -*-
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
        fields = '__all__'

class TrabajadorSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Trabajador
        fields = ('id_trabajador', 'id_contratador', 'id_zona_geografica_trabajador', 'telefono_trabajador', 'mail_trabajador')
        
    contratador = serializers.SerializerMethodField()
    zona_geografica_trabajador = serializers.SerializerMethodField()
        
    id_contratador = serializers.IntegerField(write_only=True)
    id_zona_geografica_trabajador = serializers.IntegerField(write_only=True)
    
    def get_contratador(self, obj):
        contratador = obj.contratador
        return ContratadorSerializer(contratador).data
    
    def get_zona_geografica_trabajador(self, obj):
        zona_geografica_trabajador = obj.zona_geografica_trabajador
        return ZonaGeograficaSerializer(zona_geografica_trabajador).data
    
    def create(self, validated_data):
        id_contratador = validated_data.pop('id_contratador')
        id_zona_geografica_trabajador = validated_data.pop('id_zona_geografica_trabajador')
        
        trabajador = Trabajador.objects.create(
            id_contratador = id_contratador,
            id_zona_geografica_trabajador = id_zona_geografica_trabajador,
            **validated_data
            )
            
        return trabajador
    
    def update(self, instance, validated_data):
        id_contratador = validated_data.pop('id_contratador')
        id_zona_geografica_trabajador = validated_data.pop('id_zona_geografica_trabajador')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_contratador is not None:
            instance.id_contratador = id_contratador
            
        if id_zona_geografica_trabajador is not None:
            instance.id_zona_geografica_trabajador = id_zona_geografica_trabajador
            
        instance.save()
        
        return instance


class TrabajadoresProfesionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Trabajador
        fields = ('id_trabajador_profesion', 'id_trabajador', 'id_profesion', 'matricula')
        
    trabajador = serializers.SerializerMethodField()
    profesion = serializers.SerializerMethodField()
        
    id_trabajador = serializers.IntegerField(write_only=True)
    id_profesion = serializers.IntegerField(write_only=True)
    
    def get_trabajador(self, obj):
        trabajador = obj.trabajador
        return TrabajadorSerializer(trabajador).data
    
    def get_profesion(self, obj):
        profesion = obj.profesion
        return ProfesionSerializer(profesion).data
    
    def create(self, validated_data):
        id_trabajador = validated_data.pop('id_trabajador')
        id_profesion = validated_data.pop('id_profesion')
        
        trabajador_profesion = TrabajadoresProfesion.objects.create(
            id_trabajador = id_trabajador,
            id_profesion = id_profesion,
            **validated_data
            )
            
        return trabajador_profesion
    
    def update(self, instance, validated_data):
        id_trabajador = validated_data.pop('id_trabajador')
        id_profesion = validated_data.pop('id_profesion')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_trabajador is not None:
            instance.id_trabajador = id_trabajador
            
        if id_profesion is not None:
            instance.id_profesion = id_profesion
            
        instance.save()
        
        return instance
    
class TrabajoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Trabajo
        fields = ('id_trabajo', 'id_contratador', 'id_trabajador', 'id_profesion_requerida', 'id_zona_geografica_trabajo', 'id_estado',
                  'descripcion', 'fecha_creacion', 'fecha_inicio', 'fecha_fin')
        
    contratador = serializers.SerializerMethodField()
    trabajador = serializers.SerializerMethodField()
    profesion_requerida = serializers.SerializerMethodField()
    zona_geografica_trabajo = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
        
    id_contratador = serializers.IntegerField(write_only=True)
    id_trabajador = serializers.IntegerField(write_only=True)
    id_profesion_requerida = serializers.IntegerField(write_only=True)
    id_zona_geografica_trabajo = serializers.IntegerField(write_only=True)
    id_estado = serializers.IntegerField(write_only=True)
        
    def get_contratador(self, obj):
        contratador = obj.contratador
        return ContratadorSerializer(contratador).data
    
    def get_trabajador(self, obj):
        trabajador = obj.trabajador
        return TrabajadorSerializer(trabajador).data
    
    def get_profesion_requerida(self, obj):
        profesion_requerida = obj.profesion_requerida
        return ProfesionSerializer(profesion_requerida).data
    
    def get_zona_geografica_trabajo(self, obj):
        zona_geografica_trabajo = obj.zona_geografica_trabajo
        return ZonaGeograficaSerializer(zona_geografica_trabajo).data
    
    def get_estado(self, obj):
        estado = obj.estado
        return EstadoSerializer(estado).data

    def create(self, validated_data):
        id_contratador = validated_data.pop('id_contratador')
        id_trabajador = validated_data.pop('id_trabajador')
        id_profesion_requerida = validated_data.pop('id_profesion_requerida')
        id_zona_geografica_trabajo = validated_data.pop('id_zona_geografica_trabajo')
        id_estado = validated_data.pop('id_estado')
        
        trabajo = Trabajo.objects.create(
        id_contratador = id_contratador,
        id_trabajador = id_trabajador,
        id_profesion_requerida = id_profesion_requerida,
        id_zona_geografica_trabajo = id_zona_geografica_trabajo, 
        id_estado = id_estado,
            **validated_data
            )
            
        return trabajo
    
    def update(self, instance, validated_data):
        id_contratador = validated_data.pop('id_contratador')
        id_trabajador = validated_data.pop('id_trabajador')
        id_profesion_requerida = validated_data.pop('id_profesion_requerida')
        id_zona_geografica_trabajo = validated_data.pop('id_zona_geografica_trabajo')
        id_estado = validated_data.pop('id_estado')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_contratador is not None:
            instance.id_contratador = id_contratador
            
        if id_trabajador is not None:
            instance.id_trabajador = id_trabajador
            
        if id_profesion_requerida is not None:
            instance.id_profesion_requerida = id_profesion_requerida
            
        if id_zona_geografica_trabajo is not None:
            instance.id_zona_geografica_trabajo = id_zona_geografica_trabajo
            
        if id_estado is not None:
            instance.id_estado = id_estado
            
        instance.save()
        
        return instance    
    

class PostulacionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Postulacion
        fields = ('id_postulacion', 'id_trabajo', 'id_trabajador', 'fecha_postulacion')
        
    trabajo = serializers.SerializerMethodField()
    trabajador = serializers.SerializerMethodField()
        
    id_trabajo = serializers.IntegerField(write_only=True)
    id_trabajador = serializers.IntegerField(write_only=True)
    
    def get_trabajo(self, obj):
        trabajo = obj.trabajo
        return TrabajoSerializer(trabajo).data
    
    def get_trabajador(self, obj):
        trabajador = obj.trabajador
        return TrabajadorSerializer(trabajador).data
    
    def create(self, validated_data):
        id_trabajo = validated_data.pop('id_trabajo')
        id_trabajador = validated_data.pop('id_trabajador')
        
        postulacion = Postulacion.objects.create(
            id_trabajo = id_trabajo,
            id_trabajador = id_trabajador,
            **validated_data
            )
            
        return postulacion
    
    def update(self, instance, validated_data):
        id_trabajo = validated_data.pop('id_trabajo')
        id_trabajador = validated_data.pop('id_trabajador')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if id_trabajo is not None:
            instance.id_trabajo = id_trabajo
            
        if id_trabajador is not None:
            instance.id_trabajador = id_trabajador
            
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
    
    
    
    
    
    
    
    
    
    
    
    
    