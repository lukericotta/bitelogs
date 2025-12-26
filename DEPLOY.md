# BiteLogs Deployment Guide: Render + Supabase

**Cost: $0/month** | **Time: ~20 minutes**

---

## Overview

```
┌─────────────────┐         ┌─────────────────┐
│     Render      │         │    Supabase     │
│  (Web Service)  │────────▶│   (Database)    │
│                 │         │                 │
│  - Express API  │         │  - PostgreSQL   │
│  - React App    │         │  - Free 500MB   │
│  - Free tier    │         │                 │
└─────────────────┘         └─────────────────┘
```

---

## Step 1: Create Supabase Database (5 min)

### 1.1 Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub

### 1.2 Create Project
1. Click "New Project"
2. Fill in:
   - **Name:** `bitelogs`
   - **Database Password:** Generate and **SAVE THIS** (you'll need it)
   - **Region:** Choose closest to you
3. Click "Create new project"
4. Wait ~2 minutes for provisioning

### 1.3 Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string, it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password
5. **Save this** - you'll need it for Render

### 1.4 Run Database Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Paste the following SQL and click "Run":

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  website TEXT,
  cuisine VARCHAR(100) NOT NULL,
  price_range INTEGER NOT NULL CHECK (price_range >= 1 AND price_range <= 4),
  image_url TEXT,
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_item_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_rating ON menu_items(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
```

You should see "Success. No rows returned" ✅

---

## Step 2: Push Code to GitHub (3 min)

### 2.1 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name: `bitelogs`
3. Keep it **Public** or **Private** (either works)
4. Click "Create repository"

### 2.2 Push Your Code
```bash
# In your bitelogs directory
git init
git add .
git commit -m "Initial commit - BiteLogs app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bitelogs.git
git push -u origin main
```

---

## Step 3: Deploy to Render (10 min)

### 3.1 Sign Up
1. Go to [render.com](https://render.com)
2. Click "Get Started"
3. Sign in with **GitHub** (easiest)

### 3.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`bitelogs`)
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `bitelogs` |
| **Region** | Oregon (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | (leave empty) |
| **Runtime** | `Node` |
| **Build Command** | `cd client && npm install && npm run build && cd ../server && npm install && npm run build` |
| **Start Command** | `node server/dist/index.js` |
| **Instance Type** | `Free` |

### 3.3 Add Environment Variables
Scroll down to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 1.3 |
| `JWT_SECRET` | Click "Generate" for a random value |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `LOG_LEVEL` | `info` |

### 3.4 Deploy
1. Click **"Create Web Service"**
2. Wait for build (~3-5 minutes first time)
3. Once deployed, you'll get a URL like: `https://bitelogs.onrender.com`

---

## Step 4: Verify Deployment (2 min)

### 4.1 Check Health Endpoint
Visit: `https://YOUR-APP.onrender.com/api/health`

You should see:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

### 4.2 Test the App
1. Visit your app URL: `https://YOUR-APP.onrender.com`
2. Click "Sign Up" and create an account
3. Explore the app!

---

## Troubleshooting

### Build Fails

**Check build logs in Render dashboard**

Common fixes:
- Ensure all dependencies are in `package.json` (not just devDependencies)
- Check Node version compatibility

### Database Connection Error

**Error:** `ECONNREFUSED` or `connection refused`

**Fix:** Double-check your `DATABASE_URL`:
1. Ensure password is correct (no `[YOUR-PASSWORD]` placeholder)
2. Make sure there are no extra spaces
3. Verify Supabase project is active

### App Works But Shows Blank Page

**Fix:** Check browser console (F12) for errors
- Usually a build issue with client
- Verify `client/dist` was created during build

### Cold Start Takes Forever

This is normal on free tier. First request after 15 min of inactivity:
- Takes 30-60 seconds
- Subsequent requests are fast
- Consider upgrading to $7/month for always-on

---

## Optional: Add Seed Data

To add demo restaurants and users, run this in Supabase SQL Editor:

```sql
-- Create demo user (password: Demo123!@#)
INSERT INTO users (email, password_hash, display_name, is_admin)
VALUES (
  'demo@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYX7q5a5Kq6G',
  'Demo User',
  false
) ON CONFLICT (email) DO NOTHING;

-- Create admin user (password: Demo123!@#)  
INSERT INTO users (email, password_hash, display_name, is_admin)
VALUES (
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYX7q5a5Kq6G',
  'Admin User',
  true
) ON CONFLICT (email) DO NOTHING;
```

**Demo login:** `demo@example.com` / `Demo123!@#`

---

## What's Next?

### Custom Domain (Free)
1. In Render dashboard → Settings → Custom Domains
2. Add your domain
3. Configure DNS with provided values

### Monitoring
- Render provides basic logs in dashboard
- For more: Add Sentry, LogRocket, or similar

### Scaling
When ready for real users:
- Upgrade Render to $7/month (no cold starts)
- Supabase Pro at $25/month (more storage, backups)

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Your App | `https://YOUR-APP.onrender.com` |
| Health Check | `https://YOUR-APP.onrender.com/api/health` |
| Render Dashboard | `dashboard.render.com` |
| Supabase Dashboard | `app.supabase.com` |

**Questions?** Check the [docs](/docs) folder for more details.
