# РемоДива — KG

安卓 APK 落地页，全站俄语，已按目标市场本地化。
上线方式：GitHub → Cloudflare Pages 自动构建。

## 文件在哪

```
index.html              落地页本体：文案 / 卡片 / 弹窗 / 前端事件
public/config.js        唯一配置：APK 链接 + 像素 + 年龄门      ← 平时只改这里
public/privacy.html     隐私政策
public/terms.html       使用条款
public/rekvizity.html   卖家资质（日本特商法页的俄语替代版）
public/assets/girls/    01.jpg … 09.jpg（600×800，3:4）
worker/_worker.js       分流 + 后台面板 + 内嵌安全页
scripts/build.mjs       index.html + public/* → dist/
scripts/test-cloak.mjs  17 项分流自检
```

## 本地跑

```bash
node scripts/build.mjs        # 出 dist/
node scripts/test-cloak.mjs   # 分流自检，必须 0 failed
node scripts/dev.mjs          # 本地预览，默认 5173
```

## Cloudflare Pages 设置

| 项目 | 值 |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| 环境变量 | `ADMIN_TOKEN` = remo-kg-2026 |
| D1 绑定 | 变量名 `DB` |
| 其它变量 | `PREVIEW_TOKEN`（可选）、`SAFE_COUNTRY_STRICT` = 1 |

后台：`https://你的域名/admin/live?token=remo-kg-2026`

## 分流

**这个站不分流。** 任何人打开域名都直接看到真页，没有安全页、不看国家、不看语言、不看设备。

`worker/_worker.js` 只保留统计功能：

| 路径 | 作用 |
|---|---|
| `/api/ping` | 页面定时打点，记录在线 |
| `/api/stats?token=` | 后台拉数据 |
| `/admin/live?token=` | 实时面板 |

安全页（`SAFE_HTML`）已删除。内置浏览器弹窗（FB / IG / Telegram 里提示「用浏览器打开」）也已删除，所有人走同一套下载流程。

## 换成本地真实信息（4 处）

1. `public/config.js` → `DOWNLOAD_URL`、`FB_PIXEL_ID`
2. `public/rekvizity.html` → 所有 【...】 换成真实卖家资料
3. `index.html` → `GIRLS` 数组（名字 / 状态）、`REACTIONS` 数组（点遥控器时的台词）
4. `public/assets/girls/` → 01.jpg … 09.jpg

## 不能动的三条

- 页脚和「同意」区块里的 18+ 与「仅在她同意后可操作」表述，两处都要留。
- 像素事件：免费的下载按钮 → `InitiateCheckout`；弹层里的下载按钮 → `Purchase`。
- 内置浏览器（FB / IG / Telegram）里一律不报转化事件，只弹「请用浏览器打开」。
