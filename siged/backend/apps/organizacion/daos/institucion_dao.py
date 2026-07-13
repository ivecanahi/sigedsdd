from apps.organizacion.models import Institucion, Rol, UsuarioRol


class InstitucionDAO:

    @staticmethod
    def listar(page=1, page_size=10, ordering='nombre', nombre=None):
        qs = Institucion.objects.all()
        if nombre:
            qs = qs.filter(nombre__icontains=nombre)
        campo_orden = ordering.lstrip('-')
        if campo_orden in ('nombre', 'codigo', 'ruc'):
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
    def obtener_por_id(institucion_id):
        try:
            return Institucion.objects.get(id=institucion_id)
        except Institucion.DoesNotExist:
            return None

    @staticmethod
    def crear(data):
        return Institucion.objects.create(**data)

    @staticmethod
    def actualizar(institucion, data):
        for campo, valor in data.items():
            setattr(institucion, campo, valor)
        institucion.save()
        return institucion

    @staticmethod
    def eliminar(institucion):
        institucion.delete()

    @staticmethod
    def tiene_dependencias_activas(institucion):
        return UsuarioRol.objects.filter(
            institucion=institucion,
            es_activo=True,
            rol__nombre=Rol.AUTORIDAD_ACADEMICA,
        ).exists()

    @staticmethod
    def obtener_autoridades_activas(institucion):
        return UsuarioRol.objects.filter(
            institucion=institucion,
            es_activo=True,
            rol__nombre=Rol.AUTORIDAD_ACADEMICA,
        ).select_related('usuario', 'rol')

    @staticmethod
    def listar_por_usuario(usuario):
        return Institucion.objects.filter(
            asignaciones__usuario=usuario,
            asignaciones__es_activo=True,
        ).distinct().order_by('nombre')
