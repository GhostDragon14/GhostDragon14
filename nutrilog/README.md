# NutriLog 🥗

A production-ready calorie and fitness tracking web application with three subscription tiers.

**Live URLs (after deployment):**
- Frontend: https://nutrilog.vercel.app
- Backend API: https://nutrilog-api.onrender.com

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Query, Recharts, i18next |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Payments | Stripe |
| Email | Nodemailer (Gmail SMTP) |
| Images | Cloudinary |
| Food APIs | Nutritionix + USDA FoodData Central |
| Fitness Sync | Strava OAuth, Google Fit OAuth |
| Frontend Host | Vercel (free tier) |
| Backend Host | Render (free tier) |

---

## Subscription Tiers

| Feature | Free | Premium ($10/mo) | Premium Plus ($20/mo) |
|---------|------|-----------------|----------------------|
| Food logging (Nutritionix + USDA) | ✅ | ✅ | ✅ |
| Barcode scanning | ✅ | ✅ | ✅ |
| Custom recipes | 2/week | Unlimited | Unlimited |
| Water intake tracking | ✅ | ✅ | ✅ |
| Daily step count | ✅ | ✅ | ✅ |
| Email verification + password reset | ✅ | ✅ | ✅ |
| EN/ES/FR language support | ✅ | ✅ | ✅ |
| Light/dark mode | ✅ | ✅ | ✅ |
| Workout logging + categories | ❌ | ✅ | ✅ |
| Weight/height tracking + graphs | ❌ | ✅ | ✅ |
| Advanced macro tracking | ❌ | ✅ | ✅ |
| Workout scheduling (weekly calendar) | ❌ | ✅ | ✅ |
| Health app sync (Strava, Google Fit) | ❌ | ✅ | ✅ |
| Progress photos | ❌ | ❌ | ✅ |
| BMI calculation | ❌ | ❌ | ✅ |
| Health recommendations engine | ❌ | ❌ | ✅ |
| Community groups + challenges | ❌ | ❌ | ✅ |
| Comprehensive analytics | ❌ | ❌ | ✅ |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clone and install

```bash
git clone https://github.com/ghostdragon14/ghostdragon14.git
cd nutrilog

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
```

### 3. Setup database

```bash
cd backend
npx prisma migrate dev --name init
npm run seed  # Creates admin user + sample diseases
```

### 4. Configure frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
# Set VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Run locally

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

**Default admin:** admin@nutrilog.com / Admin@123!

---

## Production Deployment

### Step 1: Create External Service Accounts

#### Nutritionix (Food API)
1. Go to https://developer.nutritionix.com/
2. Sign up for a free account
3. Create an application
4. Copy **App ID** and **API Key**

#### USDA FoodData Central
1. Go to https://fdc.nal.usda.gov/api-guide.html
2. Sign up for a free API key
3. Copy your **API Key** (or use `DEMO_KEY` for testing)

#### Cloudinary (Image uploads)
1. Go to https://cloudinary.com/
2. Create a free account
3. From Dashboard, copy **Cloud Name**, **API Key**, **API Secret**

#### Gmail SMTP
1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Go to Google Account > Security > App Passwords
4. Create an app password for "Mail"
5. Use that 16-char password as `SMTP_PASS`

#### Stripe (Payments)
1. Go to https://stripe.com/
2. Create an account
3. From Dashboard > Developers > API Keys, copy **Secret Key** and **Publishable Key**
4. Create two products:
   - **Premium**: $10/month recurring → copy Price ID
   - **Premium Plus**: $20/month recurring → copy Price ID
5. Set up webhook (after Render deploy):
   - Endpoint: `https://nutrilog-api.onrender.com/api/subscription/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy **Webhook Secret**

#### Strava (Optional)
1. Go to https://www.strava.com/settings/api
2. Create an application
3. Set callback domain to your Vercel domain
4. Copy **Client ID** and **Client Secret**

#### Google Fit (Optional)
1. Go to https://console.cloud.google.com/
2. Create a project, enable Fitness API
3. Create OAuth 2.0 credentials
4. Add your Vercel URL as authorized redirect URI

---

### Step 2: Deploy Backend to Render

1. Go to https://render.com/ and sign up
2. Click **New** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `nutrilog/backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Add all environment variables from `.env.example`:
   ```
   DATABASE_URL          (Render PostgreSQL connection string)
   JWT_SECRET            (random 64-char string)
   NODE_ENV              production
   FRONTEND_URL          https://nutrilog.vercel.app
   SMTP_HOST             smtp.gmail.com
   SMTP_PORT             587
   SMTP_USER             your-gmail@gmail.com
   SMTP_PASS             your-app-password
   STRIPE_SECRET_KEY     sk_live_...
   STRIPE_WEBHOOK_SECRET whsec_...
   STRIPE_PREMIUM_PRICE_ID        price_...
   STRIPE_PREMIUM_PLUS_PRICE_ID   price_...
   NUTRITIONIX_APP_ID    ...
   NUTRITIONIX_API_KEY   ...
   USDA_API_KEY          ...
   CLOUDINARY_CLOUD_NAME ...
   CLOUDINARY_API_KEY    ...
   CLOUDINARY_API_SECRET ...
   STRAVA_CLIENT_ID      (optional)
   STRAVA_CLIENT_SECRET  (optional)
   GOOGLE_CLIENT_ID      (optional)
   GOOGLE_CLIENT_SECRET  (optional)
   ```
