from django.contrib import admin

from apps.organizacion.models import Institucion, Rol, UsuarioRol


@admin.register(Institucion)
class InstitucionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo', 'ruc', 'fecha_creacion')
    search_fields = ('nombre', 'codigo', 'ruc')
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
