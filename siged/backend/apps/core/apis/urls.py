from django.urls import path

from apps.core.apis.views import LoginView, LogoutView, UsuarioListView


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('usuarios/', UsuarioListView.as_view(), name='usuario-list'),
]
