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
from apps.organizacion.apis.serializers.asignatura_serializer import (
    AsignaturaListSerializer,
    AsignaturaWriteSerializer,
)
from apps.organizacion.apis.serializers.educacionnivel_serializer import EducacionNivelSerializer
from apps.organizacion.apis.serializers.gradoescolar_serializer import (
    GradoEscolarListSerializer,
    GradoEscolarWriteSerializer,
)
from apps.organizacion.apis.serializers.planestudio_serializer import (
    PlanEstudioListSerializer,
    PlanEstudioWriteSerializer,
)
from apps.organizacion.daos.asignatura_dao import AsignaturaDAO
from apps.organizacion.daos.gradoescolar_dao import GradoEscolarDAO
from apps.organizacion.daos.planestudio_dao import PlanEstudioDAO
from apps.organizacion.excepciones import (
    GradoConAsignaturasAsociadasError,
    PlanConGradosAsociadosError,
    PlanVigenteExistenteError,
    SubnivelRequeridoError,
)
from apps.organizacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)
from apps.organizacion.servicios.asignatura_servicio import AsignaturaServicio
from apps.organizacion.servicios.gradoescolar_servicio import GradoEscolarServicio
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio
from apps.organizacion.servicios.planestudio_servicio import PlanEstudioServicio
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


class PlanEstudioModelTest(TestCase):
    """Pruebas unitarias para el modelo PlanEstudio."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE Plan',
            codigo='UE-PLN',
            ruc='1111111111',
        )

    def test_crear_plan_estudio(self):
        plan = PlanEstudio.objects.create(
            nombre='Plan 2026',
            es_activo=True,
            institucion=self.institucion,
        )
        self.assertEqual(plan.nombre, 'Plan 2026')
        self.assertTrue(plan.es_activo)

    def test_unicidad_nombre_por_institucion(self):
        PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        with self.assertRaises(Exception):
            PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)

    def test_unicidad_activo_por_institucion(self):
        PlanEstudio.objects.create(nombre='Plan A', es_activo=True, institucion=self.institucion)
        with self.assertRaises(Exception):
            PlanEstudio.objects.create(nombre='Plan B', es_activo=True, institucion=self.institucion)


class GradoEscolarModelTest(TestCase):
    """Pruebas unitarias para el modelo GradoEscolar."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE Grado',
            codigo='UE-GRD',
            ruc='2222222222',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )

    def test_crear_grado(self):
        grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )
        self.assertEqual(grado.nombre, 'Primero')

    def test_unicidad_nombre_por_plan(self):
        GradoEscolar.objects.create(nombre='Primero', orden=1, plan_estudio=self.plan, nivel=self.nivel)
        with self.assertRaises(Exception):
            GradoEscolar.objects.create(nombre='Primero', orden=2, plan_estudio=self.plan, nivel=self.nivel)


class AsignaturaModelTest(TestCase):
    """Pruebas unitarias para el modelo Asignatura."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE Asig',
            codigo='UE-ASG',
            ruc='3333333333',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )

    def test_crear_asignatura(self):
        asig = Asignatura.objects.create(
            nombre='Matemáticas',
            pp_semana_minimo=5,
            grado_escolar=self.grado,
        )
        self.assertEqual(asig.nombre, 'Matemáticas')

    def test_unicidad_nombre_por_grado(self):
        Asignatura.objects.create(nombre='Matemáticas', pp_semana_minimo=5, grado_escolar=self.grado)
        with self.assertRaises(Exception):
            Asignatura.objects.create(nombre='Matemáticas', pp_semana_minimo=4, grado_escolar=self.grado)


class PlanEstudioDAOTest(TestCase):
    """Pruebas unitarias para PlanEstudioDAO."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE DAO',
            codigo='UE-DAO',
            ruc='4444444444',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan DAO', institucion=self.institucion)

    def test_obtener_por_id(self):
        result = PlanEstudioDAO.obtener_por_id(self.plan.id)
        self.assertEqual(result.id, self.plan.id)

    def test_existe_nombre(self):
        self.assertTrue(PlanEstudioDAO.existe_nombre_by_institucion('Plan DAO', self.institucion.id))

    def test_existe_activo(self):
        self.plan.es_activo = True
        self.plan.save()
        self.assertTrue(PlanEstudioDAO.existe_activo_by_institucion(self.institucion.id))

    def test_tiene_grados_false(self):
        self.assertFalse(PlanEstudioDAO.tiene_grados_asociados(self.plan))


