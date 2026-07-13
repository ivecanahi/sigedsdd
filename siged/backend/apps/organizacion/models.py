from django.conf import settings
from django.db import models


class Institucion(models.Model):
    codigo = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='código',
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        null=True,
        blank=True,
        verbose_name='fecha de actualización',
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='fecha de creación',
    )
    nombre = models.CharField(
        max_length=200,
        unique=True,
        verbose_name='nombre',
    )
    ruc = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='RUC',
    )

    class Meta:
        verbose_name = 'institución educativa'
        verbose_name_plural = 'instituciones educativas'
        ordering = ('nombre',)

    def __str__(self):
        return self.nombre


class Rol(models.Model):
    ADMINISTRADOR = 'ADMINISTRADOR'
    AUTORIDAD_ACADEMICA = 'AUTORIDAD_ACADEMICA'
    DOCENTE = 'DOCENTE'
    SECRETARIA = 'SECRETARIA'
    ESTUDIANTE = 'ESTUDIANTE'
    DECE = 'DECE'

    NOMBRE_CHOICES = [
        (ADMINISTRADOR, 'Administrador'),
        (AUTORIDAD_ACADEMICA, 'Autoridad académica'),
        (DOCENTE, 'Docente'),
        (SECRETARIA, 'Secretaria'),
        (ESTUDIANTE, 'Estudiante'),
        (DECE, 'DECE'),
    ]

    nombre = models.CharField(
        max_length=50,
        choices=NOMBRE_CHOICES,
        unique=True,
        verbose_name='nombre',
    )

    class Meta:
        verbose_name = 'rol'
        verbose_name_plural = 'roles'
        ordering = ('nombre',)

    def __str__(self):
        return self.get_nombre_display()


class UsuarioRol(models.Model):
    es_activo = models.BooleanField(
        default=True,
        verbose_name='es activo',
    )
    fecha_desde = models.DateField(
        null=True,
        blank=True,
        verbose_name='fecha desde',
    )
    fecha_hasta = models.DateField(
        null=True,
        blank=True,
        verbose_name='fecha hasta',
    )
    institucion = models.ForeignKey(
        Institucion,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='asignaciones',
        verbose_name='institución',
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.CASCADE,
        related_name='asignaciones',
        verbose_name='rol',
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asignaciones',
        verbose_name='usuario',
    )

    class Meta:
        verbose_name = 'asignación de rol'
        verbose_name_plural = 'asignaciones de roles'
        constraints = [
            models.UniqueConstraint(
                fields=('usuario', 'rol', 'institucion'),
                condition=models.Q(es_activo=True),
                name='unique_usuario_rol_institucion_activo',
            ),
        ]

    def __str__(self):
        institucion_str = f' - {self.institucion.nombre}' if self.institucion else ''
        return f'{self.usuario.username} | {self.rol.get_nombre_display()}{institucion_str}'
