from rest_framework import serializers

from apps.organizacion.models import Institucion, PlanEstudio
from apps.organizacion.servicios.planestudio_servicio import PlanEstudioServicio


class PlanEstudioNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanEstudio
        fields = ('id', 'nombre')


class PlanEstudioListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanEstudio
        fields = ('id', 'nombre', 'es_activo', 'institucion', 'fecha_creacion', 'fecha_actualizacion')


class PlanEstudioDetailSerializer(serializers.ModelSerializer):
    institucion = serializers.SerializerMethodField()

    class Meta:
        model = PlanEstudio
        fields = ('id', 'nombre', 'es_activo', 'institucion', 'fecha_creacion', 'fecha_actualizacion')

    def get_institucion(self, obj):
        return {'id': obj.institucion.id, 'nombre': obj.institucion.nombre}


class PlanEstudioWriteSerializer(serializers.ModelSerializer):
    institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())

    class Meta:
        model = PlanEstudio
        fields = ('id', 'nombre', 'es_activo', 'institucion', 'fecha_creacion', 'fecha_actualizacion')

    def validate_nombre(self, value):
        institucion = self.initial_data.get('institucion')
        if not institucion and self.instance:
            institucion = self.instance.institucion_id
        if institucion:
            institucion_id = getattr(institucion, 'id', institucion)
            if PlanEstudioServicio.existe_nombre(
                value, institucion_id, excluir_id=getattr(self.instance, 'id', None)
            ):
                raise serializers.ValidationError(
                    'plan de estudio con este nombre ya existe en esta institución.'
                )
        return value
