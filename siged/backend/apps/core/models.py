from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    numero_identificacion = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='número de identificación',
    )

    USERNAME_FIELD = 'numero_identificacion'
    REQUIRED_FIELDS = ['username', 'email']

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'

    def __str__(self):
        return self.numero_identificacion
