from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.core.models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = (
        'numero_identificacion',
        'first_name',
        'last_name',
        'is_active',
    )
    fieldsets = (
        (None, {'fields': ('numero_identificacion', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('numero_identificacion', 'username', 'email', 'password1', 'password2'),
        }),
    )
    search_fields = ('numero_identificacion', 'first_name', 'last_name', 'email')
    ordering = ('numero_identificacion',)
