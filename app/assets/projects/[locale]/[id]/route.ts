import { locales } from "@i18n/config";

import { getProjectIds } from "@/utils/api";
import { getProjectData } from "@/utils/projectData";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap(locale => getProjectIds().map(id => ({ locale, id })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return Response.json(getProjectData(Number(id), locale));
}