6. Under **Database**, create a **PostgreSQL** database (free tier)
7. Link database to web service
8. Deploy — Render will run migrations automatically
9. Note your Render URL: `https://nutrilog-api.onrender.com`

**After deployment, seed the database:**
```bash
# Using Render Shell or locally with production DATABASE_URL:
npx prisma db seed
```

---

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com/ and sign up
2. Click **New Project** > Import from GitHub
3. Select this repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `nutrilog/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://nutrilog-api.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
6. Deploy
7. Note your Vercel URL: `https://nutrilog.vercel.app`

---

### Step 4: Configure Stripe Webhook

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://nutrilog-api.onrender.com/api/subscription/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the **Signing Secret** to your Render env var `STRIPE_WEBHOOK_SECRET`

---

### Step 5: Update CORS and Redirect URLs

- In Render, set `FRONTEND_URL=https://nutrilog.vercel.app`
- In Strava app settings, add: `https://nutrilog.vercel.app/integrations/strava/callback`
- In Google Console, add: `https://nutrilog.vercel.app/integrations/google-fit/callback`

---

## Project Structure

```
nutrilog/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Full database schema
│   │   └── seed.js            # Admin user + sample diseases
│   ├── src/
│   │   ├── config/            # DB, Stripe, Cloudinary
│   │   ├── controllers/       # 12 controllers (auth, food, workout...)
│   │   ├── middleware/        # JWT auth, subscription tier checks
│   │   ├── routes/            # 13 route files
│   │   ├── services/          # Email, Nutritionix, USDA, Stripe, Cloudinary
│   │   └── utils/             # BMI, TDEE, macro % calculations
│   ├── server.js
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout/            # Navbar, Sidebar, Layout
    │   │   └── common/            # StatCard, Modal, MacroPieChart, ProgressBar
    │   ├── context/            # AuthContext, ThemeContext
    │   ├── i18n/               # EN, ES, FR translations
    │   ├── pages/              # 15 pages
    │   ├── services/           # Axios API client
    │   └── App.jsx             # Routes + providers
    ├── package.json
    ├── vercel.json
    └── .env.example
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| POST | /api/auth/verify-email | Verify email token | Public |
| POST | /api/auth/forgot-password | Request reset | Public |
| POST | /api/auth/reset-password | Reset with token | Public |
| GET | /api/auth/profile | Get profile + goals | JWT |
| PUT | /api/auth/profile | Update profile | JWT |
| PUT | /api/auth/goals | Update nutrition goals | JWT |
| GET | /api/food/search?q= | Search foods | JWT |
| GET | /api/food/barcode/:upc | Lookup by barcode | JWT |
| POST | /api/food/log | Log food | JWT |
| GET | /api/food/log?date= | Get daily food log | JWT |
| POST | /api/water | Log water intake | JWT |
| GET | /api/water?date= | Get daily water | JWT |
| POST | /api/steps | Log steps | JWT |
| POST | /api/workouts | Log workout | JWT+Premium |
| GET | /api/workouts/schedule/week | Get weekly schedule | JWT+Premium |
| POST | /api/weight | Log weight | JWT+Premium |
| GET | /api/analytics/summary | Dashboard summary | JWT |
| GET | /api/analytics/calories | Calorie history | JWT |
| GET | /api/groups | Public groups | JWT+PP |
| POST | /api/groups | Create group | JWT+PP |
| GET | /api/subscription/plans | All plans | Public |
| POST | /api/subscription/checkout | Stripe checkout | JWT |
| POST | /api/subscription/webhook | Stripe webhook | Stripe-signed |
| GET | /api/admin/dashboard | Admin stats | JWT+Admin |

---

## Environment Variables Reference

See `backend/.env.example` and `frontend/.env.example` for all required values.

---

## License

MIT License © 2024 NutriLog
