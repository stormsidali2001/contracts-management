# Fix Plan — DDD Issues

---

## Issue 1 — `AgreementService` depends on `UserService` and `DirectionService`

### Problem A: `findAll` loads the caller's own User aggregate ✅ DONE

`AgreementService.findAll(params, userId)` called `this.userService.findBy({ id: userId })` just
to read `user.role`, `user.departementId`, and `user.directionId`. This is redundant auth
context resolution — the JWT guard already did this work. The right fix is to resolve it at the
transport layer.

> **Note:** Application services CAN call into other bounded contexts — that is legitimate
> orchestration. The issue here was calling `userService` to re-discover the *caller's own
> identity*, which the JWT already carries. If fresh DB values are needed, the guard/middleware
> should handle that enrichment, not the use case.

**Done:**
- Added `departementId: string | null` and `directionId: string | null` to `JwtPayload`
- Updated `AuthService.login` and `refresh_token` to populate the new fields
- Created `@CurrentUser()` decorator (`src/auth/decorators/currentUser.decorator.ts`)
- Updated `AgreementController.findAll` to use `@CurrentUser()` and pass context directly
- Updated `AgreementService.findAll` signature to accept `role`, `departementId`, `directionId`
- Removed `UserService` from `AgreementService` constructor

---

### Problem B: `createAgreement` loads `Direction` to validate a cross-aggregate invariant ✅ DONE

Loading the entire `Direction` aggregate to re-check a DB FK constraint is a cross-aggregate
validation anti-pattern. The DB will raise a constraint violation on invalid IDs.

**Done:**
- Removed the `Direction` load and `departement.find` check from `createAgreement`
- Removed `DirectionService` from `AgreementService` constructor
- `AgreementService` now depends only on `IAgreementRepository`, `VendorService`, `EventBus`

---

## Issue 2 — `NotificationRepository` has no domain interface ✅ DONE

**Done:**
- Created `src/user/domain/notification.repository.ts` with `INotificationRepository` and
  `NOTIFICATION_REPOSITORY` symbol
- `NotificationRepository` now implements `INotificationRepository`; `saveMany` accepts
  `{ message, userId }[]` (no TypeORM shape leaking)
- `UserNotificationService` injects `INotificationRepository` via its symbol
- `UserModule` registers `{ provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepository }`

---

## Issue 3 — Circular dependency (`forwardRef`) between `UserNotificationService` and `UserService` ✅ DONE

**Done:**
- Removed `saveNotificationsForDepartement` from `UserNotificationService`
- Renamed `saveNotifications` → `saveForUsers(notifications: { userId, message }[])`
- Removed `UserService` injection and `forwardRef` from `UserNotificationService`
- Moved dept user-ID resolution into `AgreementCreatedHandler` (which already had `UserService`)
- All other handlers updated from `saveNotifications` → `saveForUsers`

---

## Issue 4 — `Direction` does not extend `AggregateRoot` ✅ DONE

**Done:**
- Created domain events in `src/direction/domain/events/`:
  `direction-created`, `direction-updated`, `direction-deleted`,
  `departement-added`, `departement-updated`, `departement-removed`
- `Direction` now extends `AggregateRoot` from `src/shared/domain/aggregate-root`
- Added `Direction.reconstitute()` for repository mappers (does not emit events)
- `Direction.create()` emits `DirectionCreatedEvent`
- `rename()` emits `DirectionUpdatedEvent`
- `addDepartement()` emits `DepartementAddedEvent`
- `updateDepartement()` emits `DepartementUpdatedEvent`
- `removeDepartement()` emits `DepartementRemovedEvent`
- `DirectionService` and `DepartementService` now inject `EventBus` and call
  `eventBus.publishAll(direction.pullEvents())` after every mutation
- `deleteDirection` publishes `DirectionDeletedEvent` directly
- `DirectionModule` imports `CqrsModule`
- `DirectionRepository.toDomain()` uses `Direction.reconstitute()` to avoid spurious events

---

## Issue 5 — Inverted uniqueness logic in `updateUserUniqueCheck` (production bug) ✅ DONE

**Done:**
- Rewrote the method (renamed to `updateUser`):
  1. Fetch target user and current user in parallel — throw `NotFoundError` if either missing
  2. Permission check: non-admin can only update themselves
  3. Uniqueness check: only throws `ConflictError` if ANOTHER user owns the new email/username
- Removed the extra `findProfileById` call that was only used to re-display conflict data
- Updated controller and unit tests

---

## Issue 6 — Presentation shape assembled inside the application service ✅ DONE

**Done:**
- `getUserTypesStats` now returns `{ role: string; total: number }[]` — raw data, no reshaping
- Removed the dead `_user` parameter
- `StatisticsService.getStats` reshapes the raw array into `{ juridical, employee, admin, total }`
- All handler callers updated (removed the `null` second argument)

---

## Issue 7 — `recieveNotifications` returns the caller's input, not the actual state ✅ DONE

**Done:**
- Removed the `recieve_notifications: boolean` parameter entirely
- Returns `user.recieve_notifications` (actual post-toggle state from the aggregate)
- Controller updated to not pass the body param

---

## Execution order (all complete)

```
1. Issue 7 — recieveNotifications return value          ✅
2. Issue 5 — updateUserUniqueCheck inverted logic       ✅
3. Issue 6 — getUserTypesStats presenter concern        ✅
4. Issue 2 — INotificationRepository interface          ✅
5. Issue 3 — remove forwardRef / circular dep           ✅
6. Issue 1A — JwtPayload + CurrentUser decorator        ✅
7. Issue 1B — remove cross-aggregate validation         ✅
8. Issue 4 — Direction extends AggregateRoot            ✅
```
