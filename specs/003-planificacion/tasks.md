# Tasks: Feature 003 - Planificación Curricular

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,500–2,000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Backend Foundation + CRUD (Groups 1–5) → PR 2: Frontend Foundation + Pages (Groups 6–10) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

---

## Group 1: Backend Foundation

### T001: Define models and migrations
- [x] **Description**: Add `PlanEstudio`, `EducacionNivel`, `EducacionSubNivel`, `GradoEscolar`, `Asignatura` to `organizacion/models.py` with correct fields, ordering, and `Meta` unique constraints (`RI-004`, `RI-005`, `RI-006`). Register all five models in Django admin.
- **Acceptance criteria**: `makemigrations` and `migrate` run without errors; admin panel shows all models; unique constraints exist at DB level.
- **Files affected**: `backend/apps/organizacion/models.py`, `backend/apps/organizacion/admin.py`
- **Dependencies**: None

### T002: Add custom exception classes
- [x] **Description**: Create `PlanEstudioException`, `GradoEscolarException`, `AsignaturaException`, and shared validation errors in `organizacion/excepciones.py` for business-rule violations (duplicate name, active plan conflict, protected deletion, missing subnivel).
- **Acceptance criteria**: Each exception class is importable and carries a descriptive Spanish message per `AGENTS.md` backend rule.
- **Files affected**: `backend/apps/organizacion/excepciones.py`
- **Dependencies**: None

---

## Group 2: Backend DAOs and Services

### T003: PlanEstudioDAO + PlanEstudioServicio
- [x] **Description**: Implement `PlanEstudioDAO` with CRUD, `filter_by_institucion`, `exists_activo_by_institucion`, and `exists_nombre_by_institucion`. Implement `PlanEstudioServicio` enforcing: only one active plan per institution (`RI-003`), name uniqueness per institution (`RI-004`), protected deletion when grados exist (`RI-001`).
- **Acceptance criteria**: Unit tests pass for create, update, delete, and all business rules.
- **Files affected**: `backend/apps/organizacion/daos/planestudio_dao.py`, `backend/apps/organizacion/servicios/planestudio_servicio.py`
- **Dependencies**: T001, T002

### T004: GradoEscolarDAO + GradoEscolarServicio
- [x] **Description**: Implement `GradoEscolarDAO` with CRUD, `filter_by_plan_estudio`, `exists_nombre_by_plan`, and search. Implement `GradoEscolarServicio` enforcing: name uniqueness per plan (`RI-005`), subnivel required when nivel has subniveles (`RV-008`), protected deletion when asignaturas exist (`RI-002`), and `alerta_carga_pedagogica` calculation.
- **Acceptance criteria**: Unit tests pass for create, update, delete, subnivel validation, and carga pedagógica alert.
- **Files affected**: `backend/apps/organizacion/daos/gradoescolar_dao.py`, `backend/apps/organizacion/servicios/gradoescolar_servicio.py`
- **Dependencies**: T001, T002

### T005: AsignaturaDAO + AsignaturaServicio
- [x] **Description**: Implement `AsignaturaDAO` with CRUD, `filter_by_grado_escolar`, and `exists_nombre_by_grado`. Implement `AsignaturaServicio` enforcing name uniqueness per grado (`RI-006`).
- **Acceptance criteria**: Unit tests pass for create, update, delete, and uniqueness validation.
- **Files affected**: `backend/apps/organizacion/daos/asignatura_dao.py`, `backend/apps/organizacion/servicios/asignatura_servicio.py`
- **Dependencies**: T001, T002

---

## Group 3: Backend Serializers

### T006: PlanEstudioSerializer
- [x] **Description**: Create serializer with `nombre`, `es_activo`, `institucion` fields; validate name uniqueness per institution excluding current instance on updates; return `409`-style `non_field_errors` for active-plan conflicts.
- **Acceptance criteria**: Validation errors match contract responses; create and update work correctly.
- **Files affected**: `backend/apps/organizacion/apis/serializers/planestudio_serializer.py`
- **Dependencies**: T003

