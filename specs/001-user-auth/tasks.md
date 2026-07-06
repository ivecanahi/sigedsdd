---

description: "Plan de tareas para implementar la feature 001-user-auth: Autenticación de Usuario"
---

# Tasks: 001-user-auth — Autenticación de Usuario

**Input**: Design documents from `specs/001-user-auth/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/auth-contracts.md, .specify/memory/constitution.md, AGENTS.md

**Tests**: Incluidas — el plan.md define estrategias de verificación explícitas (unitarias, funcionales, integración, autorización) y la constitución del proyecto (Art. II) exige cobertura de pruebas.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `siged/backend/apps/core/` (Django app)
- Frontend: `siged/frontend/src/` (React + Vite)
- All paths relative to project root `siged/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización de proyectos backend y frontend, dependencias y estructura base.

- [x] T001 Create backend Django project under `siged/backend/` with config module, `apps/core/` app, and `requirements.txt`
- [x] T002 [P] Initialize Python virtual environment under `siged/backend/.venv/` and install: Django, djangorestframework, django-cors-headers, djangorestframework-authtoken
- [x] T003 [P] Create frontend Vite + React + TypeScript project under `siged/frontend/` with `package.json` and tsconfig
- [x] T004 [P] Install frontend dependencies: Tailwind CSS, react-router-dom, Material Symbols Outlined

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura base que DEBE completarse antes de cualquier user story.

**CRITICAL**: Ningún trabajo de user story puede comenzar hasta que esta fase esté completa.

- [x] T005 Configure Django `settings.py` in `siged/backend/config/settings.py`: register `rest_framework`, `rest_framework.authtoken`, `corsheaders`, `core` in INSTALLED_APPS; add `CorsMiddleware` before `CommonMiddleware`; set `REST_FRAMEWORK` default auth classes to `TokenAuthentication`; configure `CORS_ALLOWED_ORIGINS`; set `AUTH_USER_MODEL` to `core.Usuario`
- [x] T006 Create `Usuario` model extending `AbstractUser` in `siged/backend/apps/core/models.py`: add `numero_identificacion` as `CharField(20, unique=True)`, set `USERNAME_FIELD = 'numero_identificacion'`, remove `username` field, order attributes alphabetically per project conventions
- [x] T007 Register `Usuario` model in Django admin in `siged/backend/apps/core/admin.py` with display fields for `numero_identificacion`, `first_name`, `last_name`, `is_active`
- [x] T008 [P] Create core app module structure: `apis/__init__.py`, `apis/serializers/__init__.py`, `servicios/__init__.py`, `daos/__init__.py`, `permisos.py`, `excepciones.py` under `siged/backend/apps/core/`
- [x] T009 Create backend URL configuration: register `admin/` path in `siged/backend/config/urls.py` and include `core/apis/urls.py` under `api/` prefix
- [x] T010 [P] Create frontend config files: `siged/frontend/src/config/app.ts` with `app_name` and `app_full_name` constants; `siged/frontend/src/config/endpoints.ts` with `LOGIN_ENDPOINT` and `LOGOUT_ENDPOINT`
- [x] T011 [P] Configure Tailwind CSS in `siged/frontend/tailwind.config.js` with project color palette (background, surface, primary, secondary, accent, success, warning, danger, header-top, sidebar, sidebar-active, sidebar-hover, heading-block, heading-block-border); create global CSS variables in `src/index.css`; extend Vite config with backend URL variable and fixed port 3000
- [x] T012 [P] Set up React Router in `siged/frontend/src/router/`: define public route for `/login` and protected route wrapper that redirects to `/login` when no token exists

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Inicio de Sesión (Priority: P1) 🎯 MVP

**Goal**: Permitir al usuario autenticarse con su número de identificación y contraseña, iniciar sesión y redirigir al Home.

