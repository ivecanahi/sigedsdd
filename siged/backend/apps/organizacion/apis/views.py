from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.organizacion.apis.serializers.asignatura_serializer import (
    AsignaturaDetailSerializer,
    AsignaturaListSerializer,
    AsignaturaWriteSerializer,
)
from apps.organizacion.apis.serializers.educacionnivel_serializer import EducacionNivelSerializer
from apps.organizacion.apis.serializers.gradoescolar_serializer import (
    GradoEscolarDetailSerializer,
    GradoEscolarListSerializer,
    GradoEscolarWriteSerializer,
)
from apps.organizacion.apis.serializers.institucion_serializer import (
    InstitucionListSerializer,
    InstitucionSerializer,
    RolNestedSerializer,
)
from apps.organizacion.apis.serializers.planestudio_serializer import (
    PlanEstudioDetailSerializer,
    PlanEstudioListSerializer,
    PlanEstudioWriteSerializer,
)
from apps.organizacion.apis.serializers.usuariorol_serializer import UsuarioRolSerializer
from apps.organizacion.excepciones import (
    AsignacionDuplicadaError,
    GradoConAsignaturasAsociadasError,
    InstitucionConDependenciasActivasError,
    PlanConGradosAsociadosError,
    PlanVigenteExistenteError,
    SubnivelRequeridoError,
)
from apps.organizacion.models import Rol
from apps.organizacion.permisos import (
    EsAdministrador,
    EsAdministradorOAutoridadAcademicaDeInstitucion,
    EsAutoridadAcademicaDeInstitucion,
)
from apps.organizacion.servicios.asignatura_servicio import AsignaturaServicio
from apps.organizacion.servicios.educacionnivel_servicio import EducacionNivelServicio
from apps.organizacion.servicios.gradoescolar_servicio import GradoEscolarServicio
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio
from apps.organizacion.servicios.planestudio_servicio import PlanEstudioServicio
from apps.organizacion.servicios.usuariorol_servicio import UsuarioRolServicio


class InstitucionListCreateView(APIView):
    permission_classes = [IsAuthenticated, EsAdministrador]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        ordering = request.query_params.get('ordering', 'nombre')
        nombre = request.query_params.get('nombre', None)

        resultado = InstitucionServicio.listar(page, page_size, ordering, nombre)
        serializer = InstitucionListSerializer(resultado['results'], many=True)

        # Build pagination URLs to match contract (null or URL string)
        base_url = request.build_absolute_uri().split('?')[0]
        query_params = request.query_params.copy()

        next_url = None
        if resultado['next']:
            query_params['page'] = page + 1
            next_url = f"{base_url}?{query_params.urlencode()}"

        previous_url = None
        if resultado['previous']:
            query_params['page'] = page - 1
            previous_url = f"{base_url}?{query_params.urlencode()}"

        return Response({
            'count': resultado['count'],
            'next': next_url,
            'previous': previous_url,
            'results': serializer.data,
        })

    def post(self, request):
        serializer = InstitucionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        institucion = InstitucionServicio.crear(serializer.validated_data)
        return Response(
            InstitucionSerializer(institucion).data,
            status=status.HTTP_201_CREATED,
        )


