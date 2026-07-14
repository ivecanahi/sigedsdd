from rest_framework import serializers

from apps.organizacion.models import Asignatura, GradoEscolar
from apps.organizacion.apis.serializers.gradoescolar_serializer import GradoEscolarNestedSerializer
from apps.organizacion.servicios.asignatura_servicio import AsignaturaServicio


class AsignaturaNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ('id', 'nombre', 'pp_semana_minimo')


class AsignaturaListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ('id', 'nombre', 'pp_semana_minimo', 'grado_escolar', 'fecha_creacion', 'fecha_actualizacion')


class AsignaturaDetailSerializer(serializers.ModelSerializer):
    grado_escolar = GradoEscolarNestedSerializer(read_only=True)

    class Meta:
        model = Asignatura
        fields = ('id', 'nombre', 'pp_semana_minimo', 'grado_escolar', 'fecha_creacion', 'fecha_actualizacion')


class AsignaturaWriteSerializer(serializers.ModelSerializer):
    grado_escolar = serializers.PrimaryKeyRelatedField(queryset=GradoEscolar.objects.all())

    class Meta:
        model = Asignatura
        fields = ('id', 'nombre', 'pp_semana_minimo', 'grado_escolar', 'fecha_creacion', 'fecha_actualizacion')

    def validate_nombre(self, value):
        grado_escolar = self.initial_data.get('grado_escolar')
        if not grado_escolar and self.instance:
            grado_escolar = self.instance.grado_escolar_id
        if grado_escolar:
            grado_escolar_id = getattr(grado_escolar, 'id', grado_escolar)
            if AsignaturaServicio.existe_nombre(
                value, grado_escolar_id, excluir_id=getattr(self.instance, 'id', None)
            ):
                raise serializers.ValidationError(
                    'asignatura con este nombre ya existe en este grado escolar.'
                )
        return value
