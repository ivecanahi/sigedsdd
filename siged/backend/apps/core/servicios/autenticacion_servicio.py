from apps.core.daos.usuario_dao import UsuarioDAO
from apps.core.excepciones import CredencialesInvalidasError, CuentaInactivaError


class AutenticacionServicio:

    @staticmethod
    def iniciar_sesion(numero_identificacion: str, password: str):
        """Valida credenciales y crea un token de sesión.

        Raises:
            CredencialesInvalidasError: Si el usuario no existe o la contraseña es incorrecta.
            CuentaInactivaError: Si el usuario existe pero su cuenta está inactiva.
        """
        usuario = UsuarioDAO.obtener_por_identificacion(numero_identificacion)

        if usuario is None:
            raise CredencialesInvalidasError('Credenciales inválidas')

        if not usuario.check_password(password):
            raise CredencialesInvalidasError('Credenciales inválidas')

        if not usuario.is_active:
            raise CuentaInactivaError('Cuenta inactiva')

        token = UsuarioDAO.crear_token(usuario)

        return {
            'token': token.key,
            'usuario': {
                'id': usuario.id,
                'numero_identificacion': usuario.numero_identificacion,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name,
                'is_active': usuario.is_active,
            },
        }

    @staticmethod
    def cerrar_sesion(usuario):
        """Elimina el token de sesión del usuario."""
        UsuarioDAO.eliminar_token(usuario)
