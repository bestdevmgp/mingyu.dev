const KEY = "8014fcc69d94c430a4ea24241beb7c9f";
const HOST = "mingyu.dev";

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});

console.log(`${response.status} ${response.statusText} — ${urlList.length} URLs`);
process.exit(response.ok ? 0 : 1);
