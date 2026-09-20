# TeamHub — Multi-Tenant SaaS Dashboard (Final Capstone)

Ye ek mini SaaS product hai jaisa Notion/Linear/Asana ka chhota version — har
company ("organization") apna alag, private workspace paata hai, team
members ko roles milte hain, aur subscription plan ke hisaab se features
lock/unlock hote hain.

## Requirements kaise pure hote hain

| Requirement | Kahan implement hai |
|---|---|
| Multi-tenant architecture with team workspaces | `prisma/schema.prisma` (Organization + Membership models) — har API route pehle check karta hai ke user us organization ka member hai ya nahi |
| Role-based access control (admin, member, viewer) | `lib/rbac.js` + har API route mein `requireOrgRole(...)` calls |
| Subscription tiers with feature gating | `lib/plans.js` (FREE/PRO/ENTERPRISE limits) — member limit, task limit, aur "advanced analytics" chart lock/unlock hota hai |
| Analytics dashboard with charts | `app/dashboard/[orgId]/page.jsx` — Recharts se pie chart + bar chart |

Tech: **Next.js (App Router) + Tailwind**, **PostgreSQL + Prisma**, **Recharts**, custom JWT auth.

---

## Step 1 — Zaroori tools

- Node.js (agar already installed hai to skip)
- Neon.tech ka free PostgreSQL account (pehle wale ecommerce task jaisa hi)
- GitHub account
- Vercel account (deploy ke liye)

## Step 2 — Database (Neon)

1. neon.tech pe jayein (agar pehle se account hai to wahi use karein, ya naya project banayein taake ye task alag database use kare).
2. "Create a project" → naam dein (jaise `saas-dashboard`) → Create.
3. Connection string copy karein: `postgresql://username:password@ep-xxxx.neon.tech/dbname?sslmode=require`

## Step 3 — Project set up karna

```
cd saas-dashboard
npm install
cp .env.example .env
```

`.env` file kholein aur fill karein:
- `DATABASE_URL` → Neon wali connection string
- `JWT_SECRET` → koi bhi random lamba text likh dein (jaise `myS3cretKey12345xyzABC`)
- `NEXT_PUBLIC_BASE_URL` → `http://localhost:3000` hi rehne dein

## Step 4 — Database tables banana + demo data daalna

```
npx prisma migrate dev --name init
npm run seed
```

Seed script 3 demo accounts banata hai (ek hi organization "Acme Inc." ke andar, alag-alag roles ke saath) taake aap turant test kar sakein:

| Email | Password | Role |
|---|---|---|
| admin@demo.com | password123 | Admin |
| member@demo.com | password123 | Member |
| viewer@demo.com | password123 | Viewer |

## Step 5 — App chalana

```
npm run dev
```
Browser mein `http://localhost:3000` kholein — login page khulega.

## Step 6 — Poora flow test karna

1. **Multi-tenancy:** `admin@demo.com` se login karein → Overview dashboard khulega jisme "Acme Inc." dikhega. Sidebar mein "+ Organization" jaisa switcher hai — apna khud ka naya account bhi `/register` se bana sakte hain, jo apni alag organization banayega. Dono organizations ek doosre ka data nahi dekh sakte — yehi multi-tenancy hai.
2. **RBAC:** `viewer@demo.com` se login karke dekhein — Tasks page pe "Add Task" form nahi dikhega, sirf read-only list. Team page pe invite/remove buttons nahi dikhenge. Settings pe plan change ka option nahi milega. Ab `admin@demo.com` se login karke wahi pages dekhein — sab kuch editable hai.
3. **Feature gating:** Admin ke Overview page pe "Tasks created (last 14 days)" chart pe 🔒 lock dikhega (kyunki plan FREE hai). Settings → "Pro" plan choose karein → wapas Overview pe jayein — chart unlock ho jayega. Team page pe FREE plan mein sirf 3 members tak invite ho sakte hain (limit hit karke dekhein).
4. **Analytics:** Overview page pe pie chart (tasks by status) hamesha dikhta hai; bar chart sirf Pro/Enterprise pe.
5. **Team invite:** Naya user `/register` se bana lein (alag email se), fir admin account se us email ko Team page se invite karein.

## Step 7 — GitHub pe push karna

```
git init
git add .
git commit -m "Multi-tenant SaaS dashboard - final capstone"
```
GitHub pe naya repo banayein, phir diye gaye commands (`git remote add origin...`, `git push`) chalayein.

## Step 8 — Vercel pe deploy karna

1. vercel.com pe GitHub se sign in karein, repo import karein.
2. Environment Variables mein `DATABASE_URL`, `JWT_SECRET`, aur `NEXT_PUBLIC_BASE_URL` (apna future Vercel link) daalein.
3. Deploy click karein.
4. Deploy hone ke baad, ek baar Neon database pe migrations chalani padengi (Vercel build khud migrate nahi karta) — apne local terminal se:
   ```
   npx prisma migrate deploy
   npm run seed
   ```
   (`.env` mein wahi Neon `DATABASE_URL` hone se ye command seedha production database ko update kar degi.)

## Step 9 — InternX portal mein submit karna

- GitHub repo link → "Source Code URL"
- Vercel link → "Live Demo URL"
- Notes mein likhein: Multi-tenant architecture Membership join-table se, custom RBAC middleware, plan-based feature gating (member/task limits + locked analytics), Recharts se analytics dashboard.

Koi bhi step pe error aaye, exact error message ya screenshot bhej dein — line-by-line fix bataunga.
