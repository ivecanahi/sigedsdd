from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.organizacion.apis.serializers.institucion_serializer import (
    InstitucionListSerializer,
    InstitucionSerializer,
)
from apps.organizacion.apis.serializers.usuariorol_serializer import UsuarioRolSerializer
from apps.organizacion.daos.institucion_dao import InstitucionDAO
from apps.organizacion.daos.usuariorol_dao import UsuarioRolDAO
from apps.organizacion.excepciones import (
    AsignacionDuplicadaError,
    InstitucionConDependenciasActivasError,
)
from apps.organizacion.models import Institucion, Rol, UsuarioRol
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio
from apps.organizacion.servicios.usuariorol_servicio import UsuarioRolServicio

Usuario = get_user_model()


class RolModelTest(TestCase):
    """Pruebas unitarias para el modelo Rol."""

    def test_roles_predefinidos_existen(self):
        """D2: Los roles predefinidos deben existir tras la migración de seed."""
        roles = Rol.objects.all()
        nombres = [r.nombre for r in roles]
        self.assertIn(Rol.ADMINISTRADOR, nombres)
        self.assertIn(Rol.AUTORIDAD_ACADEMICA, nombres)
        self.assertIn(Rol.DOCENTE, nombres)
        self.assertIn(Rol.SECRETARIA, nombres)
        self.assertIn(Rol.ESTUDIANTE, nombres)
        self.assertIn(Rol.DECE, nombres)

    def test_nombre_display(self):
        """D4: get_nombre_display debe retornar la descripción legible."""
        rol = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        self.assertEqual(rol.get_nombre_display(), 'Administrador')


class InstitucionModelTest(TestCase):
    """Pruebas unitarias para el modelo Institucion."""

    def test_crear_institucion(self):
        """RV-001, RV-002, RV-003: Crear institución con datos válidos."""
        institucion = Institucion.objects.create(
            nombre='Unidad Educativa Test',
            codigo='UE-001',
            ruc='1234567890001',
        )
        self.assertEqual(institucion.nombre, 'Unidad Educativa Test')
        self.assertEqual(institucion.codigo, 'UE-001')
        self.assertEqual(institucion.ruc, '1234567890001')

    def test_unicidad_nombre(self):
        """RV-001: El nombre debe ser único."""
        Institucion.objects.create(nombre='UE A', codigo='UE-001', ruc='111')
        with self.assertRaises(Exception):
            Institucion.objects.create(nombre='UE A', codigo='UE-002', ruc='222')

    def test_unicidad_codigo(self):
        """RV-002: El código debe ser único."""
        Institucion.objects.create(nombre='UE A', codigo='UE-001', ruc='111')
        with self.assertRaises(Exception):
            Institucion.objects.create(nombre='UE B', codigo='UE-001', ruc='222')

    def test_unicidad_ruc(self):
        """RV-003: El RUC debe ser único."""
        Institucion.objects.create(nombre='UE A', codigo='UE-001', ruc='111')
        with self.assertRaises(Exception):
            Institucion.objects.create(nombre='UE B', codigo='UE-002', ruc='111')


class UsuarioRolModelTest(TestCase):
    """Pruebas unitarias para el modelo UsuarioRol."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass',
            numero_identificacion='12345678',
            first_name='Test',
            last_name='User',
            is_active=True,
        )
        self.rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE Test',
            codigo='UE-TST',
            ruc='1111111111',
        )

    def test_crear_asignacion_activa(self):
        """RI-002: Crear asignación activa establece fecha_desde."""
        from django.utils import timezone
        asignacion = UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_admin,
            es_activo=True,
            fecha_desde=timezone.now().date(),
        )
        self.assertTrue(asignacion.es_activo)
        self.assertIsNotNone(asignacion.fecha_desde)

    def test_unicidad_activa(self):
        """RI-005, D6: No se permite duplicar asignación activa."""
        UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        with self.assertRaises(Exception):
            UsuarioRol.objects.create(
                usuario=self.usuario,
                rol=self.rol_autoridad,
                institucion=self.institucion,
                es_activo=True,
            )


class InstitucionSerializerTest(TestCase):
    """Pruebas unitarias para el serializer de institución."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE Test',
            codigo='UE-TST',
            ruc='1111111111',
        )

    def test_validar_unicidad_nombre_en_creacion(self):
        """RV-001: Validar unicidad de nombre al crear."""
        serializer = InstitucionSerializer(data={
            'nombre': 'UE Test',
            'codigo': 'UE-NEW',
            'ruc': '2222222222',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)

    def test_validar_unicidad_en_edicion_excluye_instancia(self):
        """D11: Al editar, las validaciones de unicidad excluyen el registro actual."""
        serializer = InstitucionSerializer(
            self.institucion,
            data={'nombre': 'UE Test'},
            partial=True,
        )
        self.assertTrue(serializer.is_valid())

    def test_validar_campos_obligatorios(self):
        """RV-001, RV-002, RV-003: Campos obligatorios."""
        serializer = InstitucionSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)
        self.assertIn('codigo', serializer.errors)
        self.assertIn('ruc', serializer.errors)


