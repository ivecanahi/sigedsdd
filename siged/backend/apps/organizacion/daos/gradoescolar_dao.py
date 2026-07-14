from apps.organizacion.models import GradoEscolar


class GradoEscolarDAO:

    @staticmethod
    def listar(page=1, page_size=10, ordering='orden', nombre=None, plan_estudio_id=None):
        qs = GradoEscolar.objects.all().select_related('nivel', 'subnivel', 'plan_estudio')
        if plan_estudio_id:
            qs = qs.filter(plan_estudio_id=plan_estudio_id)
        if nombre:
            qs = qs.filter(nombre__icontains=nombre)
        campo_orden = ordering.lstrip('-')
        if campo_orden in ('orden', 'nombre'):
            qs = qs.order_by(ordering)
        elif campo_orden == 'nivel':
            qs = qs.order_by(f'{ordering}__nombre')
        elif campo_orden == 'subnivel':
            qs = qs.order_by(f'{ordering}__nombre')
        else:
            qs = qs.order_by('orden', 'nombre')
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
    def obtener_por_id(grado_id):
        try:
            return GradoEscolar.objects.select_related('nivel', 'subnivel', 'plan_estudio').get(id=grado_id)
        except GradoEscolar.DoesNotExist:
            return None

    @staticmethod
    def crear(data):
        return GradoEscolar.objects.create(**data)

    @staticmethod
    def actualizar(grado, data):
        for campo, valor in data.items():
            setattr(grado, campo, valor)
        grado.save()
        return grado

    @staticmethod
    def eliminar(grado):
        grado.delete()

    @staticmethod
    def existe_nombre_by_plan(nombre, plan_estudio_id, excluir_id=None):
        qs = GradoEscolar.objects.filter(nombre__iexact=nombre, plan_estudio_id=plan_estudio_id)
        if excluir_id:
            qs = qs.exclude(id=excluir_id)
        return qs.exists()

    @staticmethod
    def tiene_asignaturas_asociadas(grado):
        return grado.asignaturas.exists()
