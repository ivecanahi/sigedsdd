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


class EsAutoridadAcademicaDeInstitucion(BasePermission):
    """Permiso que permite el acceso solo a autoridades académicas activas de la institución."""

    def _es_administrador(self, user):
        if not user or not user.is_authenticated:
            return False
        return UsuarioRol.objects.filter(
            usuario=user,
            rol__nombre=Rol.ADMINISTRADOR,
            es_activo=True,
        ).exists()

    def _es_autoridad_de_institucion(self, user, institucion):
        if not user or not user.is_authenticated:
            return False
        return UsuarioRol.objects.filter(
            usuario=user,
            rol__nombre=Rol.AUTORIDAD_ACADEMICA,
            institucion=institucion,
            es_activo=True,
        ).exists()

    def _get_institucion_desde_kwargs(self, view):
        from apps.organizacion.daos.planestudio_dao import PlanEstudioDAO
        from apps.organizacion.daos.gradoescolar_dao import GradoEscolarDAO

        institucion_id = view.kwargs.get('institucion_id')
        if institucion_id:
            return institucion_id

        plan_estudio_id = view.kwargs.get('plan_estudio_id')
        if plan_estudio_id:
            plan = PlanEstudioDAO.obtener_por_id(plan_estudio_id)
            if plan:
                return plan.institucion_id
            return None

        grado_escolar_id = view.kwargs.get('grado_escolar_id')
        if grado_escolar_id:
            grado = GradoEscolarDAO.obtener_por_id(grado_escolar_id)
            if grado:
                return grado.plan_estudio.institucion_id
            return None

        return None

    def has_permission(self, request, view):
        user = request.user
        if self._es_administrador(user):
            return True

        institucion_id = self._get_institucion_desde_kwargs(view)
        if institucion_id:
            from apps.organizacion.models import Institucion
            try:
                institucion = Institucion.objects.get(id=institucion_id)
                return self._es_autoridad_de_institucion(user, institucion)
            except Institucion.DoesNotExist:
                return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if self._es_administrador(user):
            return True

        institucion = None
        if hasattr(obj, 'institucion'):
            institucion = obj.institucion
        elif hasattr(obj, 'plan_estudio'):
            institucion = obj.plan_estudio.institucion
        elif hasattr(obj, 'grado_escolar'):
            institucion = obj.grado_escolar.plan_estudio.institucion

        if institucion:
            return self._es_autoridad_de_institucion(user, institucion)
        return False
