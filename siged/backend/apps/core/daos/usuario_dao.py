from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

Usuario = get_user_model()


class UsuarioDAO:

    @staticmethod
    def obtener_por_identificacion(numero_identificacion: str):
        """Recupera un usuario por su número de identificación."""
        try:
            return Usuario.objects.get(numero_identificacion=numero_identificacion)
        except Usuario.DoesNotExist:
            return None

    @staticmethod
    def crear_token(usuario):
        """Crea o recupera el token de autenticación para un usuario."""
        token, _ = Token.objects.get_or_create(user=usuario)
        return token

    @staticmethod
    def listar(activo=None):
        """Lista usuarios ordenados por número de identificación."""
        qs = Usuario.objects.all()
        if activo is not None:
            qs = qs.filter(is_active=activo.lower() in ('true', '1'))
        return qs.order_by('numero_identificacion')

    @staticmethod
    def eliminar_token(usuario):
        """Elimina el token de autenticación de un usuario."""
        Token.objects.filter(user=usuario).delete()
