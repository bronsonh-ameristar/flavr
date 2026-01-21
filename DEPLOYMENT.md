# FLAVR Deployment Guide

This guide covers deploying FLAVR to:
- **Vercel** - React frontend
- **Render** - Node.js backend
- **Neon** - PostgreSQL database

## Prerequisites

- GitHub repository with your FLAVR code
- Accounts on [Vercel](https://vercel.com), [Render](https://render.com), and [Neon](https://neon.tech)

---

## Step 1: Set Up Neon Database

1. Log in to [Neon Console](https://console.neon.tech)
2. Create a new project (or use existing)
3. Copy your connection string from the dashboard:
   ```
   postgresql://neondb_owner:PASSWORD@ENDPOINT.neon.tech/neondb?sslmode=require
   ```
4. Save this connection string - you'll need it for Render

---

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub (including the `render.yaml` file)
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repository
5. Render will detect the `render.yaml` and create the service
6. Set the environment variables when prompted

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `flavr-api`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free

### Environment Variables for Render

Set these in the Render dashboard under **Environment**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_0OdcBqXm7yNT@ep-calm-wildflower-af2qdmgo-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | (Generate a secure random string - see below) |
| `FRONTEND_URL` | (Leave empty for now, set after deploying frontend) |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use: `openssl rand -hex 64`

5. Click **Create Web Service**
6. Wait for deployment to complete
7. Copy your Render URL (e.g., `https://flavr-api.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `build` (default)

### Environment Variables for Vercel

Set these in the Vercel dashboard under **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://flavr-api.onrender.com/api` (use your actual Render URL) |
| `REACT_APP_NAME` | `FLAVR` |

5. Click **Deploy**
6. Wait for deployment to complete
7. Copy your Vercel URL (e.g., `https://flavr.vercel.app`)

---

## Step 4: Update Render with Frontend URL

1. Go back to [Render Dashboard](https://dashboard.render.com)
2. Select your `flavr-api` service
3. Go to **Environment**
4. Add/Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://flavr.vercel.app
   ```
   (Use your actual Vercel URL)
5. The service will automatically redeploy

---

## Step 5: Run Database Migrations

The `start:prod` script automatically runs migrations on startup. If you need to run them manually:

1. In Render dashboard, go to your web service
2. Click **Shell** tab
3. Run:
   ```bash
   npx sequelize-cli db:migrate
   ```

---

## Environment Variables Summary

### Render (Backend)

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_0OdcBqXm7yNT@ep-calm-wildflower-af2qdmgo-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<your-generated-secret>
FRONTEND_URL=<your-vercel-url>
```

### Vercel (Frontend)

```
REACT_APP_API_URL=<your-render-url>/api
REACT_APP_NAME=FLAVR
```

---

## Deployment Order Checklist

- [ ] 1. Set up Neon database and copy connection string
- [ ] 2. Deploy backend to Render with DATABASE_URL and JWT_SECRET
- [ ] 3. Copy Render URL
- [ ] 4. Deploy frontend to Vercel with REACT_APP_API_URL pointing to Render
- [ ] 5. Copy Vercel URL
- [ ] 6. Update Render's FRONTEND_URL with Vercel URL
- [ ] 7. Test the application

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` is set correctly in Render (no trailing slash)
- Check browser console for the exact origin being blocked

### Database Connection Failed
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon dashboard to ensure the database is active
- Verify the connection string password is correct

### 404 on Page Refresh (Vercel)
- Ensure `vercel.json` exists in the `client` directory with the rewrite rule

### API Not Responding
- Check Render logs for errors
- Verify the health endpoint: `https://your-render-url.onrender.com/health`
- Note: Free tier services spin down after inactivity (first request may take 30-60s)

### Migrations Not Running
- SSH into Render and run manually: `npx sequelize-cli db:migrate`
- Check that `sequelize-cli` is in production dependencies

---

## Updating the Application

### Frontend Updates
Push to GitHub → Vercel auto-deploys

### Backend Updates
Push to GitHub → Render auto-deploys

### Database Schema Changes
1. Create a new migration: `npx sequelize-cli migration:generate --name your-migration`
2. Edit the migration file
3. Push to GitHub
4. Render will run migrations on deploy (via `start:prod` script)

---

## Useful Commands

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test health endpoint
curl https://your-render-url.onrender.com/health

# Test API
curl https://your-render-url.onrender.com/api/health
```