class GradoEscolarDAOTest(TestCase):
    """Pruebas unitarias para GradoEscolarDAO."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE DAO2',
            codigo='UE-DAO2',
            ruc='5555555555',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )

    def test_existe_nombre_by_plan(self):
        self.assertTrue(GradoEscolarDAO.existe_nombre_by_plan('Primero', self.plan.id))

    def test_tiene_asignaturas_false(self):
        self.assertFalse(GradoEscolarDAO.tiene_asignaturas_asociadas(self.grado))


class AsignaturaDAOTest(TestCase):
    """Pruebas unitarias para AsignaturaDAO."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE DAO3',
            codigo='UE-DAO3',
            ruc='6666666666',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )
        self.asignatura = Asignatura.objects.create(
            nombre='Matemáticas',
            pp_semana_minimo=5,
            grado_escolar=self.grado,
        )

    def test_existe_nombre_by_grado(self):
        self.assertTrue(AsignaturaDAO.existe_nombre_by_grado('Matemáticas', self.grado.id))

    def test_listar_por_grado(self):
        resultados = AsignaturaDAO.listar_por_grado(self.grado.id)
        self.assertEqual(len(resultados), 1)


class PlanEstudioServicioTest(TestCase):
    """Pruebas unitarias para PlanEstudioServicio."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE SRV',
            codigo='UE-SRV',
            ruc='7777777777',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan SRV', institucion=self.institucion)

    def test_crear_plan_activo_unico(self):
        PlanEstudio.objects.create(nombre='Plan A', es_activo=True, institucion=self.institucion)
        with self.assertRaises(PlanVigenteExistenteError):
            PlanEstudioServicio.crear({'nombre': 'Plan B', 'es_activo': True, 'institucion': self.institucion})

    def test_eliminar_plan_con_grados(self):
        nivel = EducacionNivel.objects.create(nombre='Primaria', pp_minutos=40, pp_semana_minimo=25)
        GradoEscolar.objects.create(nombre='Primero', orden=1, plan_estudio=self.plan, nivel=nivel)
        with self.assertRaises(PlanConGradosAsociadosError):
            PlanEstudioServicio.eliminar(self.plan)

    def test_actualizar_a_activo_conflict(self):
        PlanEstudio.objects.create(nombre='Plan B', es_activo=True, institucion=self.institucion)
        with self.assertRaises(PlanVigenteExistenteError):
            PlanEstudioServicio.actualizar(self.plan, {'es_activo': True})


class GradoEscolarServicioTest(TestCase):
    """Pruebas unitarias para GradoEscolarServicio."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE GRD',
            codigo='UE-GRD',
            ruc='8888888888',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.subnivel = EducacionSubNivel.objects.create(
            nombre='Ciclo 1',
            pp_semana_minimo=22,
            educacion_nivel=self.nivel,
        )

    def test_subnivel_requerido(self):
        with self.assertRaises(SubnivelRequeridoError):
            GradoEscolarServicio.crear({'nombre': 'Primero', 'orden': 1, 'plan_estudio': self.plan, 'nivel': self.nivel})

    def test_carga_pedagogica_alerta(self):
        grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
            subnivel=self.subnivel,
        )
        Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=grado)
        result = GradoEscolarServicio.calcular_carga_pedagogica(grado)
        self.assertEqual(result['carga_pedagogica_actual'], 5)
        self.assertEqual(result['carga_pedagogica_minima'], 22)
        self.assertTrue(result['alerta_carga_pedagogica'])

    def test_eliminar_grado_con_asignaturas(self):
        grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )
        Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=grado)
        with self.assertRaises(GradoConAsignaturasAsociadasError):
            GradoEscolarServicio.eliminar(grado)


