"""
Comando para sembrar datos de demostración en SIGED.
Uso: python manage.py seed
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.organizacion.models import (
    EducacionNivel, EducacionSubNivel, Institucion, PlanEstudio,
    GradoEscolar, Asignatura, Rol, UsuarioRol,
)

Usuario = get_user_model()


class Command(BaseCommand):
    help = 'Siembra datos de demostración para SIGED'

    def handle(self, *args, **options):
        self.stdout.write('Sembrando datos de demostración...\n')

        # ─── 1. Niveles Educativos ──────────────────────────────────────
        nivel_inicial, _ = EducacionNivel.objects.get_or_create(
            nombre='Educación Inicial',
            defaults={'pp_minutos': 30, 'pp_semana_minimo': 20},
        )
        nivel_basica, _ = EducacionNivel.objects.get_or_create(
            nombre='Educación General Básica',
            defaults={'pp_minutos': 40, 'pp_semana_minimo': 25},
        )
        nivel_bachillerato, _ = EducacionNivel.objects.get_or_create(
            nombre='Bachillerato',
            defaults={'pp_minutos': 45, 'pp_semana_minimo': 30},
        )

        # Subniveles
        sub_inicial1, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Inicial 1',
            educacion_nivel=nivel_inicial,
            defaults={'pp_semana_minimo': 20},
        )
        sub_inicial2, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Inicial 2',
            educacion_nivel=nivel_inicial,
            defaults={'pp_semana_minimo': 20},
        )
        sub_preparatoria, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Preparatoria (1ro)',
            educacion_nivel=nivel_basica,
            defaults={'pp_semana_minimo': 22},
        )
        sub_basica_elemental, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Básica Elemental (2do-4to)',
            educacion_nivel=nivel_basica,
            defaults={'pp_semana_minimo': 25},
        )
        sub_basica_media, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Básica Media (5to-7mo)',
            educacion_nivel=nivel_basica,
            defaults={'pp_semana_minimo': 28},
        )
        sub_basica_superior, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Básica Superior (8vo-10mo)',
            educacion_nivel=nivel_basica,
            defaults={'pp_semana_minimo': 30},
        )
        sub_bachillerato, _ = EducacionSubNivel.objects.get_or_create(
            nombre='Bachillerato General Unificado',
            educacion_nivel=nivel_bachillerato,
            defaults={'pp_semana_minimo': 35},
        )

        self.stdout.write('  ✅ Niveles y subniveles creados')

        # ─── 2. Instituciones ──────────────────────────────────────────
        inst_capuli, _ = Institucion.objects.get_or_create(
            codigo='17H00001',
            defaults={
                'nombre': 'Escuela Municipal Capulí Loma',
                'ruc': '1760000010001',
            },
        )
        inst_borja, _ = Institucion.objects.get_or_create(
            codigo='17H00002',
            defaults={
                'nombre': 'Escuela Municipal Borja',
                'ruc': '1760000020001',
            },
        )
        inst_pradera, _ = Institucion.objects.get_or_create(
            codigo='17H00003',
            defaults={
                'nombre': 'Unidad Educativa Pradera',
                'ruc': '1760000030001',
            },
        )

        self.stdout.write('  ✅ Instituciones creadas')

        # ─── 3. Usuarios ───────────────────────────────────────────────
        admin, _ = Usuario.objects.get_or_create(
            numero_identificacion='100000001',
            defaults={
                'username': 'admin',
                'first_name': 'Administrador',
                'last_name': 'del Sistema',
                'email': 'admin@siged.edu.ec',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin.set_password('admin123')
        admin.save()

        autoridad1, _ = Usuario.objects.get_or_create(
            numero_identificacion='100000002',
            defaults={
                'username': 'susana.moreno',
                'first_name': 'Susana',
                'last_name': 'Moreno',
                'email': 'susana@capuli.edu.ec',
                'is_staff': False,
            },
        )
        autoridad1.set_password('usuario123')
        autoridad1.save()

        autoridad2, _ = Usuario.objects.get_or_create(
            numero_identificacion='100000003',
            defaults={
                'username': 'carlos.ruiz',
                'first_name': 'Carlos',
                'last_name': 'Ruiz',
                'email': 'carlos@borja.edu.ec',
                'is_staff': False,
            },
        )
        autoridad2.set_password('usuario123')
        autoridad2.save()

        self.stdout.write('  ✅ Usuarios creados')

        # ─── 4. Roles activos ──────────────────────────────────────────
        rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)

        UsuarioRol.objects.get_or_create(
            usuario=autoridad1,
            rol=rol_autoridad,
            institucion=inst_capuli,
            defaults={'es_activo': True},
        )
        UsuarioRol.objects.get_or_create(
            usuario=autoridad2,
            rol=rol_autoridad,
            institucion=inst_borja,
            defaults={'es_activo': True},
        )

        self.stdout.write('  ✅ Roles asignados')

        # ─── 5. Planes de Estudio ─────────────────────────────────────
        plan_capuli_2025, _ = PlanEstudio.objects.get_or_create(
            nombre='Plan Curricular 2025-2026',
            institucion=inst_capuli,
            defaults={'es_activo': True},
        )
        plan_capuli_2024, _ = PlanEstudio.objects.get_or_create(
            nombre='Plan Curricular 2024-2025',
            institucion=inst_capuli,
            defaults={'es_activo': False},
        )
        plan_borja_2025, _ = PlanEstudio.objects.get_or_create(
            nombre='Plan Curricular 2025-2026',
            institucion=inst_borja,
            defaults={'es_activo': True},
        )
        plan_pradera_2025, _ = PlanEstudio.objects.get_or_create(
            nombre='Plan Curricular 2025-2026',
            institucion=inst_pradera,
            defaults={'es_activo': True},
        )

        self.stdout.write('  ✅ Planes de estudio creados')

        # ─── 6. Grados Escolares y Asignaturas ────────────────────────
        grados_y_asignaturas = [
            # (plan, nombre_grado, orden, subnivel, asignaturas)
            (plan_capuli_2025, 'Primero de Básica', 1, sub_preparatoria, [
                ('Lengua y Literatura', 8),
                ('Matemáticas', 7),
                ('Ciencias Naturales', 4),
                ('Estudios Sociales', 3),
            ]),
            (plan_capuli_2025, 'Segundo de Básica', 2, sub_basica_elemental, [
                ('Lengua y Literatura', 8),
                ('Matemáticas', 8),
                ('Ciencias Naturales', 4),
                ('Estudios Sociales', 3),
                ('Inglés', 2),
            ]),
            (plan_capuli_2025, 'Tercero de Básica', 3, sub_basica_elemental, [
                ('Lengua y Literatura', 8),
                ('Matemáticas', 8),
                ('Ciencias Naturales', 4),
                ('Estudios Sociales', 3),
                ('Inglés', 3),
                ('Educación Física', 2),
            ]),
            (plan_capuli_2025, 'Octavo de Básica', 8, sub_basica_superior, [
                ('Lengua y Literatura', 6),
                ('Matemáticas', 6),
                ('Ciencias Naturales', 4),
                ('Estudios Sociales', 3),
                ('Inglés', 3),
                ('Educación Física', 2),
                ('Química', 3),
                ('Física', 3),
            ]),
            (plan_borja_2025, 'Primero de Básica', 1, sub_preparatoria, [
                ('Lengua y Literatura', 7),
                ('Matemáticas', 6),
                ('Ciencias Naturales', 3),
                ('Estudios Sociales', 2),
            ]),
            (plan_borja_2025, 'Segundo de Básica', 2, sub_basica_elemental, [
                ('Lengua y Literatura', 7),
                ('Matemáticas', 7),
                ('Ciencias Naturales', 3),
                ('Estudios Sociales', 2),
                ('Inglés', 2),
            ]),
            (plan_pradera_2025, 'Primero de Básica', 1, sub_preparatoria, [
                ('Lengua y Literatura', 6),
                ('Matemáticas', 5),
                ('Ciencias Naturales', 3),
                ('Estudios Sociales', 2),
            ]),
            (plan_pradera_2025, 'Segundo de Básica', 2, sub_basica_elemental, [
                ('Lengua y Literatura', 6),
                ('Matemáticas', 6),
                ('Ciencias Naturales', 3),
                ('Estudios Sociales', 2),
            ]),
        ]

        for plan, grado_nombre, orden, subnivel, asignaturas in grados_y_asignaturas:
            grado, created = GradoEscolar.objects.get_or_create(
                nombre=grado_nombre,
                plan_estudio=plan,
                defaults={
                    'orden': orden,
                    'nivel': subnivel.educacion_nivel,
                    'subnivel': subnivel,
                },
            )
            for asig_nombre, horas in asignaturas:
                Asignatura.objects.get_or_create(
                    nombre=asig_nombre,
                    grado_escolar=grado,
                    defaults={'pp_semana_minimo': horas},
                )

        self.stdout.write('  ✅ Grados escolares y asignaturas creados')

        # ─── Resumen ──────────────────────────────────────────────────
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write('DATOS CARGADOS EXITOSAMENTE')
        self.stdout.write('=' * 50)
        self.stdout.write(f'  Usuarios:     {Usuario.objects.count()}')
        self.stdout.write(f'  Instituciones: {Institucion.objects.count()}')
        self.stdout.write(f'  Planes:       {PlanEstudio.objects.count()}')
        self.stdout.write(f'  Grados:       {GradoEscolar.objects.count()}')
        self.stdout.write(f'  Asignaturas:  {Asignatura.objects.count()}')
        self.stdout.write(f'  Niveles:      {EducacionNivel.objects.count()}')
        self.stdout.write(f'  Subniveles:   {EducacionSubNivel.objects.count()}')
        self.stdout.write('=' * 50)
        self.stdout.write('\nCredenciales de prueba:')
        self.stdout.write('  Admin:          100000001 / admin123')
        self.stdout.write('  Susana Moreno:  100000002 / usuario123')
        self.stdout.write('  Carlos Ruiz:    100000003 / usuario123')