class UsuarioRolSerializerTest(TestCase):
    """Pruebas unitarias para el serializer de asignaciones."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass',
            numero_identificacion='12345678',
            first_name='Test',
            last_name='User',
            is_active=True,
        )
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)

    def test_institucion_obligatoria_para_autoridad_academica(self):
        """RV-006: Institución obligatoria para AUTORIDAD_ACADEMICA."""
        serializer = UsuarioRolSerializer(data={
            'usuario': self.usuario.id,
            'rol': self.rol_autoridad.id,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('institucion', serializer.errors)


class InstitucionDAOTest(TestCase):
    """Pruebas unitarias para el DAO de instituciones."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE DAO',
            codigo='UE-DAO',
            ruc='9999999999',
        )

    def test_obtener_por_id_existente(self):
        resultado = InstitucionDAO.obtener_por_id(self.institucion.id)
        self.assertEqual(resultado.id, self.institucion.id)

    def test_obtener_por_id_inexistente(self):
        resultado = InstitucionDAO.obtener_por_id(9999)
        self.assertIsNone(resultado)

    def test_tiene_dependencias_activas_false(self):
        """RI-001: Sin dependencias activas retorna False."""
        self.assertFalse(InstitucionDAO.tiene_dependencias_activas(self.institucion))


class InstitucionServicioTest(TestCase):
    """Pruebas unitarias para el servicio de instituciones."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE SRV',
            codigo='UE-SRV',
            ruc='8888888888',
        )
        self.usuario = Usuario.objects.create_user(
            username='srvuser',
            email='srv@example.com',
            password='srvpass',
            numero_identificacion='87654321',
            first_name='Srv',
            last_name='User',
            is_active=True,
        )
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)

    def test_eliminar_institucion_sin_dependencias(self):
        """RI-001: Eliminar institución sin dependencias es exitoso."""
        pk = self.institucion.id
        InstitucionServicio.eliminar(self.institucion)
        self.assertFalse(Institucion.objects.filter(id=pk).exists())

    def test_eliminar_institucion_con_dependencias_activas(self):
        """RI-001, D12: No se puede eliminar institución con dependencias activas."""
        UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        with self.assertRaises(InstitucionConDependenciasActivasError):
            InstitucionServicio.eliminar(self.institucion)

    def test_listar_con_paginacion(self):
        """RF-002: Listar con paginación retorna estructura correcta."""
        resultado = InstitucionServicio.listar(page=1, page_size=10, ordering='nombre', nombre=None)
        self.assertIn('count', resultado)
        self.assertIn('next', resultado)
        self.assertIn('previous', resultado)
        self.assertIn('results', resultado)


class UsuarioRolServicioTest(TestCase):
    """Pruebas unitarias para el servicio de asignaciones."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username='uruser',
            email='ur@example.com',
            password='urpass',
            numero_identificacion='11223344',
            first_name='UR',
            last_name='User',
            is_active=True,
        )
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE UR',
            codigo='UE-UR',
            ruc='7777777777',
        )

    def test_crear_asignacion_activa(self):
        asignacion = UsuarioRolServicio.crear({
            'usuario': self.usuario,
            'rol': self.rol_autoridad,
            'institucion': self.institucion,
            'es_activo': True,
        })
        self.assertTrue(asignacion.es_activo)
        self.assertIsNotNone(asignacion.fecha_desde)

    def test_crear_asignacion_duplicada(self):
        """RI-005, D6: No se permite asignación activa duplicada."""
        UsuarioRolServicio.crear({
            'usuario': self.usuario,
            'rol': self.rol_autoridad,
            'institucion': self.institucion,
            'es_activo': True,
        })
        with self.assertRaises(AsignacionDuplicadaError):
            UsuarioRolServicio.crear({
                'usuario': self.usuario,
                'rol': self.rol_autoridad,
                'institucion': self.institucion,
                'es_activo': True,
            })

    def test_cambiar_estado_a_inactivo(self):
        """RI-003: Desactivar registra fecha_hasta."""
        asignacion = UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        asignacion = UsuarioRolServicio.cambiar_estado(asignacion, False)
        self.assertFalse(asignacion.es_activo)
        self.assertIsNotNone(asignacion.fecha_hasta)

    def test_cambiar_estado_a_activo(self):
        """RI-002: Activar registra fecha_desde y limpia fecha_hasta."""
        asignacion = UsuarioRol.objects.create(
            usuario=self.usuario,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=False,
            fecha_hasta='2026-01-01',
        )
        asignacion = UsuarioRolServicio.cambiar_estado(asignacion, True)
        self.assertTrue(asignacion.es_activo)
        self.assertIsNone(asignacion.fecha_hasta)
        self.assertIsNotNone(asignacion.fecha_desde)


