# tihutest

鹈鹕测试结果展示与投票网站。管理员通过隐藏入口上传 AI 生成的 HTML，访客可以全屏查看结果并进行点赞或点踩。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

请在 `.env.local` 中设置管理员口令。上传文件存储于 R2，结果与按 IP 限制的投票记录存储于 D1。
