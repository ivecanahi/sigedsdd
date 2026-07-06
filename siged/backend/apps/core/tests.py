from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.apis.serializers.autenticacion_serializer import AutenticacionSerializer
from apps.core.excepciones import CredencialesInvalidasError, CuentaInactivaError
from apps.core.models import Usuario
from apps.core.servicios.autenticacion_servicio import AutenticacionServicio


class AutenticacionSerializerTest(TestCase):
    """Pruebas unitarias para el serializer de autenticación."""

    def test_campos_obligatorios(self):
        """RF-001, RV-001, RV-002: numero_identificacion y password son obligatorios."""
        serializer = AutenticacionSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('numero_identificacion', serializer.errors)
        self.assertIn('password', serializer.errors)

    def test_numero_identificacion_vacio(self):
        """RV-001: numero_identificacion no puede estar vacío."""
        serializer = AutenticacionSerializer(data={
            'numero_identificacion': '',
            'password': 'test123',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('numero_identificacion', serializer.errors)

    def test_password_vacio(self):
        """RV-002: password no puede estar vacío."""
        serializer = AutenticacionSerializer(data={
            'numero_identificacion': '123456',
            'password': '',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_datos_validos(self):
        """Datos completos pasan validación."""
        serializer = AutenticacionSerializer(data={
            'numero_identificacion': '123456',
            'password': 'test123',
        })
        self.assertTrue(serializer.is_valid())


class AutenticacionServicioTest(TestCase):
    """Pruebas unitarias para el servicio de autenticación."""

    def setUp(self):
        self.usuario_activo = Usuario.objects.create_user(
            username='activo',
            email='activo@example.com',
            password='password123',
            numero_identificacion='111111',
            first_name='Usuario',
            last_name='Activo',
            is_active=True,
        )
        self.usuario_inactivo = Usuario.objects.create_user(
            username='inactivo',
            email='inactivo@example.com',
            password='password123',
            numero_identificacion='222222',
            first_name='Usuario',
            last_name='Inactivo',
            is_active=False,
        )

    def test_iniciar_sesion_exitoso(self):
        """RF-002: Inicio de sesión con credenciales válidas retorna token y usuario."""
        resultado = AutenticacionServicio.iniciar_sesion('111111', 'password123')

        self.assertIn('token', resultado)
        self.assertIn('usuario', resultado)
        self.assertEqual(resultado['usuario']['numero_identificacion'], '111111')
        self.assertTrue(resultado['usuario']['is_active'])

    def test_iniciar_sesion_usuario_no_existe(self):
        """RV-003: Usuario inexistente lanza CredencialesInvalidasError."""
        with self.assertRaises(CredencialesInvalidasError):
            AutenticacionServicio.iniciar_sesion('999999', 'password123')

    def test_iniciar_sesion_password_incorrecto(self):
        """RV-004: Contraseña incorrecta lanza CredencialesInvalidasError."""
        with self.assertRaises(CredencialesInvalidasError):
            AutenticacionServicio.iniciar_sesion('111111', 'wrongpassword')

    def test_iniciar_sesion_usuario_inactivo(self):
        """RF-004, RV-005: Usuario inactivo lanza CuentaInactivaError."""
        with self.assertRaises(CuentaInactivaError):
            AutenticacionServicio.iniciar_sesion('222222', 'password123')

    def test_cerrar_sesion_elimina_token(self):
        """RF-005, D8: Cierre de sesión elimina el token de la base de datos."""
        token = Token.objects.create(user=self.usuario_activo)
        self.assertTrue(Token.objects.filter(user=self.usuario_activo).exists())

        AutenticacionServicio.cerrar_sesion(self.usuario_activo)

        self.assertFalse(Token.objects.filter(user=self.usuario_activo).exists())


class LoginEndpointTest(TestCase):
    """Pruebas de integración para el endpoint de inicio de sesión."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            numero_identificacion='12345678',
            first_name='Test',
            last_name='User',
            is_active=True,
        )

    def test_login_credenciales_validas(self):
        """Escenario 1 US1: Login exitoso retorna 200, token y redirige."""
        response = self.client.post('/api/login/', {
            'numero_identificacion': '12345678',
            'password': 'testpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('usuario', response.data)
        self.assertEqual(response.data['usuario']['numero_identificacion'], '12345678')

    def test_login_credenciales_invalidas(self):
        """Escenario 2 US1: Credenciales inválidas retornan 401."""
        response = self.client.post('/api/login/', {
            'numero_identificacion': '12345678',
            'password': 'wrongpass',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Credenciales inválidas')

    def test_login_campos_vacios(self):
        """Escenario 3 US1: Campos vacíos retornan 400 con mensajes de validación."""
        response = self.client.post('/api/login/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('numero_identificacion', response.data)
        self.assertIn('password', response.data)

    def test_login_usuario_inactivo(self):
        """Escenario 4 US1: Usuario inactivo retorna 403."""
        self.usuario.is_active = False
        self.usuario.save()

        response = self.client.post('/api/login/', {
            'numero_identificacion': '12345678',
            'password': 'testpass123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Cuenta inactiva')


class LogoutEndpointTest(TestCase):
    """Pruebas de integración para el endpoint de cierre de sesión."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            username='logoutuser',
            email='logout@example.com',
            password='logoutpass',
            numero_identificacion='99999999',
            first_name='Logout',
            last_name='User',
            is_active=True,
        )
        self.token = Token.objects.create(user=self.usuario)

    def test_logout_exitoso(self):
        """Escenario 1 US2: Cierre de sesión exitoso retorna 200."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.post('/api/logout/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mensaje'], 'Sesión cerrada correctamente')
        self.assertFalse(Token.objects.filter(user=self.usuario).exists())

    def test_logout_sin_autenticacion(self):
        """Escenario 2 US2: Logout sin autenticación retorna 401."""
        response = self.client.post('/api/logout/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AuthorizationTest(TestCase):
    """Pruebas de autorización para verificar permisos de endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_login_es_publico(self):
        """D7: El endpoint de login es público (no requiere autenticación)."""
        response = self.client.post('/api/login/', {}, format='json')
        # Debe retornar 400 (campos vacíos), NO 401 (no autenticado)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_requiere_autenticacion(self):
        """D7: El endpoint de logout requiere autenticación."""
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
