# 🚀 IMovies Deployment Guide

This guide details how to deploy the IMovies Full-Stack MERN application to cloud platforms including **Render**, **Vercel**, and **Railway**.

---

## 🌟 Architecture Options

### Option 1: Unified Single-Service Deployment (Recommended on Render / Railway)
The backend Express server serves both the RESTful API endpoints at `/api/*` and the static React production build from `client/dist`.

- **Root Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Port:** Configured via `PORT` environment variable (Render sets this dynamically).

---

## 🌐 Deploying to Render

1. **Create Web Service:**
   - Link your GitHub repository.
   - Choose **Node** runtime.
   - Set **Root Directory** to `imovies` (or repository root if IMovies is in root).

2. **Build & Start Commands:**
   - **Build Command:**
     ```bash
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command:**
     ```bash
     cd server && npm start
     ```

3. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default for Render)
   - `JWT_SECRET`: `your_secure_production_jwt_secret_key_random`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority` *(Optional: If omitted, IMovies runs on its fast built-in in-memory datastore)*.

---

## ⚡ Deploying Frontend to Vercel (Decoupled Frontend)

If you prefer deploying the React Vite client on Vercel:

1. **Framework Preset:** Vite
2. **Root Directory:** `imovies/client`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variable:**
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`

---

## 🧪 Post-Deployment Verification Checklist

1. [ ] Check health endpoint: `https://<your-domain>/api/health` returns status `ok`.
2. [ ] Login with demo admin: `admin@imovies.com` / `admin123`.
3. [ ] Verify movie catalog and hero banner load on homepage.
4. [ ] Select a movie and navigate to the Showtime selector.
5. [ ] Choose a showtime and select seats on the interactive visual seat map.
6. [ ] Complete test reservation and inspect digital E-Ticket modal.
7. [ ] Visit `/my-bookings` to verify the ticket appears in the guest dashboard.
8. [ ] Visit `/admin` to verify Box Office KPIs and real-time revenue stats.
