from rest_framework import serializers


class AutenticacionSerializer(serializers.Serializer):
    numero_identificacion = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Este campo es obligatorio.',
            'blank': 'Este campo es obligatorio.',
        },
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            'required': 'Este campo es obligatorio.',
            'blank': 'Este campo es obligatorio.',
        },
    )
