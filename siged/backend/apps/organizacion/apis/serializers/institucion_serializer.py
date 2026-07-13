from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.organizacion.models import Institucion, Rol, UsuarioRol
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio

Usuario = get_user_model()


class UsuarioNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('id', 'username', 'first_name', 'last_name')


class RolNestedSerializer(serializers.ModelSerializer):
    nombre_display = serializers.CharField(source='get_nombre_display', read_only=True)

    class Meta:
        model = Rol
        fields = ('id', 'nombre', 'nombre_display')


class InstitucionNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = ('id', 'nombre')


class AutoridadAcademicaSerializer(serializers.ModelSerializer):
    usuario = UsuarioNestedSerializer(read_only=True)
    rol = RolNestedSerializer(read_only=True)

    class Meta:
        model = UsuarioRol
        fields = ('id', 'usuario', 'rol', 'es_activo', 'fecha_desde')


class InstitucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = ('id', 'codigo', 'fecha_actualizacion', 'fecha_creacion', 'nombre', 'ruc')


class InstitucionListSerializer(InstitucionSerializer):
    autoridades_academicas = serializers.SerializerMethodField()

    class Meta(InstitucionSerializer.Meta):
        fields = InstitucionSerializer.Meta.fields + ('autoridades_academicas',)

    def get_autoridades_academicas(self, obj):
        autoridades = InstitucionServicio.obtener_autoridades_activas(obj)
        return AutoridadAcademicaSerializer(autoridades, many=True).data
