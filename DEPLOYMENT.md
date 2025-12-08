# MoneyFast Uganda - Deployment Guide

This guide explains how to deploy your system to Vercel and connect your domain `dslns.com`.

## 1. Preparation
Your project is now Vercel-ready. The following files have been added:
- `vercel.json`: Configuration for Vercel.
- `api/index.js`: Serverless entry point.
- `src/config/db.js`: Updated to support both PostgreSQL (Production) and SQLite (Demo).

## 2. Deploy to Vercel
1.  **Push to GitHub:** Ensure your latest code is pushed to your GitHub repository.
2.  **Login to Vercel:** Go to [vercel.com](https://vercel.com) and log in.
3.  **Import Project:** Click "Add New..." -> "Project" and select your `bulk-payment-system` repository.
4.  **Configure:**
    -   Framework Preset: **Other**
    -   Root Directory: `./` (default)
    -   Build Command: (Leave empty or `npm install`)
    -   Output Directory: (Leave empty)
    -   **Environment Variables:**
        -   Add keys from your `.env` file (e.g., `JWT_SECRET`, `MTN_SUBSCRIPTION_KEY`, etc.).
        -   **Database:**
            -   **Option A (Demo Mode):** Do nothing. The system will use a temporary in-memory database. Data will reset on redeployment.
            -   **Option B (Production):** Create a Postgres database (e.g., on Neon.tech or Supabase). Get the connection string and add it as `DATABASE_URL` in Vercel Environment Variables.
5.  **Deploy:** Click "Deploy".

## 3. Connect Domain (dslns.com)
1.  Once deployed, go to your Project Dashboard on Vercel.
2.  Click **Settings** -> **Domains**.
3.  Enter `dslns.com` and click **Add**.
4.  Vercel will show you DNS records (A Record or CNAME).
5.  Go to your Domain Registrar (where you bought dslns.com) and update the DNS records to match what Vercel provides.
6.  Wait for propagation (usually minutes).

## 4. Verification
-   Visit `https://dslns.com/landing.html` to see your new site.
-   Visit `https://dslns.com/` to log in to the system.
