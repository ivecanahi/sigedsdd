from apps.organizacion.models import PlanEstudio


class PlanEstudioDAO:

    @staticmethod
    def listar(page=1, page_size=10, ordering='nombre', nombre=None, institucion_id=None):
        qs = PlanEstudio.objects.all()
        if institucion_id:
            qs = qs.filter(institucion_id=institucion_id)
        if nombre:
            qs = qs.filter(nombre__icontains=nombre)
        campo_orden = ordering.lstrip('-')
        if campo_orden in ('nombre', 'es_activo'):
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
    def obtener_por_id(plan_id):
        try:
            return PlanEstudio.objects.get(id=plan_id)
        except PlanEstudio.DoesNotExist:
            return None

    @staticmethod
    def crear(data):
        return PlanEstudio.objects.create(**data)

    @staticmethod
    def actualizar(plan, data):
        for campo, valor in data.items():
            setattr(plan, campo, valor)
        plan.save()
        return plan

    @staticmethod
    def eliminar(plan):
        plan.delete()

    @staticmethod
    def existe_activo_by_institucion(institucion_id, excluir_id=None):
        qs = PlanEstudio.objects.filter(institucion_id=institucion_id, es_activo=True)
        if excluir_id:
            qs = qs.exclude(id=excluir_id)
        return qs.exists()

    @staticmethod
    def existe_nombre_by_institucion(nombre, institucion_id, excluir_id=None):
        qs = PlanEstudio.objects.filter(nombre__iexact=nombre, institucion_id=institucion_id)
        if excluir_id:
            qs = qs.exclude(id=excluir_id)
        return qs.exists()

    @staticmethod
    def tiene_grados_asociados(plan):
        return plan.grados_escolares.exists()
