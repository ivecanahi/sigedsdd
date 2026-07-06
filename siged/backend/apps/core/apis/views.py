from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.apis.serializers.autenticacion_serializer import AutenticacionSerializer
from apps.core.excepciones import CredencialesInvalidasError, CuentaInactivaError
from apps.core.servicios.autenticacion_servicio import AutenticacionServicio


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
    def post(self, request):
        AutenticacionServicio.cerrar_sesion(request.user)
        return Response({'mensaje': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)
