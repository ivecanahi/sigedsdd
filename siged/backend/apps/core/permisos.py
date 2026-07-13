from rest_framework.permissions import BasePermission


class NoRequerido(BasePermission):
    """Permiso que permite el acceso a cualquier usuario, autenticado o no."""

    def has_permission(self, request, view):
        return True


class EsAdministrador(BasePermission):
    """Permiso que permite el acceso solo a usuarios con rol ADMINISTRADOR activo."""

    def _es_administrador(self, user):
        if not user or not user.is_authenticated:
            return False
        from apps.organizacion.models import Rol, UsuarioRol
        return UsuarioRol.objects.filter(
            usuario=user,
            rol__nombre=Rol.ADMINISTRADOR,
            es_activo=True,
        ).exists()

    def has_permission(self, request, view):
        return self._es_administrador(request.user)

    def has_object_permission(self, request, view, obj):
        return self._es_administrador(request.user)
