type WithI18n = { i18n?: unknown };

export function applyLocale<T extends WithI18n>(row: T, locale: string): Omit<T, "i18n"> {
  const { i18n, ...rest } = row;
  if (locale === "ko" || !i18n) return rest;
  const en = (i18n as { en?: Partial<T> })?.en;
  return en ? { ...rest, ...en } : rest;
}

export function applyLocaleAll<T extends WithI18n>(rows: T[], locale: string): Omit<T, "i18n">[] {
  return rows.map(row => applyLocale(row, locale));
}
