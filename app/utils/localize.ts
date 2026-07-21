type WithI18n = { i18n?: unknown };

export function applyLocale<T extends WithI18n>(row: T, locale: string): Omit<T, "i18n"> {
  const { i18n, ...rest } = row;
  if (locale === "ko" || !i18n) return rest;
  const dict = i18n as Record<string, Partial<T> | undefined>;
  const translation = dict[locale] ?? dict.en;
  return translation ? { ...rest, ...translation } : rest;
}

export function applyLocaleAll<T extends WithI18n>(rows: T[], locale: string): Omit<T, "i18n">[] {
  return rows.map(row => applyLocale(row, locale));
}
