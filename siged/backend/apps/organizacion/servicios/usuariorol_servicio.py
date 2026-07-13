from django.utils import timezone

from apps.organizacion.daos.usuariorol_dao import UsuarioRolDAO
from apps.organizacion.excepciones import AsignacionDuplicadaError


class UsuarioRolServicio:

    @staticmethod
    def listar(institucion_id=None):
        return UsuarioRolDAO.listar(institucion_id)

    @staticmethod
    def obtener(usuario_rol_id):
        return UsuarioRolDAO.obtener_por_id(usuario_rol_id)

    @staticmethod
    def crear(data):
        if data.get('es_activo', True):
            if UsuarioRolDAO.existe_activa(
                data['usuario'],
                data['rol'],
                data.get('institucion'),
            ):
                raise AsignacionDuplicadaError(
                    'Ya existe una asignación activa para este usuario, rol e institución.'
                )
        if data.get('es_activo', True):
            data['fecha_desde'] = timezone.now().date()
            data['fecha_hasta'] = None
        return UsuarioRolDAO.crear(data)

    @staticmethod
    def actualizar(usuario_rol, data):
        nueva_rol = data.get('rol', usuario_rol.rol)
        nueva_institucion = data.get('institucion', usuario_rol.institucion)
        nuevo_usuario = data.get('usuario', usuario_rol.usuario)
        nuevo_es_activo = data.get('es_activo', usuario_rol.es_activo)

        if nuevo_es_activo:
            if UsuarioRolDAO.existe_activa(
                nuevo_usuario,
                nueva_rol,
                nueva_institucion,
                excluir_id=usuario_rol.id,
            ):
                raise AsignacionDuplicadaError(
                    'Ya existe una asignación activa para este usuario, rol e institución.'
                )

        data.pop('fecha_desde', None)
        data.pop('fecha_hasta', None)

        return UsuarioRolDAO.actualizar(usuario_rol, data)

    @staticmethod
    def cambiar_estado(usuario_rol, es_activo):
        if es_activo and not usuario_rol.es_activo:
            if UsuarioRolDAO.existe_activa(
                usuario_rol.usuario,
                usuario_rol.rol,
                usuario_rol.institucion,
                excluir_id=usuario_rol.id,
            ):
                raise AsignacionDuplicadaError(
                    'Ya existe una asignación activa para este usuario, rol e institución.'
                )

        usuario_rol.es_activo = es_activo
        if es_activo:
            usuario_rol.fecha_desde = timezone.now().date()
            usuario_rol.fecha_hasta = None
        else:
            usuario_rol.fecha_hasta = timezone.now().date()
        usuario_rol.save()
        return usuario_rol

    @staticmethod
    def eliminar(usuario_rol):
        UsuarioRolDAO.eliminar(usuario_rol)

    @staticmethod
    def listar_roles_activos_por_usuario(usuario):
        return UsuarioRolDAO.listar_roles_activos_por_usuario(usuario)
