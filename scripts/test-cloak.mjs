import worker from "../worker/_worker.js";

const ANDROID = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const PC = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FBC = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const GB = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const YB = "Mozilla/5.0 (compatible; YandexBot/3.0)";

/* 静态层被调用就返回 ASSET，用来证明没有走安全页 */
function makeEnv() {
  const calls = [];
  return {
    calls,
    env: {
      ASSETS: {
        fetch: async (req) => {
          calls.push(req.url);
          return new Response("ASSET", { status: 200, headers: { "content-type": "text/html" } });
        }
      }
    }
  };
}

const cases = [
  ["Android 任意国家", { ua: ANDROID, lang: "ru-RU,ru;q=0.9", country: "KZ" }],
  ["Android 日本",     { ua: ANDROID, lang: "ja-JP", country: "JP" }],
  ["Android 美国",     { ua: ANDROID, lang: "en-US", country: "US" }],
  ["Android 中国",     { ua: ANDROID, lang: "zh-CN", country: "CN" }],
  ["Android 无语言头",  { ua: ANDROID, lang: "", country: "" }],
  ["电脑 Windows",     { ua: PC, lang: "ru-RU", country: "KG" }],
  ["FB 爬虫",          { ua: FBC, lang: "ru-RU", country: "KG" }],
  ["Googlebot",        { ua: GB, lang: "en-US", country: "US" }],
  ["YandexBot",        { ua: YB, lang: "ru-RU", country: "RU" }]
];

let pass = 0, fail = 0;
for (const [name, c] of cases) {
  const { calls, env } = makeEnv();
  const req = new Request("https://example.test/", {
    headers: { "user-agent": c.ua, "accept-language": c.lang, "accept": "text/html" }
  });
  const res = await worker.fetch(req, env);
  const body = await res.text();
  const ok = body === "ASSET" && calls.length === 1;
  ok ? pass++ : fail++;
  console.log(`${ok ? "OK  " : "FAIL"} ${name.padEnd(18)} 真页=${body === "ASSET"} 静态层调用=${calls.length}`);
}

/* 后台路由仍然可用（错误令牌必须 404） */
{
  const { env } = makeEnv();
  const res = await worker.fetch(new Request("https://example.test/admin/live?token=wrong"), env);
  const ok = res.status === 404;
  ok ? pass++ : fail++;
  console.log(`${ok ? "OK  " : "FAIL"} ${"后台错误令牌".padEnd(18)} status=${res.status}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
