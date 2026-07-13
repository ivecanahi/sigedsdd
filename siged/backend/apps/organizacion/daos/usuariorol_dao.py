from django.contrib.auth import get_user_model

from apps.organizacion.models import Rol, UsuarioRol

Usuario = get_user_model()


class UsuarioRolDAO:

    @staticmethod
    def listar(institucion_id=None):
        qs = UsuarioRol.objects.all().select_related('usuario', 'rol', 'institucion')
        if institucion_id:
            qs = qs.filter(institucion_id=institucion_id)
        return qs.order_by('id')

    @staticmethod
    def obtener_por_id(usuario_rol_id):
        try:
            return UsuarioRol.objects.select_related('usuario', 'rol', 'institucion').get(id=usuario_rol_id)
        except UsuarioRol.DoesNotExist:
            return None

    @staticmethod
    def crear(data):
        return UsuarioRol.objects.create(**data)

    @staticmethod
    def actualizar(usuario_rol, data):
        for campo, valor in data.items():
            setattr(usuario_rol, campo, valor)
        usuario_rol.save()
        return usuario_rol

    @staticmethod
    def eliminar(usuario_rol):
        usuario_rol.delete()

    @staticmethod
    def listar_roles_activos_por_usuario(usuario):
        return Rol.objects.filter(
            asignaciones__usuario=usuario,
            asignaciones__es_activo=True,
        ).distinct().order_by('nombre')

    @staticmethod
    def existe_activa(usuario, rol, institucion, excluir_id=None):
        qs = UsuarioRol.objects.filter(
            usuario=usuario,
            rol=rol,
            institucion=institucion,
            es_activo=True,
        )
        if excluir_id:
            qs = qs.exclude(id=excluir_id)
        return qs.exists()
