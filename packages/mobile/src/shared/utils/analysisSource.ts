export function isManualSearchResult(value: { category?: string | null } | null | undefined): boolean {
  return value?.category === 'Gefunden via Suche';
}
