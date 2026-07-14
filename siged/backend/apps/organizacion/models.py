from django.conf import settings
from django.db import models


class Asignatura(models.Model):
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
    grado_escolar = models.ForeignKey(
        'GradoEscolar',
        on_delete=models.CASCADE,
        related_name='asignaturas',
        verbose_name='grado escolar',
    )
    nombre = models.CharField(
        max_length=150,
        verbose_name='nombre',
    )
    pp_semana_minimo = models.PositiveIntegerField(
        verbose_name='carga pedagógica mínima semanal',
    )

    class Meta:
        verbose_name = 'asignatura'
        verbose_name_plural = 'asignaturas'
        ordering = ('nombre',)
        unique_together = ('nombre', 'grado_escolar')

    def __str__(self):
        return self.nombre


class EducacionNivel(models.Model):
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
        max_length=100,
        unique=True,
        verbose_name='nombre',
    )
    pp_minutos = models.PositiveIntegerField(
        verbose_name='carga pedagógica mínima (minutos)',
    )
    pp_semana_minimo = models.PositiveIntegerField(
        verbose_name='carga pedagógica mínima semanal',
    )

    class Meta:
        verbose_name = 'nivel educativo'
        verbose_name_plural = 'niveles educativos'
        ordering = ('nombre',)

    def __str__(self):
        return self.nombre


class EducacionSubNivel(models.Model):
    educacion_nivel = models.ForeignKey(
        EducacionNivel,
        on_delete=models.CASCADE,
        related_name='subniveles',
        verbose_name='nivel educativo',
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
        max_length=100,
        verbose_name='nombre',
    )
    pp_semana_minimo = models.PositiveIntegerField(
        verbose_name='carga pedagógica mínima semanal',
    )

    class Meta:
        verbose_name = 'subnivel educativo'
        verbose_name_plural = 'subniveles educativos'
        ordering = ('nombre',)
        unique_together = ('nombre', 'educacion_nivel')

    def __str__(self):
        return self.nombre


class GradoEscolar(models.Model):
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
    nivel = models.ForeignKey(
        EducacionNivel,
        on_delete=models.CASCADE,
        related_name='grados_escolares',
        verbose_name='nivel educativo',
    )
    nombre = models.CharField(
        max_length=100,
        verbose_name='nombre',
    )
    orden = models.PositiveIntegerField(
        verbose_name='orden',
    )
    plan_estudio = models.ForeignKey(
        'PlanEstudio',
        on_delete=models.CASCADE,
        related_name='grados_escolares',
        verbose_name='plan de estudio',
    )
    subnivel = models.ForeignKey(
        EducacionSubNivel,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='grados_escolares',
        verbose_name='subnivel educativo',
    )

    class Meta:
        verbose_name = 'grado escolar'
        verbose_name_plural = 'grados escolares'
        ordering = ('orden', 'nombre')
        unique_together = ('nombre', 'plan_estudio')

    def __str__(self):
        return self.nombre


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


class PlanEstudio(models.Model):
    es_activo = models.BooleanField(
        default=False,
        verbose_name='es activo',
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
    institucion = models.ForeignKey(
        Institucion,
        on_delete=models.CASCADE,
        related_name='planes_estudio',
        verbose_name='institución',
    )
    nombre = models.CharField(
        max_length=200,
        verbose_name='nombre',
    )

    class Meta:
        verbose_name = 'plan de estudio'
        verbose_name_plural = 'planes de estudio'
        ordering = ('nombre',)
        unique_together = ('nombre', 'institucion')
        constraints = [
            models.UniqueConstraint(
                fields=['institucion'],
                condition=models.Q(es_activo=True),
                name='unique_plan_vigente_por_institucion',
            ),
        ]

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
