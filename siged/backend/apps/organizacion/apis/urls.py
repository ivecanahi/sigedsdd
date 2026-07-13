from django.urls import path

from apps.organizacion.apis.views import (
    InstitucionDetailUpdateDeleteView,
    InstitucionListCreateView,
    InstitucionUsuarioView,
    UsuarioRolDetailUpdateDeleteView,
    UsuarioRolListCreateView,
    UsuarioRolRolesView,
    UsuarioRolToggleView,
)

urlpatterns = [
    path('instituciones/', InstitucionListCreateView.as_view(), name='institucion-list-create'),
    path('instituciones/<int:pk>/', InstitucionDetailUpdateDeleteView.as_view(), name='institucion-detail-update-delete'),
    path('instituciones/usuario/', InstitucionUsuarioView.as_view(), name='institucion-usuario'),
    path('usuarioroles/', UsuarioRolListCreateView.as_view(), name='usuariorol-list-create'),
    path('usuarioroles/roles/', UsuarioRolRolesView.as_view(), name='usuariorol-roles'),
    path('usuarioroles/<int:pk>/estado/', UsuarioRolToggleView.as_view(), name='usuariorol-toggle'),
    path('usuarioroles/<int:pk>/', UsuarioRolDetailUpdateDeleteView.as_view(), name='usuariorol-detail-update-delete'),
]
