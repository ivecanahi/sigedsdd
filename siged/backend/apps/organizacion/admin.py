from django.contrib import admin

from apps.organizacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    Institucion,
    PlanEstudio,
    Rol,
    UsuarioRol,
)


@admin.register(Asignatura)
class AsignaturaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'pp_semana_minimo', 'grado_escolar', 'fecha_creacion')
    search_fields = ('nombre',)
    list_filter = ('grado_escolar',)
    ordering = ('nombre',)


@admin.register(EducacionNivel)
class EducacionNivelAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'pp_minutos', 'pp_semana_minimo', 'fecha_creacion')
    search_fields = ('nombre',)
    ordering = ('nombre',)


@admin.register(EducacionSubNivel)
class EducacionSubNivelAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'pp_semana_minimo', 'educacion_nivel', 'fecha_creacion')
    search_fields = ('nombre', 'educacion_nivel__nombre')
    list_filter = ('educacion_nivel',)
    ordering = ('nombre',)


@admin.register(GradoEscolar)
class GradoEscolarAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'orden', 'plan_estudio', 'nivel', 'subnivel', 'fecha_creacion')
    search_fields = ('nombre', 'plan_estudio__nombre')
    list_filter = ('nivel', 'subnivel')
    ordering = ('orden', 'nombre')


@admin.register(Institucion)
class InstitucionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo', 'ruc', 'fecha_creacion')
    search_fields = ('nombre', 'codigo', 'ruc')
    ordering = ('nombre',)


@admin.register(PlanEstudio)
class PlanEstudioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'es_activo', 'institucion', 'fecha_creacion')
    search_fields = ('nombre', 'institucion__nombre')
    list_filter = ('es_activo', 'institucion')
    ordering = ('nombre',)


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'get_nombre_display')
    search_fields = ('nombre',)

    @admin.display(description='nombre visible')
    def get_nombre_display(self, obj):
        return obj.get_nombre_display()


@admin.register(UsuarioRol)
class UsuarioRolAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol', 'institucion', 'es_activo', 'fecha_desde', 'fecha_hasta')
    list_filter = ('rol', 'es_activo')
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__last_name')
    ordering = ('usuario__username',)
