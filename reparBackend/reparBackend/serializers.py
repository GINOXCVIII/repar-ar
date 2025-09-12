#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Sep 12 17:18:34 2025

@author: imano-oh
"""

from rest_framework import serializers
# from .models import * # Importar los modelos necesarios
        
class TrabajadorSerializer(serializers.ModelSerializer):
    class Meta:
        # model = Trabajador
        fields = '__all__'
        
class ContratadorSerializer(serializers.ModelSerializer):
    class Meta:
        # model = Contratador
        fields = '__all__'
        
class TrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        # model = Trabajo
        fields = '__all__'