**Independent Test**: `POST /login/` con credenciales válidas retorna 200 + token; con credenciales inválidas retorna 401; con usuario inactivo retorna 403.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create `AutenticacionSerializer` in `siged/backend/apps/core/apis/serializers/autenticacion_serializer.py` with `numero_identificacion` and `password` fields, field-level required validation per RV-001 and RV-002
- [x] T014 [P] [US1] Create `UsuarioDAO` in `siged/backend/apps/core/daos/usuario_dao.py`: method `obtener_por_identificacion(numero_identificacion)` to retrieve user by identification number; method `crear_token(usuario)` to create DRF Token; method `eliminar_token(usuario)` to delete token (D8 decision)
- [x] T015 [US1] Create `AutenticacionServicio` in `siged/backend/apps/core/servicios/autenticacion_servicio.py`: `iniciar_sesion(numero_identificacion, password)` validates credentials via DAO, checks `is_active` (RV-005), creates token, returns token + user data; raises typed exceptions for invalid credentials (RV-003, RV-004) and inactive account
- [x] T016 [US1] Create login view in `siged/backend/apps/core/apis/views.py`: `LoginView` (APIView, no permission required — D7 decision) that uses serializer for validation, delegates to service, returns 200/400/401/403 per contract specs
- [x] T017 [US1] Register `/login/` URL in `siged/backend/apps/core/apis/urls.py`
- [x] T018 [P] [US1] Create `authApi` service in `siged/frontend/src/features/auth/services/authApi.ts`: `login(numero_identificacion, password)` that POSTs to `LOGIN_ENDPOINT` and returns token + user data; `logout()` that POSTs to `LOGOUT_ENDPOINT` with Authorization header (D5 decision)
- [x] T019 [P] [US1] Create `AuthContext` in `siged/frontend/src/features/auth/context/AuthContext.tsx` that stores token and user data, reads/writes `authToken` in localStorage (D4 decision), provides `login` and `logout` methods; create `useAuth` hook in `siged/frontend/src/features/auth/hooks/useAuth.ts`
- [x] T020 [US1] Create `LoginForm` component in `siged/frontend/src/features/auth/components/LoginForm.tsx` with `numero_identificacion` and `password` fields, submit handler calling `useAuth().login()`, inline field-level error display per D9 research decision, global error display for `non_field_errors`
- [x] T021 [US1] Create `LoginPage` in `siged/frontend/src/features/auth/pages/LoginPage.tsx` rendering LoginForm and redirecting to `/` on successful login; add route in router configuration

**Checkpoint**: At this point, User Story 1 is fully functional — a user can log in with valid credentials, see error messages for invalid/inactive/empty fields, and be redirected to the home page.

---

## Phase 4: User Story 2 — Cierre de Sesión (Priority: P1)

**Goal**: Permitir al usuario autenticado cerrar sesión de forma segura, invalidando el token y redirigiendo al login.

**Dependency**: Requiere `AutenticacionServicio`, `UsuarioDAO`, y configuración `TokenAuthentication` completadas en US1 y Fase 2.

**Independent Test**: `POST /logout/` con token válido retorna 200 y elimina el token (D8); sin token retorna 401.

### Implementation for User Story 2