### T007: GradoEscolarSerializer
- [x] **Description**: Create serializer with `nombre`, `orden`, `plan_estudio`, `nivel`, `subnivel`, plus computed fields `alerta_carga_pedagogica`, `carga_pedagogica_actual`, `carga_pedagogica_minima`. Validate subnivel requirement and name uniqueness per plan.
- **Acceptance criteria**: Computed fields reflect correct alert state; subnivel validation works; update excludes self from uniqueness check.
- **Files affected**: `backend/apps/organizacion/apis/serializers/gradoescolar_serializer.py`
- **Dependencies**: T004

### T008: AsignaturaSerializer
- [x] **Description**: Create serializer with `nombre`, `pp_semana_minimo`, `grado_escolar`; validate name uniqueness per grado excluding current instance on updates.
- **Acceptance criteria**: Create, update, and validation errors match contract.
- **Files affected**: `backend/apps/organizacion/apis/serializers/asignatura_serializer.py`
- **Dependencies**: T005

### T009: EducacionNivelSerializer + EducacionSubNivelSerializer
- [x] **Description**: Create `EducacionSubNivelSerializer` with `id`, `nombre`, `pp_semana_minimo`. Create `EducacionNivelSerializer` with nested `subniveles` list.
- **Acceptance criteria**: `GET /educacion-niveles/` returns correctly nested JSON per contract.
- **Files affected**: `backend/apps/organizacion/apis/serializers/educacionnivel_serializer.py`, `backend/apps/organizacion/apis/serializers/educacionsubnivel_serializer.py`
- **Dependencies**: T001

---

## Group 4: Backend Views, URLs, Permissions

### T010: Custom permission EsAutoridadAcademicaDeInstitucion
- [x] **Description**: Implement permission class verifying `AUTORIDAD_ACADEMICA` role and active assignment to the requested institution/plan’s institution. Reuse pattern from 002.
- **Acceptance criteria**: Returns 403 for unauthorized users/institutions; allows access for assigned authority.
- **Files affected**: `backend/apps/organizacion/permisos.py`
- **Dependencies**: None

### T011: PlanEstudio CRUD endpoints
- [x] **Description**: Add `PlanEstudioListView` (`GET /planes-estudio/instituciones/{id}/`, paginated, ordered, searchable) and `PlanEstudioDetailView` (`GET/POST/PATCH/DELETE /planes-estudio/{id}/`). Views delegate to serializers and services only.
- **Acceptance criteria**: All methods return status codes and payloads matching `planificacion-contracts.md`.
- **Files affected**: `backend/apps/organizacion/apis/views.py`
- **Dependencies**: T006, T010

### T012: GradoEscolar CRUD endpoints
- [x] **Description**: Add `GradoEscolarListView` (`GET /grados-escolares/planes-estudio/{id}/`) and `GradoEscolarDetailView` (`GET/POST/PATCH/DELETE /grados-escolares/{id}/`).
- **Acceptance criteria**: List supports pagination, ordering, search; detail returns computed alert fields.
- **Files affected**: `backend/apps/organizacion/apis/views.py`
- **Dependencies**: T007, T010

### T013: Asignatura CRUD endpoints
- [x] **Description**: Add `AsignaturaListView` (`GET /asignaturas/grados-escolares/{id}/`) and `AsignaturaDetailView` (`GET/POST/PATCH/DELETE /asignaturas/{id}/`).
- **Acceptance criteria**: All methods return correct payloads; mutations trigger updated carga pedagógica on next grado fetch.
- **Files affected**: `backend/apps/organizacion/apis/views.py`
- **Dependencies**: T008, T010

### T014: EducacionNivel list endpoint + URL registrations
- [x] **Description**: Add `EducacionNivelListView` (`GET /educacion-niveles/`). Register all new paths in `organizacion/apis/urls.py` and include in root `urls.py`.
- **Acceptance criteria**: Endpoint returns nested niveles/subniveles; all URLs resolve and reverse correctly.
- **Files affected**: `backend/apps/organizacion/apis/views.py`, `backend/apps/organizacion/apis/urls.py`, `backend/config/urls.py`
- **Dependencies**: T009, T010

---

## Group 5: Backend Tests

### T015: Unit tests for serializers
- [x] **Description**: Test valid/invalid data for each serializer: field limits, missing required fields, duplicate names, active-plan conflict, subnivel requirement, and self-exclusion on update.
- **Acceptance criteria**: All serializer test cases pass (`pytest` or `python manage.py test`).
- **Files affected**: `backend/apps/organizacion/tests.py`
- **Dependencies**: T006, T007, T008, T009