class AsignaturaServicioTest(TestCase):
    """Pruebas unitarias para AsignaturaServicio."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE ASG',
            codigo='UE-ASG',
            ruc='9999999999',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )

    def test_crear_asignatura(self):
        asig = AsignaturaServicio.crear({'nombre': 'Mat', 'pp_semana_minimo': 5, 'grado_escolar': self.grado})
        self.assertEqual(asig.nombre, 'Mat')


class PlanEstudioSerializerTest(TestCase):
    """Pruebas unitarias para PlanEstudioSerializer."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE SER',
            codigo='UE-SER',
            ruc='0000000001',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)

    def test_nombre_unico_en_creacion(self):
        serializer = PlanEstudioWriteSerializer(data={
            'nombre': 'Plan A',
            'es_activo': False,
            'institucion': self.institucion.id,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)

    def test_nombre_unico_en_edicion_excluye_instancia(self):
        serializer = PlanEstudioWriteSerializer(
            self.plan,
            data={'nombre': 'Plan A'},
            partial=True,
        )
        self.assertTrue(serializer.is_valid())

    def test_campos_obligatorios(self):
        serializer = PlanEstudioWriteSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)
        self.assertIn('institucion', serializer.errors)


class GradoEscolarSerializerTest(TestCase):
    """Pruebas unitarias para GradoEscolarSerializer."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE SER2',
            codigo='UE-SER2',
            ruc='0000000002',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.subnivel = EducacionSubNivel.objects.create(
            nombre='Ciclo 1',
            pp_semana_minimo=22,
            educacion_nivel=self.nivel,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
            subnivel=self.subnivel,
        )

    def test_nombre_unico_en_creacion(self):
        serializer = GradoEscolarWriteSerializer(data={
            'nombre': 'Primero',
            'orden': 2,
            'plan_estudio': self.plan.id,
            'nivel': self.nivel.id,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)

    def test_subnivel_requerido(self):
        serializer = GradoEscolarWriteSerializer(data={
            'nombre': 'Segundo',
            'orden': 2,
            'plan_estudio': self.plan.id,
            'nivel': self.nivel.id,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('subnivel', serializer.errors)

    def test_carga_pedagogica_computed(self):
        serializer = GradoEscolarListSerializer(self.grado)
        self.assertEqual(serializer.data['carga_pedagogica_minima'], 22)
        self.assertEqual(serializer.data['carga_pedagogica_actual'], 0)
        self.assertTrue(serializer.data['alerta_carga_pedagogica'])


class AsignaturaSerializerTest(TestCase):
    """Pruebas unitarias para AsignaturaSerializer."""

    def setUp(self):
        self.institucion = Institucion.objects.create(
            nombre='UE SER3',
            codigo='UE-SER3',
            ruc='0000000003',
        )
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )
        self.asignatura = Asignatura.objects.create(
            nombre='Matemáticas',
            pp_semana_minimo=5,
            grado_escolar=self.grado,
        )

    def test_nombre_unico_en_creacion(self):
        serializer = AsignaturaWriteSerializer(data={
            'nombre': 'Matemáticas',
            'pp_semana_minimo': 4,
            'grado_escolar': self.grado.id,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)

    def test_campos_obligatorios(self):
        serializer = AsignaturaWriteSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)
        self.assertIn('pp_semana_minimo', serializer.errors)
        self.assertIn('grado_escolar', serializer.errors)


class EducacionNivelSerializerTest(TestCase):
    """Pruebas unitarias para EducacionNivelSerializer."""

    def setUp(self):
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.subnivel = EducacionSubNivel.objects.create(
            nombre='Ciclo 1',
            pp_semana_minimo=22,
            educacion_nivel=self.nivel,
        )

    def test_nivel_con_subniveles(self):
        serializer = EducacionNivelSerializer(self.nivel)
        self.assertEqual(len(serializer.data['subniveles']), 1)
        self.assertEqual(serializer.data['subniveles'][0]['nombre'], 'Ciclo 1')


class PlanEstudioEndpointTest(TestCase):
    """Pruebas de integración para endpoints de planes de estudio."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_user(
            username='admin_plan',
            email='admin_plan@example.com',
            password='adminpass',
            numero_identificacion='00000010',
            first_name='Admin',
            last_name='Plan',
            is_active=True,
        )
        self.autoridad_user = Usuario.objects.create_user(
            username='autoridad_plan',
            email='autoridad_plan@example.com',
            password='autoridadpass',
            numero_identificacion='00000011',
            first_name='Autoridad',
            last_name='Plan',
            is_active=True,
        )
        self.rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE Plan EP',
            codigo='UE-PL-EP',
            ruc='1010101010',
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

    def test_listar_planes_como_autoridad(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/planes-estudio/instituciones/{self.institucion.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_crear_plan_como_autoridad(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.post('/api/planes-estudio/', {
            'nombre': 'Plan Nuevo',
            'es_activo': False,
            'institucion': self.institucion.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Plan Nuevo')

    def test_crear_plan_activo_conflict(self):
        PlanEstudio.objects.create(nombre='Plan A', es_activo=True, institucion=self.institucion)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.post('/api/planes-estudio/', {
            'nombre': 'Plan B',
            'es_activo': True,
            'institucion': self.institucion.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('non_field_errors', response.data)

    def test_eliminar_plan_con_grados(self):
        plan = PlanEstudio.objects.create(nombre='Plan Del', institucion=self.institucion)
        nivel = EducacionNivel.objects.create(nombre='Primaria', pp_minutos=40, pp_semana_minimo=25)
        GradoEscolar.objects.create(nombre='Primero', orden=1, plan_estudio=plan, nivel=nivel)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.delete(f'/api/planes-estudio/{plan.id}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_obtener_detalle_plan(self):
        plan = PlanEstudio.objects.create(nombre='Plan Det', institucion=self.institucion)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/planes-estudio/{plan.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Plan Det')

    def test_actualizar_plan(self):
        plan = PlanEstudio.objects.create(nombre='Plan Upd', institucion=self.institucion)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.patch(f'/api/planes-estudio/{plan.id}/', {
            'nombre': 'Plan Actualizado',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Plan Actualizado')

    def test_acceso_denegado_otra_institucion(self):
        otra_institucion = Institucion.objects.create(
            nombre='UE Otra',
            codigo='UE-OTR',
            ruc='2020202020',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/planes-estudio/instituciones/{otra_institucion.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class GradoEscolarEndpointTest(TestCase):
    """Pruebas de integración para endpoints de grados escolares."""

    def setUp(self):
        self.client = APIClient()
        self.autoridad_user = Usuario.objects.create_user(
            username='autoridad_grado',
            email='autoridad_grado@example.com',
            password='autoridadpass',
            numero_identificacion='00000012',
            first_name='Autoridad',
            last_name='Grado',
            is_active=True,
        )
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE Grado EP',
            codigo='UE-GR-EP',
            ruc='3030303030',
        )
        UsuarioRol.objects.create(
            usuario=self.autoridad_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        self.autoridad_token = Token.objects.create(user=self.autoridad_user)
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.subnivel = EducacionSubNivel.objects.create(
            nombre='Ciclo 1',
            pp_semana_minimo=22,
            educacion_nivel=self.nivel,
        )

    def test_listar_grados(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/grados-escolares/planes-estudio/{self.plan.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_crear_grado_sin_subnivel(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.post('/api/grados-escolares/', {
            'nombre': 'Primero',
            'orden': 1,
            'plan_estudio': self.plan.id,
            'nivel': self.nivel.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subnivel', response.data)

    def test_crear_grado_con_subnivel(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.post('/api/grados-escolares/', {
            'nombre': 'Primero',
            'orden': 1,
            'plan_estudio': self.plan.id,
            'nivel': self.nivel.id,
            'subnivel': self.subnivel.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_eliminar_grado_con_asignaturas(self):
        grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )
        Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=grado)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.delete(f'/api/grados-escolares/{grado.id}/')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_obtener_detalle_grado(self):
        grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
            subnivel=self.subnivel,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/grados-escolares/{grado.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Primero')

    def test_actualizar_grado(self):
        grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
            subnivel=self.subnivel,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.patch(f'/api/grados-escolares/{grado.id}/', {
            'nombre': 'Segundo',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Segundo')


class AsignaturaEndpointTest(TestCase):
    """Pruebas de integración para endpoints de asignaturas."""

    def setUp(self):
        self.client = APIClient()
        self.autoridad_user = Usuario.objects.create_user(
            username='autoridad_asig',
            email='autoridad_asig@example.com',
            password='autoridadpass',
            numero_identificacion='00000013',
            first_name='Autoridad',
            last_name='Asig',
            is_active=True,
        )
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = Institucion.objects.create(
            nombre='UE Asig EP',
            codigo='UE-AS-EP',
            ruc='4040404040',
        )
        UsuarioRol.objects.create(
            usuario=self.autoridad_user,
            rol=self.rol_autoridad,
            institucion=self.institucion,
            es_activo=True,
        )
        self.autoridad_token = Token.objects.create(user=self.autoridad_user)
        self.plan = PlanEstudio.objects.create(nombre='Plan A', institucion=self.institucion)
        self.nivel = EducacionNivel.objects.create(
            nombre='Primaria',
            pp_minutos=40,
            pp_semana_minimo=25,
        )
        self.grado = GradoEscolar.objects.create(
            nombre='Primero',
            orden=1,
            plan_estudio=self.plan,
            nivel=self.nivel,
        )

    def test_listar_asignaturas(self):
        Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=self.grado)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/asignaturas/grados-escolares/{self.grado.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_crear_asignatura(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.post('/api/asignaturas/', {
            'nombre': 'Matemáticas',
            'pp_semana_minimo': 5,
            'grado_escolar': self.grado.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Matemáticas')

    def test_obtener_detalle_asignatura(self):
        asig = Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=self.grado)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.get(f'/api/asignaturas/{asig.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Mat')

    def test_actualizar_asignatura(self):
        asig = Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=self.grado)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.patch(f'/api/asignaturas/{asig.id}/', {
            'nombre': 'Matemáticas Avanzadas',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Matemáticas Avanzadas')

    def test_eliminar_asignatura(self):
        asig = Asignatura.objects.create(nombre='Mat', pp_semana_minimo=5, grado_escolar=self.grado)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.autoridad_token.key}')
        response = self.client.delete(f'/api/asignaturas/{asig.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class EducacionNivelEndpointTest(TestCase):
    """Pruebas de integración para endpoint de niveles educativos."""

    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            username='user_nivel',
            email='user_nivel@example.com',
            password='userpass',
            numero_identificacion='00000014',
            first_name='User',
            last_name='Nivel',
            is_active=True,
        )
        Token.objects.create(user=self.user)

    def test_listar_niveles_autenticado(self):
        EducacionNivel.objects.create(nombre='Primaria', pp_minutos=40, pp_semana_minimo=25)
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/educacion-niveles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_listar_niveles_sin_autenticacion(self):
        response = self.client.get('/api/educacion-niveles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
