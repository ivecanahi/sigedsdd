from rest_framework import serializers

from apps.organizacion.models import EducacionSubNivel


class EducacionSubNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionSubNivel
        fields = ('id', 'nombre', 'pp_semana_minimo')


class EducacionSubNivelNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionSubNivel
        fields = ('id', 'nombre')


class EducacionSubNivelDetailNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionSubNivel
        fields = ('id', 'nombre', 'pp_semana_minimo')