- [x] T022 [P] [US2] Add `cerrar_sesion(usuario)` method to `AutenticacionServicio` in `siged/backend/apps/core/servicios/autenticacion_servicio.py` that calls `usuario_dao.eliminar_token(usuario)` per D8 decision
- [x] T023 [US2] Create logout view in `siged/backend/apps/core/apis/views.py`: `LogoutView` (APIView, requires TokenAuthentication — D7 decision) that calls service `cerrar_sesion`, returns 200 with success message per contract
- [x] T024 [US2] Register `/logout/` URL in `siged/backend/apps/core/apis/urls.py`
- [x] T025 [P] [US2] Create `TopBar` component in `siged/frontend/src/features/layout/components/TopBar.tsx` that displays `app_full_name` + `app_name` from config, shows authenticated user's name, and renders logout button calling `useAuth().logout()`
- [x] T026 [P] [US2] Create `SideMenu` component in `siged/frontend/src/features/layout/components/SideMenu.tsx` with collapsible navigation, styled per project color palette (sidebar: #330099, sidebar-active: #7399FF, sidebar-hover: #6488EE)
- [x] T027 [US2] Create `AuthenticatedLayout` in `siged/frontend/src/features/layout/pages/AuthenticatedLayout.tsx` composing TopBar, SideMenu, main content area with heading block (heading-block: #F8FAFC, heading-block-border: #4c6ef5), and footer with `app_name`; wrap protected routes with this layout
- [x] T028 [US2] Wire up logout flow: integrate logout in AuthContext to clear localStorage token and redirect to `/login`; ensure TopBar logout button triggers full flow

**Checkpoint**: Both user stories are independently functional. User can log in, see the authenticated layout with TopBar and SideMenu, and log out securely.

---

## Phase 5: Verification & Polish

**Purpose**: Pruebas, superusuario, migraciones y verificación end-to-end.

- [x] T029 Create superuser: run `python manage.py createsuperuser` with `username=admin`, `email=admin@example.com`, `password=admin123`, `numero_identificacion=000000001`, `is_superuser=True`, `is_staff=True`, `is_active=True`, `first_name=Administrador`, `last_name=Sistema`
- [x] T030 [P] Write unit tests for login serializer field validation (missing fields), service credential verification, and inactive user rejection in `siged/backend/apps/core/tests.py`
- [x] T031 [P] Write unit tests for logout service token deletion and authorization (public login, protected logout) in `siged/backend/apps/core/tests.py`
- [x] T032 [P] Write integration tests: full login flow (valid → 200, invalid → 401, inactive → 403); full logout flow (authenticated → 200, unauthenticated → 401) in `siged/backend/apps/core/tests.py`
- [x] T033 Run `python manage.py makemigrations` and `python manage.py migrate`; then end-to-end smoke test: start backend + frontend, verify login renders, login as admin, verify redirect to home with TopBar, click logout, verify redirect to login

**Checkpoint**: Complete authentication feature verified end-to-end.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 Login (Phase 3)**: Depends on Phase 1 + Phase 2
- **US2 Logout (Phase 4)**: Depends on Phase 1 + Phase 2 + T014 (UsuarioDAO) + T015 (AutenticacionServicio)
- **Verification (Phase 5)**: Depends on all user stories being complete

### Within Each User Story

- Serializers/DAOs before services
- Services before views
- API before frontend integration
- Story complete before moving to next priority

---

## Parallel Opportunities

| Tasks | Parallel Group | Why |
|-------|---------------|-----|
| T002, T003, T004 | Setup tools | Different package managers (pip, npm), no shared state |
| T008, T010, T011, T012 | Foundational infra | Backend modules, frontend config, styling, routing — independent files |
| T013, T014 | US1 data layer | Serializer and DAO are independent files |
| T018, T019 | US1 frontend base | Auth API service and AuthContext are independent files |
| T022, T025, T026 | US2 service + layout | Backend service and frontend components (TopBar, SideMenu) are independent |
| T030, T031, T032 | Verification tests | Login tests, logout tests, and integration tests are independent cases |

### Parallel Example: User Story 1

```bash
# Launch all [P] tasks for US1 together:
Task: "T013 — Create AutenticacionSerializer"
Task: "T014 — Create UsuarioDAO"
Task: "T018 — Create authApi service"
Task: "T019 — Create AuthContext and useAuth"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Login)
4. **STOP and VALIDATE**: Manual test — start backend, POST `/login/` with admin via curl
5. Deploy/demo — login flow is functional

### Full Feature Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 Login → Test independently → MVP ready
3. Add US2 Logout + Layout → Test independently → Full auth feature
4. Add Verification → Final validation

### Parallel Team Strategy

With multiple developers:

1. **Developer A**: Phase 1 + Phase 2 (foundation)
2. **Developer B**: Phase 3 (US1 — Login) — can start once T005-T007 (User model + DRF config) are done
3. **Developer C**: Phase 4 (US2 — Logout/Layout) — can start once T005-T007 are done
   - T022 (service method) depends on T014-T015; T025-T027 (layout) can start immediately

---

## Notes

- [P] tasks = different files, no dependencies
- [US1], [US2] = story label for traceability
- Each user story is independently completable and testable
- Backend paths: `siged/backend/apps/core/`
- Frontend paths: `siged/frontend/src/`
- Commit after each task or logical group
- Run `python manage.py test` after Phase 3 and Phase 4
- Run `python manage.py runserver` and `npm run dev` to verify full stack
