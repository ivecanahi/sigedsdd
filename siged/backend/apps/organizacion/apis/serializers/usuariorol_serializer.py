from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.organizacion.models import Institucion, Rol, UsuarioRol
from apps.organizacion.apis.serializers.institucion_serializer import (
    InstitucionNestedSerializer,
    RolNestedSerializer,
    UsuarioNestedSerializer,
)

Usuario = get_user_model()


class UsuarioRolSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all())
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all())
    institucion = serializers.PrimaryKeyRelatedField(
        queryset=Institucion.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = UsuarioRol
        fields = (
            'id',
            'es_activo',
            'fecha_desde',
            'fecha_hasta',
            'institucion',
            'rol',
            'usuario',
        )
        read_only_fields = ('es_activo', 'fecha_desde', 'fecha_hasta')

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['usuario'] = UsuarioNestedSerializer(instance.usuario).data
        ret['rol'] = RolNestedSerializer(instance.rol).data
        if instance.institucion:
            ret['institucion'] = InstitucionNestedSerializer(instance.institucion).data
        else:
            ret['institucion'] = None
        return ret

    def validate(self, attrs):
        rol = attrs.get('rol')
        institucion = attrs.get('institucion')
        if rol and rol.nombre == Rol.AUTORIDAD_ACADEMICA and not institucion:
            raise serializers.ValidationError({
                'institucion': 'Este campo es obligatorio para el rol AUTORIDAD_ACADEMICA.'
            })
        return attrs
