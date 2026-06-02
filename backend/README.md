# Travelink

## Group:
### 1. 2602083316 - Nelson Nathanael (CEO) - (Front End)
### 2. 2602068170 - Yodi Satria (CTO) - (Back End)
### 3. 2602176686 - Rafif Adilfa Irdeva (COO) - (Front End)

## Stack
- **Laravel** (API + server-rendered Inertia responses)
- **Inertia.js** + **React** (frontend)
- **Vite** (bundler; hot module reload in dev)
- **TypeScript**, **ESLint**
- **Chakra UI** (components)
- **SQLi**

---

## Requirements
- PHP **8.4** and Composer **2.8.x**
- Node.js **24.1.x** and npm **11.4.x**

---

## Quick Start (Local)

```bash
# 1) Clone
git clone https://github.com/kakuryouh/Travelink-Back-End.git
cd Travelink-Back-End

# 2) Install PHP deps
composer install --no-interaction --prefer-dist

# 3) Install JS deps
npm install

# 4) Copy env & generate key
cp .env.example .env          # Windows PowerShell: copy .env.example .env
php artisan key:generate

# 5) Configure DB in .env
#   DB_CONNECTION=sqlite or any other DB you prefer
#   DB_HOST=127.0.0.1
#   DB_PORT=3306
#   DB_DATABASE=your_db
#   DB_USERNAME=your_user
#   DB_PASSWORD=your_pass

# 6) Migrate (and optionally seed)
php artisan migrate --seed

# 7) Link storage for public files (user uploads, images, etc.)
php artisan storage:link

# 8) Start servers (use two terminals)
php artisan serve         # http://127.0.0.1:8000
npm run dev               # Vite dev server with HMR
#or use Herd and only run 'npm run dev' 
```

Now open `http://127.0.0.1:8000` in your browser.

---

## Environment
Key `.env` entries you may need:

```dotenv
APP_NAME="Your App"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=sqlite
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_pass

# Vite / Inertia (when using Docker or different host)
VITE_DEV_SERVER_HOST=localhost
VITE_DEV_SERVER_PORT=5173
```

---

## NPM Scripts
- `npm run dev` – start Vite in development (HMR)
- `npm run build` – production build
- `npm run lint` – lint TypeScript/JS

---

## Running Tests / CI
```bash
php artisan test         # Laravel tests
npm run lint             # ESLint + TS checks
```

This repo includes GitHub Actions for **lint** and **tests** on push/PR.

---

## Common Tasks

### Add a background or uploaded image
- Put file under `storage/app/public/...`
- Run `php artisan storage:link`
- Reference it as `/storage/<path-from-public-disk>`

---

---

## Troubleshooting
- **404 for /storage/...** → Run `php artisan storage:link` and ensure file exists under `storage/app/public/...`.
- **Vite HMR not connecting** → Check `APP_URL`, ensure correct host/port in `.env`, and that `npm run dev` is running.
- **DB connection errors** → Verify `.env` credentials and run `php artisan config:clear`.

---
