import { after, type NextRequest } from "next/server";

const LINK_PREVIEW_BOTS: [platform: string, pattern: RegExp][] = [
  ["iMessage", /Facebot Twitterbot\/1\.0/],
  ["카카오톡", /kakaotalk-scrap/],
  ["카카오스토리", /kakaostory-og-reader/],
  ["LINE", /line-poker/],
  ["네이버 블로그·카페", /Blueno\//],
  ["Signal", /^WhatsApp\/2$/],
  ["WhatsApp", /^WhatsApp\/\d+\.\d/],
  ["Telegram", /TelegramBot \(like TwitterBot\)/],
  ["Discord", /Discordbot/],
  ["Slack", /Slackbot-LinkExpanding/],
  ["Microsoft Teams·Skype", /SkypeUriPreview/],
  ["Google Messages", /GoogleMessages/],
  ["Snapchat", /Snap URL Preview Service/],
  ["Facebook·Instagram·Threads·Messenger", /^facebookexternalhit\/1\.1(?: \(\+http:\/\/www\.facebook\.com\S+\))?$/],
  ["X", /Twitterbot\//],
  ["LinkedIn", /LinkedInBot\//],
  ["Reddit", /redditbot\//],
  ["Notion", /docs\/about\) Notion|NotionEmbedder/],
  ["Jira·Confluence", /docs\/about\) Atlassian/],
  ["Canva", /docs\/about\) Canva/],
  ["OpenGraph.io", /OpenGraph\.io\//],
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
            { name: "링크", value: `\`${path}\`` },
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
