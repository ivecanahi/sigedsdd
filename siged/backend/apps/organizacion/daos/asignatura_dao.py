from apps.organizacion.models import Asignatura


class AsignaturaDAO:

    @staticmethod
    def listar(page=1, page_size=10, ordering='nombre', nombre=None, grado_escolar_id=None):
        qs = Asignatura.objects.all()
        if grado_escolar_id:
            qs = qs.filter(grado_escolar_id=grado_escolar_id)
        if nombre:
            qs = qs.filter(nombre__icontains=nombre)
        campo_orden = ordering.lstrip('-')
        if campo_orden == 'nombre':
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('nombre')
        total = qs.count()
        inicio = (page - 1) * page_size
        fin = inicio + page_size
        resultados = qs[inicio:fin]
        return {
            'count': total,
            'next': page * page_size < total,
            'previous': page > 1,
            'results': resultados,
        }

    @staticmethod
    def obtener_por_id(asignatura_id):
        try:
            return Asignatura.objects.get(id=asignatura_id)
        except Asignatura.DoesNotExist:
            return None

    @staticmethod
    def crear(data):
        return Asignatura.objects.create(**data)

    @staticmethod
    def actualizar(asignatura, data):
        for campo, valor in data.items():
            setattr(asignatura, campo, valor)
        asignatura.save()
        return asignatura

    @staticmethod
    def eliminar(asignatura):
        asignatura.delete()

    @staticmethod
    def listar_por_grado(grado_escolar_id):
        return Asignatura.objects.filter(grado_escolar_id=grado_escolar_id).order_by('nombre')

    @staticmethod
    def existe_nombre_by_grado(nombre, grado_escolar_id, excluir_id=None):
        qs = Asignatura.objects.filter(nombre__iexact=nombre, grado_escolar_id=grado_escolar_id)
        if excluir_id:
            qs = qs.exclude(id=excluir_id)
        return qs.exists()
