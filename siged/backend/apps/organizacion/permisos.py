from rest_framework.permissions import BasePermission

from apps.organizacion.models import Rol, UsuarioRol


class EsAdministrador(BasePermission):
    """Permiso que permite el acceso solo a usuarios con rol ADMINISTRADOR activo."""

    def _es_administrador(self, user):
        if not user or not user.is_authenticated:
            return False
        return UsuarioRol.objects.filter(
            usuario=user,
            rol__nombre=Rol.ADMINISTRADOR,
            es_activo=True,
        ).exists()

    def has_permission(self, request, view):
        return self._es_administrador(request.user)

    def has_object_permission(self, request, view, obj):
        return self._es_administrador(request.user)


class EsAdministradorOAutoridadAcademicaDeInstitucion(BasePermission):
    """Permiso que permite el acceso a administradores o autoridades académicas de la institución."""

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if UsuarioRol.objects.filter(
            usuario=user,
            rol__nombre=Rol.ADMINISTRADOR,
            es_activo=True,
        ).exists():
            return True
        return UsuarioRol.objects.filter(
            usuario=user,
            rol__nombre=Rol.AUTORIDAD_ACADEMICA,
            institucion=obj,
            es_activo=True,
        ).exists()
