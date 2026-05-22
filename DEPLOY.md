# Deploy: Vercel (frontend) + Render (backend)

## Project layout

```
├── client/          → React app (deploy to **Vercel**)
├── server/          → Express API (deploy to **Render**)
│   ├── index.js
│   ├── routes/
│   ├── models/
│   └── package.json
└── vercel.json      → builds only `client/`
```

---

## Render (backend API)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Root Directory:** `server` ← required
   - **Build Command:** `npm install && npm run build` (or leave Render default — needs `build` script in `server/package.json`)
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. **Environment** tab — add these variables (paste from your local `.env`):

| Variable | Example / notes |
|----------|-----------------|
| `MONGODB_URI` | `mongodb+srv://...` from MongoDB Atlas |
| `JWT_SECRET` | Long random string (32+ chars) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `HF_TOKEN` | Hugging Face token |
| `CLOUDINARY_URL` | Or `CLOUDINARY_CLOUD_NAME` + `API_KEY` + `API_SECRET` |
| `CLIENT_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

4. Deploy. Copy the service URL, e.g. `https://ai-image-generator-00bf.onrender.com`.

Optional: use **Blueprint** with `render.yaml` in the repo root.

---

## Vercel (frontend)

1. [Vercel Dashboard](https://vercel.com) → import the same repo.
2. Settings:
   - **Framework Preset:** Vite (or Other — `vercel.json` handles build)
   - **Root Directory:** leave as **repo root** (default)
   - Build uses `vercel.json` → builds `client/dist` only
3. **Settings → Environment Variables** — add:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | Optional if `client/.env.production` is committed — otherwise set to `https://ai-image-generator-00bf.onrender.com` |

   No `MONGODB_URI`, `JWT_SECRET`, or `HF_TOKEN` on Vercel — those stay on Render only.

4. Deploy (or redeploy after env changes).

---

## Local development

Root `.env` (or `server/.env`) — backend secrets:

```env
MONGODB_URI=...
JWT_SECRET=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
HF_TOKEN=...
CLOUDINARY_URL=...
CLIENT_URL=http://localhost:5173
```

`client/.env` (optional — dev uses Vite proxy if empty):

```env
# Leave empty locally; Vite proxies /api → http://localhost:3000
# VITE_API_URL=http://localhost:3000
```

```bash
npm run install:all
npm run dev
```

- API: http://localhost:3000  
- App: http://localhost:5173  

---

## Quick checklist

| Secret | Render | Vercel |
|--------|--------|--------|
| `MONGODB_URI` | ✅ | ❌ |
| `JWT_SECRET` | ✅ | ❌ |
| `SUPABASE_*` | ✅ | ❌ |
| `HF_TOKEN` | ✅ | ❌ |
| `CLOUDINARY_*` | ✅ | ❌ |
| `CLIENT_URL` | ✅ | ❌ |
| `VITE_API_URL` | ❌ | ✅ |
