/**
 * Returns a plain object with leading underscores stripped from all top-level
 * keys. This lets mappers consume domain aggregates that follow the `private
 * _field` + getter pattern without leaking the raw backing-field name in the
 * HTTP response (e.g. `_departements` → `departements`).
 */
export function stripPrivateKeys(source: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) =>
      key.startsWith('_') ? [key.slice(1), value] : [key, value],
    ),
  );
}
