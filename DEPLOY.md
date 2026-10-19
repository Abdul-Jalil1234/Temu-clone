# Deployment guide

The app needs four external things: **PostgreSQL**, a **Sanity** project (products), **Stripe** (payments) and, optionally, a **FastBot** bot (AI chat).

## 0. Collect your keys

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Any Postgres (Neon, Supabase, Vercel Postgres, or the bundled Docker one) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | sanity.io/manage → your project |
| `SANITY_API_READ_TOKEN` (Viewer) and `SANITY_API_WRITE_TOKEN` (Editor) | sanity.io/manage → API → Tokens |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Developers |
| `NEXT_PUBLIC_BASE_URL` | Your final site URL, e.g. `https://shop.example.com` |
| `FASTBOT_API_KEY` | app.fastbots.ai → your bot → Settings → API key |

Copy `.env.example` to `.env` and fill these in. **Never commit `.env`.**

---

## Option A — Vercel (easiest)

1. Push this project to GitHub.
2. Create a free Postgres database (e.g. neon.tech) and copy its connection string.
3. On vercel.com → **Add New → Project** → import the repo.
4. Add every variable from step 0 under **Settings → Environment Variables**.
5. Set the **Build Command** to `npx prisma generate && npx prisma db push && next build` (creates the tables on first deploy), then **Deploy**.
6. Set `NEXT_PUBLIC_BASE_URL` to your Vercel URL and redeploy.
7. In Sanity → API → **CORS origins**, add your site URL (with credentials allowed).
8. In Stripe → Developers → Webhooks, add `https://YOUR-SITE/api/stripe/webhook` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Option B — Docker (any VPS: DigitalOcean, Hetzner, AWS…)

```bash
cp .env.example .env        # fill it in (DATABASE_URL is overridden to the bundled Postgres)
docker compose up -d --build
```

The site is on http://localhost:3000. Tables are created automatically on container start.

Put it behind HTTPS with Caddy (auto certificates):

```
# /etc/caddy/Caddyfile
shop.example.com {
    reverse_proxy localhost:3000
}
```

Then follow steps 7–8 from Option A (Sanity CORS, Stripe webhook).
To update later: `git pull && docker compose up -d --build`.

**Docker without compose** (using an external database):

```bash
docker build -t temu-clone \
  --build-arg NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
  --build-arg NEXT_PUBLIC_SANITY_DATASET=production \
  --build-arg NEXT_PUBLIC_BASE_URL=https://shop.example.com .
docker run -d -p 3000:3000 --env-file .env temu-clone
```

> `NEXT_PUBLIC_*` values are baked in at **build** time, so rebuild the image if you change them.

---

## New features & how to configure them

- **Flash-sale timers** — banner and "Flash Deals" row count down to local midnight and restart automatically each day. For a fixed deadline, pass `useCountdown(timestampMs)`.
- **Category nav bar** — built from your Sanity `productCategory` documents. Add a category in `/studio` and it appears.
- **Daily Spin & Win** — one spin per day per browser; it resets at local midnight. The prize is chosen by date (`src/actions/wheel-of-fortune-actions.ts`), and a server cookie stops a second free prize on the same day. A floating 🎁 button reopens the wheel / shows the time until the next spin.
- **AI chat (FastBot)** — the chat box calls `/api/chat`, which forwards to FastBot with your key server-side. Set `FASTBOT_API_KEY`; without it the chat answers "not configured". If you prefer FastBot's own widget instead, add `<script defer src="https://app.fastbots.ai/embed.js" data-bot-id="YOUR_BOT_ID"></script>` to `src/app/layout.tsx` and remove `<ChatWidget />`.
- **Extras** — trust bar (free shipping/returns), flash-deal cards with discount badges and "% claimed" bars.

## Troubleshooting

- *Build fails with "SANITY_API_READ_TOKEN is not set"* — add the token as a build-time env var too.
- *Images don't load* — product images come from `cdn.sanity.io`; confirm the dataset is public or the token is valid.
- *Chat says unavailable* — check `FASTBOT_API_KEY` and that the bot is enabled in FastBot.
