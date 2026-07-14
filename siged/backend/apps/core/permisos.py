from rest_framework.permissions import BasePermission


class NoRequerido(BasePermission):
    """Permiso que permite el acceso a cualquier usuario, autenticado o no."""

    def has_permission(self, request, view):
        return True
