# ChessSim 部署指南

把 ChessSim 部署到生产环境：**GitHub（代码）→ Vercel（构建 + 托管）→ Cloudflare（域名 chesssim.com）**

```
本地代码 ──push──▶ GitHub ──自动构建──▶ Vercel（chesssim-xxx.vercel.app）
                                            ▲
                                            │ DNS 指向
                                  Cloudflare：chesssim.com
```

v0.1 是全静态项目，**无需数据库、无需环境变量、无需任何后端配置**，Vercel 全部使用默认设置即可。

---

## 第 1 步：GitHub（代码仓库）

### 方式 A：已经由 AI 代劳 ✅

如果本项目的代码已经通过你本机登录的 `gh` CLI 推送到 GitHub，跳过本步。

### 方式 B：手动操作

1. 打开 <https://github.com/new>，Repository name 填 `chesssim`；
2. 可见性按需选择（Public / Private 均可，Vercel 两种都能导入）；
3. **不要**勾选 “Add a README file”（保持空仓库，避免推送冲突）；
4. 本地执行：

```bash
cd /Users/dusir/Deepseek1/Projects/Chesssim1
git remote add origin https://github.com/<你的用户名>/chesssim.git
git branch -M main
git push -u origin main
```

> 如果仓库创建时已带 README：先执行
> `git pull origin main --allow-unrelated-histories` 再 push。

---

## 第 2 步：Vercel（部署）

1. 打开 <https://vercel.com>，**用 GitHub 账号登录**（Recommended，这样能直接看到你的仓库）；
2. 控制台 → **Add New… → Project**；
3. 在 Import Git Repository 里找到 `chesssim`，点 **Import**；
4. Vercel 会自动识别为 **Next.js**，所有配置保持默认：

   | 配置项 | 值 |
   |---|---|
   | Framework Preset | Next.js（自动识别） |
   | Build Command | `next build`（自动） |
   | Output Directory | 默认 |
   | Install Command | `npm install`（自动） |
   | Environment Variables | 不需要，留空 |

5. 点 **Deploy**，等待 1–2 分钟；
6. 部署成功后你会得到一个地址：`https://chesssim-xxxx.vercel.app`，点击打开验证：

   - `/` 首页
   - `/matches` 比赛列表
   - `/match/deepseek-vs-gpt` 回放页
   - `/about`、`/updates`

之后每次 `git push` 到 `main` 分支，Vercel 都会**自动重新构建部署**，无需手动操作。

---

## 第 3 步：绑定域名 chesssim.com

域名注册在 Cloudflare，DNS 也在 Cloudflare 管理。思路：**Vercel 上添加域名 → 按 Vercel 给出的记录去 Cloudflare 添加 DNS 记录**。

### 3.1 Vercel 侧

1. 进入项目 → **Settings → Domains**；
2. 输入 `chesssim.com` → **Add**；
3. 再添加 `www.chesssim.com` → **Add**；
4. 此时两个域名会显示 **Invalid Configuration**（正常，因为 DNS 还没配）；
5. 展开域名，Vercel 会显示它要求的 DNS 记录，**记下来**（一般是下面这样，以页面实际显示为准）：

   | Type | Name | Value |
   |---|---|---|
   | CNAME | `www` | `cname.vercel-dns.com` |
   | A | `@`（根域名） | `76.76.21.21` |

### 3.2 Cloudflare 侧

1. 登录 <https://dash.cloudflare.com>，选中 `chesssim.com`；
2. 左侧 **DNS → Records → Add record**，添加两条：

   | Type | Name | Content | Proxy status |
   |---|---|---|---|
   | CNAME | `www` | `cname.vercel-dns.com` | **DNS only（灰云）** |
   | A | `@` | `76.76.21.21` | **DNS only（灰云）** |

   > ⚠️ 关键点：先用 **DNS only（灰云）**，不要开 Cloudflare 代理（橙云）。
   > Vercel 需要直接解析到它的边缘网络来签发 SSL 证书；开代理会导致
   > 域名一直显示 Invalid Configuration。

   > 补充：Cloudflare 支持根域 CNAME Flattening，所以根域名也可以添加
   > `CNAME @ → cname.vercel-dns.com`，效果与 A 记录相同。

3. **www 重定向无需配置**：两个域名都变绿（Valid）后，Vercel 会自动把
   `www.chesssim.com` 重定向到 `chesssim.com`（或按你在 Vercel 里设置的
   Primary 域名反向重定向）。

### 3.3 等待生效并设为默认域名

1. DNS 生效一般几分钟（最长 48 小时，通常很快）；
2. 回到 Vercel → Settings → Domains，状态从 Invalid 变为 **Valid** ✅；
3. 把 `chesssim.com` 设为 **Primary**；
4. 浏览器访问 `https://chesssim.com` 验证。

### 3.4（可选）之后想开 Cloudflare 代理

等 Vercel 域名全部 Valid、HTTPS 正常后，如果确实需要 Cloudflare 的
CDN/防火墙功能，可以尝试把记录改成 **Proxied（橙云）**。如果出现 522
或证书错误，切回 **DNS only（灰云）** 即可——对本项目来说灰云完全够用。

---

## 常见问题排查

| 现象 | 原因 / 解决 |
|---|---|
| Vercel 域名一直 Invalid Configuration | DNS 记录值填错，或还没生效。核对记录后等 5–10 分钟刷新；确认 Cloudflare 里是灰云 |
| 访问域名显示 Vercel 404 | 域名没绑定到具体 Project，检查 Settings → Domains |
| 部署失败 | 打开 Vercel 部署日志看报错；本地先跑 `npm run build` 确认能通过 |
| 改了代码线上没变 | 确认 `git push` 到了 `main` 分支，Vercel 会自动触发部署 |
| 想回滚版本 | Vercel 控制台 → Deployments → 选中旧版本 → Promote to Production |
| 端口 3000 被占用（本地开发） | `lsof -i :3000` 找到 PID 后 `kill <PID>`，或直接访问自动切换的 3001 端口 |

## 日常更新流程

```bash
git add .
git commit -m "描述你的改动"
git push
```

Vercel 收到 push 后自动构建上线。每个 Pull Request 还会自动生成一个
**Preview 预览链接**，方便上线前检查。

---

## 技术备注

- Next.js 15（App Router，全部页面静态生成 / SSG），Node 18.18+；
- Vercel 默认 Node 版本即可，无需额外设置；
- 项目无 `.env` 依赖，不需要配置任何环境变量或密钥；
- 未来接入真实 AI 对弈 API 时，把 API Key 配置在
  Vercel → Settings → Environment Variables 即可，代码侧已有模块化结构预留。