### T016: Service tests for business rules
- [x] **Description**: Test `PlanEstudioServicio` (active-plan uniqueness, protected delete), `GradoEscolarServicio` (subnivel required, carga alert), `AsignaturaServicio` (name uniqueness).
- **Acceptance criteria**: 100% business-rule coverage; tests fail if rules are bypassed.
- **Files affected**: `backend/apps/organizacion/tests.py`
- **Dependencies**: T003, T004, T005

### T017: Endpoint tests for CRUD + authorization tests
- [x] **Description**: Test every endpoint for 200/201/204/400/403/404/409 responses, pagination, ordering, search, and institution-scoped access. Test unauthenticated, wrong institution, and wrong role.
- **Acceptance criteria**: Full contract compliance verified by automated tests.
- **Files affected**: `backend/apps/organizacion/tests.py`
- **Dependencies**: T011, T012, T013, T014

---

## Group 6: Frontend Foundation

### T018: InstitucionContext / selected institution state
- **Description**: Create React context or state mechanism to store the currently selected institution ID and name after navigating from "Mis instituciones". Provide setter and getter accessible to planificación features.
- **Acceptance criteria**: Context persists selected institution across route changes within planificación; clearing it returns to general menu.
- **Files affected**: `frontend/src/context/InstitucionContext.tsx` (or equivalent), `frontend/src/App.tsx`
- **Dependencies**: None

### T019: Update SideMenu for contextual institutional menu
- **Description**: When `institucion` is selected, render contextual options: "Volver al menú principal", "Mi institución", "Planes de estudio". Use `sidebar`, `sidebar-active`, `sidebar-hover` theme keys only.
- **Acceptance criteria**: Menu matches prototype; navigation routes work; theme keys are not hardcoded.
- **Files affected**: `frontend/src/components/SideMenu.tsx` (or equivalent layout component)
- **Dependencies**: T018

### T020: Router updates for new routes
- **Description**: Add routes: `/instituciones/:id/dashboard`, `/instituciones/:id/planes-estudio`, `/planes-estudio/:planId/grados-asignaturas` (or equivalent). Reuse base layout with header, sidebar, content, footer.
- **Acceptance criteria**: All routes render within base layout; unknown plan/institution IDs handled gracefully.
- **Files affected**: `frontend/src/router/index.tsx` (or equivalent)
- **Dependencies**: T018, T019

---

## Group 7: Frontend API Services

### T021: planEstudioApi.ts
- **Description**: Implement `listByInstitucion`, `get`, `create`, `update`, `remove` using centralized endpoint constants. Reuse existing auth token header pattern.
- **Acceptance criteria**: All functions compile; URLs match backend contract exactly.
- **Files affected**: `frontend/src/features/planificacion/services/planEstudioApi.ts`, `frontend/src/config/endpoints.ts`
- **Dependencies**: None

### T022: gradoEscolarApi.ts
- **Description**: Implement `listByPlanEstudio`, `get`, `create`, `update`, `remove`. Use centralized endpoints.
- **Acceptance criteria**: Functions compile; URLs match contract.
- **Files affected**: `frontend/src/features/planificacion/services/gradoEscolarApi.ts`, `frontend/src/config/endpoints.ts`
- **Dependencies**: None

### T023: asignaturaApi.ts
- **Description**: Implement `listByGradoEscolar`, `get`, `create`, `update`, `remove`. Use centralized endpoints.
- **Acceptance criteria**: Functions compile; URLs match contract.
- **Files affected**: `frontend/src/features/planificacion/services/asignaturaApi.ts`, `frontend/src/config/endpoints.ts`
- **Dependencies**: None

### T024: nivelApi.ts
- **Description**: Implement `listNiveles` for `GET /educacion-niveles/`. Use centralized endpoints.
- **Acceptance criteria**: Returns typed nested niveles/subniveles.
- **Files affected**: `frontend/src/features/planificacion/services/nivelApi.ts`, `frontend/src/config/endpoints.ts`
- **Dependencies**: None

---

## Group 8: Frontend Pages - Planes de Estudio

