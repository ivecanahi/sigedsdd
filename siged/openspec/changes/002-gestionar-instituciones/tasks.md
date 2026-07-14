# Tasks: Gestionar Instituciones

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2000–2800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 4 stacked PRs |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend foundation | PR 1 | Base: main |
| 2 | Backend views & tests | PR 2 | Base: PR 1 |
| 3 | Frontend foundation & institution UI | PR 3 | Base: PR 2 |
| 4 | Authority modal, My Institutions, cleanup | PR 4 | Base: PR 3 |

## Phase 1: Foundation

- [x] 1.1 Create `organizacion` app with `models.py` (`Institucion`, `Rol`, `UsuarioRol`)
- [x] 1.2 Generate and run migrations
- [x] 1.3 Add `organizacion` to `INSTALLED_APPS` and root `urls.py`
- [x] 1.4 Seed `Rol` constants and initial roles
- [x] 1.5 Create `organizacion/excepciones.py`

## Phase 2: Backend — Institutions

- [x] 2.1 Create `daos/institucion_dao.py`
- [x] 2.2 Create `servicios/institucion_servicio.py`
- [x] 2.3 Create `serializers/institucion_serializer.py`
- [x] 2.4 Create `permisos.py`
- [x] 2.5 Add institution views (list, detail, create, patch, delete, RF-002/003/004/005/006)
- [x] 2.6 Register institution routes in `organizacion/apis/urls.py`

## Phase 3: Backend — Assignments

- [x] 3.1 Create `daos/usuariorol_dao.py`
- [x] 3.2 Create `servicios/usuariorol_servicio.py`
- [x] 3.3 Create `serializers/usuariorol_serializer.py`
- [x] 3.4 Add assignment views (list, create, patch, delete, toggle, /roles/, /usuario/, RF-007/008/009/010/011)
- [x] 3.5 Add `GET /usuarios/?activo=` endpoint in `core`
- [x] 3.6 Wire `organizacion` URLs into root `urls.py`

## Phase 4: Frontend — Foundation

- [x] 4.1 Add `ROLES` constants to `frontend/src/config/app.ts`
- [x] 4.2 Create `features/instituciones/types/institucion.ts` and `usuariorol.ts`
- [x] 4.3 Create `features/instituciones/services/institucionApi.ts` and `usuarioRolApi.ts`
- [x] 4.4 Create `features/instituciones/hooks/useRoles.ts`
- [x] 4.5 Update sidebar to render options per active roles (RF-001)

## Phase 5: Frontend — Institution Management

- [x] 5.1 Create `InstitucionTable.tsx` (pagination, sort, search, autoridades, RF-002/006)
- [x] 5.2 Create `InstitucionForm.tsx`
- [x] 5.3 Create `InstitucionListPage.tsx`
- [x] 5.4 Create `AutoridadAcademicaModal.tsx` (RF-007–011)
- [x] 5.5 Wire table refresh on modal mutations

## Phase 6: Frontend — My Institutions & Routing

- [x] 6.1 Create `InstitucionCard.tsx` and `MisInstitucionesPage.tsx` (RF-012)
- [x] 6.2 Add `/instituciones` and `/mis-instituciones` routes
- [x] 6.3 Add unauthorized redirects

## Phase 7: Testing

- [x] 7.1 Backend unit tests: model, serializer, DAO, service
- [x] 7.2 Backend integration tests: view→service→DAO, permissions
- [x] 7.3 Backend functional tests: CRUD, toggle, search, users filter
- [x] 7.4 Frontend tests: sidebar, table, form, modal
- [x] 7.5 E2E verification against US-1 through US-4

## Phase 8: Cleanup

- [x] 8.1 Verify no hardcoded role strings
- [x] 8.2 Update project docs
