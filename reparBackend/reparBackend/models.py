from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Revisar que faltan los IDs

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.nombre


class RolCliente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Cliente: {self.usuario.nombre}"


class RolTrabajador(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    disponibilidad = models.BooleanField(default=True)

    def __str__(self):
        return f"Trabajador: {self.usuario.nombre}"


class Profesion(models.Model):
    id_profesion = models.AutoField(primary_key=True)
    nombre_profesion = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre_profesion


class TrabajadorProfesion(models.Model):
    id_trabajador_profesion = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(RolTrabajador, on_delete=models.CASCADE)
    profesion = models.ForeignKey(Profesion, on_delete=models.CASCADE)
    matricula = models.CharField(max_length=50, blank=True, null=True)


class ZonaGeografica(models.Model):
    calle = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    provincia = models.CharField(max_length=100, blank=True, null=True)


class Trabajo(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aceptado', 'Aceptado'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ] # No conocia esto, pero puede funcionar, aunque no lo veo practico para modificaciones a futuro

    cliente = models.ForeignKey(RolCliente, on_delete=models.CASCADE)
    trabajador = models.ForeignKey(RolTrabajador, on_delete=models.SET_NULL, blank=True, null=True) # El trabajador es un postulante. ¿es uno solo, son varios? ¿como manejar eso?
    profesion = models.ForeignKey(Profesion, on_delete=models.CASCADE)
    zona_geo = models.ForeignKey(ZonaGeografica, on_delete=models.SET_NULL, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    confirmacion_cliente = models.BooleanField(default=False)
    confirmacion_trabajador = models.BooleanField(default=False)
    

"""
# Parte de imanol, ver si pasa...

class Estado(models.Model):
    id_estado = models.AutoField(primary_key=True)
    descripcion_estado = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.descripcion_estado


class ZonaGeografica(models.Model):
    id_zona_geografica = models.AutoField(primary_key=True)
    codigo_postal = models.CharField(max_length=10)
    ciudad = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.ciudad}, {self.provincia}"
"""


class Postulacion(models.Model):
    trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE)
    trabajador = models.ForeignKey(RolTrabajador, on_delete=models.CASCADE)
    mensaje = models.TextField(blank=True, null=True)
    fecha_postulacion = models.DateTimeField(auto_now_add=True)


class Calificacion(models.Model):
    id_calificacion = models.AutoField(primary_key=True)
    id_calificador = models.ForeignKey(Usuario, on_delete=models.CASCADE) # Revisar la referencia de la key, si es Usuario o será otra
    id_calificado = models.ForeignKey(Usuario, on_delete=models.CASCADE) # 
    id_trabajo = models.ForeignKey(Trabajo, on_delete=models.CASCADE)
    calificacion = models.DecimalField(
        max_decimal_places = 1, 
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0)]) # Lo hice float para permitir valores con coma
    comentario = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)












