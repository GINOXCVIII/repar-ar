#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Sep 12 17:21:13 2025

@author: imano-oh
"""

from django.contrib import admin
from .models import CalificacionContratador, CalificacionTrabajador, Contratador, Estado, Postulacion, Profesion, Trabajador, TrabajadoresProfesion, Trabajo, ZonaGeografica

admin.site.register(Trabajo)
admin.site.register(Trabajador)
admin.site.register(Contratador)
admin.site.register(CalificacionContratador)
admin.site.register(CalificacionTrabajador)
admin.site.register(Estado)
admin.site.register(Postulacion)
admin.site.register(Profesion)
admin.site.register(TrabajadoresProfesion)
admin.site.register(ZonaGeografica)


