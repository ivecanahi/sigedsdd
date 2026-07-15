from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    numero_identificacion = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='número de identificación',
    )
    username = models.CharField(
        max_length=150,
        unique=False,
        verbose_name='nombre de usuario',
    )

    USERNAME_FIELD = 'numero_identificacion'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'

    def save(self, *args, **kwargs):
        if not self.username or self.username.strip() == '':
            self.username = self.numero_identificacion
        super().save(*args, **kwargs)

    def __str__(self):
        return self.numero_identificacion
