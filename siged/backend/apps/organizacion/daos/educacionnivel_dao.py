from apps.organizacion.models import EducacionNivel


class EducacionNivelDAO:

    @staticmethod
    def listar():
        return EducacionNivel.objects.all().order_by('nombre').prefetch_related('subniveles')
