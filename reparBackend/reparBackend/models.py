from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class ZonaGeografica(models.Model):
    id_zona_geografica = models.AutoField(primary_key=True)
    calle = models.CharField(max_length=100)
    ciudad = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Zona Geografica"
        verbose_name_plural = "Zonas Geograficas"
        
    def __str__(self):
        return f"{self.calle}, {self.ciudad}, {self.provincia}"

class Profesion(models.Model):
    id_profesion = models.AutoField(primary_key=True)
    nombre_profesion = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Profesion"
        verbose_name_plural = "Profesiones"
        
    def __str__(self):
        return f"{self.nombre_profesion}"

class Estado(models.Model):
    id_estado = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Estado"
        verbose_name_plural = "Estados"
        
    def __str__(self):
        return f"{self.id_estado} {self.descripcion}"

class Contratador(models.Model):
    id_contratador = models.AutoField(primary_key=True)
    id_zona_geografica_contratador = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, null=True, db_column='id_zona_geografica_contratador')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email_contratador = models.EmailField(max_length=100)
    telefono_contratador = models.BigIntegerField()
    dni = models.IntegerField()
    
    class Meta:
        verbose_name = "Contratador"
        verbose_name_plural = "Contratadores"
        
    def __str__(self):
        return f"{self.id_contratador} - {self.apellido.upper()}, {self.nombre}"

class Trabajador(models.Model):
    id_trabajador = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador')
    id_zona_geografica_trabajador = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, null=True, db_column='id_zona_geografica_trabajador')
    telefono_trabajador = models.BigIntegerField()
    mail_trabajador = models.EmailField(max_length=100)
    
    class Meta:
        verbose_name = "Trabajador"
        verbose_name_plural = "Trabajadores"
        
    def __str__(self):
        return f"{self.id_trabajador} - {self.id_contratador.apellido.upper()}, {self.id_contratador.nombre}"

class Trabajo(models.Model):
    id_trabajo = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador')
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_trabajador')
    id_profesion_requerida = models.ForeignKey(Profesion, on_delete=models.PROTECT, db_column='id_profesion_requerida')
    id_zona_geografica_trabajo = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, null=True, db_column='id_zona_geografica_trabajo')
    id_estado = models.ForeignKey(Estado, on_delete=models.PROTECT, db_column='id_estado')
    descripcion = models.CharField(max_length=500)
    fecha_creacion = models.DateTimeField()
    fecha_inicio = models.DateTimeField(blank=True, null=True) # Estarán en blanco inicialmente
    fecha_fin = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Trabajo"
        verbose_name_plural = "Trabajos"
        
    def __str__(self):
        contratador = "Contratador: " + self.id_contratador.apellido.upper() + ", " + self.id_contratador.nombre
        if self.id_trabajador:
            trabajador = "Trabajador: "  + self.id_trabajador.id_contratador.apellido.upper() + ", " + self.id_trabajador.id_contratador.nombre
        else:
            trabajador = "Trabajador: VACANTE"
        return f"Trabajo {self.id_trabajo} {self.id_estado.descripcion.upper()} {contratador} - {trabajador}"

class Postulacion(models.Model):
    id_postulacion = models.AutoField(primary_key=True)
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, db_column='id_trabajo')
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    fecha_postulacion = models.DateTimeField()
    
    class Meta:
        verbose_name = "Postulacion"
        verbose_name_plural = "Postulaciones"
        
    def __str__(self):
        return f"{self.id_trabajo} {self.id_trabajador} {self.fecha_postulacion}"

class CalificacionTrabajador(models.Model):
    id_calificacion_trabajador = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador') 
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, db_column='id_trabajo')
    calificacion = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(1.0), MaxValueValidator(5.0)])
    comentario = models.CharField(max_length=500)
    fecha_calificacion = models.DateTimeField()
    
    class Meta:
        verbose_name = "Calificacion del trabajador"
        verbose_name_plural = "Cafilicaciones de trabajadores"
        
    def __str__(self):
        return f"{self.id_calificacion_trabajador}"

class CalificacionContratador(models.Model):
    id_calificacion_contratador = models.AutoField(primary_key=True)
    id_contratador = models.ForeignKey(Contratador, on_delete=models.CASCADE, db_column='id_contratador') 
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE, db_column='id_trabajo')
    calificacion = models.DecimalField(max_digits=2, decimal_places=1, validators=[MinValueValidator(1.0), MaxValueValidator(5.0)])
    comentario = models.CharField(max_length=500)
    fecha_calificacion = models.DateTimeField()
    
    class Meta:
        verbose_name = "Calificacion del contratador"
        verbose_name_plural = "Cafilicaciones de contratadores"
        
    def __str__(self):
        return f"{self.id_calificacion_contratador}"

class TrabajadoresProfesion(models.Model):
    id_trabajador_profesion = models.AutoField(primary_key=True)
    id_trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, db_column='id_trabajador')
    id_profesion = models.ForeignKey(Profesion, on_delete=models.CASCADE, db_column='id_profesion')
    matricula = models.CharField(max_length=100, blank=True)
    
    class Meta:
        verbose_name = "Profesion de un trabajador"
        verbose_name_plural = "Profesiones de un trabajador"
        
    def __str__(self):
        return f"{self.id_trabajador}: {self.id_profesion.nombre_profesion} MN: {self.matricula}"

