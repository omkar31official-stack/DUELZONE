# 🚀 DUELZONE Full Deployment Guide

This guide details how to deploy **DUELZONE** for free so two (or more) players anywhere in the world can open a link, create private rooms, and play all 10 real-time mini-games.

---

## 🏗️ Architecture Overview

DUELZONE consists of two main parts:
1. **Backend Service (`server/`)**: A Node.js + Express + Socket.IO server hosted on **Render** or **Railway**.
2. **Frontend Web App (`client/`)**: A Vite + React static application hosted on **Vercel** or **Netlify**.

---

## Step 1: Push Code to GitHub updated

First, upload your project folder to GitHub:

```bash
cd /media/omkar/Storage/Projects/game
git init
git add .
git commit -m "Initial DUELZONE production build"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/duelzone.git
git push -u origin main
```

---

## Step 2: Deploy the Backend Server (Render.com)

Render provides free Node.js hosting with WebSockets support.

1. Go to [Render.com](https://render.com) and log in with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your **`duelzone`** GitHub repository.
4. Fill in the service configuration:
   - **Name**: `duelzone-server` (or any custom name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will compile your server and give you a public Web Server URL:
   > 📌 **Example Backend URL**: `https://duelzone-server.onrender.com` *(Save this URL for Step 3)*

---

## Step 3: Deploy the Frontend Website (Vercel.com)

Vercel provides lightning-fast global CDN hosting for React/Vite apps.

1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your **`duelzone`** GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click Edit and select `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Add Environment Variable**:
   - **Key**: `VITE_SERVER_URL`
   - **Value**: `https://duelzone-server.onrender.com` *(Use your exact backend URL from Step 2)*
6. Click **Deploy**.
7. Vercel will build the frontend and provide your live website URL:
   > 🌐 **Example Frontend URL**: `https://duelzone-arcade.vercel.app`

---

## Step 4: Verification & Playing Online

1. Open `https://duelzone-arcade.vercel.app` on your laptop or phone.
2. Click **Create Private Room** and enter your name (e.g. `Omkar`).
3. Copy the generated **Room Code** (or click **Copy Code & Link**).
4. Send the code/link to your friend anywhere in the world!
5. When your friend joins on their phone, both players will instantly see each other connected, and the Host can select and start any of the 10 mini-games in real time.
# DUELZONE