class InstitucionDetailUpdateDeleteView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated(), EsAdministradorOAutoridadAcademicaDeInstitucion()]
        return [IsAuthenticated(), EsAdministrador()]

    def get(self, request, pk):
        institucion = InstitucionServicio.obtener(pk)
        if not institucion:
            return Response(
                {'detail': 'No encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, institucion)
        return Response(InstitucionSerializer(institucion).data)

    def patch(self, request, pk):
        institucion = InstitucionServicio.obtener(pk)
        if not institucion:
            return Response(
                {'detail': 'No encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, institucion)
        serializer = InstitucionSerializer(
            institucion,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        institucion = InstitucionServicio.actualizar(
            institucion,
            serializer.validated_data,
        )
        return Response(InstitucionSerializer(institucion).data)

    def delete(self, request, pk):
        institucion = InstitucionServicio.obtener(pk)
        if not institucion:
            return Response(
                {'detail': 'No encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        self.check_object_permissions(request, institucion)
        try:
            InstitucionServicio.eliminar(institucion)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except InstitucionConDependenciasActivasError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_409_CONFLICT,
            )


class InstitucionUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        instituciones = InstitucionServicio.listar_por_usuario(request.user)
        serializer = InstitucionSerializer(instituciones, many=True)
        return Response(serializer.data)


class UsuarioRolListCreateView(APIView):
    permission_classes = [IsAuthenticated, EsAdministrador]

    def get(self, request):
        institucion_id = request.query_params.get('institucion', None)
        asignaciones = UsuarioRolServicio.listar(institucion_id)
        serializer = UsuarioRolSerializer(asignaciones, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UsuarioRolSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            asignacion = UsuarioRolServicio.crear(serializer.validated_data)
        except AsignacionDuplicadaError as e:
            return Response(
                {'non_field_errors': [str(e)]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            UsuarioRolSerializer(asignacion).data,
            status=status.HTTP_201_CREATED,
        )


class UsuarioRolDetailUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated, EsAdministrador]

    def patch(self, request, pk):
        asignacion = UsuarioRolServicio.obtener(pk)
        if not asignacion:
            return Response(
                {'detail': 'No encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UsuarioRolSerializer(
            asignacion,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            asignacion = UsuarioRolServicio.actualizar(
                asignacion,
                serializer.validated_data,
            )
        except AsignacionDuplicadaError as e:
            return Response(
                {'non_field_errors': [str(e)]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(UsuarioRolSerializer(asignacion).data)

    def delete(self, request, pk):
        asignacion = UsuarioRolServicio.obtener(pk)
        if not asignacion:
            return Response(
                {'detail': 'No encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        UsuarioRolServicio.eliminar(asignacion)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UsuarioRolToggleView(APIView):
    permission_classes = [IsAuthenticated, EsAdministrador]

    def patch(self, request, pk):
        asignacion = UsuarioRolServicio.obtener(pk)
        if not asignacion:
            return Response(
                {'detail': 'No encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        es_activo = request.data.get('es_activo')
        if es_activo is None:
            return Response(
                {'es_activo': 'Este campo es obligatorio.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            asignacion = UsuarioRolServicio.cambiar_estado(
                asignacion,
                es_activo,
            )
        except AsignacionDuplicadaError as e:
            return Response(
                {'non_field_errors': [str(e)]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(UsuarioRolSerializer(asignacion).data)


class RolListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = Rol.objects.all().order_by('nombre')
        serializer = RolNestedSerializer(roles, many=True)
        return Response(serializer.data)


class UsuarioRolRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = UsuarioRolServicio.listar_roles_activos_por_usuario(request.user)
        serializer = RolNestedSerializer(roles, many=True)
        return Response(serializer.data)


class PlanEstudioListView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def get(self, request, institucion_id):
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        ordering = request.query_params.get('ordering', 'nombre')
        nombre = request.query_params.get('nombre', None)

        resultado = PlanEstudioServicio.listar(page, page_size, ordering, nombre, institucion_id)
        serializer = PlanEstudioListSerializer(resultado['results'], many=True)

        base_url = request.build_absolute_uri().split('?')[0]
        query_params = request.query_params.copy()

        next_url = None
        if resultado['next']:
            query_params['page'] = page + 1
            next_url = f"{base_url}?{query_params.urlencode()}"

        previous_url = None
        if resultado['previous']:
            query_params['page'] = page - 1
            previous_url = f"{base_url}?{query_params.urlencode()}"

        return Response({
            'count': resultado['count'],
            'next': next_url,
            'previous': previous_url,
            'results': serializer.data,
        })


class PlanEstudioCreateView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def post(self, request):
        serializer = PlanEstudioWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            plan = PlanEstudioServicio.crear(serializer.validated_data)
        except PlanVigenteExistenteError as e:
            return Response(
                {'non_field_errors': [str(e)]},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(
            PlanEstudioListSerializer(plan).data,
            status=status.HTTP_201_CREATED,
        )


class PlanEstudioDetailUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def get(self, request, pk):
        plan = PlanEstudioServicio.obtener(pk)
        if not plan:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, plan)
        return Response(PlanEstudioDetailSerializer(plan).data)

    def patch(self, request, pk):
        plan = PlanEstudioServicio.obtener(pk)
        if not plan:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, plan)
        serializer = PlanEstudioWriteSerializer(plan, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            plan = PlanEstudioServicio.actualizar(plan, serializer.validated_data)
        except PlanVigenteExistenteError as e:
            return Response(
                {'non_field_errors': [str(e)]},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(PlanEstudioListSerializer(plan).data)

    def delete(self, request, pk):
        plan = PlanEstudioServicio.obtener(pk)
        if not plan:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, plan)
        try:
            PlanEstudioServicio.eliminar(plan)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PlanConGradosAsociadosError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_409_CONFLICT,
            )


class GradoEscolarListView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def get(self, request, plan_estudio_id):
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        ordering = request.query_params.get('ordering', 'orden')
        nombre = request.query_params.get('nombre', None)

        resultado = GradoEscolarServicio.listar(page, page_size, ordering, nombre, plan_estudio_id)
        serializer = GradoEscolarListSerializer(resultado['results'], many=True)

        base_url = request.build_absolute_uri().split('?')[0]
        query_params = request.query_params.copy()

        next_url = None
        if resultado['next']:
            query_params['page'] = page + 1
            next_url = f"{base_url}?{query_params.urlencode()}"

        previous_url = None
        if resultado['previous']:
            query_params['page'] = page - 1
            previous_url = f"{base_url}?{query_params.urlencode()}"

        return Response({
            'count': resultado['count'],
            'next': next_url,
            'previous': previous_url,
            'results': serializer.data,
        })


class GradoEscolarCreateView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def post(self, request):
        serializer = GradoEscolarWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        grado = GradoEscolarServicio.crear(serializer.validated_data)
        return Response(
            GradoEscolarListSerializer(grado).data,
            status=status.HTTP_201_CREATED,
        )


class GradoEscolarDetailUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def get(self, request, pk):
        grado = GradoEscolarServicio.obtener(pk)
        if not grado:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, grado)
        return Response(GradoEscolarDetailSerializer(grado).data)

    def patch(self, request, pk):
        grado = GradoEscolarServicio.obtener(pk)
        if not grado:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, grado)
        serializer = GradoEscolarWriteSerializer(grado, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            grado = GradoEscolarServicio.actualizar(grado, serializer.validated_data)
        except SubnivelRequeridoError as e:
            return Response(
                {'subnivel': [str(e)]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(GradoEscolarListSerializer(grado).data)

    def delete(self, request, pk):
        grado = GradoEscolarServicio.obtener(pk)
        if not grado:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, grado)
        try:
            GradoEscolarServicio.eliminar(grado)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except GradoConAsignaturasAsociadasError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_409_CONFLICT,
            )


class AsignaturaListView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def get(self, request, grado_escolar_id):
        asignaturas = AsignaturaServicio.listar_por_grado(grado_escolar_id)
        serializer = AsignaturaListSerializer(asignaturas, many=True)
        return Response(serializer.data)


class AsignaturaCreateView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def post(self, request):
        serializer = AsignaturaWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        asignatura = AsignaturaServicio.crear(serializer.validated_data)
        return Response(
            AsignaturaListSerializer(asignatura).data,
            status=status.HTTP_201_CREATED,
        )


class AsignaturaDetailUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated, EsAutoridadAcademicaDeInstitucion]

    def get(self, request, pk):
        asignatura = AsignaturaServicio.obtener(pk)
        if not asignatura:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, asignatura)
        return Response(AsignaturaDetailSerializer(asignatura).data)

    def patch(self, request, pk):
        asignatura = AsignaturaServicio.obtener(pk)
        if not asignatura:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, asignatura)
        serializer = AsignaturaWriteSerializer(asignatura, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        asignatura = AsignaturaServicio.actualizar(asignatura, serializer.validated_data)
        return Response(AsignaturaListSerializer(asignatura).data)

    def delete(self, request, pk):
        asignatura = AsignaturaServicio.obtener(pk)
        if not asignatura:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, asignatura)
        AsignaturaServicio.eliminar(asignatura)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EducacionNivelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        niveles = EducacionNivelServicio.listar()
        serializer = EducacionNivelSerializer(niveles, many=True)
        return Response(serializer.data)
