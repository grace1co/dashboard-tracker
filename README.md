# 🌿 My Life Dashboard

A personal, mobile-first life dashboard built with Next.js 14, Tailwind CSS, Neon Postgres, Prisma, and PWA support. Track goals, habits, tasks, books, reflections, bucket list items — and get daily SMS summaries.

---

## ✨ Features

| View | What's inside |
|------|--------------|
| **Weekly** | Focus, tasks, gym count, events, books, wins |
| **Monthly** | Gym calendar, books read, reflections, goals |
| **Quarterly** | Goals with subtasks, finance tracker |
| **Habits** | Daily checklist, streaks, monthly grid |
| **Yearly** | Vision reset, life buckets, long-term goals |
| **Bucket List** | Dream list with categories and status |
| **Settings** | Profile, SMS, Google Calendar, theme |

- 📱 PWA — install on iPhone or Android like a native app
- 💬 SMS automation via Twilio (morning summary + evening inbox)
- 🗓 Google Calendar integration
- ⚡ Vercel-ready with cron job for morning texts

---

## 🚀 Quick Setup

### 1. Create the Next.js project

```bash
npx create-next-app@14 my-dashboard --typescript --tailwind --app --no-src-dir
cd my-dashboard
```

### 2. Install dependencies

```bash
npm install @prisma/client prisma next-pwa framer-motion \
  react-hot-toast lucide-react date-fns clsx \
  tailwind-merge twilio tsx
```

### 3. Copy all project files

Copy every file from this repo into your project directory, preserving the folder structure.

### 4. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Neon Postgres — get from https://neon.tech
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"

# App URL (use http://localhost:3000 locally)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Cron secret (make up any long random string)
CRON_SECRET="replace-with-random-secret-string"

# Twilio — optional, see SMS setup below
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
MY_PHONE_NUMBER=""

# Google Calendar — optional, see Calendar setup below
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REFRESH_TOKEN=""
```

### 5. Set up the database

```bash
npx prisma db push
```

### 6. Seed with sample data

```bash
npx tsx prisma/seed.ts
```

### 7. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — it redirects to `/weekly`.

---

## 📦 Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Add environment variables in the Vercel dashboard:
# Settings → Environment Variables → paste all vars from .env.local
```

> The `vercel.json` cron job fires daily at 8 AM UTC to send your morning text. Adjust the schedule if needed (`"0 12 * * *"` = 8 AM EST).

---

## 📱 Install as a Phone App (PWA)

### iPhone (Safari)
1. Open your deployed app URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — done!

### Android (Chrome)
1. Open the URL in **Chrome**
2. Tap the menu (⋮ three dots)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Tap **Add**

The app opens full-screen, no browser chrome, with your sage-green icon.

---

## 💬 SMS Automation Setup

### Twilio Account
1. Sign up at [twilio.com](https://twilio.com) (free trial available)
2. Buy a phone number (~$1/month)
3. Copy your **Account SID** and **Auth Token** from the dashboard
4. Add all three values to `.env.local`

### Webhook (incoming texts)
In your Twilio console:
- Go to your phone number settings
- Under **Messaging**, set the webhook URL to:
  ```
  https://your-app.vercel.app/api/sms/receive
  ```
- Method: **HTTP POST**

### What you can text in:
| Text | Action |
|------|--------|
| `gym` / `worked out` | Logs gym habit for today |
| `finished reading Book Title` | Marks book as read |
| `done task name` | Marks matching task complete |
| `win: something great happened` | Adds a win |
| `help` | Returns command list |

---

## 🗓 Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Google Calendar API**
4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add your app URL as an authorized redirect URI
7. Use the OAuth playground or a one-time script to get a `refresh_token`
8. Paste the three values into `.env.local`

---

## 🗂 Project Structure

```
app/
  weekly/        → Weekly dashboard (default home)
  monthly/       → Monthly view
  quarterly/     → Quarterly goals & finance
  habits/        → Habit tracker
  yearly/        → Yearly vision reset
  bucketlist/    → Life bucket list
  settings/      → App settings
  offline/       → PWA offline fallback
  api/           → All API routes
    tasks/
    habits/
    goals/
    books/
    events/
    reflections/
    wins/
    bucketlist/
    finance/
    settings/
    sms/
components/
  DesktopNav.tsx
  MobileNav.tsx
  ui.tsx
lib/
  prisma.ts
  utils.ts
prisma/
  schema.prisma
  seed.ts
public/
  manifest.json
  icons/
```

---

## 🎨 Customizing Colors

All colors are defined in `tailwind.config.ts` under `theme.extend.colors`. The main palette:

| Token | Hex | Used for |
|-------|-----|---------|
| `sage` | `#6B9080` | Primary actions, active states |
| `terracotta` | `#D4856A` | Accents, warnings |
| `lavender` | `#8B7EC8` | Secondary highlights |
| `forest` | `#1E3C2D` | Text, dark backgrounds |
| `cream` | `#FAF7F2` | Page background |

Change any hex value in `tailwind.config.ts` and the whole dashboard updates.

---

## 📋 Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Run production build
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes
npx tsx prisma/seed.ts  # Re-seed database
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres (serverless)
- **ORM**: Prisma
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **SMS**: Twilio
- **PWA**: next-pwa
- **Deploy**: Vercel