### T025: DashboardPage
- **Description**: Display selected institution name and summary cards/actions. Use `heading-block` and `heading-block-border` theme keys. Route from "Mi institución".
- **Acceptance criteria**: Renders institution name; theme keys not hardcoded; matches prototype.
- **Files affected**: `frontend/src/features/planificacion/pages/DashboardPage.tsx`
- **Dependencies**: T018, T020

### T026: PlanEstudioListPage + PlanEstudioTable
- **Description**: Paginated, sortable (nombre, estado), searchable table. "Nuevo" button right, search left. Uppercase column headers. Pagination visible even for one page. Each row has action to navigate to grados/asignaturas.
- **Acceptance criteria**: Meets all `SKILL.md` table rules; matches prototype; CRUD flows functional.
- **Files affected**: `frontend/src/features/planificacion/pages/PlanEstudioListPage.tsx`, `frontend/src/features/planificacion/components/PlanEstudioTable.tsx`
- **Dependencies**: T019, T021

### T027: PlanEstudioForm (create/edit modal)
- **Description**: Modal form with `nombre` (required, max 200), `es_activo` toggle. Submit calls API; display field-level errors from backend (`non_field_errors` as global message). Required fields marked with red `*`.
- **Acceptance criteria**: Creates and edits successfully; shows validation errors; red asterisks present; matches prototype.
- **Files affected**: `frontend/src/features/planificacion/components/PlanEstudioForm.tsx`
- **Dependencies**: T021

---

## Group 9: Frontend Pages - Grados y Asignaturas

### T028: GradoAsignaturaPage + GradoEscolarTable
- **Description**: Page shows plan name header and table of grados escolares. Table columns: nombre, orden, nivel, subnivel, carga pedagógica (`actual/mínimo pp`), alert badge when below minimum. Paginated, sortable, searchable. "Nuevo" right, search left.
- **Acceptance criteria**: Alert badge appears correctly; table rules from `SKILL.md` satisfied; matches prototype.
- **Files affected**: `frontend/src/features/planificacion/pages/GradoAsignaturaPage.tsx`, `frontend/src/features/planificacion/components/GradoEscolarTable.tsx`
- **Dependencies**: T020, T022

### T029: GradoEscolarForm
- **Description**: Modal with `nombre`, `orden`, `nivel` dropdown (from `nivelApi`), `subnivel` dropdown (conditional, populated from selected nivel’s subniveles). Subnivel is required when nivel has subniveles. On edit, preselect saved subnivel.
- **Acceptance criteria**: Conditional subnivel works; preselection on edit; validation errors shown; red asterisks present.
- **Files affected**: `frontend/src/features/planificacion/components/GradoEscolarForm.tsx`
- **Dependencies**: T024

### T030: AsignaturaCard + AsignaturaSection
- **Description**: Section listing asignaturas for selected grado. Each asignatura shown in a card with name and `pp_semana_minimo`. Actions: edit, delete with confirmation modal. "Nueva asignatura" button opens form.
- **Acceptance criteria**: Cards render; CRUD updates reflect immediately in parent grado table alert state.
- **Files affected**: `frontend/src/features/planificacion/components/AsignaturaCard.tsx`, `frontend/src/features/planificacion/components/AsignaturaSection.tsx`
- **Dependencies**: T023

---

## Group 10: Frontend Tests & Integration

### T031: TypeScript compilation and lint
- **Description**: Run `tsc --noEmit` and linter across `features/planificacion/`. Fix all type errors.
- **Acceptance criteria**: Zero TS errors; zero lint errors.
- **Files affected**: All files in `frontend/src/features/planificacion/`
- **Dependencies**: T025–T030

### T032: Functional testing of all flows
- **Description**: Manually or with automated frontend tests verify: dashboard → planes → grados → asignaturas navigation; create/edit/delete with confirmation modals; error displays; alert badge updates after asignatura changes.
- **Acceptance criteria**: All acceptance scenarios from `spec.md` pass.
- **Files affected**: Test suite or manual verification log
- **Dependencies**: T025–T030

### T033: Integration frontend-backend
- **Description**: Run backend and frontend together; exercise full end-to-end CRUD for planes, grados, asignaturas; verify auth, permissions, pagination, search, ordering, and alert calculation.
- **Acceptance criteria**: No CORS issues; no 404 mismatches; payloads match contracts; UI reflects backend state immediately.
- **Files affected**: Full stack
- **Dependencies**: T017, T032
