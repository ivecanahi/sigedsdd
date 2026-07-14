from rest_framework import serializers

from apps.organizacion.models import EducacionNivel, EducacionSubNivel, GradoEscolar, PlanEstudio
from apps.organizacion.apis.serializers.educacionnivel_serializer import (
    EducacionNivelDetailNestedSerializer,
    EducacionNivelNestedSerializer,
)
from apps.organizacion.apis.serializers.educacionsubnivel_serializer import (
    EducacionSubNivelDetailNestedSerializer,
    EducacionSubNivelNestedSerializer,
)
from apps.organizacion.apis.serializers.planestudio_serializer import PlanEstudioNestedSerializer
from apps.organizacion.servicios.gradoescolar_servicio import GradoEscolarServicio


class GradoEscolarNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradoEscolar
        fields = ('id', 'nombre', 'orden')


class GradoEscolarListSerializer(serializers.ModelSerializer):
    nivel = EducacionNivelNestedSerializer(read_only=True)
    subnivel = EducacionSubNivelNestedSerializer(read_only=True)
    alerta_carga_pedagogica = serializers.SerializerMethodField()
    carga_pedagogica_actual = serializers.SerializerMethodField()
    carga_pedagogica_minima = serializers.SerializerMethodField()

    class Meta:
        model = GradoEscolar
        fields = (
            'id',
            'nombre',
            'orden',
            'plan_estudio',
            'nivel',
            'subnivel',
            'alerta_carga_pedagogica',
            'carga_pedagogica_actual',
            'carga_pedagogica_minima',
            'fecha_creacion',
            'fecha_actualizacion',
        )

    def get_alerta_carga_pedagogica(self, obj):
        return GradoEscolarServicio.calcular_carga_pedagogica(obj)['alerta_carga_pedagogica']

    def get_carga_pedagogica_actual(self, obj):
        return GradoEscolarServicio.calcular_carga_pedagogica(obj)['carga_pedagogica_actual']

    def get_carga_pedagogica_minima(self, obj):
        return GradoEscolarServicio.calcular_carga_pedagogica(obj)['carga_pedagogica_minima']


class GradoEscolarDetailSerializer(serializers.ModelSerializer):
    plan_estudio = PlanEstudioNestedSerializer(read_only=True)
    nivel = EducacionNivelDetailNestedSerializer(read_only=True)
    subnivel = EducacionSubNivelDetailNestedSerializer(read_only=True)
    alerta_carga_pedagogica = serializers.SerializerMethodField()
    carga_pedagogica_actual = serializers.SerializerMethodField()
    carga_pedagogica_minima = serializers.SerializerMethodField()

    class Meta:
        model = GradoEscolar
        fields = (
            'id',
            'nombre',
            'orden',
            'plan_estudio',
            'nivel',
            'subnivel',
            'alerta_carga_pedagogica',
            'carga_pedagogica_actual',
            'carga_pedagogica_minima',
            'fecha_creacion',
            'fecha_actualizacion',
        )

    def get_alerta_carga_pedagogica(self, obj):
        return GradoEscolarServicio.calcular_carga_pedagogica(obj)['alerta_carga_pedagogica']

    def get_carga_pedagogica_actual(self, obj):
        return GradoEscolarServicio.calcular_carga_pedagogica(obj)['carga_pedagogica_actual']

    def get_carga_pedagogica_minima(self, obj):
        return GradoEscolarServicio.calcular_carga_pedagogica(obj)['carga_pedagogica_minima']


class GradoEscolarWriteSerializer(serializers.ModelSerializer):
    plan_estudio = serializers.PrimaryKeyRelatedField(queryset=PlanEstudio.objects.all())
    nivel = serializers.PrimaryKeyRelatedField(queryset=EducacionNivel.objects.all())
    subnivel = serializers.PrimaryKeyRelatedField(
        queryset=EducacionSubNivel.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = GradoEscolar
        fields = (
            'id',
            'nombre',
            'orden',
            'plan_estudio',
            'nivel',
            'subnivel',
            'fecha_creacion',
            'fecha_actualizacion',
        )

    def validate_nombre(self, value):
        plan_estudio = self.initial_data.get('plan_estudio')
        if not plan_estudio and self.instance:
            plan_estudio = self.instance.plan_estudio_id
        if plan_estudio:
            plan_estudio_id = getattr(plan_estudio, 'id', plan_estudio)
            if GradoEscolarServicio.existe_nombre(
                value, plan_estudio_id, excluir_id=getattr(self.instance, 'id', None)
            ):
                raise serializers.ValidationError(
                    'grado escolar con este nombre ya existe en este plan de estudio.'
                )
        return value

    def validate(self, attrs):
        nivel = attrs.get('nivel')
        subnivel = attrs.get('subnivel')
        if nivel and nivel.subniveles.exists() and not subnivel:
            raise serializers.ValidationError({
                'subnivel': 'Este campo es obligatorio para el nivel seleccionado.'
            })
        return attrs
