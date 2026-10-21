import { EMAIL } from "@/lib/site";

export function GET() {
  return new Response(null, { status: 307, headers: { Location: `mailto:${EMAIL}` } });
}