class InstitucionEndpointTest(TestCase):
    """Pruebas de integración para endpoints de instituciones."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_user(
            username='admin_test',
            email='admin_test@example.com',
            password='adminpass',
            numero_identificacion='00000001',
            first_name='Admin',
            last_name='Test',
            is_active=True,
        )
        self.autoridad_user = Usuario.objects.create_user(
            username='autoridad_test',
            email='autoridad_test@example.com',
            password='autoridadpass',
            numero_identificacion='00000002',
            first_name='Autoridad',
            last_name='Test',
            is_active=True,
        )
        self.rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE Endpoint',
            codigo='UE-EP',
            ruc='6666666666',
        )
        UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_admin,
            es_activo=True,
        )
        UsuarioRol.objects.create(
            usuario=self.autoridad_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        self.admin_token = Token.objects.create(user=self.admin_user)
        self.autoridad_token = Token.objects.create(user=self.autoridad_user)

    def test_listar_instituciones_como_admin(self):
        """RF-002: Admin puede listar instituciones."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/instituciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_listar_instituciones_sin_permiso(self):
        """RF-002: Autoridad académica no puede listar todas las instituciones."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get('/api/instituciones/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_crear_institucion_como_admin(self):
        """RF-003: Admin puede crear institución."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.post('/api/instituciones/', {
            'nombre': 'Nueva UE',
            'codigo': 'UE-NEW',
            'ruc': '5555555555',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Nueva UE')

    def test_obtener_detalle_como_admin(self):
        """Admin puede obtener detalle."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get(f'/api/instituciones/{self.institucion.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], self.institucion.nombre)

    def test_obtener_detalle_como_autoridad_propia(self):
        """RF-012, D7: Autoridad puede ver su institución asignada."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/instituciones/{self.institucion.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_actualizar_institucion_como_admin(self):
        """RF-004: Admin puede actualizar institución."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.patch(f'/api/instituciones/{self.institucion.id}/', {
            'nombre': 'UE Actualizada',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'UE Actualizada')

    def test_eliminar_institucion_con_dependencias(self):
        """RI-001, D12: No se puede eliminar institución con dependencias activas."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.delete(f'/api/instituciones/{self.institucion.id}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_eliminar_institucion_sin_dependencias(self):
        """RF-005: Eliminar institución sin dependencias retorna 204."""
        institucion_libre = Institucion.objects.create(
            nombre='UE Libre',
            codigo='UE-LIB',
            ruc='4444444444',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.delete(f'/api/instituciones/{institucion_libre.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_buscar_institucion_por_nombre(self):
        """RF-006, D10: Búsqueda case-insensitive por nombre."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/instituciones/?nombre=Endpoint')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_listar_instituciones_usuario(self):
        """RF-012: Listar instituciones del usuario autenticado."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get('/api/instituciones/usuario/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], self.institucion.nombre)


class UsuarioRolEndpointTest(TestCase):
    """Pruebas de integración para endpoints de asignaciones."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_user(
            username='admin_ur',
            email='admin_ur@example.com',
            password='adminpass',
            numero_identificacion='00000003',
            first_name='Admin',
            last_name='UR',
            is_active=True,
        )
        self.rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE UR Endpoint',
            codigo='UE-UR-EP',
            ruc='3333333333',
        )
        UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_admin,
            es_activo=True,
        )
        self.admin_token = Token.objects.create(user=self.admin_user)

    def test_crear_asignacion_autoridad_academica(self):
        """RF-008: Crear asignación de autoridad académica."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.post('/api/usuarioroles/', {
            'usuario': self.admin_user.id,
            'rol': self.rol_autoridad.id,
            'institucion': self.institucion.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rol']['nombre'], Rol.AUTORIDAD_ACADEMICA)

    def test_crear_asignacion_sin_institucion_para_autoridad(self):
        """RV-006: Error al crear autoridad académica sin institución."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.post('/api/usuarioroles/', {
            'usuario': self.admin_user.id,
            'rol': self.rol_autoridad.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('institucion', response.data)

    def test_listar_roles_activos_del_usuario(self):
        """D9: Endpoint de roles activos del usuario."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/usuarioroles/roles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], Rol.ADMINISTRADOR)

    def test_desactivar_asignacion(self):
        """RF-011: Desactivar asignación retorna estado inactivo."""
        asignacion = UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.patch(f'/api/usuarioroles/{asignacion.id}/estado/', {
            'es_activo': False,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['es_activo'])
        self.assertIsNotNone(response.data['fecha_hasta'])

    def test_activar_asignacion(self):
        """RF-011: Activar asignación retorna estado activo."""
        asignacion = UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=False,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.patch(f'/api/usuarioroles/{asignacion.id}/estado/', {
            'es_activo': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['es_activo'])
        self.assertIsNone(response.data['fecha_hasta'])

    def test_eliminar_asignacion(self):
        """RF-010: Eliminar asignación retorna 204."""
        asignacion = UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.delete(f'/api/usuarioroles/{asignacion.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_actualizar_usuario_en_asignacion(self):
        """RF-009: PATCH usuario en asignación existente cambia el usuario."""
        asignacion = UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        otro_usuario = Usuario.objects.create_user(
            username='otro_user',
            email='otro@example.com',
            password='otropass',
            numero_identificacion='00000999',
            first_name='Otro',
            last_name='Usuario',
            is_active=True,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.patch(f'/api/usuarioroles/{asignacion.id}/', {
            'usuario': otro_usuario.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['usuario']['id'], otro_usuario.id)


class UsuariosEndpointTest(TestCase):
    """Pruebas de integración para el endpoint de usuarios en core."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_user(
            username='admin_users',
            email='admin_users@example.com',
            password='adminpass',
            numero_identificacion='00000004',
            first_name='Admin',
            last_name='Users',
            is_active=True,
        )
        self.inactive_user = Usuario.objects.create_user(
            username='inactive_user',
            email='inactive@example.com',
            password='inactivepass',
            numero_identificacion='00000005',
            first_name='Inactive',
            last_name='User',
            is_active=False,
        )
        self.rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        UsuarioRol.objects.create(
            usuario=self.admin_user,
            rol=self.rol_admin,
            es_activo=True,
        )
        self.admin_token = Token.objects.create(user=self.admin_user)

    def test_listar_usuarios_como_admin(self):
        """Admin puede listar usuarios."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_listar_usuarios_activos(self):
        """D13: Filtrar usuarios por activo=true."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/usuarios/?activo=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for usuario in response.data:
            self.assertTrue(usuario['is_active'])

    def test_listar_usuarios_inactivos(self):
        """Filtrar usuarios por activo=false."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/usuarios/?activo=false')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for usuario in response.data:
            self.assertFalse(usuario['is_active'])

    def test_listar_usuarios_sin_autenticacion(self):
        """Endpoint requiere autenticación."""
        response = self.client.get('/api/usuarios/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
