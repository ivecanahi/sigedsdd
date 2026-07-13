from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.organizacion.apis.serializers.institucion_serializer import (
    InstitucionListSerializer,
    InstitucionSerializer,
    RolNestedSerializer,
)
from apps.organizacion.apis.serializers.usuariorol_serializer import UsuarioRolSerializer
from apps.organizacion.excepciones import (
    AsignacionDuplicadaError,
    InstitucionConDependenciasActivasError,
)
from apps.organizacion.models import Rol
from apps.organizacion.permisos import (
    EsAdministrador,
    EsAdministradorOAutoridadAcademicaDeInstitucion,
)
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio
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


class UsuarioRolRolesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = UsuarioRolServicio.listar_roles_activos_por_usuario(request.user)
        serializer = RolNestedSerializer(roles, many=True)
        return Response(serializer.data)
