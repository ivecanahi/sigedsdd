from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.apis.serializers.autenticacion_serializer import AutenticacionSerializer
from apps.core.apis.serializers.usuario_serializer import UsuarioSerializer
from apps.core.excepciones import CredencialesInvalidasError, CuentaInactivaError
from apps.core.permisos import EsAdministrador
from apps.core.servicios.autenticacion_servicio import AutenticacionServicio
from rest_framework.exceptions import NotAuthenticated

Usuario = get_user_model()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AutenticacionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        numero_identificacion = serializer.validated_data['numero_identificacion']
        password = serializer.validated_data['password']

        try:
            resultado = AutenticacionServicio.iniciar_sesion(numero_identificacion, password)
            return Response(resultado, status=status.HTTP_200_OK)
        except CredencialesInvalidasError:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
        except CuentaInactivaError:
            return Response({'error': 'Cuenta inactiva'}, status=status.HTTP_403_FORBIDDEN)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def handle_exception(self, exc):
        if isinstance(exc, NotAuthenticated):
            return Response({'error': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        return super().handle_exception(exc)

    def post(self, request):
        AutenticacionServicio.cerrar_sesion(request.user)
        return Response({'mensaje': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)


class UsuarioListView(APIView):
    permission_classes = [IsAuthenticated, EsAdministrador]

    def get(self, request):
        activo = request.query_params.get('activo', None)
        qs = Usuario.objects.all()
        if activo is not None:
            qs = qs.filter(is_active=activo.lower() in ('true', '1'))
        serializer = UsuarioSerializer(qs.order_by('numero_identificacion'), many=True)
        return Response(serializer.data)
