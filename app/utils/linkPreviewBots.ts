import { after, type NextRequest } from "next/server";

const LINK_PREVIEW_BOTS: [platform: string, pattern: RegExp][] = [
  ["네이버 블로그/카페", /Blueno\//],
  ["네이버웍스", /WorksOgCrawler\//],
  ["카카오스토리", /kakaostory-og-reader/],
  ["카카오톡", /kakaotalk-scrap/],
  ["Canva", /docs\/about\) Canva/],
  ["Discord", /Discordbot/],
  ["Google Messages", /GoogleMessages/],
  ["iMessage", /Facebot Twitterbot\/1\.0/],
  ["Jira/Confluence", /docs\/about\) Atlassian/],
  ["LINE", /line-poker/],
  ["LinkedIn", /LinkedInBot\//],
  ["Meta", /^facebookexternalhit\/1\.1(?: \(\+http:\/\/www\.facebook\.com\S+\))?$/],
  ["Microsoft Teams", /SkypeUriPreview/],
  ["Notion", /docs\/about\) Notion|NotionEmbedder/],
  ["OpenGraph.io", /OpenGraph\.io\//],
  ["Reddit", /redditbot\//],
  ["Signal", /^WhatsApp\/2$/],
  ["Slack", /Slackbot-LinkExpanding/],
  ["Snapchat", /Snap URL Preview Service/],
  ["Telegram", /TelegramBot \(like TwitterBot\)/],
  ["WhatsApp", /^WhatsApp\/\d+\.\d/],
  ["X", /Twitterbot\//],
];

const ANY_LINK_PREVIEW_BOT = new RegExp(LINK_PREVIEW_BOTS.map(([, pattern]) => pattern.source).join("|"));

const sendToDiscord = async (path: string, userAgent: string) => {
  const [platform] = LINK_PREVIEW_BOTS.find(([, pattern]) => pattern.test(userAgent))!;
  const time = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul" });
  await fetch(process.env.DISCORD_LINK_PREVIEW_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: `🔗 ${platform}에서 링크가 공유됐어요`,
          color: 14876416,
          fields: [
            { name: "링크", value: `\`${path}\`\n\u200b` },
            { name: "User-Agent", value: `\`${userAgent}\`` },
          ],
          footer: { text: `${time} KST` },
        },
      ],
    }),
  });
};

export const notifyLinkPreview = (request: NextRequest) => {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (request.method !== "GET" || !ANY_LINK_PREVIEW_BOT.test(userAgent)) return;
  const { pathname, search } = request.nextUrl;
  after(() => sendToDiscord(pathname + search, userAgent));
};
