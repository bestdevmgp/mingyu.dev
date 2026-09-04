import type { PostHog } from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

type Props = Record<string, unknown>;

const QUEUE_LIMIT = 50;

let client: PostHog | null = null;
let booting = false;
const queue: { name: string; props?: Props }[] = [];

const isLocalhost = () =>
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export const isAnalyticsEnabled = () => Boolean(KEY) && !isLocalhost();

export function track(name: string, props?: Props) {
  if (!isAnalyticsEnabled()) return;
  if (client) {
    client.capture(name, props);
    return;
  }
  if (queue.length < QUEUE_LIMIT) queue.push({ name, props });
}

export function setLocale(locale: string) {
  client?.register({ locale });
}

export async function bootPostHog() {
  if (!KEY || !isAnalyticsEnabled() || booting || client) return;
  booting = true;

  const { default: posthog } = await import("posthog-js");

  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: "history_change",
    person_profiles: "identified_only",
    disable_capture_url_hashes: true,
    persistence: "localStorage+cookie",
  });

  posthog.register({ locale: document.documentElement.lang || "ko" });

  client = posthog;
  for (const event of queue.splice(0)) posthog.capture(event.name, event.props);
}
