from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class ZonaGeografica(models.Model):
    id_zona_geografica = models.AutoField(primary_key=True)
    calle = models.CharField(max_length=100)
    ciudad = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)

class Profesion(models.Model):
    id_profesion = models.AutoField(primary_key=True)
    nombre_profesion = models.CharField(max_length=100)

class Estado(models.Model):
    id_estado = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)

class Contratador(models.Model):
    id_contratador = models.AutoField(primary_key=True)
    id_zona_geografica_contratador = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, null=True, db_column='id_zona_geografica_contratador')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email_contratador = models.EmailField(max_length=100)
    telefono_contratador = models.IntegerField()
    dni = models.IntegerField()

class Trabajador(models.Model):
    id_trabajador = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador')
    id_zona_geografica_trabajador = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, null=True, db_column='id_zona_geografica_trabajador')
    telefono_trabajador = models.IntegerField()
    mail_trabajador = models.EmailField(max_length=100)

class Trabajo(models.Model):
    id_trabajo = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador')
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_trabajador')
    id_profesion_requerida = models.ForeignKey(Profesion, on_delete=models.PROTECT, db_column='id_profesion_requerida')
    id_zona_geografica_trabajo = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, null=True, db_column='id_zona_geografica_trabajo')
    id_estado = models.ForeignKey(Estado, on_delete=models.PROTECT, db_column='id_estado')
    descripcion = models.CharField(max_length=500)
    fecha_creacion = models.DateTimeField()
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()

class Postulacion(models.Model):
    id_postulacion = models.AutoField(primary_key=True)
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, db_column='id_trabajo')
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    fecha_postulacion = models.DateTimeField()

class CalificacionTrabajador(models.Model):
    id_calificacion_trabajador = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador') 
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, db_column='id_trabajo')
    calificacion = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(1.0), MaxValueValidator(5.0)])
    comentario = models.CharField(max_length=500)
    fecha_calificacion = models.DateTimeField()

class CalificacionContratador(models.Model):
    id_calificacion_contratador = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador') 
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, db_column='id_trabajo')
    calificacion = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(1.0), MaxValueValidator(5.0)])
    comentario = models.CharField(max_length=500)
    fecha_calificacion = models.DateTimeField()

class TrabajadoresProfesion(models.Model):
    id_trabajador_profesion = models.AutoField(primary_key=True)
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    id_profesion = models.ForeignKey(Profesion, on_delete=models.CASCADE, db_column='id_profesion')
    matricula = models.CharField(max_length=100, blank=True)
