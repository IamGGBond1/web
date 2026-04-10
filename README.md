#对冲基金官网示范（GitHub Pages）

本目录为**独立仓库**结构：静态页面在 `site/`，通过 GitHub Actions 发布到 GitHub Pages。

## 本地预览

用浏览器直接打开 `site/index.html`，或在本目录执行：

```bash
npx --yes serve site
```

浏览器访问终端里显示的地址（一般为 http://localhost:3000）。

## 部署到 GitHub Pages

1. 在 GitHub 新建**公开**仓库（免费账号下私有仓库通常无法使用 Pages，除非付费计划支持）。
2. 将**本文件夹**作为仓库根目录推送（注意：推送的是 `fund-site-github-pages` 里的内容，不要把外层整个「交易信号2026」推上去，除非你刻意要单仓多项目）。

   ```bash
   cd fund-site-github-pages
   git init
   git add .
   git commit -m "Initial demo site for GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

3. 打开仓库 **Settings → Pages**：
   - **Build and deployment → Source** 选择 **Deploy from a branch**（从分支部署）。
   - **Branch** 选 **gh-pages**，文件夹选 **/ (root)**。首次需先推送一次 `main`，等 Actions 生成 `gh-pages` 分支后再选；若列表里没有 **gh-pages**，点一次 **Run workflow** 或任意小提交触发部署后再刷新设置页。
4. 等待 **Actions** 里 “Deploy to GitHub Pages” 跑绿。站点地址一般为：

   `https://<用户名>.github.io/<仓库名>/`

若仓库名为 `<用户名>.github.io`，则主页为 `https://<用户名>.github.io/`。

## 自定义域名（可选）

在 **Settings → Pages** 填写域名，并按提示在 DNS 服务商处添加 **CNAME** 或 **A** 记录；勾选 **Enforce HTTPS**。

## 说明

- 文案与 “Aurora Capital” 仅为演示，请替换为经合规审核的内容。
- 本示例使用 `site` 作为网站根目录，避免把 `.github` 等一并当作站点资源上传。
