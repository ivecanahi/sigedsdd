from rest_framework import serializers

from apps.organizacion.models import EducacionNivel
from apps.organizacion.apis.serializers.educacionsubnivel_serializer import (
    EducacionSubNivelSerializer,
)


class EducacionNivelSerializer(serializers.ModelSerializer):
    subniveles = EducacionSubNivelSerializer(many=True, read_only=True)

    class Meta:
        model = EducacionNivel
        fields = ('id', 'nombre', 'pp_minutos', 'pp_semana_minimo', 'subniveles')


class EducacionNivelNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionNivel
        fields = ('id', 'nombre')


class EducacionNivelDetailNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionNivel
        fields = ('id', 'nombre', 'pp_minutos', 'pp_semana_minimo')
